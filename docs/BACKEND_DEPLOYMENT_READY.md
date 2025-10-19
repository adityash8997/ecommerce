# Lost & Found Backend - Ready for Render Deployment

## ✅ All Changes Complete

The Lost & Found application system is now **fully functional** and **ready to deploy** to Render.

---

## 🎯 What's Included

### Core Features
1. ✅ **Application System** - Users can apply for lost items with photo proof
2. ✅ **User ID Tracking** - Applications linked to user accounts (prevents duplicates, enables state persistence)
3. ✅ **Photo Upload** - Finders upload photos via Supabase Storage
4. ✅ **Privacy Protection** - Contact details hidden until payment
5. ✅ **Payment Integration** - Razorpay ₹5 per unlock
6. ✅ **Duplicate Prevention** - Database constraint + backend validation + frontend check
7. ✅ **Button State Persistence** - "Already Applied" stays greyed after refresh
8. ✅ **RLS Security** - Row-level policies protect data access

### What's NOT Included (By Design)
- ❌ Email notifications - **Removed** because users can view applications directly in the portal

---

## 📦 Backend Endpoints

### 1. Submit Application
```
POST /submit-lost-item-application

Body:
{
  lostItemId: "uuid",
  lostItemTitle: "string",
  lostItemOwnerEmail: "string",
  applicantUserId: "uuid",       // ✅ User ID tracked
  applicantName: "string",
  applicantEmail: "string",
  applicantPhone: "string",
  foundPhotoUrl: "string",       // Supabase Storage URL
  foundDescription: "string",
  foundLocation: "string",
  foundDate: "YYYY-MM-DD"
}

Responses:
- 200: Success
- 400: Missing required fields
- 409: Duplicate application (user already applied)
- 500: Server error
```

### 2. Create Unlock Order
```
POST /create-application-unlock-order

Body:
{
  amount: 500,                   // ₹5 in paise
  applicationId: "uuid",
  lostItemTitle: "string",
  ownerUserId: "uuid",
  receipt: "string"
}

Responses:
- 200: Order created (returns Razorpay order)
- 400: Missing required fields
- 409: Already paid
- 500: Server error
```

### 3. Verify Payment
```
POST /verify-application-unlock-payment

Body:
{
  razorpay_order_id: "string",
  razorpay_payment_id: "string",
  razorpay_signature: "string",
  applicationId: "uuid",
  ownerUserId: "uuid"
}

Responses:
- 200: Payment verified, contact details unlocked
- 400: Invalid signature or missing fields
- 500: Server error
```

---

## 🔧 Environment Variables Required

### Backend (.env)
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# Razorpay (Live Keys)
RAZORPAY_KEY_ID=rzp_live_RLPa3HxTgjff9E
RAZORPAY_KEY_SECRET=your_live_secret

# Server
PORT=3001
```

### Frontend (.env)
```env
# IMPORTANT: Change this after deploying backend to Render
VITE_LOST_FOUND_API_URL=http://localhost:3001
# Should become: https://your-backend.onrender.com

# Razorpay (Frontend)
VITE_RAZORPAY_KEY_ID=rzp_live_RLPa3HxTgjff9E
```

---

## 🚀 Deployment Steps

### 1. Deploy Backend to Render

**Create New Web Service:**
- Repository: Connect your GitHub repo
- Branch: main
- Root Directory: `/backend`
- Build Command: `npm install`
- Start Command: `node server.js`

**Environment Variables on Render:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
RAZORPAY_KEY_ID=rzp_live_RLPa3HxTgjff9E
RAZORPAY_KEY_SECRET=your_live_secret
PORT=3001
```

**Health Check:**
- Path: `/health` or `/`
- Should return 200 OK

### 2. Update Frontend Environment Variable

After backend is deployed to Render (e.g., `https://kiitsaathi-backend.onrender.com`):

```env
# Update this in frontend .env
VITE_LOST_FOUND_API_URL=https://kiitsaathi-backend.onrender.com
```

**Redeploy frontend** to Vercel with updated environment variable.

### 3. Test Complete Flow

1. ✅ User applies for lost item with photo
2. ✅ Application saved with user ID
3. ✅ Button shows "Already Applied"
4. ✅ Refresh page → Button stays greyed
5. ✅ Item owner views applications
6. ✅ Contact details hidden
7. ✅ Owner pays ₹5
8. ✅ Contact details revealed

---

## 📊 Database Schema

### lost_found_applications Table
```sql
CREATE TABLE lost_found_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id UUID REFERENCES lost_and_found_items(id),
  applicant_user_id UUID REFERENCES auth.users(id),  -- ✅ Tracks user
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  found_photo_url TEXT NOT NULL,
  found_description TEXT NOT NULL,
  found_location TEXT NOT NULL,
  found_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',  -- 'pending' | 'paid' | 'rejected'
  payment_id TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE (lost_item_id, applicant_user_id)  -- ✅ Prevents duplicates
);
```

### RLS Policies
- ✅ Anyone can insert applications
- ✅ Item owners can view applications for their items
- ✅ Applicants can view their own applications
- ✅ Item owners can update application status (after payment)

---

## 🔒 Security Features

1. **Row Level Security (RLS)**
   - Only item owners see applications for their items
   - Applicants only see their own submissions
   - Payment required to unlock contact details

2. **Payment Verification**
   - Razorpay signature verification
   - Server-side order creation
   - Duplicate payment prevention

3. **Data Validation**
   - Required field checks
   - User ID validation
   - Unique constraint enforcement

---

## 📝 API Routes Summary

| Route | Method | Purpose |
|-------|--------|---------|
| `/submit-lost-item-application` | POST | Submit application with photo |
| `/create-application-unlock-order` | POST | Create Razorpay order (₹5) |
| `/verify-application-unlock-payment` | POST | Verify payment & unlock contact |

---

## ✅ Pre-Deployment Checklist

- [x] User ID tracking implemented
- [x] Duplicate prevention working
- [x] Button state persistence fixed
- [x] Payment integration tested
- [x] Email notifications removed (not needed)
- [x] No external dependencies beyond Supabase & Razorpay
- [x] All endpoints tested locally
- [x] No TypeScript/JavaScript errors
- [x] Documentation complete

**Ready to deploy!** 🎉

---

## 🎯 Post-Deployment

After deploying to Render:

1. ✅ Copy Render URL (e.g., `https://kiitsaathi-backend.onrender.com`)
2. ✅ Update `VITE_LOST_FOUND_API_URL` in frontend environment
3. ✅ Redeploy frontend on Vercel
4. ✅ Test complete flow in production
5. ✅ Monitor Render logs for any issues

---

## 📞 Testing in Production

**Test User Flow:**
1. Create a lost item post
2. Apply for it from another account (with photo)
3. Check "View Applications" shows the application
4. Verify contact details are hidden
5. Pay ₹5 via Razorpay
6. Confirm contact details are revealed
7. Refresh page and verify "Already Applied" button stays greyed

**Expected Results:**
- ✅ All steps complete successfully
- ✅ No errors in browser console
- ✅ No errors in Render logs
- ✅ Payment recorded in Razorpay dashboard

---

## 🎊 Conclusion

The Lost & Found application system is **production-ready** with:
- Complete application submission flow
- Secure payment integration
- Privacy-protected contact details
- Duplicate prevention
- User tracking and state persistence
- No email dependencies

**Deploy with confidence!** 🚀
