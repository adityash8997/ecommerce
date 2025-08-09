import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CelebrationBookingRequest {
  name: string;
  contactNumber: string;
  celebrationType: string;
  dateTime: string;
  venueLocation: string;
  specialRequests?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: CelebrationBookingRequest = await req.json();
    console.log("Received celebration booking:", requestData);

    // Save to database
    const { data, error } = await supabase
      .from('celebration_bookings')
      .insert([{
        name: requestData.name,
        contact_number: requestData.contactNumber,
        celebration_type: requestData.celebrationType,
        date_time: requestData.dateTime,
        venue_location: requestData.venueLocation,
        special_requests: requestData.specialRequests || null
      }]);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    // Send notification email to admin
    await resend.emails.send({
      from: "KIIT Saathi <onboarding@resend.dev>",
      to: ["kiitsaathi@gmail.com"],
      subject: "New Celebration Booking! 🎉",
      html: `
        <h2>New Celebration Booking Request</h2>
        <p><strong>Customer:</strong> ${requestData.name}</p>
        <p><strong>Contact:</strong> ${requestData.contactNumber}</p>
        <p><strong>Celebration Type:</strong> ${requestData.celebrationType}</p>
        <p><strong>Date & Time:</strong> ${new Date(requestData.dateTime).toLocaleString()}</p>
        <p><strong>Venue:</strong> ${requestData.venueLocation}</p>
        ${requestData.specialRequests ? 
          `<p><strong>Special Requests:</strong> ${requestData.specialRequests}</p>` : ''}
        <p>Please follow up with the customer to confirm details and pricing.</p>
      `,
    });

    console.log("Celebration booking processed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Celebration booking submitted successfully! We'll contact you soon to finalize the details." 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-celebration-booking function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);