import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartonBookingRequest {
  fullName: string;
  mobileNumber: string;
  hostelName: string;
  roomNumber: string;
  numberOfBoxes: number;
  needTape: boolean;
  pickupSlot: string;
  paymentMethod: string;
  totalPrice: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bookingData: CartonBookingRequest = await req.json();

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert booking into database
    const { data: booking, error: dbError } = await supabase
      .from("carton_transfer_bookings")
      .insert({
        full_name: bookingData.fullName,
        mobile_number: bookingData.mobileNumber,
        hostel_name: bookingData.hostelName,
        room_number: bookingData.roomNumber,
        number_of_boxes: bookingData.numberOfBoxes,
        need_tape: bookingData.needTape,
        pickup_slot: bookingData.pickupSlot,
        payment_method: bookingData.paymentMethod,
        total_price: bookingData.totalPrice,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    // Send confirmation email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "KIIT Saathi <noreply@kiitsaathi.com>",
      to: ["kiitsaathi@gmail.com"],
      subject: "New Carton Transfer Booking",
      html: `
        <h2>New Carton Transfer Booking Received</h2>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Student Name:</strong> ${bookingData.fullName}</p>
        <p><strong>Mobile:</strong> ${bookingData.mobileNumber}</p>
        <p><strong>Hostel:</strong> ${bookingData.hostelName}</p>
        <p><strong>Room:</strong> ${bookingData.roomNumber}</p>
        <p><strong>Boxes:</strong> ${bookingData.numberOfBoxes}</p>
        <p><strong>Tape Required:</strong> ${bookingData.needTape ? 'Yes' : 'No'}</p>
        <p><strong>Pickup Slot:</strong> ${bookingData.pickupSlot}</p>
        <p><strong>Payment Method:</strong> ${bookingData.paymentMethod}</p>
        <p><strong>Total Amount:</strong> ₹${bookingData.totalPrice}</p>
        <p><strong>Booking Time:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Booking confirmed successfully!",
        bookingId: booking.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-carton-booking function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);