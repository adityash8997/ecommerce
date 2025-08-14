import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookSelectionRequest {
  type: 'buyback' | 'purchase';
  semester: number;
  selectedBooks: string[];
  selectedCombo?: string;
  totalAmount: number;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  additionalNotes?: string;
}

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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const requestData: BookSelectionRequest = await req.json();
    console.log('Received book selection request:', requestData);

    // Store the book selection request
    const { data, error } = await supabase
      .from('book_selection_requests')
      .insert({
        user_id: user.id,
        request_type: requestData.type,
        semester: requestData.semester,
        selected_books: requestData.selectedBooks,
        selected_combo: requestData.selectedCombo,
        total_amount: requestData.totalAmount,
        contact_info: requestData.contactInfo,
        additional_notes: requestData.additionalNotes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing book selection:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to store book selection' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('Book selection stored successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        requestId: data.id,
        message: `${requestData.type === 'buyback' ? 'Buyback' : 'Purchase'} request submitted successfully!`
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
    console.error('Error in submit-book-selection function:', error);
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