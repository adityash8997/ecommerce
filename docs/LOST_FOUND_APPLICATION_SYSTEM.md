# Lost & Found Application System - Feature Documentation

## 🎯 Overview
This document explains the new application-based system for LOST items in the Lost & Found portal. This feature allows finders to submit applications with photos, and item owners to review applications before paying to unlock contact details.

**Note: This feature ONLY applies to LOST items. FOUND items continue to work as before.**

---

## 📋 Complete User Flow

### Scenario: John loses his bottle, Harry finds it

#### **Step 1: John Posts a Lost Item**
1. John logs into KIIT Saathi
2. Navigates to Lost & Found portal
3. Clicks "Post Lost Item"
4. Fills in details:
   - Title: "Black Water Bottle"
   - Description, Location, Date
   - Category: "Miscellaneous"
   - Photo (optional)
   - Contact information
5. Submits → Goes to admin approval (existing flow)
6. After approval, item appears in Lost Items section

#### **Step 2: Harry Finds the Bottle**
1. Harry sees John's lost item card
2. Card shows "📝 Apply if You Found This" button
3. Harry clicks the Apply button

#### **Step 3: Harry Submits Application**
1. Application form opens with fields:
   - **Photo of found item** (REQUIRED) ⭐
   - Description of found item
   - Where he found it
   - When he found it
   - Harry's contact details (name, email, phone)
2. Harry submits the application
3. Harry sees confirmation: "Application submitted successfully!"

#### **Step 4: John Receives Email Notification**
1. Email sent to John's registered email via Resend.com
2. Email contains:
   - ✅ Photo of the found item (uploaded by Harry)
   - ✅ Location where Harry found it
   - ✅ Date when Harry found it
   - ❌ NO contact details (hidden for privacy)
3. Email prompts John to log in to view all applications

#### **Step 5: John Views Applications**
1. John logs into the portal
2. On his lost item card, sees "📋 View Applications (X)" button
3. Clicks to open Applications Dialog
4. Sees all applicants with:
   - Photo of found item
   - Description, location, date
   - Status: 🔒 Locked / ✅ Unlocked

#### **Step 6: John Selects Harry's Application**
1. John reviews all application photos
2. Recognizes his bottle in Harry's photo
3. Clicks "Pay ₹5 & Unlock Contact Details" on Harry's application
4. Razorpay payment modal opens
5. John pays ₹5

#### **Step 7: Contact Details Unlocked**
1. After successful payment:
   - Harry's contact details become visible
   - Shows: Name, Email, Phone
   - Status changes to "✅ Unlocked"
2. John contacts Harry to arrange pickup
3. John marks item as "Complete" after collecting

---

## 🔧 Technical Implementation

### **Database Schema**

#### New Table: `lost_found_applications`
```sql
CREATE TABLE lost_found_applications (
    id UUID PRIMARY KEY,
    lost_item_id UUID REFERENCES lost_and_found_items(id),
    applicant_user_id TEXT REFERENCES auth.users(id),
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    found_photo_url TEXT NOT NULL,
    found_description TEXT NOT NULL,
    found_location TEXT NOT NULL,
    found_date DATE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    payment_id TEXT
);
```

### **New Components**

1. **ApplicationSubmissionForm.tsx**
   - Form for Harry to submit application
   - Handles photo upload to Supabase storage
   - Validates all required fields
   - Calls backend endpoint

2. **ViewApplicationsDialog.tsx**
   - Displays all applications for a lost item
   - Shows photos and details
   - Handles payment unlock for specific applicant
   - Updates UI after payment

3. **ApplicationPaymentComponent.tsx**
   - Razorpay integration for ₹5 payment
   - Specific to application unlocks
   - Different from Lost Found payment component

### **Backend API Endpoints**

#### 1. Submit Application
```javascript
POST /submit-lost-item-application
Body: {
  lostItemId, lostItemTitle, lostItemOwnerEmail,
  applicantName, applicantEmail, applicantPhone,
  foundPhotoUrl, foundDescription, foundLocation, foundDate
}
```
- Saves application to database
- Sends email to item owner with photo (via Resend)

#### 2. Create Application Unlock Order
```javascript
POST /create-application-unlock-order
Body: {
  amount: 500, // ₹5 in paise
  applicationId, lostItemTitle, ownerUserId
}
```
- Creates Razorpay order for unlocking contact
- Returns order ID for payment

#### 3. Verify Application Unlock Payment
```javascript
POST /verify-application-unlock-payment
Body: {
  razorpay_order_id, razorpay_payment_id, razorpay_signature,
  applicationId, ownerUserId
}
```
- Verifies Razorpay signature
- Updates application status to 'paid'
- Stores payment in orders table

### **Modified Files**

#### `src/pages/LostAndFound.tsx`
- Added state for applications and dialogs
- Modified LOST items tab to show:
  - "Apply" button for non-owners
  - "View Applications (X)" button for owners
