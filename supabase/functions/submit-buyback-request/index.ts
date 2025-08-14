import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface BookDetails {
  title: string;
  author: string;
  condition: string;
  estimatedPrice: number;
}

interface BuybackRequest {
  booksDetails: BookDetails[];
  estimatedTotal: number;
  pickupAddress: string;
  contactNumber: string;
  studentName: string;
  rollNumber: string;
  paymentPreference: string;
  additionalNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('💰 Buyback request function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }

    const requestData: BuybackRequest = await req.json();
    console.log('📋 Buyback request data received:', requestData);

    // Insert buyback request into database
    const { data: buybackRequest, error: insertError } = await supabase
      .from('book_buyback_requests')
      .insert([{
        user_id: user.id,
        books_details: requestData.booksDetails,
        estimated_total: requestData.estimatedTotal,
        pickup_address: requestData.pickupAddress,
        contact_number: requestData.contactNumber,
        student_name: requestData.studentName,
        roll_number: requestData.rollNumber,
        payment_preference: requestData.paymentPreference,
        status: 'submitted'
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting buyback request:', insertError);
      throw new Error(`Failed to create buyback request: ${insertError.message}`);
    }

    console.log('✅ Buyback request created:', buybackRequest.id);

    // Send confirmation email to student
    try {
      const emailResponse = await resend.emails.send({
        from: "KIIT Saathi <noreply@kiitsaathi.com>",
        to: [user.email!],
        subject: "💰 Book Buyback Request Submitted - KIIT Saathi",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669; text-align: center;">Buyback Request Submitted! 💰</h2>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <p style="margin-top: 0;"><strong>Great news!</strong> We've received your book buyback request and our team will evaluate your books within 24-48 hours.</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e293b;">Request Summary:</h3>
              <p><strong>Request ID:</strong> ${buybackRequest.id}</p>
              <p><strong>Student Name:</strong> ${requestData.studentName}</p>
              <p><strong>Roll Number:</strong> ${requestData.rollNumber}</p>
              <p><strong>Contact:</strong> ${requestData.contactNumber}</p>
              <p><strong>Pickup Address:</strong> ${requestData.pickupAddress}</p>
              <p><strong>Payment Preference:</strong> ${requestData.paymentPreference}</p>
              <p><strong>Estimated Total:</strong> ₹${requestData.estimatedTotal}</p>
              
              <h4 style="color: #1e293b;">Books Submitted:</h4>
              <ul>
                ${requestData.booksDetails.map(book => 
                  `<li><strong>${book.title}</strong> by ${book.author} - ${book.condition} condition (Est. ₹${book.estimatedPrice})</li>`
                ).join('')}
              </ul>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #92400e;">📋 What happens next?</h4>
              <ol style="color: #92400e; margin: 0;">
                <li>Our team will physically evaluate your books</li>
                <li>You'll receive a final quote within 48 hours</li>
                <li>If you accept, we'll schedule a pickup</li>
                <li>Payment will be processed immediately after pickup</li>
              </ol>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
              <strong>Thanks for choosing KIIT Saathi! 📚</strong><br>
              <small>Track your request status in the app</small>
            </p>
          </div>
        `,
      });

      console.log('✅ Confirmation email sent:', emailResponse.id);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await resend.emails.send({
        from: "KIIT Saathi <admin@kiitsaathi.com>",
        to: ["admin@kiitsaathi.com"],
        subject: "💰 New Book Buyback Request - KIIT Saathi",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">New Book Buyback Request</h2>
            
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
              <p style="margin-top: 0;"><strong>⚡ Action Required:</strong> New buyback request needs evaluation</p>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Student Details:</h3>
              <p><strong>Name:</strong> ${requestData.studentName}</p>
              <p><strong>Roll Number:</strong> ${requestData.rollNumber}</p>
              <p><strong>Contact:</strong> ${requestData.contactNumber}</p>
              <p><strong>Pickup Address:</strong> ${requestData.pickupAddress}</p>
              <p><strong>Payment Preference:</strong> ${requestData.paymentPreference}</p>
              
              <h3>Books Details:</h3>
              <p><strong>Estimated Total:</strong> ₹${requestData.estimatedTotal}</p>
              <ul>
                ${requestData.booksDetails.map(book => 
                  `<li><strong>${book.title}</strong> by ${book.author}<br>
                      Condition: ${book.condition} | Estimated: ₹${book.estimatedPrice}</li>`
                ).join('')}
              </ul>
            </div>
            
            <p><strong>Request ID:</strong> ${buybackRequest.id}</p>
            <p style="color: #dc2626;"><strong>⏰ SLA:</strong> Respond within 48 hours</p>
          </div>
        `,
      });
    } catch (adminEmailError) {
      console.error('Failed to send admin notification:', adminEmailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        request: buybackRequest,
        message: 'Buyback request submitted successfully! We\'ll evaluate your books within 48 hours.'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in submit-buyback-request function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process buyback request',
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);