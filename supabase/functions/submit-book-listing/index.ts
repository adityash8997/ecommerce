import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface BookListingRequest {
  title: string;
  author: string;
  semester?: number;
  condition: string;
  price: number;
  description?: string;
  images?: string[];
  contactInfo: {
    name: string;
    phone: string;
    email: string;
    preferredContact: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('📚 Book listing function called');

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

    const listingData: BookListingRequest = await req.json();
    console.log('📋 Listing data received:', listingData);

    // Insert book listing into database
    const { data: listing, error: insertError } = await supabase
      .from('book_listings')
      .insert([{
        user_id: user.id,
        title: listingData.title,
        author: listingData.author,
        semester: listingData.semester,
        condition: listingData.condition,
        price: listingData.price,
        description: listingData.description,
        images: listingData.images || [],
        contact_info: listingData.contactInfo,
        status: 'active'
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting listing:', insertError);
      throw new Error(`Failed to create listing: ${insertError.message}`);
    }

    console.log('✅ Book listing created:', listing.id);

    // Send confirmation email to student
    try {
      const emailResponse = await resend.emails.send({
        from: "KIIT Saathi <noreply@kiitsaathi.com>",
        to: [listingData.contactInfo.email],
        subject: "📚 Book Listed Successfully on KIIT Saathi!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb; text-align: center;">Book Listed Successfully! 📚</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e293b;">Listing Details:</h3>
              <p><strong>Title:</strong> ${listingData.title}</p>
              <p><strong>Author:</strong> ${listingData.author}</p>
              ${listingData.semester ? `<p><strong>Semester:</strong> ${listingData.semester}</p>` : ''}
              <p><strong>Condition:</strong> ${listingData.condition}</p>
              <p><strong>Price:</strong> ₹${listingData.price}</p>
              ${listingData.description ? `<p><strong>Description:</strong> ${listingData.description}</p>` : ''}
            </div>
            
            <p>Your book is now live on KIIT Saathi! Students can contact you directly through the platform.</p>
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #0277bd;"><strong>💡 Tips for better sales:</strong></p>
              <ul style="color: #0277bd; margin: 10px 0;">
                <li>Respond quickly to interested buyers</li>
                <li>Be honest about the book's condition</li>
                <li>Consider competitive pricing</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
              <strong>Happy selling! 🎉</strong><br>
              The KIIT Saathi Team
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
        subject: "📚 New Book Listing - KIIT Saathi",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">New Book Listing Submitted</h2>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
              <h3>Student Details:</h3>
              <p><strong>Name:</strong> ${listingData.contactInfo.name}</p>
              <p><strong>Email:</strong> ${listingData.contactInfo.email}</p>
              <p><strong>Phone:</strong> ${listingData.contactInfo.phone}</p>
              
              <h3>Book Details:</h3>
              <p><strong>Title:</strong> ${listingData.title}</p>
              <p><strong>Author:</strong> ${listingData.author}</p>
              ${listingData.semester ? `<p><strong>Semester:</strong> ${listingData.semester}</p>` : ''}
              <p><strong>Condition:</strong> ${listingData.condition}</p>
              <p><strong>Price:</strong> ₹${listingData.price}</p>
              ${listingData.description ? `<p><strong>Description:</strong> ${listingData.description}</p>` : ''}
            </div>
            
            <p><strong>Listing ID:</strong> ${listing.id}</p>
          </div>
        `,
      });
    } catch (adminEmailError) {
      console.error('Failed to send admin notification:', adminEmailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        listing: listing,
        message: 'Book listing created successfully!'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in submit-book-listing function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process book listing',
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