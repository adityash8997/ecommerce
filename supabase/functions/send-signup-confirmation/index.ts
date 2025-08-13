import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SignupEmailData {
  user: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const webhookData: SignupEmailData = await req.json();
    const { user, email_data } = webhookData;
    
    // Extract first name from full name, fallback to 'Student'
    const fullName = user.user_metadata?.full_name || 'Student';
    const firstName = fullName.split(' ')[0] || 'Student';
    const confirmationUrl = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`;

    console.log("Processing signup confirmation email for:", user.email);

    const emailResponse = await resend.emails.send({
      from: "KIIT Saathi <onboarding@resend.dev>",
      to: [user.email],
      subject: "🎉 Welcome to KIIT Saathi – You're In!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 0;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 Welcome to KIIT Saathi!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 18px;">You're officially part of the crew!</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: white; padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 24px;">Hi ${firstName} 🙌</h2>
              <p style="color: #475569; font-size: 18px; line-height: 1.6; margin: 0;">
                Welcome aboard! Your KIIT Saathi account is officially set up and ready to roll.
              </p>
            </div>
            
            <!-- Value Proposition -->
            <div style="background: linear-gradient(135deg, #f1f5f9, #e2e8f0); padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #22c55e;">
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                From booking campus tours to selling your old books, finding lost items, or even scoring the best momo deals — we've got you covered.
              </p>
              <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px;">
                <span style="background: #22c55e; color: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">📚 Book Exchange</span>
                <span style="background: #3b82f6; color: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">🔍 Lost & Found</span>
                <span style="background: #8b5cf6; color: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">🏛️ Campus Tours</span>
                <span style="background: #f59e0b; color: white; padding: 8px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">👥 Senior Connect</span>
              </div>
            </div>
            
            <!-- Confirmation Button -->
            <div style="text-align: center; margin: 40px 0;">
              <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">✨ What's next?</h3>
              <p style="color: #64748b; margin: 0 0 25px 0; font-size: 16px;">
                Confirm your email and start exploring all the cool services waiting for you:
              </p>
              <a href="${confirmationUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3); transition: all 0.3s ease;">
                🚀 Confirm Email & Get Started
              </a>
            </div>
            
            <!-- Fun Campus Life Section -->
            <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
              <p style="color: #1e40af; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">
                🌟 Ready to make campus life amazing?
              </p>
              <p style="color: #3730a3; font-size: 14px; line-height: 1.6; margin: 0;">
                Join thousands of KIIT students who are already making their university experience simpler, smarter, and way more fun!
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
            <p style="color: #22c55e; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
              We're excited to have you in the family! 🚀
            </p>
            <p style="color: #64748b; font-size: 16px; margin: 0 0 20px 0;">
              Here's to making your campus life simpler, smarter, and way more fun!
            </p>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
              <p style="color: #475569; font-size: 14px; margin: 0 0 5px 0;">Cheers,</p>
              <p style="color: #22c55e; font-size: 16px; font-weight: bold; margin: 0;">
                The KIIT Saathi Crew 💙
              </p>
            </div>
          </div>
          
          <!-- Mobile Optimization -->
          <div style="padding: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <span style="word-break: break-all; color: #64748b;">${confirmationUrl}</span>
            </p>
          </div>
        </div>
        
        <!-- Mobile Responsive Styles -->
        <style>
          @media only screen and (max-width: 600px) {
            .container { padding: 10px !important; }
            h1 { font-size: 24px !important; }
            h2 { font-size: 20px !important; }
            .button { padding: 12px 20px !important; font-size: 14px !important; }
          }
        </style>
      `,
    });

    console.log("Signup confirmation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Signup confirmation email sent successfully!" 
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
    console.error("Error in send-signup-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to send signup confirmation email. Please try again later." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);