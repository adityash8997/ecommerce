import express from "express";
import { createClient } from "@supabase/supabase-js";
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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
// Group balances endpoint for ViewBalances
app.get('/api/group/:groupId/balances', async (req, res) => {
  const { groupId } = req.params;
  try {
    const { data, error } = await supabase.rpc('calculate_group_balances', {
      _group_id: groupId
    });
    if (error) return res.status(500).json({ error: error.message, data: [] });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch balances', data: [] });
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


export default router;
