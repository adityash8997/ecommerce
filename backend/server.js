import dotenv from 'dotenv';
dotenv.config(); // ✅ Load environment variables FIRST

import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import createAdminRoutes, { createFeedbackRoute } from "./routes/AdminRoute.js";
import createSemBooksRoutes from "./routes/SemBooksRoutes.js";
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';


const app = express();

const allowedOrigins = [  
  "http://localhost:8080",
  "http://10.5.83.177:8080",
  "http://localhost:5173",
  "https://kiitsaathi.vercel.app",
  "https://kiitsaathi-git-satvik-aditya-sharmas-projects-3c0e452b.vercel.app",
  "https://ksaathi.vercel.app"
];

// ✅ MIDDLEWARE MUST COME FIRST (before any routes)
app.use(cookieParser());
app.use(express.json());

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

// ✅ Add request logger
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; // Expecting "Bearer <token>"
  const token = authHeader?.split(' ')[1]; // Get token part

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    req.user_id = decoded.sub; // Supabase stores user ID in "sub"
    next();
  } catch (err) {
    console.error('Invalid token:', err);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  next(err);
});

console.log('🔧 Environment Debug Info:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `✅ Set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : '❌ Missing');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing');

// ✅ Initialize Supabase AFTER environment variables are loaded
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Razorpay instance
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

