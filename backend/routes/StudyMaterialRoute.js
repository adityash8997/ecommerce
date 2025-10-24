import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fetch study material requests
router.get("/api/admin/study-material-requests", async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from("study_material_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (error) {
    console.error("Error fetching study material requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// Get signed preview URL
router.get("/api/admin/study-material-preview-url", async (req, res) => {
  try {
    const { path } = req.query;
    if (!path) return res.status(400).json({ error: "Missing path" });
    const { data, error } = await supabase.storage
      .from("study-material-pending")
      .createSignedUrl(path, 300);
    if (error) throw error;
    res.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error("Error creating signed URL:", error);
    res.status(500).json({ error: "Failed to create signed URL" });
  }
});

// Approve study material
router.post("/api/admin/study-material-approve", async (req, res) => {
  try {
    const { request_id, adminUserId } = req.body;
    // Call your edge function or implement approval logic here
    // For now, just update status
    const { error } = await supabase
      .from("study_material_requests")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", request_id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error("Error approving material:", error);
    res.status(500).json({ success: false, error: "Failed to approve material" });
  }
});

// Reject study material
router.post("/api/admin/study-material-reject", async (req, res) => {
  try {
    const { request_id, admin_comment } = req.body;
    const { error } = await supabase
      .from("study_material_requests")
      .update({ status: "rejected", admin_comment, updated_at: new Date().toISOString() })
      .eq("id", request_id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error("Error rejecting material:", error);
    res.status(500).json({ success: false, error: "Failed to reject material" });
  }
});

export default router;
