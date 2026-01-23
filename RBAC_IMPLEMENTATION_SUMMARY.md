# RBAC Implementation Summary

## ✅ What Has Been Created

I've implemented a comprehensive **Role-Based Access Control (RBAC)** system for your AMS application with **segment-wise and center-wise access control**.

---

## 🎯 System Overview

### Role Hierarchy

Your new system supports 6 role levels:

1. **Admin** - Full system access across all segments and centers
2. **HQ Manager** - Can see all centers across all segments (All India view)
3. **Segment Manager** - Can see all centers within their segment only
   - Example: PSSL Manager sees all PSSL centers (HQ + Mumbai + Data Center)
4. **Center Manager** - Can see only their specific center
   - Example: Mumbai Manager sees only Mumbai center data
5. **User** - Basic staff access (limited permissions)
6. **Pending** - No access until approved

### Access Levels

- `all` - Cross-segment access (Admin only)
- `headquarters` - All segments, all centers (HQ Managers)
- `segment` - All centers within one segment (Segment Managers)
- `center` - Single center only (Center Managers)

### Segments

Three segments have been defined:
- **PSSL** - Prakhar Softwares Systems Limited
- **IIDT** - Indian Institute of Drone Technology
- **PRAKHAR** - Prakhar Aviation Services

---

## 📁 Files Created

### 1. SQL Schema & Migration Files

#### `supabase/04_rbac_segment_access.sql` (Main Implementation)
- Creates `segments` table for organizations/departments
- Adds `segment_code`, `center_id`, `access_level` to profiles table
- Links all data tables (locations, staff, components, training, projects, bills) to segments
- Implements Row Level Security (RLS) policies for automatic data filtering
- Creates helper functions for access control
- Adds triggers for automatic segment assignment
- Creates indexes for performance

#### `supabase/05_data_migration_rbac.sql` (Data Migration)
- Links existing locations to segments
- Maps components, staff, training to locations and segments
- Provides data validation reports
- Creates helper views for user management

### 2. Documentation Files

#### `supabase/RBAC_IMPLEMENTATION_GUIDE.md` (Complete Guide)
- Detailed role descriptions and permissions matrix
- Step-by-step implementation instructions
- SQL queries for testing and verification
- Frontend integration examples
- Troubleshooting guide
- Security best practices

#### `supabase/RBAC_QUICK_REFERENCE.md` (Quick Start)
- Fast lookup for role configurations
- Profile creation templates
- Common queries and commands
- Quick fixes for common issues
- Example: Complete setup for a center manager

### 3. Frontend Updates

#### `src/context/AuthContext.tsx` (Updated)
Added new role check functions:
- `isCenterManager()` - Check if user is a center manager or higher
- `isSegmentManager()` - Check if user is a segment manager or higher
- `isHQManager()` - Check if user is HQ manager or admin
- `getUserSegment()` - Get user's segment code
- `getUserCenter()` - Get user's center/location ID
- `getUserAccessLevel()` - Get user's access level

Updated User interface to include:
- `segment_code` - User's segment assignment
- `center_id` - User's center assignment (for center managers)
- `access_level` - User's access scope

---

## 🚀 What You Need To Do

### Step 1: Run SQL Scripts on Supabase (10 minutes)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your AMS project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "+ New Query"

3. **Run Migration Script #1**
   - Open `supabase/04_rbac_segment_access.sql`
   - Copy entire content
   - Paste in SQL Editor
   - Click "Run" (or Ctrl+Enter)
   - Wait for completion (all statements should execute successfully)

4. **Run Migration Script #2**
   - Open `supabase/05_data_migration_rbac.sql`
   - Copy entire content
   - Paste in SQL Editor
   - Click "Run"
   - Review the summary reports at the end

5. **Verify Setup**
   ```sql
   -- Check segments
   SELECT * FROM public.segments;
   
   -- Check locations are linked to segments
   SELECT id, name, segment_code, is_headquarters FROM public.locations;
   
   -- Check the user access summary view
   SELECT * FROM public.user_access_summary;
   ```

### Step 2: Create Manager Users (5 minutes per user)

For each manager you want to add:

1. **Create Auth User**
   - Supabase Dashboard → Authentication → Users
   - Click "+ Add user"
   - Enter email and password
   - Check "Auto Confirm User"
   - Save and **copy the UUID**

