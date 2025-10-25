import dotenv from 'dotenv';
dotenv.config(); // ✅ Load environment variables FIRST

import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import SemBooksRoutes from "./routes/SemBooksRoutes.js"
import FacultyRoute from "./routes/FacultyRoute.js"
import StudyMaterialRoute from "./routes/StudyMaterialRoute.js"
import authRoute from './routes/authRoute.js'
import lostFoundRoute from './routes/lost-foundRoute.js'

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

app.use(cookieParser());
app.use("/api/admin", createAdminRoutes(supabase));
app.use("/", createSemBooksRoutes(supabase)); 
app.use("/",FacultyRoute);
app.use("/",StudyMaterialRoute);
app.use("/",authRoute);
app.use("/",lostFoundRoute);

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
// PAYMENT ENDPOINTS (SECURED + CLEANED)
// ============================================

// ✅ Check if the authenticated user has paid to view a Lost & Found contact
app.get('/has-paid-contact', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id;
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

// ✅ Check if user has paid for contact unlock for a specific item
app.get('/has-paid-contact', async (req, res) => {
  const { user_id, item_id, item_title } = req.query;
  if (!user_id || !item_id || !item_title) {
    return res.status(400).json({ error: 'Missing user_id, item_id, or item_title' });
  }
  try {
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
  }
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
    console.error("Error ensuring profile:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
app.get("/api/group/:groupId", async (req, res) => {
  const { groupId } = req.params;
  const { user_id } = req.query;

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

    return res.json({ group, members, expenses });
  } catch (err) {
    console.error("Error fetching group data:", err);
    return res.status(500).json({ error: "Failed to fetch group data" });
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
