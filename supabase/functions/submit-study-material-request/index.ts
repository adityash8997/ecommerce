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

    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { title, subject, semester, branch, year, folder_type, filename, filesize, mime_type, storage_path, uploader_name } = await req.json();

    // Validate required fields
    if (!title || !subject || !semester || !folder_type || !filename || !storage_path) {
      throw new Error('Missing required fields');
    }

    // Validate folder_type
    const allowedFolders = ['notes', 'pyqs', 'ppts', 'ebooks'];
    if (!allowedFolders.includes(folder_type)) {
      throw new Error('Invalid folder type');
    }

    // Validate file size (50MB limit)
    if (filesize && filesize > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit');
    }

    // Insert request
    const { data: request, error: insertError } = await supabase
      .from('study_material_requests')
      .insert({
        title,
        subject,
        semester,
        branch: branch || null,
        year: year || null,
        folder_type,
        uploader_id: user.id,
        uploader_name: uploader_name || user.email,
        filename,
        storage_path,
        filesize: filesize || null,
        mime_type: mime_type || null,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    console.log('Study material request created:', request.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        request_id: request.id,
        message: 'Request submitted successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in submit-study-material-request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});