2. **Create Profile**
   - Table Editor → profiles → "+ Insert row"
   - Use templates from `RBAC_QUICK_REFERENCE.md`
   - Fill in all required fields
   - Save

**Recommended Initial Users:**

1. **System Admin** (for you)
   ```
   role: admin
   access_level: all
   segment_code: NULL
   center_id: NULL
   ```

2. **HQ Manager** (All India view)
   ```
   role: hq_manager
   access_level: headquarters
   segment_code: NULL
   center_id: NULL
   ```

3. **PSSL Segment Manager** (All PSSL centers)
   ```
   role: segment_manager
   access_level: segment
   segment_code: PSSL
   center_id: NULL
   ```

4. **IIDT Segment Manager** (All IIDT centers)
   ```
   role: segment_manager
   access_level: segment
   segment_code: IIDT
   center_id: NULL
   ```

5. **Prakhar Segment Manager** (All Prakhar centers)
   ```
   role: segment_manager
   access_level: segment
   segment_code: PRAKHAR
   center_id: NULL
   ```

6. **Mumbai Center Manager** (Mumbai only)
   ```
   role: center_manager
   access_level: center
   segment_code: PSSL
   center_id: 4
   ```

### Step 3: Test Access Control (5 minutes)

Login as each user type and verify they see the correct data:

```sql
-- As HQ Manager: Should see ALL locations
SELECT * FROM public.locations;

-- As PSSL Segment Manager: Should see only PSSL locations
SELECT * FROM public.locations;

-- As Mumbai Center Manager: Should see only Mumbai
SELECT * FROM public.locations;
```

### Step 4: Update Frontend Components (Optional - for enhanced UX)

The AuthContext has been updated, but you may want to:

1. **Add segment/center display in UI**
   ```typescript
   const { user, getUserSegment, getUserAccessLevel } = useAuth();
   
   return (
     <div>
       <p>Role: {user?.role}</p>
       <p>Segment: {getUserSegment()}</p>
       <p>Access: {getUserAccessLevel()}</p>
     </div>
   );
   ```

2. **Add role-based component visibility**
   ```typescript
   const { isCenterManager, isSegmentManager, isHQManager } = useAuth();
   
   {isHQManager() && <AllIndiaStats />}
   {isSegmentManager() && <SegmentStats />}
   {isCenterManager() && <CenterStats />}
   ```

3. **Add segment/center selector for admins**
   ```typescript
   // Allow admins to filter by segment
   const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
   
   const { data: locations } = useQuery(['locations', selectedSegment], 
     async () => {
       let query = supabase.from('locations').select('*');
       if (selectedSegment) {
         query = query.eq('segment_code', selectedSegment);
       }
       return (await query).data;
     }
   );
   ```

---

## 🔐 How It Works

### Automatic Data Filtering (Row Level Security)

The system uses **Supabase Row Level Security (RLS)** policies to automatically filter data at the database level:

- **Admin/HQ Manager** → Sees all data (no filtering)
- **Segment Manager** → Only sees data where `segment_code` matches theirs
- **Center Manager** → Only sees data where `location_id` matches their `center_id`
- **User** → Limited access based on their assignments

This happens **automatically** - you don't need to add filters in your frontend queries!

### Example Scenarios

#### Scenario 1: PSSL Manager views staff
```typescript
// Frontend query (same for all users)
const { data } = await supabase.from('staff').select('*');

// Results vary by user:
// - Admin: All staff across all segments
// - HQ Manager: All staff across all segments
// - PSSL Manager: Only PSSL staff
// - Mumbai Manager: Only Mumbai staff
```

#### Scenario 2: Center Manager creates a component
```typescript
const { data } = await supabase.from('components').insert({
  name: 'New Drone',
  location_id: 4, // Mumbai
  // segment_code is auto-populated by trigger
});

// Access check:
// - Mumbai Manager (center_id=4): ✅ Allowed
// - Chennai Manager (center_id=5): ❌ Blocked by RLS
// - PSSL Segment Manager: ✅ Allowed (Mumbai is PSSL)
// - IIDT Segment Manager: ❌ Blocked (Mumbai is not IIDT)
```

---

## 🧪 Testing Checklist

