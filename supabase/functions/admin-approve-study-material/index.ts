import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hardened approve function with explicit checks
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[STEP 0] Function invoked');

  try {
    // STEP 1: Check environment variables
    console.log('[STEP 1] Checking environment variables...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl) {
      console.error('[STEP 1] MISSING_ENV: SUPABASE_URL');
      return new Response(
        JSON.stringify({ success: false, code: 'MISSING_ENV', message: 'SUPABASE_URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!supabaseKey) {
      console.error('[STEP 1] MISSING_ENV: SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ success: false, code: 'MISSING_ENV', message: 'SUPABASE_SERVICE_ROLE_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[STEP 1] ✓ Environment variables present');
    console.log('[STEP 1] Using URL:', supabaseUrl);
    console.log('[STEP 1] Service role key length:', supabaseKey.length);

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // STEP 2: Validate authentication
    console.log('[STEP 2] Validating authentication...');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[STEP 2] No authorization header');
      return new Response(
        JSON.stringify({ success: false, code: 'NO_AUTH', message: 'Authorization header missing' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[STEP 2] Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, code: 'UNAUTHORIZED', message: authError?.message || 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[STEP 2] ✓ User authenticated:', user.email);

    // STEP 3: Verify admin status
    console.log('[STEP 3] Checking admin status...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[STEP 3] Profile fetch error:', profileError.message);
      return new Response(
        JSON.stringify({ success: false, code: 'PROFILE_ERROR', message: profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile?.is_admin) {
      console.error('[STEP 3] User is not admin:', user.email);
      return new Response(
        JSON.stringify({ success: false, code: 'NOT_ADMIN', message: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[STEP 3] ✓ Admin verified');

    // STEP 4: Parse and validate request body
    console.log('[STEP 4] Parsing request body...');
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error('[STEP 4] JSON parse error:', e);
      return new Response(
        JSON.stringify({ success: false, code: 'INVALID_JSON', message: 'Request body must be valid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { request_id } = requestBody;

    if (!request_id) {
      console.error('[STEP 4] Missing request_id in body:', requestBody);
      return new Response(
        JSON.stringify({ success: false, code: 'MISSING_FIELD', message: 'request_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[STEP 4] ✓ Request ID:', request_id);

    // STEP 5: Fetch request details
    console.log('[STEP 5] Fetching request details...');
    const { data: request, error: fetchError } = await supabase
      .from('study_material_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (fetchError) {
      console.error('[STEP 5] Fetch error:', fetchError.message, fetchError.code);
      return new Response(
        JSON.stringify({ success: false, code: 'REQUEST_NOT_FOUND', message: `Request not found: ${fetchError.message}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!request) {
      console.error('[STEP 5] No request data returned');
      return new Response(
        JSON.stringify({ success: false, code: 'REQUEST_NOT_FOUND', message: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[STEP 5] ✓ Request found:', {
      title: request.title,
      folder: request.folder_type,
      status: request.status,
      storage_path: request.storage_path
    });

    if (request.status !== 'pending') {
      console.error('[STEP 5] Request already processed, status:', request.status);
      return new Response(
        JSON.stringify({ success: false, code: 'ALREADY_PROCESSED', message: `Request status is "${request.status}"` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STEP 6: Verify pending file exists
    console.log('[STEP 6] Verifying pending file exists...');
    const pendingBucket = 'study-material-pending';
    const pendingPath = request.storage_path;
    
    console.log('[STEP 6] Checking bucket:', pendingBucket, 'path:', pendingPath);
    
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(pendingBucket)
      .download(pendingPath);

    if (downloadError) {
      console.error('[STEP 6] File not found or download error:', downloadError.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          code: 'FILE_NOT_FOUND', 
          message: `Pending file not found: ${downloadError.message}`,
          pending_path: pendingPath
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[STEP 6] ✓ File downloaded, size:', fileData.size, 'bytes');

    // STEP 7: Copy to production bucket
    console.log('[STEP 7] Copying to production bucket...');
    const productionBucket = 'study_materials';
    const folder = request.folder_type.toLowerCase(); // notes, pyqs, ppts, ebooks
    const timestamp = Date.now();
    const productionFilename = `${timestamp}_${request.filename}`;
    const productionPath = `${folder}/${productionFilename}`;

    console.log('[STEP 7] Production bucket:', productionBucket);
    console.log('[STEP 7] Production path:', productionPath);

    const { error: uploadError } = await supabase.storage
      .from(productionBucket)
      .upload(productionPath, fileData, {
        contentType: request.mime_type || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      console.error('[STEP 7] Upload error:', uploadError.message, uploadError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          code: 'UPLOAD_FAILED', 
          message: `Failed to upload to production: ${uploadError.message}`,
          bucket: productionBucket,
          path: productionPath
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[STEP 7] ✓ File uploaded to production');

    // STEP 8: Get public URL
    console.log('[STEP 8] Generating public URL...');
    const { data: { publicUrl } } = supabase.storage
      .from(productionBucket)
      .getPublicUrl(productionPath);

    console.log('[STEP 8] ✓ Public URL:', publicUrl);

    // STEP 9: Insert into appropriate table
    console.log('[STEP 9] Inserting into database table:', folder);
    
    const commonData = {
      title: request.title,
      subject: request.subject,
      semester: request.semester,
      branch: request.branch || 'CSE',
      uploaded_by: request.uploader_name,
      user_id: request.uploader_id,
      views: 0
    };

    let insertError;
    let materialId;

    if (folder === 'notes') {
      const { data, error } = await supabase.from('notes').insert({
        ...commonData,
        pdf_url: publicUrl,
        upload_date: new Date().toISOString().split('T')[0]
      }).select('id').single();
      insertError = error;
      materialId = data?.id;
    } else if (folder === 'pyqs') {
      const { data, error } = await supabase.from('pyqs').insert({
        ...commonData,
        pdf_url: publicUrl,
        year: request.year || new Date().getFullYear().toString()
      }).select('id').single();
      insertError = error;
      materialId = data?.id;
    } else if (folder === 'ppts') {
      const { data, error } = await supabase.from('ppts').insert({
        ...commonData,
        ppt_url: publicUrl, // Note: ppts uses ppt_url not pdf_url
        upload_date: new Date().toISOString().split('T')[0]
      }).select('id').single();
      insertError = error;
      materialId = data?.id;
    } else if (folder === 'ebooks') {
      const { data, error } = await supabase.from('ebooks').insert({
        ...commonData,
        pdf_url: publicUrl,
        upload_date: new Date().toISOString().split('T')[0],
        year: request.year || new Date().getFullYear().toString()
      }).select('id').single();
      insertError = error;
      materialId = data?.id;
    } else {
      console.error('[STEP 9] Invalid folder type:', folder);
      await supabase.storage.from(productionBucket).remove([productionPath]);
      return new Response(
        JSON.stringify({ success: false, code: 'INVALID_FOLDER', message: `Invalid folder type: ${folder}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (insertError) {
      console.error('[STEP 9] Insert error:', insertError.message, insertError);
      console.log('[STEP 9] Rolling back - deleting uploaded file...');
      await supabase.storage.from(productionBucket).remove([productionPath]);
      return new Response(
        JSON.stringify({ 
          success: false, 
          code: 'DB_INSERT_FAILED', 
          message: `Failed to create material record: ${insertError.message}`,
          hint: insertError.hint || 'Check table schema and required fields'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[STEP 9] ✓ Material record created, ID:', materialId);

    // STEP 10: Update request status
    console.log('[STEP 10] Updating request status to approved...');
    const { error: updateError } = await supabase
      .from('study_material_requests')
      .update({
        status: 'approved',
        admin_id: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', request_id);

    if (updateError) {
      console.error('[STEP 10] Update error:', updateError.message);
      // Don't rollback here - material is published, just log the error
      console.warn('[STEP 10] Material published but request status not updated');
    } else {
      console.log('[STEP 10] ✓ Request status updated');
    }

    console.log('[SUCCESS] Study material approved successfully');
    console.log('[SUCCESS] Material ID:', materialId);
    console.log('[SUCCESS] Public URL:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        material_id: materialId,
        public_url: publicUrl,
        message: 'Material approved and published successfully'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('[FATAL] Unexpected error:', error);
    console.error('[FATAL] Stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        success: false, 
        code: 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});