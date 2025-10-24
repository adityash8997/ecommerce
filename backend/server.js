import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import adminRoutes from "./routes/AdminRoute.js";
import SemBooksRoutes from "./routes/SemBooksRoutes.js"
import FacultyRoute from "./routes/FacultyRoute.js"
import StudyMaterialRoute from "./routes/StudyMaterialRoute.js"


const app = express();
import cookieParser from 'cookie-parser';

const allowedOrigins = [
  "http://localhost:8080",
  "http://10.5.83.177:8080",
  "http://localhost:5173",
  "https://kiitsaathi.vercel.app",
  "https://kiitsaathi-git-satvik-aditya-sharmas-projects-3c0e452b.vercel.app",
   "https://ksaathi.vercel.app"
];

app.use(cookieParser());
app.use("/api/admin", adminRoutes);
app.use("/", SemBooksRoutes); 
app.use("/",FacultyRoute);
app.use("/",StudyMaterialRoute)


// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  next(err);
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('lost_and_found_items')
      .select('id')
      .limit(1);
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      supabase: error ? 'Error' : 'Connected',
      razorpay: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Missing'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Check current session

app.get("/api/auth/callback", async (req, res) => {
  try {
    const { access_token } = req.query; // or handle from headers or cookies

    if (!access_token) {
      return res.status(400).json({ error: "Missing access token" });
    }

    // Verify and get user info
    const { data: user, error } = await supabase.auth.getUser(access_token);
    if (error || !user) {
      console.error(error);
      return res.status(401).json({ error: "Invalid token" });
    }

    // Check if user email confirmed
    if (user.user?.email_confirmed_at) {
      // Optional: create your own session/cookie or issue JWT
      return res.json({ success: true, message: "Email confirmed" });
    } else {
      return res.status(403).json({ success: false, message: "Email not confirmed yet" });
    }
  } catch (err) {
    console.error("Auth callback failed:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get('/api/auth/session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ session: null, profile: null });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.json({ session: null, profile: null });
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_email_verified')
      .eq('id', user.id)
      .single();

    res.json({ 
      session: { user }, 
      profile 
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ error: 'Failed to check session' });
  }
});

// Sign up with email/password
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate KIIT email
    if (!email.endsWith('@kiit.ac.in')) {
      return res.status(400).json({ 
        error: 'Only KIIT College Email IDs (@kiit.ac.in) are allowed to sign up or log in to KIIT Saathi.' 
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://ksaathi.vercel.app/auth/callback",
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    res.json({ 
      success: true, 
      user: data.user, 
      session: data.session,
      message: data?.user && !data.session 
        ? 'Check your email for the confirmation link' 
        : 'Account created successfully'
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(400).json({ 
      error: error.message || 'An error occurred during sign up' 
    });
  }
});

// Sign in with email/password
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate KIIT email
    if (!email.endsWith('@kiit.ac.in')) {
      return res.status(400).json({ 
        error: 'Only KIIT College Email IDs (@kiit.ac.in) are allowed to sign up or log in to KIIT Saathi.' 
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json({ 
      success: true, 
      session: data.session,
      user: data.user
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(400).json({ 
      error: error.message || 'An error occurred during sign in' 
    });
  }
});

// Sign out
app.post('/api/auth/signout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      await supabase.auth.admin.signOut(token);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: 'Failed to sign out' });
  }
});

// Resend confirmation email
app.post('/api/auth/resend-confirmation', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { error } = await supabase.auth.resend({ 
      type: 'signup', 
      email 
    });

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Confirmation email resent' 
    });
  } catch (error) {
    console.error('Resend confirmation error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to resend confirmation email' 
    });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate KIIT email
    if (!email.endsWith('@kiit.ac.in')) {
      return res.status(400).json({ 
        error: 'Only KIIT College Email IDs (@kiit.ac.in) are allowed' 
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'https://ksaathi.vercel.app'}/reset-password`,
    });

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Password reset email sent' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to send password reset email' 
    });
  }
});

// Verify email callback
app.post('/api/auth/verify-email-callback', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    const { error } = await supabase.functions.invoke('verify-email-callback', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Verify email callback error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// Test Lost & Found order creation (simplified)
app.post('/test-lost-found-order', async (req, res) => {
  try {
    console.log('🧪 Test Lost & Found Order Request:', req.body);
    const { amount } = req.body;
    
    // Check if Razorpay is available
    if (!razorpay) {
      return res.status(500).json({ 
        error: 'Razorpay not configured',
        details: 'Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables'
      });
    }
    
    // Simple Razorpay order creation test
    const order = await razorpay.orders.create({
      amount: amount || 1500, // Default 15 rupees in paise
      currency: 'INR',
      receipt: 'test_' + Date.now(),
      notes: {
        test: 'true'
      }
    });
    
    console.log('✅ Test order created:', order.id);
    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Test order error:', error);
    res.status(500).json({ error: error.message });
  }
});




// Razorpay instance - only create if environment variables are available
let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Razorpay:', error.message);
  }
} else {
  console.warn('⚠️  Razorpay not initialized - missing environment variables');
}

console.log('🔧 Environment Debug Info:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `✅ Set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : '❌ Missing');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing');

// Supabase instance
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



// ✅ Check if user has paid for contact unlock for a specific item
app.get('/has-paid-contact', async (req, res) => {
  const { user_id, item_id, item_title } = req.query;
  if (!user_id || !item_id || !item_title) {
    return res.status(400).json({ error: 'Missing user_id, item_id, or item_title' });
  }
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user_id)
      .eq('service_name', 'LostAndFound')
      .eq('subservice_name', item_title)
      .eq('payment_status', 'success');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ paid: data && data.length > 0 });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err });
  }
});