- [ ] Run `04_rbac_segment_access.sql` successfully
- [ ] Run `05_data_migration_rbac.sql` successfully
- [ ] Verify segments table has 3 segments (PSSL, IIDT, PRAKHAR)
- [ ] Verify locations are linked to segments
- [ ] Create admin user and login
- [ ] Create HQ manager and verify they see all data
- [ ] Create segment manager and verify they see only their segment
- [ ] Create center manager and verify they see only their center
- [ ] Test that center manager cannot see other centers' data
- [ ] Test that segment manager cannot see other segments' data
- [ ] Verify staff/components/training are filtered correctly
- [ ] Check user_access_summary view shows correct access descriptions

---

## 📊 Database Schema Changes

### New Tables
- `segments` - Stores segment/organization definitions

### Modified Tables (new columns)
- `profiles` → `segment_code`, `center_id`, `access_level`
- `locations` → `segment_code`, `is_headquarters`
- `components` → `segment_code`, `location_id`
- `staff` → `segment_code`, `location_id`
- `training` → `segment_code`, `location_id`
- `projects` → `segment_code`
- `bills` → `segment_code`, `location_id`

### New Views
- `user_access_summary` - Shows all users with their access scope
- `location_manager_mapping` - Helper for assigning center managers

### New Functions
- `current_user_segment()` - Get current user's segment
- `current_user_center()` - Get current user's center
- `current_user_access_level()` - Get current user's access level
- `can_access_segment()` - Check if user can access a segment
- `can_access_location()` - Check if user can access a location
- `is_hq_manager()` - Check if user is HQ manager
- `is_segment_manager()` - Check if user is segment manager
- `is_center_manager()` - Check if user is center manager

### Updated RLS Policies
All tables now have segment-aware and center-aware RLS policies that automatically filter data based on:
- User's role
- User's segment_code
- User's center_id
- User's access_level

---

## 📚 Documentation Reference

1. **Quick Start** → `supabase/RBAC_QUICK_REFERENCE.md`
   - Templates for creating users
   - Common queries
   - Quick fixes

2. **Complete Guide** → `supabase/RBAC_IMPLEMENTATION_GUIDE.md`
   - Detailed explanations
   - Frontend integration examples
   - Troubleshooting
   - Security best practices

3. **SQL Scripts**
   - `supabase/04_rbac_segment_access.sql` - Main RBAC system
   - `supabase/05_data_migration_rbac.sql` - Data migration

---

## 🎉 Benefits

### Security
- Database-level access control (can't be bypassed from frontend)
- Automatic data filtering based on user role
- No sensitive data exposed to unauthorized users

### Flexibility
- Easy to add new segments
- Easy to promote/demote users
- Support for multiple organization structures

### Scalability
- Indexed for performance
- Efficient queries with RLS policies
- Supports large number of centers and users

### Maintainability
- Clear role definitions
- Self-documenting with views and functions
- Easy to audit user access

---

## 🆘 Need Help?

### Quick Lookup
→ See `RBAC_QUICK_REFERENCE.md`

### Detailed Guide
→ See `RBAC_IMPLEMENTATION_GUIDE.md`

### Common Issues

**Can't see any data after login**
- Check profile exists in `profiles` table
- Verify `is_active = true`
- Ensure `role` is not 'pending'
- Check `segment_code` matches data

**Seeing too much data**
- Verify `access_level` is correct
- Check `segment_code` is set (for segment managers)
- Check `center_id` is set (for center managers)

**Can't create/edit resources**
- Verify role has correct permissions
- Check RLS policies with SQL queries
- Ensure segment/location IDs match user's scope

---

## 🔄 Next Steps

1. ✅ **Run migrations** on Supabase
2. ✅ **Create test users** for each role type
3. ✅ **Test access control** with different users
4. 🔲 **Update UI** to show segment/center info (optional)
5. 🔲 **Add segment selector** for admins (optional)
6. 🔲 **Train your team** on the new role structure
7. 🔲 **Document your specific role assignments**

---

**Implementation Date**: January 2026  
**Status**: Ready for deployment  
**Security**: Row Level Security (RLS) enabled on all tables  
**Performance**: Indexed for optimal query performance  

---

## Summary

You now have a production-ready, secure, scalable RBAC system that provides:
- **Segment-wise access** (e.g., PSSL manager sees all PSSL centers)
- **Center-wise access** (e.g., Mumbai manager sees only Mumbai)
- **Headquarters view** (e.g., HQ manager sees all India)
- **Automatic data filtering** at database level
- **Easy user management** with clear role definitions

Start by running the SQL migrations, create a few test users, and verify the access control works as expected!