// ✅ SIMPLE TEST ROUTES FIRST (for debugging)
app.get('/test', (req, res) => {
  console.log('✅ Test endpoint hit!');
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

app.get('/health', async (req, res) => {
  console.log('✅ Health check endpoint hit!');
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

// ✅ NOW register route files (AFTER middleware and supabase initialization)
app.use("/api/admin", createAdminRoutes(supabase));
app.use("/api/feedback", createFeedbackRoute(supabase));
app.use("/", createSemBooksRoutes(supabase));

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

app.get("/api/auth/callback", async (req, res) => {
  try {
    const { access_token } = req.query;

    if (!access_token) {
      return res.status(400).json({ error: "Missing access token" });
    }

    const { data: user, error } = await supabase.auth.getUser(access_token);
    if (error || !user) {
      console.error(error);
      return res.status(401).json({ error: "Invalid token" });
    }

    if (user.user?.email_confirmed_at) {
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

app.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('📝 Signup request received:', req.body.email);
    const { email, password, fullName } = req.body;

    if (!email.endsWith('@kiit.ac.in')) {
      return res.status(400).json({ 
        error: 'Only KIIT College Email IDs (@kiit.ac.in) are allowed to sign up or log in to KIIT Saathi.' 
      });
    }

    console.log('⏳ Calling Supabase signUp...');
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

    console.log('✅ Signup successful');
    res.json({ 
      success: true, 
      user: data.user, 
      session: data.session,
      message: data?.user && !data.session 
        ? 'Check your email for the confirmation link' 
        : 'Account created successfully'
    });
  } catch (error) {
    console.error('❌ Sign up error:', error);
    res.status(400).json({ 
      error: error.message || 'An error occurred during sign up' 
    });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

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

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

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

// ============================================
// PAYMENT ENDPOINTS
// ============================================

// ============================================
// PAYMENT ENDPOINTS (SECURED + CLEANED)
// ============================================

// ✅ Check if the authenticated user has paid to view a Lost & Found contact
app.get('/has-paid-contact', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // authenticated user
    const { item_id, item_title } = req.query;

    if (!item_id || !item_title) {
      return res.status(400).json({ error: 'Missing item_id or item_title' });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user_id)
      .eq('service_name', 'LostAndFound')
      .eq('subservice_name', item_title)
      .eq('payment_status', 'completed')
      .limit(1);

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.json({ paid: !!(data && data.length) });
  } catch (err) {
    console.error('Unexpected error in /has-paid-contact:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

// ✅ Create a generic Razorpay order (amount in rupees -> converted to paise)
app.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!razorpay) {
      return res.status(500).json({
        error: 'Payment service not available - Razorpay not configured',
      });
    }
    if (!amount || !receipt) {
      return res.status(400).json({ error: 'Missing amount or receipt' });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // rupees -> paise
      currency,
      receipt,
    });

    return res.json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// ✅ Verify a generic payment and record it to orders
app.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      service_name,
      subservice_name,
      amount,
      payment_method = 'razorpay',
      currency = 'INR',
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !service_name || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Signature verify
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Optional: fetch payment to double-check status
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment.status !== 'captured') {
        return res.status(400).json({ error: 'Payment not captured' });
      }
    } catch (e) {
      console.warn('Razorpay fetch warning:', e?.message);
    }

    const { error } = await supabase.from('orders').insert({
      user_id,
      service_name,
      subservice_name: subservice_name || null,
      amount,
      payment_status: 'completed',
      transaction_id: razorpay_payment_id,
      payment_method,
      booking_details: { currency, razorpay_order_id },
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save order' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Unexpected error in /verify-payment:', err);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// ✅ Create order for Lost & Found contact unlock (amount expected in **paise**)
app.post('/create-lost-found-order', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // payer
    const { amount, itemId, itemTitle, itemPosterEmail, receipt } = req.body;

    if (!razorpay) {
      return res.status(500).json({ error: 'Payment service not available' });
    }
    if (!amount || !itemId || !itemTitle) {
      return res.status(400).json({ error: 'Missing amount, itemId, or itemTitle' });
    }

    // Validate item and prevent paying for own item
    const { data: itemData, error: itemError } = await supabase
      .from('lost_and_found_items')
      .select('contact_email')
      .eq('id', itemId)
      .single();

    if (itemError || !itemData) {
      return res.status(404).json({ error: 'Lost item not found' });
    }
    if (itemData.contact_email && itemPosterEmail && itemData.contact_email === itemPosterEmail) {
      return res.status(400).json({ error: 'You cannot unlock your own item' });
    }

    // Check existing completed payment for the same user & item
    const { data: existingPayment, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user_id)
      .eq('service_name', 'LostAndFoundContact')
      .eq('payment_status', 'completed')
      .contains('booking_details', { item_id: itemId })
      .limit(1);

    if (checkError) {
      console.error('Check existing payment error:', checkError);
      return res.status(500).json({ error: 'Failed to validate payment status' });
    }
    if (existingPayment && existingPayment.length > 0) {
      return res.status(400).json({ error: 'Payment already completed for this item' });
    }

    const order = await razorpay.orders.create({
      amount, // already in paise
      currency: 'INR',
      receipt: receipt || `lost_found_${itemId}_${Date.now()}`,
      notes: {
        item_id: itemId,
        item_title: itemTitle,
        payer_user_id: user_id,
        poster_email: itemPosterEmail || '',
      },
    });

    return res.json(order);
  } catch (error) {
    console.error('Error creating Lost & Found order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// ✅ Verify Lost & Found payment (paise) and store
app.post('/verify-lost-found-payment', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // payer
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      itemId,
      itemTitle,
      itemPosterEmail,
      splitDetails, // optional metadata from client
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !itemId || !itemTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Optional: verify captured
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment.status !== 'captured') {
        return res.status(400).json({ error: 'Payment not captured' });
      }
    } catch (e) {
      console.warn('Razorpay fetch warning:', e?.message);
    }

    const { error: orderError } = await supabase.from('orders').insert({
      user_id,
      service_name: 'LostAndFoundContact',
      subservice_name: itemTitle,
      amount: splitDetails?.totalAmount || null, // optional
      payment_method: 'razorpay',
      payment_status: 'completed',
      transaction_id: razorpay_payment_id,
      booking_details: {
        item_id: itemId,
        item_title: itemTitle,
        poster_email: itemPosterEmail || '',
        razorpay_order_id,
        split_details: splitDetails || null,
      },
    });
    if (orderError) {
      console.error('Error storing order:', orderError);
      // continue — payment is successful regardless
    }

    return res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error('Error verifying Lost & Found payment:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

// ✅ Check if the authenticated user already paid for Lost & Found contact (by item)
app.get('/has-paid-lost-found-contact', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { item_id } = req.query;

    if (!item_id) {
      return res.status(400).json({ error: 'Missing item_id' });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user_id)
      .eq('service_name', 'LostAndFoundContact')
      .eq('payment_status', 'completed')
      .contains('booking_details', { item_id })
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.json({ paid: !!(data && data.length) });
  } catch (error) {
    console.error('Error checking Lost & Found payment status:', error);
    return res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// ✅ Submit application for a lost item (owner will review later)
app.post('/submit-lost-item-application', authenticateToken, async (req, res) => {
  try {
    const applicantUserId = req.user_id; // authenticated applicant
    const {
      lostItemId,
      lostItemTitle,
      lostItemOwnerEmail,
      applicantName,
      applicantEmail,
      applicantPhone,
      foundPhotoUrl,
      foundDescription,
      foundLocation,
      foundDate,
    } = req.body;

    if (!lostItemId || !lostItemOwnerEmail || !applicantName || !applicantEmail || !applicantPhone || !foundPhotoUrl || !foundDescription || !foundLocation || !foundDate) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

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
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505' || `${insertError.message}`.includes('unique_application_per_user_per_item')) {
        return res.status(409).json({
          error: 'You have already applied for this lost item. Please wait for the owner to review your application.',
          type: 'duplicate',
        });
      }
      console.error('Database insert error:', insertError);
      return res.status(500).json({ error: 'Failed to save application' });
    }

    return res.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: applicationData.id,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({ error: 'Failed to submit application' });
  }
});

// ✅ Create order for unlocking application contact details (owner pays) — amount in **paise**
app.post('/create-application-unlock-order', authenticateToken, async (req, res) => {
  try {
    const ownerUserId = req.user_id; // authenticated owner
    const { amount, applicationId, lostItemTitle, receipt } = req.body;

    if (!razorpay) {
      return res.status(500).json({ error: 'Payment service not available' });
    }
    if (!amount || !applicationId) {
      return res.status(400).json({ error: 'Missing amount or applicationId' });
    }

    // Check if already unlocked (status paid)
    const { data: existingApplication, error: checkError } = await supabase
      .from('lost_found_applications')
      .select('status')
      .eq('id', applicationId)
      .single();

    if (checkError) {
      console.error('Check application error:', checkError);
      return res.status(500).json({ error: 'Failed to validate application' });
    }
    if (existingApplication?.status === 'paid') {
      return res.status(400).json({ error: 'Already unlocked' });
    }

    const order = await razorpay.orders.create({
      amount, // paise
      currency: 'INR',
      receipt: receipt || `app_unlock_${applicationId}_${Date.now()}`,
      notes: {
        application_id: applicationId,
        service: 'application_contact_unlock',
        owner_user_id: ownerUserId,
        lost_item_title: lostItemTitle || '',
      },
    });

    return res.json(order);
  } catch (error) {
    console.error('Error creating application unlock order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// ✅ Verify payment for application unlock and store
app.post('/verify-application-unlock-payment', authenticateToken, async (req, res) => {
  try {
    const ownerUserId = req.user_id; // authenticated owner
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      applicationId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !applicationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Optional: verify captured
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment.status !== 'captured') {
        return res.status(400).json({ error: 'Payment not captured' });
      }
    } catch (e) {
      console.warn('Razorpay fetch warning:', e?.message);
    }

    // Update application to paid
    const { error: updateError } = await supabase
      .from('lost_found_applications')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_id: razorpay_payment_id,
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return res.status(500).json({ error: 'Failed to unlock application' });
    }

    // Record order (owner paid)
    const { error: orderError } = await supabase.from('orders').insert({
      user_id: ownerUserId,
      service_name: 'ApplicationContactUnlock',
      subservice_name: `Application ${applicationId}`,
      amount: null, // optional to store; if you want a fixed amount, set it in client and pass here
      payment_method: 'razorpay',
      payment_status: 'completed',
      transaction_id: razorpay_payment_id,
      booking_details: {
        application_id: applicationId,
        razorpay_order_id,
      },
    });
    if (orderError) {
      console.error('Error storing order:', orderError);
      // continue — payment is successful regardless
    }

    return res.json({
      success: true,
      message: 'Contact details unlocked successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Error verifying application unlock payment:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});q



{/* ---------------------- assignment hook ENDPOINTS ---------------------- */}

/**
 * GET /api/assignments
 * Fetch assignments for the logged-in user.
 */
/**
 * ✅ GET /api/assignments (SECURED)
 * Fetch assignments for the logged-in user.
 */
app.get('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id; // ✅ Secure user ID from token

    const { data, error } = await supabase
      .from('assignment_requests')
      .select(`*, assignment_files(*)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ assignments: data || [] });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});


/**
 * ✅ POST /api/assignments (SECURED)
 * Body: formData (no user_id required anymore — we use token)
 */
app.post('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id; // ✅ Secure user ID from token
    const { name, whatsapp, year, branch, pages, deadline, hostel, room,
      notes, urgent, matchHandwriting, deliveryMethod } = req.body;

    // ✅ Server-side pricing logic here
    const basePrice = pages * (urgent ? 15 : 10);
    const matchingFee = matchHandwriting ? 20 : 0;
    const deliveryFee = deliveryMethod === 'hostel_delivery' ? 10 : 0;
    const totalPrice = basePrice + matchingFee + deliveryFee;

    const { data, error } = await supabase
      .from('assignment_requests')
      .insert({
        user_id: userId,
        student_name: name,
        whatsapp_number: whatsapp,
        year,
        branch,
        pages,
        deadline,
        hostel_name: hostel,
        room_number: room,
        special_instructions: notes,
        is_urgent: urgent,
        match_handwriting: matchHandwriting,
        delivery_method: deliveryMethod || 'hostel_delivery',
        total_price: totalPrice,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, assignment: data });
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});


/**
 * ✅ GET /api/files/signed-url (SECURED)
 */
app.get('/api/files/signed-url', authenticateToken, async (req, res) => {
  try {
    const { path } = req.query;
    if (!path) return res.status(400).json({ error: 'File path required' });

    const { data, error } = await supabase.storage
      .from('assignment-files')
      .createSignedUrl(path, 3600); // 1 hour

    if (error) throw error;

    res.json({ url: data.signedUrl });
  } catch (err) {
    console.error('Error creating signed URL:', err);
    res.status(500).json({ error: 'Failed to generate URL' });
  }
});



{/* ---------------------- events hook ENDPOINTS  ---------------------- */}

/**
 * GET /api/events
 * Returns validated and chronological events
 */
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('validation', true)
      .order('event_date', { ascending: true });

    if (error) throw error;

    res.json({ events: data || [] });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});


{/* ---------------------- group auto link ENDPOINTS  ---------------------- */}

// ✅ FINAL FIXED BACKEND ENDPOINT (no foreign key joins required)
// POST /api/groups/auto-link
// ✅ SECURED version of POST /api/groups/auto-link
// ✅ SECURED version of POST /api/groups/auto-link
app.post('/api/groups/auto-link', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ From token

    // ✅ Fetch user email from Supabase Auth system
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !userData?.user?.email) {
      return res.status(400).json({ error: 'Could not fetch user email' });
    }
    const email = userData.user.email;

    // ✅ Extract roll number from email
    const rollMatch = email.match(/^(\d+)@/);
    if (!rollMatch) {
      return res.json({ newGroups: [] });
    }
    const rollNumber = rollMatch[1];

    // ✅  Fetch matching groups based on roll_number in group_members
    const { data: matchingMembers, error: membersError } = await supabase
      .from('group_members')
      .select(`
        id,
        roll_number,
        group_id,
        groups!inner(
          id,
          name,
          created_by
        )
      `)
      .eq('roll_number', rollNumber);

    if (membersError) throw membersError;
    if (!matchingMembers || matchingMembers.length === 0) {
      return res.json({ newGroups: [] });
    }

    const newGroups = [];

    // ✅ Loop through matched groups
    for (const member of matchingMembers) {
      const group = member.groups;
      if (!group) continue;

      // ✅ Skip if user created this group
      if (group.created_by === user_id) continue;

      // ✅ Check if notification exists
      const { data: existingNotification } = await supabase
        .from('group_notifications')
        .select('id')
        .eq('user_id', user_id)
        .eq('group_id', group.id)
        .single();

      if (existingNotification) continue;

      // ✅ Insert notification
      await supabase
        .from('group_notifications')
        .insert({ user_id, group_id: group.id });

      // ✅ Fetch group creator info
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', group.created_by)
        .single();

      const creatorName = creatorProfile?.full_name || 'Unknown';
      const creatorEmail = creatorProfile?.email || '';
      const creatorRollNumber = creatorEmail.match(/^(\d+)@/)?.[1] || '';

      newGroups.push({
        name: group.name,
        creatorName,
        creatorRollNumber,
        rollNumber
      });
    }

    return res.json({ newGroups });
  } catch (err) {
    console.error('Error auto-linking groups:', err);
    return res.status(500).json({ error: 'Failed to auto-link groups' });
  }
});



{/* ---------------------- use order history hook ENDPOINTS  ---------------------- */}

// 1️⃣ GET /api/orders - Fetch user's orders
// ✅ GET /api/orders - Fetch user's orders (SECURED)
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ Secure user from token

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ orders: data || [] });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});


// ✅ POST /api/orders - Create new order (SECURED)
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ Secure user from token
    const { service_name, subservice_name, amount, payment_status, transaction_id, payment_method, booking_details } = req.body;

    if (!service_name || !amount || !payment_status) {
      return res.status(400).json({ error: 'Missing required fields: service_name, amount, or payment_status' });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id,
        service_name,
        subservice_name: subservice_name || null,
        amount,
        payment_status,
        transaction_id: transaction_id || null,
        payment_method: payment_method || null,
        booking_details: booking_details || null
      })
      .select()
      .single();

    if (error) throw error;

    return res.json({ order: data });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});


// ✅ PATCH /api/orders/:id/status - Update order payment status (SECURED)
app.patch('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ Secure user from token
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Missing status field' });
    }

    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status })
      .eq('id', id)
      .eq('user_id', user_id); // ✅ Prevent updating others' orders

    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

{/* ---------------------- use policy manager hook ENDPOINTS END ---------------------- */}

// ✅ Get user policy acceptance
// ✅ Get user policy acceptance (SECURED)
app.get('/api/policy', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ From JWT

    const { data, error } = await supabase
      .from('policy_acceptances')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return res.json({ policyData: data || null });
  } catch (err) {
    console.error('Error fetching policy acceptance:', err);
    return res.status(500).json({ error: 'Failed to fetch policy data' });
  }
});


// ✅ Accept Privacy Policy (SECURED)
app.post('/api/policy/privacy', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ From token
    const { privacy_policy_version } = req.body;

    if (!privacy_policy_version) {
      return res.status(400).json({ error: 'Missing privacy_policy_version' });
    }

    const updateData = {
      user_id,
      privacy_policy_accepted: true,
      privacy_policy_version,
      last_updated: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('policy_acceptances')
      .upsert(updateData, { onConflict: 'user_id' });

    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    console.error('Error accepting privacy policy:', err);
    return res.status(500).json({ error: 'Failed to accept privacy policy' });
  }
});


// ✅ Accept Terms & Conditions (SECURED)
app.post('/api/policy/terms', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ From token
    const { terms_conditions_version } = req.body;

    if (!terms_conditions_version) {
      return res.status(400).json({ error: 'Missing terms_conditions_version' });
    }

    const updateData = {
      user_id,
      terms_conditions_accepted: true,
      terms_conditions_version,
      last_updated: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('policy_acceptances')
      .upsert(updateData, { onConflict: 'user_id' });

    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    console.error('Error accepting terms:', err);
    return res.status(500).json({ error: 'Failed to accept terms' });
  }
});


{/* ---------------------- use secure los tand found hook ENDPOINTS ---------------------- */}

// ✅ GET Lost & Found items (active only)
// ✅ GET Lost & Found items (active only) - SECURED
app.get('/api/lostfound', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lost_and_found_items')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ items: data || [] });
  } catch (err) {
    console.error('Error fetching lost & found items:', err);
    return res.status(500).json({ error: 'Failed to fetch items' });
  }
});


// ✅ POST - Add a new Lost/Found item (SECURED)
app.post('/api/lostfound', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ SECURE USER ID
    const { ...itemData } = req.body;

    const newItem = {
      ...itemData,
      user_id,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('lost_and_found_items')
      .insert(newItem)
      .select()
      .single();

    if (error) throw error;

    return res.json({ item: data });
  } catch (err) {
    console.error('Error adding lost & found item:', err);
    return res.status(500).json({ error: 'Failed to add item' });
  }
});


// ✅ PATCH - Update an existing Lost/Found item (SECURED)
app.patch('/api/lostfound/:id', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ SECURE USER ID
    const { id } = req.params;
    const { ...updates } = req.body;

    // ✅ Only allow user to update THEIR item
    const { data, error } = await supabase
      .from('lost_and_found_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(403).json({ error: 'Unauthorized to update this item' });
    }

    return res.json({ item: data });
  } catch (err) {
    console.error('Error updating lost & found item:', err);
    return res.status(500).json({ error: 'Failed to update item' });
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



{/* ---------------------- use service visibility hook ENDPOINTS ---------------------- */}


// ✅ GET service visibility data
app.get('/api/service-visibility', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_visibility')
      .select('*');

    if (error) throw error;

    return res.json({ services: data || [] });
  } catch (err) {
    console.error('Error fetching service visibility:', err);
    return res.status(500).json({ error: 'Failed to fetch service visibility' });
  }
});





/* ---------------------- SERVER ---------------------- */
const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