// ✅ Create Razorpay order
app.post('/create-order', async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;
  
  if (!razorpay) {
    return res.status(500).json({ 
      error: 'Payment service not available - Razorpay not configured',
      details: 'Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables'
    });
  }
  
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency,
      receipt,
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Verify payment and save to Supabase
app.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, user_id, amount, service_name, subservice_name, payment_method } = req.body;

  try {
    // Insert order
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id,
          transaction_id: razorpay_order_id,
          amount,
          payment_status: 'success',
          service_name,
          subservice_name,
          payment_method,
        },
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message, details: error });
    }

    // If LostAndFound, send contact details to user's email
    if (service_name === 'LostAndFound') {
      // 1. Get user email from Supabase users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', user_id)
        .single();
      if (userError || !userData?.email) {
        console.error('User email fetch error:', userError);
      } else {
        // 2. Get contact details for the item
        const { data: itemData, error: itemError } = await supabase
          .from('lost_and_found_items')
          .select('contact_name, contact_email, contact_phone, title')
          .eq('title', subservice_name)
          .single();
        if (itemError || !itemData) {
          console.error('LostFound item fetch error:', itemError);
        } else {
          // 3. Send email using Resend API
          try {
            const Resend = require('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: 'KIIT Saathi <onboarding@resend.dev>',
              to: [userData.email],
              subject: `Contact Details for ${itemData.title}`,
              html: `<h2>Contact Details for ${itemData.title}</h2>
                <p><strong>Name:</strong> ${itemData.contact_name}</p>
                <p><strong>Email:</strong> ${itemData.contact_email}</p>
                <p><strong>Phone:</strong> ${itemData.contact_phone}</p>
                <p>Thank you for using KIIT Saathi Lost & Found!</p>`
            });
            console.log('Contact details sent to', userData.email);
          } catch (emailErr) {
            console.error('Error sending contact email:', emailErr);
          }
        }
      }
    }

    console.log('Order insert response:', data);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error in /verify-payment:', err);
    return res.status(500).json({ error: 'Unexpected server error', details: err });
  }
});

// ✅ Get user's orders
app.get('/get-orders', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ orders: data });
  } catch (err) {
    console.error('Unexpected error in /get-orders:', err);
    return res.status(500).json({ error: 'Unexpected server error', details: err });
  }
});

// ✅ Alternative endpoint for fetching orders
app.get('/orders', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error (alt):', error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ orders: data });
  } catch (err) {
    console.error('Unexpected error in /orders:', err);
    return res.status(500).json({ error: 'Unexpected server error', details: err });
  }
});



