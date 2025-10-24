import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================
// ADMIN DASHBOARD DATA
// ============================================
router.get("/api/admin/dashboard-data", async (req, res) => {
  try {
    const { data: lfRequests } = await supabase
      .from("lost_found_requests")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: eventReqs } = await supabase
      .from("interview_event_requests")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: resaleReqs } = await supabase
      .from("resale_listings")
      .select(`
        *,
        seller:profiles!seller_id(full_name, email),
        images:resale_listing_images(storage_path)
      `)
      .order("created_at", { ascending: false });

    const { data: contacts } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: feedbackData } = await supabase
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: actions } = await supabase
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const today = new Date().toISOString().split("T")[0];
    const actionsToday =
      actions?.filter((a) => a.created_at.startsWith(today)).length || 0;

    const stats = {
      totalPendingLostFound:
        lfRequests?.filter((r) => r.status === "pending").length || 0,
      totalPendingEvents:
        eventReqs?.filter((r) => r.status === "pending").length || 0,
      totalPendingResale:
        resaleReqs?.filter((r) => r.status === "pending").length || 0,
      totalPendingContacts:
        contacts?.filter((c) => c.status === "new").length || 0,
      totalActionsToday: actionsToday,
      totalUsers: totalUsers || 0,
      totalFeedbacks: feedbackData?.length || 0,
      totalUnresolvedFeedbacks:
        feedbackData?.filter((f) => !f.resolved).length || 0,
    };

    res.json({
      lostFoundRequests: lfRequests || [],
      eventRequests: eventReqs || [],
      resaleListings: resaleReqs || [],
      contactSubmissions: contacts || [],
      feedbacks: feedbackData || [],
      adminActions: actions || [],
      stats,
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({
      error: "Failed to fetch admin data",
      message: error.message,
    });
  }
});


// ============================================
// ADMIN APPROVAL ENDPOINTS
// ============================================
router.post('/api/admin/approve-item', async (req, res) => {
  try {
    const { itemId, type, adminUserId } = req.body;
    
    const functionName = type === 'lost-found' ? 'admin-approve-lost-item' : 'admin-approve-event';
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { 
        requestId: itemId, 
        adminUserId 
      }
    });

    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ 
      error: 'Failed to approve item',
      message: error.message 
    });
  }
});

router.post('/api/admin/approve-resale', async (req, res) => {
  try {
    const { listingId, adminUserId } = req.body;
    
    const { data, error } = await supabase.functions.invoke('moderate-resale-listing', {
      body: { 
        listingId,
        action: 'approve',
        adminUserId
      }
    });

    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Resale approval error:', error);
    res.status(500).json({ 
      error: 'Failed to approve listing',
      message: error.message 
    });
  }
});

// ============================================
// ADMIN REJECTION ENDPOINTS
// ============================================
router.post('/api/admin/reject-item', async (req, res) => {
  try {
    const { itemId, type, reason, adminUserId } = req.body;
    
    if (!reason?.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const functionName = type === 'lost-found' ? 'admin-reject-lost-item' : 'admin-reject-event';
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { 
        requestId: itemId, 
        reason,
        adminUserId 
      }
    });

    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({ 
      error: 'Failed to reject item',
      message: error.message 
    });
  }
});

router.post('/api/admin/reject-resale', async (req, res) => {
  try {
    const { listingId, reason, adminUserId } = req.body;
    
    if (!reason?.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const { data, error } = await supabase.functions.invoke('moderate-resale-listing', {
      body: { 
        listingId,
        action: 'reject',
        adminUserId,
        reason
      }
    });

    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Resale rejection error:', error);
    res.status(500).json({ 
      error: 'Failed to reject listing',
      message: error.message 
    });
  }
});

// ============================================
// CONTACT STATUS UPDATE ENDPOINT
// ============================================
router.patch('/api/admin/update-contact-status', async (req, res) => {
  try {
    const { contactId, status } = req.body;
    
    const { error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', contactId);

    if (error) throw error;
    
    res.json({ success: true, message: `Contact marked as ${status}` });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ 
      error: 'Failed to update contact status',
      message: error.message 
    });
  }
});

// ============================================
// FEEDBACK MANAGEMENT ENDPOINTS
// ============================================
router.patch('/api/admin/resolve-feedback', async (req, res) => {
  try {
    const { feedbackId, resolved } = req.body;
    
    const { error } = await supabase
      .from('feedbacks')
      .update({ 
        resolved,
        resolved_at: resolved ? new Date().toISOString() : null
      })
      .eq('id', feedbackId);

    if (error) throw error;
    
    res.json({ 
      success: true, 
      message: resolved ? 'Feedback marked as resolved' : 'Feedback marked as unresolved' 
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ 
      error: 'Failed to update feedback',
      message: error.message 
    });
  }
});

router.delete('/api/admin/delete-feedback/:feedbackId', async (req, res) => {
  try {
    const { feedbackId } = req.params;
    
    const { error } = await supabase
      .from('feedbacks')
      .delete()
      .eq('id', feedbackId);

    if (error) throw error;
    
    res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to delete feedback',
      message: error.message 
    });
  }
});

router.post("/api/feedback", async (req, res) => {
  try {
    const { category, feedback_text, rating } = req.body;

    // Basic validation
    if (!category || !feedback_text) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const { error } = await supabase
      .from("feedbacks")
      .insert([{ category, feedback_text, rating: rating || null }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ success: false, message: "Database insert failed" });
    }

    return res.status(200).json({ success: true, message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Feedback submission failed:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
