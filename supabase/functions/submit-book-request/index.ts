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

interface BookSubmissionRequest {
  type: 'sell' | 'buy';
  fullName: string;
  rollNumber: string;
  contactNumber: string;
  email?: string;
  bookTitles?: string;
  branch?: string;
  yearOfStudy?: string;
  bookCondition?: string;
  photoUrls?: string[];
  pickupLocation?: string;
  termsAccepted?: boolean;
  bookSetNeeded?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: BookSubmissionRequest = await req.json();
    console.log("Received book request:", requestData);

    if (requestData.type === 'sell') {
      // Handle book selling submission
      const { data, error } = await supabase
        .from('book_submissions')
        .insert([{
          full_name: requestData.fullName,
          roll_number: requestData.rollNumber,
          contact_number: requestData.contactNumber,
          email: requestData.email!,
          book_titles: requestData.bookTitles!,
          branch: requestData.branch!,
          year_of_study: requestData.yearOfStudy!,
          book_condition: requestData.bookCondition!,
          photo_urls: requestData.photoUrls || [],
          pickup_location: requestData.pickupLocation!,
          terms_accepted: requestData.termsAccepted!
        }]);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Send notification email to admin
      await resend.emails.send({
        from: "KIIT Saathi <onboarding@resend.dev>",
        to: ["kiitsaathi@gmail.com"],
        subject: "New Book Selling Request",
        html: `
          <h2>New Book Selling Request</h2>
          <p><strong>Student:</strong> ${requestData.fullName} (${requestData.rollNumber})</p>
          <p><strong>Contact:</strong> ${requestData.contactNumber}</p>
          <p><strong>Email:</strong> ${requestData.email}</p>
          <p><strong>Books:</strong> ${requestData.bookTitles}</p>
          <p><strong>Branch & Year:</strong> ${requestData.branch} - ${requestData.yearOfStudy}</p>
          <p><strong>Condition:</strong> ${requestData.bookCondition}</p>
          <p><strong>Pickup Location:</strong> ${requestData.pickupLocation}</p>
          ${requestData.photoUrls && requestData.photoUrls.length > 0 ? 
            `<p><strong>Photo URLs:</strong> ${requestData.photoUrls.join(', ')}</p>` : ''}
        `,
      });

      // Send confirmation email to student
      if (requestData.email) {
        await resend.emails.send({
          from: "KIIT Saathi <onboarding@resend.dev>",
          to: [requestData.email],
          subject: "Book Selling Request Received! 📚",
          html: `
            <h2>Thanks for your book submission, ${requestData.fullName}! 📚💙</h2>
            <p>We've received your request to sell your books and our team will reach out within 24 hours.</p>
            <p><strong>What happens next:</strong></p>
            <ul>
              <li>Our team will review your book details</li>
              <li>We'll calculate a fair price based on condition & demand</li>
              <li>If approved, we'll contact you to arrange pickup</li>
            </ul>
            <p>Meanwhile, start dreaming about how you'll spend your extra cash! 😄</p>
            <p>Questions? Reply to this email.</p>
            <p>Best regards,<br>The KIIT Saathi Team</p>
          `,
        });
      }

    } else if (requestData.type === 'buy') {
      // Handle book purchase request
      const { data, error } = await supabase
        .from('book_purchase_requests')
        .insert([{
          full_name: requestData.fullName,
          roll_number: requestData.rollNumber,
          contact_number: requestData.contactNumber,
          book_set_needed: requestData.bookSetNeeded!
        }]);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Send notification email to admin
      await resend.emails.send({
        from: "KIIT Saathi <onboarding@resend.dev>",
        to: ["kiitsaathi@gmail.com"],
        subject: "New Book Purchase Request",
        html: `
          <h2>New Book Purchase Request</h2>
          <p><strong>Student:</strong> ${requestData.fullName} (${requestData.rollNumber})</p>
          <p><strong>Contact:</strong> ${requestData.contactNumber}</p>
          <p><strong>Book Set Needed:</strong> ${requestData.bookSetNeeded}</p>
        `,
      });
    }

    console.log("Book request processed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: requestData.type === 'sell' 
          ? "Book selling request submitted successfully!" 
          : "Book purchase request submitted successfully!"
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
    console.error("Error in submit-book-request function:", error);
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