import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    console.log('Starting approval process...');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.email);

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      console.error('User is not admin:', user.email);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { request_id } = await req.json();

    if (!request_id) {
      console.error('Missing request_id');
      return new Response(
        JSON.stringify({ success: false, error: 'Request ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing request:', request_id);

    // Get the request details
    const { data: request, error: fetchError } = await supabase
      .from('study_material_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (fetchError || !request) {
      console.error('Request fetch error:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Request found:', request.title, 'Status:', request.status);

    if (request.status !== 'pending') {
      return new Response(
        JSON.stringify({ success: false, error: 'Request has already been processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Copy file from pending to production bucket
    const pendingPath = request.storage_path;
    const folder = request.folder_type;
    
    // Generate unique filename with folder prefix for study_materials bucket
    const timestamp = Date.now();
    const productionFilename = `${timestamp}_${request.filename}`;
    const productionPath = `${folder}/${productionFilename}`;

    console.log('Downloading from pending:', pendingPath);
    
    // Get the file from pending bucket
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('study-material-pending')
      .download(pendingPath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to download pending file: ${downloadError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Uploading to production:', productionPath);

    // Upload to production study_materials bucket with folder prefix
    const { error: uploadError } = await supabase.storage
      .from('study_materials')
      .upload(productionPath, fileData, {
        contentType: request.mime_type || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to upload to production: ${uploadError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('File uploaded successfully to:', productionPath);

    // Get public URL from study_materials bucket
    const { data: { publicUrl } } = supabase.storage
      .from('study_materials')
      .getPublicUrl(productionPath);

    // Insert into appropriate table
    let insertError;
    const commonData = {
      title: request.title,
      subject: request.subject,
      semester: request.semester,
      branch: request.branch || 'CSE',
      uploaded_by: request.uploader_name,
      user_id: request.uploader_id,
      views: 0
    };

    if (folder === 'notes') {
      const { error } = await supabase.from('notes').insert({
        ...commonData,
        pdf_url: publicUrl,
        upload_date: new Date().toISOString().split('T')[0]
      });
      insertError = error;
    } else if (folder === 'pyqs') {
      const { error } = await supabase.from('pyqs').insert({
        ...commonData,
        pdf_url: publicUrl,
        year: request.year || new Date().getFullYear().toString()
      });
      insertError = error;
    } else if (folder === 'ppts') {
      const { error } = await supabase.from('ppts').insert({
        ...commonData,
        ppt_url: publicUrl,
        upload_date: new Date().toISOString().split('T')[0]
      });
      insertError = error;
    } else if (folder === 'ebooks') {
      const { error } = await supabase.from('ebooks').insert({
        ...commonData,
        pdf_url: publicUrl,
        upload_date: new Date().toISOString().split('T')[0],
        year: request.year || new Date().getFullYear().toString()
      });
      insertError = error;
    }

    if (insertError) {
      // Rollback: delete the uploaded file from study_materials bucket
      await supabase.storage.from('study_materials').remove([productionPath]);
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create published material record: ${insertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Material record created successfully');

    // Update request status
    const { error: updateError } = await supabase
      .from('study_material_requests')
      .update({
        status: 'approved',
        admin_id: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', request_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to update request status: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Study material approved successfully:', request_id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Material approved and published successfully',
        public_url: publicUrl
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Unexpected error in admin-approve-study-material:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});