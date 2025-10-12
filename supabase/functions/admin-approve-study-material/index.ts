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
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      throw new Error('Admin access required');
    }

    const { request_id } = await req.json();

    if (!request_id) {
      throw new Error('Request ID is required');
    }

    // Get the request details
    const { data: request, error: fetchError } = await supabase
      .from('study_material_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (fetchError || !request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request has already been processed');
    }

    // Copy file from pending to production bucket
    const pendingPath = request.storage_path;
    const folder = request.folder_type;
    
    // Generate unique filename with folder prefix for study_materials bucket
    const timestamp = Date.now();
    const productionFilename = `${timestamp}_${request.filename}`;
    const productionPath = `${folder}/${productionFilename}`;

    // Get the file from pending bucket
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('study-material-pending')
      .download(pendingPath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error('Failed to download pending file');
    }

    // Upload to production study_materials bucket with folder prefix
    const { error: uploadError } = await supabase.storage
      .from('study_materials')
      .upload(productionPath, fileData, {
        contentType: request.mime_type || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload to production bucket');
    }

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
      throw new Error('Failed to create published material record');
    }

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
      throw updateError;
    }

    console.log('Study material approved:', request_id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Material approved and published successfully',
        public_url: publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in admin-approve-study-material:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});