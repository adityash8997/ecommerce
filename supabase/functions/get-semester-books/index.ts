import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const semesterId = url.searchParams.get('semester');

    if (!semesterId) {
      return new Response(
        JSON.stringify({ error: 'Semester parameter is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Get books for the specified semester
    const { data: books, error } = await supabase
      .from('semester_books')
      .select('*')
      .eq('semester', parseInt(semesterId))
      .order('subject_category', { ascending: true });

    if (error) {
      console.error('Error fetching semester books:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch semester books' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Get semester combos
    const { data: combos, error: comboError } = await supabase
      .from('semester_combos')
      .select('*')
      .eq('semester_number', parseInt(semesterId));

    if (comboError) {
      console.error('Error fetching semester combos:', comboError);
    }

    return new Response(
      JSON.stringify({ 
        books: books || [],
        combos: combos || []
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in get-semester-books function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);