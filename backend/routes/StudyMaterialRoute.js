import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Upload study material and submit request
router.post("/api/study-material/upload", async (req, res) => {
  try {
    // Use express-fileupload or multer for file parsing if not already set up
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded", success: false });
    }
    const file = req.files.file;
    const {
      title, subject, semester, branch, year, folder_type, uploader_name
    } = req.body;
    if (!title || !subject || !semester || !folder_type || !uploader_name) {
      return res.status(400).json({ error: "Missing required fields", success: false });
    }
    // Validate file type and size
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: "Invalid file type", success: false });
    }
    if (file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ error: "File size exceeds 50MB limit", success: false });
    }
    // Generate filename
    const userId = req.user?.id || "anonymous";
    const timestamp = Date.now();
    const filename = `${userId}/${timestamp}_${file.name}`;
    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('study-material-pending')
      .upload(filename, file.data, {
        contentType: file.mimetype,
        upsert: false
      });
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file', success: false });
    }
    // Insert request into DB
    const { error: insertError } = await supabase
      .from('study_material_requests')
      .insert({
        title,
        subject,
        semester,
        branch,
        year,
        folder_type,
        filename: file.name,
        storage_path: filename,
        filesize: file.size,
        mime_type: file.mimetype,
        uploader_name,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    if (insertError) {
      // Cleanup uploaded file
      await supabase.storage.from('study-material-pending').remove([filename]);
      return res.status(500).json({ error: 'Failed to submit request', success: false });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Study material upload error:', error);
    res.status(500).json({ error: 'Failed to submit material', success: false });
  }
});

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
