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
import authRoute from './routes/authRoute.js'
import lostFoundRoute from './routes/lost-foundRoute.js'



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
app.use("/",StudyMaterialRoute);
app.use("/",authRoute);
app.use("/",lostFoundRoute);



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
