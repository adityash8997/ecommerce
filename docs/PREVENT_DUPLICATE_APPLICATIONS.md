# 🚫 Prevent Duplicate Applications

## What This Does

Prevents users from submitting multiple applications for the same lost item. Once a user applies, they cannot apply again until the item owner takes action.

## Database Constraint

Added unique constraint to `lost_found_applications` table:
```sql
UNIQUE (lost_item_id, applicant_user_id)
```

This ensures that each combination of `lost_item_id` and `applicant_user_id` is unique.

## How to Apply

### Option 1: Run New Migration (If table exists)

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of: `supabase/migrations/20251019_add_unique_constraint.sql`
3. Run the query

### Option 2: Recreate Table (If starting fresh)

The main migration file already includes the constraint:
- File: `supabase/migrations/20251019_create_lost_found_applications.sql`
- Line 17: `CONSTRAINT unique_application_per_user_per_item UNIQUE (lost_item_id, applicant_user_id)`

## User Experience

### When User Tries to Apply Again:

**Before:** User could submit multiple applications for same item

**After:** User sees error message:
```
⚠️ Already Applied
You have already submitted an application for this item. 
Please wait for the owner to review it.
```

## Backend Handling

The backend detects PostgreSQL error code `23505` (unique violation) and returns a user-friendly message:

```javascript
if (insertError.code === '23505') {
  return res.status(409).json({ 
    error: 'You have already applied for this lost item...',
    type: 'duplicate' 
  });
}
```

## Frontend Handling

The frontend catches the duplicate error and shows a toast notification:

```typescript
if (result.error?.includes('already applied')) {
  toast({
    title: "Already Applied",
    description: "You have already submitted an application...",
    variant: "destructive",
  });
}
```

## Testing

To verify it works:

1. **Apply once** - Should succeed ✅
2. **Try applying again** - Should show "Already Applied" error 🚫
3. **Different user applies** - Should succeed ✅
4. **Same user, different item** - Should succeed ✅

## Technical Details

- **Database Level**: PostgreSQL UNIQUE constraint
- **Error Code**: 23505 (unique_violation)
- **HTTP Status**: 409 Conflict
- **Scope**: Per user + per item (not global)

---

**Note:** If you already ran the first migration without the constraint, run the `20251019_add_unique_constraint.sql` migration to add it to your existing table.
