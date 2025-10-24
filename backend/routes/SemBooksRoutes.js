import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

router.use(express.json());

router.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  next(err);
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// New Endpoints for Semester Data
router.get('/api/semester-books', async (req, res) => {
  const { semester } = req.query;
  if (!semester || isNaN(Number(semester))) {
    return res.status(400).json({ error: 'Invalid or missing semester parameter' });
  }

  try {
    const { data, error } = await supabase
      .from('semester_books')
      .select('*')
      .eq('semester', Number(semester))
      .order('subject_category', { ascending: true });

    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching semester books:', error);
    res.status(500).json({ error: 'Failed to fetch semester books' });
  }
});

router.get('/api/semester-combos', async (req, res) => {
  const { semester } = req.query;
  if (!semester || isNaN(Number(semester))) {
    return res.status(400).json({ error: 'Invalid or missing semester parameter' });
  }

  try {
    const { data, error } = await supabase
      .from('semester_combos')
      .select('*')
      .eq('semester_number', Number(semester));

    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching semester combos:', error);
    res.status(500).json({ error: 'Failed to fetch semester combos' });
  }
});

export default router;