import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const app = express();

const allowedOrigins = [
  "http://localhost:8080",
  "http://10.5.83.177:8080",
  "http://localhost:5173",
  "https://kiitsaathi.vercel.app",
  "https://kiitsaathi-git-satvik-aditya-sharmas-projects-3c0e452b.vercel.app",
   "https://ksaathi.vercel.app"
];

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
});


{/* ---------------------- assignment hook ENDPOINTS ---------------------- */}

/**
 * GET /api/assignments
 * Fetch assignments for the logged-in user.
 */
app.get('/api/assignments', async (req, res) => {
  try {
    const userId = req.query.user_id; // Replace with decoded token later

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - Missing User ID' });
    }

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
 * GET /api/helpers
 */
app.get('/api/helpers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('assignment_helpers')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) throw error;

    res.json({ helpers: data || [] });
  } catch (err) {
    console.error('Error fetching helpers:', err);
    res.status(500).json({ error: 'Failed to fetch helpers' });
  }
});


/**
 * POST /api/assignments
 * Body: formData + files count (no files yet)
 */
app.post('/api/assignments', async (req, res) => {
  try {
    const { user_id, name, whatsapp, year, branch, pages, deadline, hostel, room,
      notes, urgent, matchHandwriting, deliveryMethod } = req.body;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized - Missing User ID' });
    }

    // Server-side pricing logic (SECURED)
    const basePrice = pages * (urgent ? 15 : 10);
    const matchingFee = matchHandwriting ? 20 : 0;
    const deliveryFee = deliveryMethod === 'hostel_delivery' ? 10 : 0;
    const totalPrice = basePrice + matchingFee + deliveryFee;

    const { data, error } = await supabase
      .from('assignment_requests')
      .insert({
        user_id,
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
 * GET /api/files/signed-url?path=some/path
 */
app.get('/api/files/signed-url', async (req, res) => {
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
app.get('/api/events', async (req, res) => {
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
app.post('/api/groups/auto-link', async (req, res) => {
  try {
    const { user_id, email } = req.body; // TEMP: will replace with token later

    if (!user_id || !email) {
      return res.status(400).json({ error: 'Missing user_id or email' });
    }

    // 1️⃣ Extract roll number from email
    const rollMatch = email.match(/^(\d+)@/);
    if (!rollMatch) {
      return res.json({ newGroups: [] });
    }
    const rollNumber = rollMatch[1];

    // 2️⃣ Fetch matching groups based on roll_number in group_members
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

    // 3️⃣ Loop through matched groups
    for (const member of matchingMembers) {
      const group = member.groups;
      if (!group) continue;

      // Skip if user created this group
      if (group.created_by === user_id) continue;

      // 4️⃣ Check if notification exists
      const { data: existingNotification } = await supabase
        .from('group_notifications')
        .select('id')
        .eq('user_id', user_id)
        .eq('group_id', group.id)
        .single();

      if (existingNotification) continue;

      // 5️⃣ Insert notification
      await supabase
        .from('group_notifications')
        .insert({ user_id, group_id: group.id });

      // 6️⃣ Fetch creator profile manually (no FK needed)
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
app.get('/api/orders', async (req, res) => {
  try {
let { user_id } = req.query;
user_id = user_id?.toString().trim().replace(/"/g, "");

    // ✅ Log raw incoming value
    console.log('Raw user_id received:', JSON.stringify(user_id));

    // ✅ If user_id received, sanitize by trimming any whitespace/newline
    if (user_id) {
      user_id = user_id.toString().trim(); // removes \n, space
    }

    // ✅ Log sanitized value
    console.log('Sanitized user_id:', JSON.stringify(user_id));

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

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


// 2️⃣ POST /api/orders - Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { user_id, service_name, subservice_name, amount, payment_status, transaction_id, payment_method, booking_details } = req.body;

    if (!user_id || !service_name || !amount || !payment_status) {
      return res.status(400).json({ error: 'Missing required fields: user_id, service_name, amount, or payment_status' });
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

// 3️⃣ PATCH /api/orders/:id/status - Update order payment status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, status } = req.body; // TEMP

    if (!user_id || !status) {
      return res.status(400).json({ error: 'Missing user_id or status' });
    }

    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status })
      .eq('id', id)
      .eq('user_id', user_id); // Prevent updating others' orders

    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

{/* ---------------------- use policy manager hook ENDPOINTS END ---------------------- */}

// ✅ Get user policy acceptance
app.get('/api/policy', async (req, res) => {
  try {
    let { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    user_id = user_id.toString().trim().replace(/"/g, "");

    const { data, error } = await supabase
      .from('policy_acceptances')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // ignore "no rows" error

    return res.json({ policyData: data || null });
  } catch (err) {
    console.error('Error fetching policy acceptance:', err);
    return res.status(500).json({ error: 'Failed to fetch policy data' });
  }
});

// ✅ Accept privacy policy
app.post('/api/policy/privacy', async (req, res) => {
  try {
    const { user_id, privacy_policy_version } = req.body;
    if (!user_id || !privacy_policy_version) {
      return res.status(400).json({ error: 'Missing user_id or privacy_policy_version' });
    }

    const updateData = {
      user_id,
      privacy_policy_accepted: true,
      privacy_policy_version,
      last_updated: new Date().toISOString()
    };

    const { error } = await supabase
      .from('policy_acceptances')
      .upsert(updateData, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Supabase UPSERT Error:', error);
      throw error;
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Error accepting privacy policy:', err);
    return res.status(500).json({ error: 'Failed to accept privacy policy' });
  }
});


// ✅ Accept Terms & Conditions
app.post('/api/policy/terms', async (req, res) => {
  try {
    const { user_id, terms_conditions_version } = req.body;
    if (!user_id || !terms_conditions_version) {
      return res.status(400).json({ error: 'Missing user_id or terms_conditions_version' });
    }

    const updateData = {
      user_id,
      terms_conditions_accepted: true,
      terms_conditions_version,
      last_updated: new Date().toISOString(),
      updated_at: new Date().toISOString() // optional, since you've now added it
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
app.get('/api/lostfound', async (req, res) => {
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


// ✅ POST - Add a new Lost/Found item
app.post('/api/lostfound', async (req, res) => {
  try {
    const { user_id, ...itemData } = req.body; // ✅ TEMP: user_id passed manually

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

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


// ✅ PATCH - Update an existing Lost/Found item
app.patch('/api/lostfound/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, ...updates } = req.body;

    // ✅ TEMP: Ensure same user is making the update
    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    const { data, error } = await supabase
      .from('lost_and_found_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user_id) // ✅ Ensures users can only update their own items (temporary logic)
      .select()
      .single();

    if (error) throw error;

    return res.json({ item: data });
  } catch (err) {
    console.error('Error updating lost & found item:', err);
    return res.status(500).json({ error: 'Failed to update item' });
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
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
