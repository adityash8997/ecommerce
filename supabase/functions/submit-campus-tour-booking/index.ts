import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampusTourBookingRequest {
  guestName: string;
  contactNumber: string;
  email?: string;
  selectedDate: string;
  selectedSlot: string;
  groupSize: number;
  specialRequests?: string;
  tourType: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: user, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user.user) {
      throw new Error("Authentication failed");
    }

    const booking: CampusTourBookingRequest = await req.json();

    // Calculate price based on tour type and group size
    const basePrice = booking.tourType === 'morning' ? 299 : 399;
    const totalPrice = basePrice + (booking.groupSize > 4 ? (booking.groupSize - 4) * 50 : 0);

    // Insert booking into database
    const { data: bookingData, error: insertError } = await supabase
      .from("campus_tour_bookings")
      .insert({
        user_id: user.user.id,
        guest_name: booking.guestName,
        contact_number: booking.contactNumber,
        email: booking.email,
        selected_date: booking.selectedDate,
        selected_slot: booking.selectedSlot,
        group_size: booking.groupSize,
        special_requests: booking.specialRequests,
        tour_type: booking.tourType,
        price: totalPrice,
        status: "pending"
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Send confirmation email
    try {
      await resend.emails.send({
        from: "KIIT Saathi <bookings@kiitsaathi.com>",
        to: [booking.email || user.user.email!],
        subject: "Campus Tour Booking Confirmation - KIIT Saathi",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">🎓 Tour Booking Confirmed!</h1>
              <p style="color: #6b7280; font-size: 16px;">Your KIIT Campus Tour has been successfully booked</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin-bottom: 15px;">Booking Details</h2>
              <p><strong>Guest Name:</strong> ${booking.guestName}</p>
              <p><strong>Tour Date:</strong> ${new Date(booking.selectedDate).toLocaleDateString()}</p>
              <p><strong>Time Slot:</strong> ${booking.selectedSlot}</p>
              <p><strong>Tour Type:</strong> ${booking.tourType.charAt(0).toUpperCase() + booking.tourType.slice(1)} Tour</p>
              <p><strong>Group Size:</strong> ${booking.groupSize} people</p>
              <p><strong>Total Price:</strong> ₹${totalPrice}</p>
              ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 10px; border-left: 4px solid #10b981; margin-bottom: 20px;">
              <h3 style="color: #059669; margin-bottom: 10px;">What's Next?</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li>Our team will call you within 12 hours to confirm details</li>
                <li>You'll receive a campus entry pass via WhatsApp</li>
                <li>Meet your guide at the main gate 15 minutes before your slot</li>
                <li>Bring ID proof for campus entry</li>
              </ul>
            </div>
            
            <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin-bottom: 10px;">Questions? Contact us:</p>
              <p style="color: #2563eb;"><strong>Phone:</strong> ${booking.contactNumber}</p>
              <p style="color: #6b7280; font-size: 14px;">This is an automated email from KIIT Saathi</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      booking: bookingData,
      totalPrice 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in submit-campus-tour-booking:", error);
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