// Create order for Lost & Found contact unlock
app.post('/create-lost-found-order', async (req, res) => {
  try {
    console.log('🔍 Lost & Found Order Request:', req.body);
    console.log('🔍 Environment check - Supabase URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
    console.log('🔍 Environment check - Razorpay Key:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Missing');
    
    const { amount, itemId, itemTitle, itemPosterEmail, payerUserId, receipt } = req.body;

    // Validate required fields
    if (!amount || !itemId || !itemTitle || !payerUserId) {
      console.log('❌ Missing required fields:', { amount, itemId, itemTitle, payerUserId });
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['amount', 'itemId', 'itemTitle', 'payerUserId'] 
      });
    }

    console.log('⏳ Checking for existing payment...');
    // For now, let's skip the unlock table check since it doesn't exist yet
    // and check directly in the orders table
    const { data: existingPayment, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', payerUserId)
      .eq('service_name', 'LostAndFoundContact')
      .eq('payment_status', 'completed')
      .contains('booking_details', { item_id: itemId })
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking existing payment:', checkError);
      return res.status(500).json({ error: 'Failed to validate payment status', details: checkError });
    }

    if (existingPayment && existingPayment.length > 0) {
      console.log('❌ Payment already exists for this user/item combination');
      return res.status(400).json({ 
        error: 'Payment already completed', 
        message: 'You have already unlocked contact details for this item' 
      });
    }

    console.log('⏳ Fetching item details...');
    // Get the item details to check if user is the poster and item type
    const { data: itemData, error: itemError } = await supabase
      .from('lost_and_found_items')
      .select('contact_email, item_type')
      .eq('id', itemId)
      .single();

    if (itemError) {
      console.error('❌ Error fetching item details:', itemError);
      return res.status(500).json({ error: 'Failed to validate item', details: itemError });
    }

    if (!itemData) {
      console.error('❌ Item not found with ID:', itemId);
      return res.status(404).json({ error: 'Item not found' });
    }

    console.log('⏳ Fetching user details...');
    // Get user's email to check if they're the poster
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(payerUserId);
    
    if (userError) {
      console.error('❌ Error fetching user details:', userError);
      return res.status(500).json({ error: 'Failed to validate user', details: userError });
    }

    if (!userData?.user?.email) {
      console.error('❌ User email not found for ID:', payerUserId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent users from paying for their own items (both lost and found)
    if (itemData.contact_email === userData.user.email) {
      console.log('❌ User trying to unlock their own item');
      return res.status(400).json({ 
        error: 'Cannot unlock own item', 
        message: 'You cannot pay to unlock contact details for your own posted item' 
      });
    }

    console.log('⏳ Creating Razorpay order...');
    
    // Check if Razorpay is available
    if (!razorpay) {
      console.error('❌ Razorpay not initialized - missing environment variables');
      return res.status(500).json({ 
        error: 'Payment service not available', 
        details: 'Razorpay not configured - missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET',
        message: 'Payment service is temporarily unavailable. Please contact support.' 
      });
    }
    
    // Create Razorpay order
    const options = {
      amount: amount, // amount in paise (15 rupees = 1500 paise)
      currency: 'INR',
      receipt: receipt,
      notes: {
        item_id: itemId,
        item_title: itemTitle,
        service: 'lost_found_contact',
        payer_user_id: payerUserId,
        poster_email: itemPosterEmail
      }
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Lost & Found order created successfully:', order.id);
    res.json(order);

  } catch (error) {
    console.error('❌ Error creating Lost & Found order:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Verify payment and process split for Lost & Found
app.post('/verify-lost-found-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      itemId,
      itemTitle,
      itemPosterEmail,
      payerUserId,
      splitDetails
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({ success: false, message: 'Payment not captured' });
    }

    // Store payment in existing orders table
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: payerUserId,
        service_name: 'LostAndFoundContact',
        subservice_name: itemTitle,
        amount: splitDetails.totalAmount,
        payment_method: 'razorpay',
        payment_status: 'completed',
        transaction_id: razorpay_payment_id,
        booking_details: {
          item_id: itemId,
          item_title: itemTitle,
          poster_email: itemPosterEmail,
          razorpay_order_id: razorpay_order_id,
          split_details: splitDetails
        }
      });

    if (orderError) {
      console.error('Error storing order:', orderError);
      // Don't fail the request as payment is successful
    }

    console.log('✅ Lost & Found payment verified and stored successfully');
    res.json({
      success: true,
      message: 'Payment verified and contact details unlocked',
      paymentId: razorpay_payment_id
    });

  } catch (error) {
    console.error('Error verifying Lost & Found payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed', 
      details: error.message 
    });
  }
});

