# 🔒 Greyed Out Apply Button Feature

## Overview

Once a user submits an application for a lost item, the "Apply" button automatically becomes greyed out (disabled) with text changing to "Already Applied". This prevents accidental duplicate submissions and provides clear visual feedback.

## User Experience

### Before Application:
```
┌─────────────────────────────────┐
│  📝 Apply if You Found This     │  ← Blue, clickable
└─────────────────────────────────┘
```

### After Application:
```
┌─────────────────────────────────┐
│  ✓ Already Applied               │  ← Greyed out, disabled
└─────────────────────────────────┘
```

## Implementation Details

### 1. **State Management**
```typescript
const [userAppliedItems, setUserAppliedItems] = useState<{ [itemId: string]: boolean }>({})
```
Tracks which lost items the current user has already applied to.

### 2. **Data Fetching**
On component mount and when user changes:
```typescript
useEffect(() => {
  // Fetch all applications by current user from database
  const { data } = await supabase
    .from('lost_found_applications')
    .select('lost_item_id')
    .eq('applicant_user_id', user.id);
  
  // Mark items as applied
  data.forEach(application => {
    appliedItems[application.lost_item_id] = true;
  });
}, [user?.id, items]);
```

### 3. **Button Rendering**
```tsx
<Button
  disabled={userAppliedItems[item.id]}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  {userAppliedItems[item.id] ? (
    <><CheckCircle /> Already Applied</>
  ) : (
    '📝 Apply if You Found This'
  )}
</Button>
```

### 4. **Real-time Update**
After successful submission:
```typescript
onSuccess={() => {
  setUserAppliedItems(prev => ({
    ...prev,
    [itemId]: true  // Immediately disable button
  }));
}}
```

## Technical Stack

- **Frontend State**: React useState hook
- **Database Query**: Supabase RLS-protected query
- **UI Component**: shadcn/ui Button with disabled state
- **Visual Feedback**: Opacity change + cursor change + text change

## Benefits

### For Users:
✅ Clear visual feedback that application was submitted  
✅ Prevents accidental duplicate submissions  
✅ No need to remember which items they've applied to  

### For System:
✅ Reduces unnecessary API calls  
✅ Complements database unique constraint  
✅ Better UX before backend validation kicks in  

### For Item Owners:
✅ Cleaner application list (no duplicates from same person)  
✅ More serious applicants only  

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| User not logged in | Apply button prompts login (separate check) |
| User owns the item | Shows "View Applications" instead |
| User applied before refresh | Fetches applied items on mount |
| Network error during fetch | Button remains enabled (fail-open) |
| Successful application | Button immediately greys out |

## Testing Checklist

- [ ] Apply for item → Button becomes greyed with "Already Applied"
- [ ] Refresh page → Button stays greyed
- [ ] Different user views same item → Button is blue/clickable
- [ ] Same user views different item → Button is blue/clickable
- [ ] Logout → All buttons reset to clickable
- [ ] Login as different user → Buttons reflect new user's applications

## Files Modified

- ✅ `src/pages/LostAndFound.tsx` - Added state tracking and button logic
- ✅ `supabase/migrations/20251019_create_lost_found_applications.sql` - Database table
- ✅ `backend/server.js` - Backend duplicate detection

## Related Features

- Database unique constraint (PostgreSQL level)
- Backend error handling (409 Conflict)
- Frontend toast notification ("Already Applied")

---

**Result:** Three-layer protection against duplicate applications:
1. ✅ **UI Layer** - Greyed out button (this feature)
2. ✅ **Backend Layer** - Error detection and friendly message
3. ✅ **Database Layer** - UNIQUE constraint enforcement
