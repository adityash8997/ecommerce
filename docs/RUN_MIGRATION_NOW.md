# 🚨 URGENT: Run Database Migration

## Error You're Seeing
```
Could not find the table 'public.lost_found_applications' in the schema cache
```

This error occurs because the database table hasn't been created yet.

## How to Fix (2 Minutes)

### Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Open your project: `kiitsaathi`

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Migration**
   - Open file: `supabase/migrations/20251019_create_lost_found_applications.sql`
   - Copy the ENTIRE contents (all 69 lines)
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Ctrl+Enter)
   - You should see: "Success. No rows returned"

5. **Verify Table Created**
   - Click "Table Editor" in left sidebar
   - Look for `lost_found_applications` table
   - You should see it with columns: id, lost_item_id, applicant_name, etc.

### Option 2: Supabase CLI (If you have it installed)

```powershell
# Navigate to project root
cd c:\Users\KIIT\kiitsaathi

# Apply migration
supabase db push
```

## What This Creates

The migration creates:
- ✅ `lost_found_applications` table with proper schema
- ✅ Foreign key relationships to `lost_and_found_items`
- ✅ Indexes for query performance
- ✅ Row Level Security (RLS) policies for privacy
- ✅ Status tracking (pending, paid, rejected)

## After Running Migration

Once you see "Success" in Supabase dashboard:

1. **Go back to your application**
2. **Try submitting an application again**
3. **It should work now!**

## Test Data

After migration, you can test by:
- Posting a LOST item
- Switching to different user account
- Clicking "Apply if You Found This"
- Uploading a photo and submitting

---

**Need Help?**
If you see any errors while running the migration, copy the error message and share it.
