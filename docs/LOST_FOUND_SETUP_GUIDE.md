# 🚀 Quick Setup Guide - Lost & Found Application System

## Step 1: Install Dependencies

```bash
npm install resend
```

## Step 2: Run Database Migration

You need to run the migration to create the `lost_found_applications` table:

### Option A: Using Supabase CLI (Recommended)
```bash
supabase migration up
```

### Option B: Manual (via Supabase Dashboard)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of: `supabase/migrations/20251019_create_lost_found_applications.sql`
4. Click "Run"

## Step 3: Set Up Resend API (Email Service)

### Get Resend API Key:
1. Go to https://resend.com
2. Sign up / Log in
3. Create a new API key
4. Copy the API key

### Add to Environment Variables:
Add to your backend `.env` file:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

**Note**: Email functionality is optional but highly recommended. Without it, owners won't receive email notifications when someone applies.

## Step 4: Test the Feature

### Test as Finder (Harry):
1. Go to Lost & Found portal
2. Navigate to "Lost" tab
3. Find any lost item (not yours)
4. Click "📝 Apply if You Found This"
5. Fill in the form with:
   - Upload a photo (REQUIRED)
   - Description
   - Location where found
   - Date found
   - Your contact details
6. Submit
7. Should see success message

### Test as Owner (John):
1. Go to your lost item
2. Should see "📋 View Applications (X)" button
3. Click to view applications
4. See the photo and details (contact hidden)
5. Click "Pay ₹5 & Unlock Contact Details"
6. Complete Razorpay payment (₹5)
7. Contact details should now be visible!

## Step 5: Verify Email (if Resend configured)

1. Check the email of the lost item owner
2. Should receive email with:
   - Subject: "Someone Found Your Lost Item: [Item Name]"
   - Photo of found item
   - Location and date found
   - Link to view all applications

## 🔍 Troubleshooting

### Application form not opening?
- Check browser console for errors
- Verify user is logged in
- Check that item type is "lost" not "found"

### Email not sending?
- Verify `RESEND_API_KEY` is set in backend `.env`
- Check backend logs for email errors
- Note: Feature works without emails, they're just helpful

### Payment not working?
- Verify Razorpay keys are set
- Check backend is running
- Look for errors in browser console

### Applications not showing?
- Run the database migration
- Check RLS policies are created
- Verify Supabase connection

## ✅ Quick Verification Checklist

- [ ] `npm install resend` completed
- [ ] Database migration run successfully
- [ ] `RESEND_API_KEY` added to backend `.env`
- [ ] Backend server restarted
- [ ] Can see "Apply" button on lost items
- [ ] Application form opens and submits
- [ ] Can view applications as item owner
- [ ] Payment flow works
- [ ] Contact details visible after payment

## 📝 Important Notes

1. **Only LOST items** have the new application system
2. **FOUND items** continue to work as before (no changes)
3. **Owners can unlock multiple applicants** (₹5 each)
4. **Emails are optional** but improve user experience

## 🎯 Next Steps

After verifying everything works:
1. Test with multiple applications on same item
2. Verify email notifications arrive
3. Check payment verification works
4. Test "Mark as Complete" functionality

---

**Need help?** Check the full documentation at `docs/LOST_FOUND_APPLICATION_SYSTEM.md`