- FOUND items tab remains unchanged

---

## 🔐 Security & Privacy

### **Privacy Protection**
1. **Applicant contact details hidden** until payment
2. **Only photo sent in email** (no personal info)
3. **Owner pays per applicant** they want to contact
4. **RLS policies** on applications table:
   - Item owners can view applications for their items
   - Applicants can view their own applications

### **Payment Security**
- Razorpay signature verification
- Payment status tracked in database
- Prevents duplicate payments for same application

---

## 💡 Key Features

### **Multiple Applications Support**
- ✅ Multiple people can apply for same lost item
- ✅ Owner sees count: "View Applications (3)"
- ✅ Owner can unlock any/all applicants (₹5 each)

### **Selective Unlocking**
- ✅ Owner only pays for applications they choose
- ✅ Other applicants' details remain hidden
- ✅ No bulk unlock (prevents misuse)

### **Email Notifications**
- ✅ Email sent for each new application
- ✅ Contains only photo (privacy-first)
- ✅ Prompts owner to review in portal

---

## 🚀 Setup Requirements

### **Environment Variables Needed**
```env
# Existing
VITE_API_URL=your_backend_url
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# New (for email functionality)
RESEND_API_KEY=your_resend_api_key  # Optional but recommended
```

### **Required Package Installation**
```bash
npm install resend
```

### **Database Migration**
Run the migration file:
```bash
supabase/migrations/20251019_create_lost_found_applications.sql
```

---

## 📊 Payment Flow Breakdown

### For Item Owner (John):
1. Views applications: **FREE**
2. Unlocks 1st applicant (Harry): **₹5**
3. Unlocks 2nd applicant (Sarah): **₹5** (if needed)
4. Total: ₹5 per unlocked applicant

### Revenue Distribution:
- **₹5 Platform Fee** (100% to platform)
- Supports platform operations
- No revenue sharing with applicants/posters

---

## 🔄 Differences from FOUND Items Flow

| Feature | LOST Items (NEW) | FOUND Items (OLD) |
|---------|------------------|-------------------|
| Button | "Apply if You Found This" | "Contact [Name] (₹5)" |
| Process | Apply → Review → Pay → Contact | Direct payment for contact |
| Email | Photo sent to owner | No email |
| Multiple people | Yes, all can apply | N/A |
| Owner pays for | Specific applicant | Original poster contact |
| Photo required | Yes, mandatory | Optional |

---

## ✅ Testing Checklist

- [ ] Lost item shows "Apply" button for non-owners
- [ ] Lost item shows "View Applications" for owners
- [ ] Application form validates all fields
- [ ] Photo upload works to Supabase storage
- [ ] Application saves to database
- [ ] Email sent with photo (if RESEND_API_KEY set)
- [ ] Application count updates after submission
- [ ] View Applications dialog shows all applications
- [ ] Payment process works for unlocking
- [ ] Contact details visible after payment
- [ ] Status updates to "paid" after payment
- [ ] Found items unchanged (original flow works)

---

## 🐛 Known Limitations

1. **Email dependency**: Requires Resend API key for email notifications
2. **Manual filtering**: Owner must manually check which photo matches
3. **No rejection flow**: No way to reject applications (all stay pending)
4. **No refund logic**: If wrong unlock, no automatic refund

---

## 🎨 UI/UX Highlights

### Lost Item Card (Owner View)
```
┌─────────────────────────────┐
│  [Photo]                    │
│  Lost Badge                 │
│                             │
│  Black Water Bottle         │
│  Description...             │
│                             │
│  📋 View Applications (3)   │  ← New
│  ✅ Mark as Complete        │
└─────────────────────────────┘
```

### Lost Item Card (Non-Owner View)
```
┌─────────────────────────────┐
│  [Photo]                    │
│  Lost Badge                 │
│                             │
│  Black Water Bottle         │
│  Description...             │
│                             │
│  📝 Apply if You Found This │  ← New
└─────────────────────────────┘
```

### Found Item Card (Unchanged)
```
┌─────────────────────────────┐
│  [Photo]                    │
│  Found Badge                │
│                             │
│  Blue Backpack              │
│  Description...             │
│                             │
│  📞 Contact John (₹5)       │  ← Same as before
└─────────────────────────────┘
```

---

## 📝 Future Enhancements

1. **Applicant notifications**: Notify Harry when John unlocks his contact
2. **Rejection feature**: Allow owner to mark wrong applications as rejected
3. **Chat system**: In-app chat instead of revealing full contact
4. **Auto-match**: AI to suggest matching applications based on photo similarity
5. **Refund system**: Partial refund if item not collected
6. **Rating system**: Rate applicants/owners after successful exchange

---

## 🤝 Support

For issues or questions:
- Check database migrations are run
- Verify environment variables
- Check browser console for errors
- Review backend logs for API errors

---

**Implementation Date**: October 19, 2025
**Version**: 1.0
**Status**: ✅ Complete and Ready for Testing
