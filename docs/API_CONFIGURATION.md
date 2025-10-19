# API Configuration - Lost vs Found Items

## Current Setup (After Changes)

### 🔵 **FOUND Items** → Uses RENDER URL
- **API URL**: `https://kiitsaathi-4.onrender.com`
- **Environment Variable**: `VITE_API_URL`
- **Endpoints**:
  - `/create-lost-found-order` (for FOUND items contact unlock)
  - `/verify-lost-found-payment`
  - All other general services

### 🟢 **LOST Items** → Uses LOCALHOST
- **API URL**: `http://localhost:3001`
- **Environment Variable**: `VITE_LOST_FOUND_API_URL`
- **Endpoints**:
  - `/submit-lost-item-application` (Harry submits application)
  - `/create-application-unlock-order` (John pays to unlock)
  - `/verify-application-unlock-payment`
  - `/has-paid-lost-found-contact`
  - `/send-contact-details`

---

## Files Modified

### `.env` (Root)
```env
VITE_API_URL="https://kiitsaathi-4.onrender.com"  # For FOUND items
VITE_LOST_FOUND_API_URL="http://localhost:3001"   # For LOST items (NEW)
```

### Components Updated:
1. ✅ `src/components/ApplicationSubmissionForm.tsx`
2. ✅ `src/components/ApplicationPaymentComponent.tsx`
3. ✅ `src/pages/LostAndFound.tsx`

### Components Unchanged (Still use Render):
1. ✅ `src/components/LostFoundPaymentComponent.tsx` (FOUND items)
2. ✅ `src/components/PaymentComponent.tsx` (Other services)

---

## Testing

### Test FOUND Items (Should use Render):
1. Go to "Found" tab
2. Click "Contact [Name] (₹5)" on any found item
3. ✅ Should connect to `https://kiitsaathi-4.onrender.com`

### Test LOST Items (Should use Localhost):
1. Go to "Lost" tab
2. Click "Apply if You Found This"
3. Submit application
4. ✅ Should connect to `http://localhost:3001`
5. View Applications as owner
6. Pay to unlock
7. ✅ All requests go to `http://localhost:3001`

---

## To Deploy LOST Items to Render Later:

When ready to deploy, simply update `.env`:
```env
VITE_LOST_FOUND_API_URL="https://kiitsaathi-4.onrender.com"
```

Or create a separate Render service:
```env
VITE_LOST_FOUND_API_URL="https://kiitsaathi-lost-found.onrender.com"
```

Then rebuild and redeploy the frontend.

---

## Backend Requirements

Make sure your **local backend (port 3001)** has all the new endpoints:
- ✅ `/submit-lost-item-application`
- ✅ `/create-application-unlock-order`
- ✅ `/verify-application-unlock-payment`
- ✅ `/has-paid-lost-found-contact`
- ✅ `/send-contact-details`

These are already in `backend/server.js` from the implementation.

---

**Status**: ✅ Configuration Complete
- FOUND items → Render (deployed)
- LOST items → Localhost (for development)