// Check if user has already paid for Lost & Found contact details
app.get('/has-paid-lost-found-contact', async (req, res) => {
  try {
    console.log('🔍 Checking payment status for user:', req.query.user_id, 'item:', req.query.item_id);
    const { user_id, item_id } = req.query;

    if (!user_id || !item_id) {
      console.log('❌ Missing required parameters');
      return res.status(400).json({ error: 'Missing user_id or item_id' });
    }

    console.log('⏳ Checking orders table for payment history...');
    // Check in the orders table for completed payments
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user_id)
      .eq('service_name', 'LostAndFoundContact')
      .eq('payment_status', 'completed')
      .contains('booking_details', { item_id: item_id })
      .limit(1);

    if (error) {
      console.error('❌ Database error in orders table:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const hasPaid = data && data.length > 0;
    console.log(`${hasPaid ? '✅' : '❌'} Payment status result:`, hasPaid);
    res.json({ paid: hasPaid });

  } catch (error) {
    console.error('Error checking Lost & Found payment status:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// Submit application for a lost item
app.post('/submit-lost-item-application', async (req, res) => {
  try {
    console.log('📝 Lost Item Application Submission:', req.body);
    
    const {
      lostItemId,
      lostItemTitle,
      lostItemOwnerEmail,
      applicantUserId,
      applicantName,
      applicantEmail,
      applicantPhone,
      foundPhotoUrl,
      foundDescription,
      foundLocation,
      foundDate
    } = req.body;

    // Validate required fields
    if (!lostItemId || !lostItemOwnerEmail || !applicantName || !applicantEmail || !applicantPhone || !foundPhotoUrl || !foundDescription || !foundLocation || !foundDate) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['lostItemId', 'lostItemOwnerEmail', 'applicantName', 'applicantEmail', 'applicantPhone', 'foundPhotoUrl', 'foundDescription', 'foundLocation', 'foundDate']
      });
    }

    console.log('⏳ Inserting application into database...');
    console.log('Applicant User ID:', applicantUserId);
    // Insert application into database
    const { data: applicationData, error: insertError } = await supabase
      .from('lost_found_applications')
      .insert({
        lost_item_id: lostItemId,
        applicant_user_id: applicantUserId || null,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: applicantPhone,
        found_photo_url: foundPhotoUrl,
        found_description: foundDescription,
        found_location: foundLocation,
        found_date: foundDate,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Database error:', insertError);
      
      // Check if it's a duplicate application error
      if (insertError.code === '23505' || insertError.message.includes('unique_application_per_user_per_item')) {
        return res.status(409).json({ 
          error: 'You have already applied for this lost item. Please wait for the owner to review your application.',
          type: 'duplicate' 
        });
      }
      
      return res.status(500).json({ error: 'Failed to save application', details: insertError.message });
    }

    console.log('✅ Application saved to database:', applicationData.id);

    // Email notification removed - users can view applications directly in the portal
    console.log('📧 Email notification skipped - owner can view applications in portal');

    res.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: applicationData.id
    });

  } catch (error) {
    console.error('❌ Error submitting application:', error);
    res.status(500).json({ 
      error: 'Failed to submit application', 
      details: error.message 
    });
  }
});

// Create order for unlocking application contact details
app.post('/create-application-unlock-order', async (req, res) => {
  try {
    console.log('🔓 Application Unlock Order Request:', req.body);
    
    const { amount, applicationId, lostItemTitle, ownerUserId, receipt } = req.body;

    // Validate required fields
    if (!amount || !applicationId || !ownerUserId) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['amount', 'applicationId', 'ownerUserId'] 
      });
    }

    console.log('⏳ Checking if already paid for this application...');
    // Check if already unlocked
    const { data: existingApplication, error: checkError } = await supabase
      .from('lost_found_applications')
      .select('status')
      .eq('id', applicationId)
      .single();

    if (checkError) {
      console.error('❌ Error checking application:', checkError);
      return res.status(500).json({ error: 'Failed to validate application', details: checkError });
    }

    if (existingApplication.status === 'paid') {
      console.log('❌ Application already unlocked');
      return res.status(400).json({ 
        error: 'Already unlocked', 
        message: 'You have already unlocked this application' 
      });
    }

    console.log('⏳ Creating Razorpay order...');
    
    if (!razorpay) {
      console.error('❌ Razorpay not initialized');
      return res.status(500).json({ 
        error: 'Payment service not available',
        message: 'Payment service is temporarily unavailable. Please contact support.' 
      });
    }
    
    // Create Razorpay order
    const options = {
      amount: amount, // amount in paise (5 rupees = 500 paise)
      currency: 'INR',
      receipt: receipt || `app_unlock_${applicationId}_${Date.now()}`,
      notes: {
        application_id: applicationId,
        service: 'application_contact_unlock',
        owner_user_id: ownerUserId,
        lost_item_title: lostItemTitle
      }
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Application unlock order created:', order.id);
    res.json(order);

  } catch (error) {
    console.error('❌ Error creating application unlock order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Verify payment for application unlock
app.post('/verify-application-unlock-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      applicationId,
      ownerUserId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({ success: false, message: 'Payment not captured' });
    }

    // Update application status to 'paid'
    const { error: updateError } = await supabase
      .from('lost_found_applications')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_id: razorpay_payment_id
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return res.status(500).json({ success: false, message: 'Failed to unlock application' });
    }

    // Store payment in orders table
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: ownerUserId,
        service_name: 'ApplicationContactUnlock',
        subservice_name: `Application ${applicationId}`,
        amount: 5,
        payment_method: 'razorpay',
        payment_status: 'completed',
        transaction_id: razorpay_payment_id,
        booking_details: {
          application_id: applicationId,
          razorpay_order_id: razorpay_order_id
        }
      });

    if (orderError) {
      console.error('Error storing order:', orderError);
      // Don't fail the request as payment is successful
    }

    console.log('✅ Application contact unlocked successfully');
    res.json({
      success: true,
      message: 'Contact details unlocked successfully',
      paymentId: razorpay_payment_id
    });

  } catch (error) {
    console.error('Error verifying application unlock payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed', 
      details: error.message 
    });
  }
});q

// Store active SSE connections
const sseClients = new Set();

// SSE endpoint for real-time admin notifications
app.get('/api/admin/realtime-notifications', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // For nginx

  // Add client to active connections
  sseClients.add(res);
  console.log(`Admin client connected. Total clients: ${sseClients.size}`);

  // Send initial connection success message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Real-time connected' })}\n\n`);

  // Remove client on disconnect
  req.on('close', () => {
    sseClients.delete(res);
    console.log(`Admin client disconnected. Total clients: ${sseClients.size}`);
  });
});

// Broadcast function to send to all connected clients
const broadcastToAdmins = (notification) => {
  const message = `data: ${JSON.stringify(notification)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(message);
    } catch (error) {
      console.error('Error sending SSE:', error);
      sseClients.delete(client);
    }
  });
};

// Set up Supabase real-time subscriptions
const setupAdminRealtimeSubscriptions = () => {
  // Lost & Found channel
  const lostFoundChannel = supabase
    .channel('admin_lost_found_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'lost_found_requests'
    }, (payload) => {
      console.log('🔔 Lost & Found real-time event:', payload);
      
      const notification = {
        type: 'lost_found',
        eventType: payload.eventType,
        data: payload.new,
        timestamp: new Date().toISOString()
      };
      
      broadcastToAdmins(notification);
    })
    .subscribe((status) => {
      console.log('Lost & Found admin channel status:', status);
    });

  // Event Requests channel
  const eventRequestsChannel = supabase
    .channel('admin_event_requests_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'interview_event_requests'
    }, (payload) => {
      console.log('🔔 Event Request real-time event:', payload);
      
      const notification = {
        type: 'event',
        eventType: payload.eventType,
        data: payload.new,
        timestamp: new Date().toISOString()
      };
      
      broadcastToAdmins(notification);
    })
    .subscribe();

  // Resale Listings channel
  const resaleListingsChannel = supabase
    .channel('admin_resale_listings_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'resale_listings'
    }, (payload) => {
      console.log('🔔 Resale Listing real-time event:', payload);
      
      const notification = {
        type: 'resale',
        eventType: payload.eventType,
        data: payload.new,
        timestamp: new Date().toISOString()
      };
      
      broadcastToAdmins(notification);
    })
    .subscribe();

  // Contacts channel
  const contactsChannel = supabase
    .channel('admin_contacts_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'contacts'
    }, (payload) => {
      console.log('🔔 Contact Submission real-time event:', payload);
      
      const notification = {
        type: 'contact',
        eventType: payload.eventType,
        data: payload.new,
        timestamp: new Date().toISOString()
      };
      
      broadcastToAdmins(notification);
    })
    .subscribe();

  return { lostFoundChannel, eventRequestsChannel, resaleListingsChannel, contactsChannel };
};

// Initialize real-time subscriptions when server starts
setupAdminRealtimeSubscriptions();


//Group Dashboard SplitSaathi
app.post("/api/profile/ensure", async (req, res) => {
  const { user_id, email, full_name } = req.body;

  if (!user_id || !email) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Check if profile exists
    const { data: existing, error: selectError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user_id)
      .maybeSingle();

    if (selectError) throw selectError;

    // If not, create one
    if (!existing) {
      const { error: insertError } = await supabase.from("profiles").insert([
        { id: user_id, email, full_name: full_name || email },
      ]);
      if (insertError) throw insertError;
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Error ensuring profile:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
app.get("/api/group/:groupId", async (req, res) => {
  const { groupId } = req.params;
  const { user_id } = req.query; // pass logged-in user's id in query

  try {
    // Fetch group details
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();
    if (groupError) throw groupError;

    // Fetch members
    const { data: members, error: membersError } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId);
    if (membersError) throw membersError;

    // Fetch expenses
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select(`
        *,
        paid_by_member:group_members(*)
      `)
      .eq("group_id", groupId)
      .order("date", { ascending: false });
    if (expensesError) throw expensesError;

    return res.json({
      success: true,
      group,
      members,
      expenses,
    });
  } catch (err) {
    console.error("Error loading group data:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

//HandleContactSubmit
app.post("/api/contact", async (req, res) => {
  try {
    const data = req.body;

    // Validate input
    if (!data.name || !data.email || !data.message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Call your Supabase Edge Function securely
    const { error } = await supabase.functions.invoke("send-contact-email", {
      body: data,
    });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (err) {
    console.error("Error invoking send-contact-email:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
});

//Events
app.post('/api/events/add', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Missing authorization header' });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { formData } = req.body;
    if (!formData?.event_name || !formData?.event_date)
      return res.status(400).json({ success: false, message: 'Event name and date are required' });

    // ✅ Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, email')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const reqs = formData.requirements || [];

    if (profile?.is_admin) {
      // Admin → directly publish to calendar
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([
          {
            ...formData,
            requirements: reqs,
            validation: true,
          },
        ])
        .select();

      if (error) throw error;

      return res.json({
        success: true,
        message: 'Event published successfully!',
        data,
      });
    } else {
      // Regular user → create request
      const { error } = await supabase
        .from('interview_event_requests')
        .insert({
          ...formData,
          requirements: reqs,
          requester_email: user.email,
          user_id: user.id,
          status: 'pending',
        });

      if (error) throw error;

      return res.json({
        success: true,
        message:
          "Event submitted for review! You'll be notified once it's approved.",
      });
    }
  } catch (error) {
    console.error('Event add error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// server.js
app.post("/api/interviews/add", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const { formData } = req.body;
    if (!formData?.interview_name || !formData?.interview_date) {
      return res.status(400).json({ success: false, message: "Interview name and date are required" });
    }

    const reqs = formData.requirements
      ? formData.requirements.split(",").map(r => r.trim()).filter(Boolean)
      : [];

    // Get user profile to check admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profile?.is_admin) {
      const { data, error } = await supabase
        .from("interview_events")
        .insert([{ ...formData, requirements: reqs, validation: true }])
        .select();

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.json({ success: true, message: "Interview added successfully", data });
    } else {
      const { error } = await supabase
        .from("interview_event_requests")
        .insert({
          ...formData,
          requirements: reqs,
          requester_email: user.email,
          user_id: user.id,
          status: "pending",
        });

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.json({
        success: true,
        message: "Interview submitted for review! You'll be notified once it's approved",
      });
    }
  } catch (err) {
    console.error("Interview submit error:", err);
    res.status(500).json({ success: false, message: "Failed to submit interview" });
  }
});

//Society Events
app.get("/api/society-events", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .gte("event_date", today)
      .order("event_date", { ascending: true });

    if (error) throw error;

    // Group by society name (case-insensitive)
    const eventsBySociety = {};
    data?.forEach((event) => {
      const normalizedName = event.society_name.toLowerCase().trim();
      if (!eventsBySociety[normalizedName]) {
        eventsBySociety[normalizedName] = [];
      }
      eventsBySociety[normalizedName].push(event);
    });

    res.status(200).json(eventsBySociety);
  } catch (err) {
    console.error("Error fetching events:", err.message);
    res.status(500).json({ error: "Failed to load events" });
  }
});

//SplitSaathi
app.post("/api/user-groups", async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ error: "Missing userId or email" });
    }

    // Extract roll number from email (e.g., "2105555@kiit.ac.in")
    const rollNumberMatch = email.match(/^(\d+)@/);
    const rollNumber = rollNumberMatch?.[1];

    // Load groups created by user
    const { data: createdGroups, error: createdError } = await supabase
      .from("groups")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (createdError) throw createdError;

    let linkedGroups = [];

    // If roll number found, load groups they're a member of
    if (rollNumber) {
      const { data: memberRecords, error: memberError } = await supabase
        .from("group_members")
        .select("group_id, groups!inner(*)")
        .eq("roll_number", rollNumber);

      if (memberError) throw memberError;

      linkedGroups = memberRecords
        .map((record) => record.groups)
        .filter((group) => group.created_by !== userId); // Avoid duplicates
    }

    // Merge & deduplicate
    const allGroups = [...(createdGroups || []), ...linkedGroups];
    const uniqueGroups = Array.from(
      new Map(allGroups.map((g) => [g.id, g])).values()
    );

    res.status(200).json(uniqueGroups);
  } catch (error) {
    console.error("Error loading user groups:", error.message);
    res.status(500).json({ error: "Failed to load user groups" });
  }
});
app.post("/api/create-group", async (req, res) => {
  try {
    const { userId, groupForm } = req.body;

    if (!userId || !groupForm?.name?.trim()) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate members
    const validMembers = (groupForm.members || []).filter(
      (m) => m.name && m.name.trim() !== ""
    );

    if (validMembers.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one member with a name is required" });
    }

    // 1️⃣ Create the group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: groupForm.name,
        description: groupForm.description,
        currency: groupForm.currency || "₹",
        created_by: userId,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // 2️⃣ Insert members
    const { error: membersError } = await supabase
      .from("group_members")
      .insert(
        validMembers.map((member) => ({
          group_id: group.id,
          name: member.name.trim(),
          email_phone: "",
          roll_number: member.rollNumber?.trim() || null,
        }))
      );

    if (membersError) throw membersError;

    // Return the created group
    res.status(200).json({
      message: "Group created successfully",
      group,
      memberCount: validMembers.length,
    });
  } catch (error) {
    console.error("❌ Error creating group:", error.message);
    res.status(500).json({ error: "Failed to create group" });
  }
});



/* ---------------------- SERVER ---------------------- */
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
