# Role-Based Access Control (RBAC) Implementation Guide

## Overview
This guide explains how to implement segment-wise and center-wise access control for your Asset Management System (AMS).

## Role Hierarchy

### 1. **Admin** (`admin`)
- **Access Level**: `all`
- **Scope**: Full system access
- **Can See**: Everything across all segments and centers
- **Permissions**: Full CRUD on all resources
- **Example**: System administrator, CTO

### 2. **Headquarters Manager** (`hq_manager`)
- **Access Level**: `headquarters` or `all`
- **Scope**: All centers across all segments (All India)
- **Can See**: All PSSL + IIDT + Prakhar centers combined
- **Permissions**: Read all, Manage across segments
- **Example**: National Operations Manager, Director of Operations

### 3. **Segment Manager** (`segment_manager`)
- **Access Level**: `segment`
- **Scope**: All centers within their segment only
- **Can See**: 
  - PSSL Manager → All PSSL centers (HQ + Mumbai + Data Center)
  - IIDT Manager → All IIDT centers (Research + Chennai + Dehradun)
  - Prakhar Manager → All Prakhar centers (Training + Maintenance Hub)
- **Permissions**: Full CRUD for their segment
- **Example**: PSSL Division Head, IIDT Research Director

### 4. **Center Manager** (`center_manager`)
- **Access Level**: `center`
- **Scope**: Only their specific center/location
- **Can See**: Only data from their assigned center
- **Permissions**: Manage resources at their center
- **Example**: Mumbai Branch Manager, Chennai Office Manager

### 5. **User** (`user`)
- **Access Level**: `center` (usually)
- **Scope**: Basic access, may see data from their location
- **Can See**: Limited view based on their assignments
- **Permissions**: Read-only or limited updates
- **Example**: Regular staff member, analyst

### 6. **Pending** (`pending`)
- **Access Level**: None
- **Scope**: No access until approved
- **Can See**: Nothing
- **Permissions**: None
- **Example**: Newly registered user awaiting approval

---

## Access Control Matrix

| Role | Segments | All Centers | Own Segment Centers | Own Center Only |
|------|----------|-------------|---------------------|-----------------|
| Admin | ✅ All | ✅ All | ✅ All | ✅ All |
| HQ Manager | ✅ All | ✅ All | ✅ All | ✅ All |
| Segment Manager | Own Only | ❌ No | ✅ Yes | ✅ Yes |
| Center Manager | Own Only | ❌ No | ❌ No | ✅ Yes |
| User | View Only | ❌ No | ❌ No | Limited |
| Pending | ❌ None | ❌ No | ❌ No | ❌ No |

---

## Implementation Steps

### Step 1: Run the Migration on Supabase

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Execute the Migration**
   - Copy the entire content of `04_rbac_segment_access.sql`
   - Paste it into the SQL editor
   - Click "Run" or press `Ctrl+Enter`
   - Wait for all statements to execute successfully

4. **Verify the Changes**
   ```sql
   -- Check if segments table was created
   SELECT * FROM public.segments;
   
   -- Check if profiles table has new columns
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND column_name IN ('segment_code', 'center_id', 'access_level');
   
   -- Check if new roles are available
   SELECT enumlabel 
   FROM pg_enum 
   WHERE enumtypid = (
     SELECT oid FROM pg_type WHERE typname = 'profiles_role_check'
   );
   ```

### Step 2: Update Existing Location Data

Run the data migration script to link existing locations with segments:

```sql
-- Link locations to segments based on name patterns
UPDATE public.locations 
SET segment_code = 'PSSL', is_headquarters = (name LIKE '%Headquarters%')
WHERE name LIKE '%PSSL%';

UPDATE public.locations 
SET segment_code = 'IIDT', is_headquarters = (name LIKE '%Research Center%')
WHERE name LIKE '%IIDT%';

UPDATE public.locations 
SET segment_code = 'PRAKHAR', is_headquarters = (name LIKE '%Training Center%')
WHERE name LIKE '%Prakhar%' OR name LIKE '%Aviation%';

-- Verify the update
SELECT id, name, segment_code, is_headquarters, type 
FROM public.locations 
ORDER BY segment_code, id;
```

### Step 3: Update Existing Components Data

```sql
-- Update components with location_id (convert from text to ID)
-- First, you need to map the location text to location IDs
UPDATE public.components c
SET location_id = l.id
FROM public.locations l
WHERE c.location = l.name;

-- The segment_code will be auto-populated by the trigger
-- Verify
SELECT id, name, location, location_id, segment_code 
FROM public.components 
LIMIT 10;
```

### Step 4: Update Existing Staff Data

```sql
-- Update staff with location_id
UPDATE public.staff s
SET location_id = l.id
FROM public.locations l
WHERE s.location = l.name;

-- The segment_code will be auto-populated by the trigger
-- Verify
SELECT id, name, location, location_id, segment_code, department
FROM public.staff 
LIMIT 10;
```

### Step 5: Update Existing Training Data

```sql
-- Update training with location_id (if schedule_location matches)
UPDATE public.training t
SET location_id = l.id
FROM public.locations l
WHERE t.schedule_location = l.name;

-- For training at institutions, try to match institution names
UPDATE public.training t
SET location_id = l.id
FROM public.locations l
WHERE t.location_id IS NULL 
AND t.institution LIKE '%' || l.name || '%';

-- Verify
SELECT id, name, institution, schedule_location, location_id, segment_code
FROM public.training 
LIMIT 10;
```

### Step 6: Create Sample Users with Different Roles

```sql
-- Example 1: Create an HQ Manager (can see all India centers)
-- First, create the auth user in Supabase Auth dashboard, then:
INSERT INTO public.profiles (
  id, email, username, full_name, role, access_level, 
  segment_code, center_id, is_active
) VALUES (
  'auth-user-uuid-here', -- Replace with actual auth.users UUID
  'hq.manager@company.com',
  'hq_manager',
  'National Operations Manager',
  'hq_manager',
  'headquarters', -- Can see all centers
  NULL, -- Not tied to specific segment
  NULL, -- Not tied to specific center
  true
);

-- Example 2: Create a PSSL Segment Manager (sees all PSSL centers)
INSERT INTO public.profiles (
  id, email, username, full_name, role, access_level, 
  segment_code, center_id, is_active
) VALUES (
  'auth-user-uuid-here', -- Replace with actual auth.users UUID
  'pssl.manager@pssl.com',
  'pssl_manager',
  'PSSL Division Head',
  'segment_manager',
  'segment', -- Can see all centers in PSSL segment
  'PSSL', -- PSSL segment only
  NULL, -- All PSSL centers, not just one
  true
);

-- Example 3: Create a Mumbai Center Manager (sees Mumbai center only)
INSERT INTO public.profiles (
  id, email, username, full_name, role, access_level, 
  segment_code, center_id, is_active
) VALUES (
  'auth-user-uuid-here', -- Replace with actual auth.users UUID
  'mumbai.manager@pssl.com',
  'mumbai_manager',
  'Mumbai Branch Manager',
  'center_manager',
  'center', -- Can see only Mumbai center
  'PSSL', -- PSSL segment
  4, -- Mumbai location ID (from locations table)
  true
);

-- Example 4: Create an IIDT Segment Manager
INSERT INTO public.profiles (
  id, email, username, full_name, role, access_level, 
  segment_code, center_id, is_active
) VALUES (
  'auth-user-uuid-here', -- Replace with actual auth.users UUID
  'iidt.manager@iidt.org',
  'iidt_manager',
  'IIDT Research Director',
  'segment_manager',
  'segment',
  'IIDT', -- IIDT segment only
  NULL, -- All IIDT centers
  true
);
```

### Step 7: Test Access Control

```sql
-- As HQ Manager: Should see all locations
SELECT * FROM public.locations;

-- As PSSL Segment Manager: Should see only PSSL locations
SELECT * FROM public.locations WHERE segment_code = 'PSSL';

-- As Mumbai Center Manager: Should see only Mumbai location
SELECT * FROM public.locations WHERE id = 4;

-- Test staff access
-- HQ Manager: All staff
SELECT * FROM public.staff;

-- PSSL Manager: Only PSSL staff
SELECT * FROM public.staff WHERE segment_code = 'PSSL';

-- Mumbai Manager: Only Mumbai staff
SELECT * FROM public.staff WHERE location_id = 4;

-- Test the view
SELECT * FROM public.user_access_summary;
```

---

## Frontend Integration

### Update AuthContext

Add new role check functions to your `AuthContext.tsx`:

```typescript
// Add these to the AuthContextType interface
export interface AuthContextType {
  // ... existing properties
  isCenterManager: () => boolean;
  isSegmentManager: () => boolean;
  isHQManager: () => boolean;
  getUserSegment: () => string | null;
  getUserCenter: () => number | null;
  getUserAccessLevel: () => string | null;
}

// Add to User interface
export interface User {
  // ... existing properties
  segment_code?: string;
  center_id?: number;
  access_level?: string;
}

// Add these functions to AuthProvider
const isCenterManager = (): boolean => {
  return hasRole(['center_manager', 'segment_manager', 'hq_manager', 'admin']);
};

const isSegmentManager = (): boolean => {
  return hasRole(['segment_manager', 'hq_manager', 'admin']);
};

const isHQManager = (): boolean => {
  return hasRole(['hq_manager', 'admin']);
};

const getUserSegment = (): string | null => {
  return user?.segment_code || null;
};

const getUserCenter = (): number | null => {
  return user?.center_id || null;
};

const getUserAccessLevel = (): string | null => {
  return user?.access_level || null;
};
```

### Filter Data in Frontend

```typescript
// Example: Filter locations based on user access
const fetchLocations = async () => {
  const { data, error } = await supabase
    .from('locations')
    .select('*');
  
  // RLS policies handle filtering automatically!
  // HQ Manager will get all locations
  // Segment Manager will get only their segment's locations
  // Center Manager will get only their center
  
  if (error) throw error;
  return data;
};

// Example: Filter staff by segment
const fetchStaffBySegment = async (segmentCode: string) => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('segment_code', segmentCode); // Additional filter on top of RLS
  
  return data;
};
```

### Add Segment/Center Selector for Admins

For admin users, you may want to add a UI to switch context:

```typescript
const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
const [selectedCenter, setSelectedCenter] = useState<number | null>(null);

// Fetch segments
const { data: segments } = useQuery(['segments'], async () => {
  const { data } = await supabase.from('segments').select('*');
  return data;
});

// Fetch locations filtered by segment
const { data: locations } = useQuery(
  ['locations', selectedSegment], 
  async () => {
    let query = supabase.from('locations').select('*');
    if (selectedSegment) {
      query = query.eq('segment_code', selectedSegment);
    }
    const { data } = await query;
    return data;
  }
);
```

---

## Supabase Dashboard Configuration

### 1. Authentication Setup

1. Go to **Authentication** → **Users**
2. Create users manually or enable auth providers
3. After creating a user, note their UUID

### 2. Create Profile for Each User

1. Go to **Table Editor** → **profiles**
2. Click "+ Insert row"
3. Fill in the details:
   - `id`: Paste the auth user's UUID
   - `email`: User's email
   - `username`: Unique username
   - `full_name`: Display name
   - `role`: Select from dropdown (center_manager, segment_manager, hq_manager, admin)
   - `access_level`: Select scope (center, segment, headquarters, all)
   - `segment_code`: For segment/center managers (PSSL, IIDT, PRAKHAR)
   - `center_id`: For center managers only (location ID)
   - `is_active`: true
4. Click "Save"

### 3. View User Access Summary

1. Go to **Table Editor** → **user_access_summary** (View)
2. See all users with their access descriptions
3. Verify each user has the correct segment and center assignments

### 4. Enable Row Level Security (Automatic)

RLS is automatically enabled by the migration script. To verify:

1. Go to **Authentication** → **Policies**
2. Select each table (profiles, locations, components, staff, etc.)
3. You should see multiple policies for each table
4. Each policy should have conditions based on roles and segments

---

## Common Scenarios

### Scenario 1: Adding a New Center Manager

```sql
-- 1. Create auth user in Supabase Auth dashboard
-- 2. Get the user's UUID
-- 3. Insert profile:

INSERT INTO public.profiles (
  id, email, username, full_name, role, access_level,
  segment_code, center_id, is_active
) VALUES (
  'USER-UUID-HERE',
  'chennai.manager@iidt.org',
  'chennai_manager',
  'Chennai Office Manager',
  'center_manager',
  'center',
  'IIDT', -- IIDT segment
  5, -- Chennai location ID
  true
);
```

### Scenario 2: Promoting a Center Manager to Segment Manager

```sql
UPDATE public.profiles 
SET 
  role = 'segment_manager',
  access_level = 'segment',
  center_id = NULL -- Remove center restriction
WHERE email = 'mumbai.manager@pssl.com';
```

### Scenario 3: Adding a New Segment

```sql
-- 1. Insert the segment
INSERT INTO public.segments (code, name, description) 
VALUES ('NEWDIV', 'New Division', 'Description of new division');

-- 2. Update locations to belong to this segment
UPDATE public.locations 
SET segment_code = 'NEWDIV' 
WHERE name LIKE '%New Division%';

-- 3. Create a segment manager
INSERT INTO public.profiles (
  id, email, username, full_name, role, access_level,
  segment_code, is_active
) VALUES (
  'USER-UUID-HERE',
  'newdiv.manager@company.com',
  'newdiv_manager',
  'New Division Head',
  'segment_manager',
  'segment',
  'NEWDIV',
  true
);
```

### Scenario 4: Viewing What a User Can Access

```sql
-- Check user's profile
SELECT * FROM public.user_access_summary 
WHERE email = 'user@example.com';

-- Test their location access
SELECT id, name, segment_code 
FROM public.locations;
-- This will show only what they can access based on RLS
```

---

## Troubleshooting

### Issue: User Can't See Any Data

**Solution:**
1. Check if user has a profile in `profiles` table
2. Verify `is_active = true`
3. Ensure `role` is not 'pending'
4. Check if `segment_code` is set correctly
5. Verify location's `segment_code` matches user's segment

### Issue: Segment Manager Sees Too Much Data

**Solution:**
1. Check `access_level` - should be 'segment', not 'headquarters' or 'all'
2. Verify `segment_code` is set correctly in profile
3. Check if locations have correct `segment_code`

### Issue: Center Manager Can't Edit Resources

**Solution:**
1. Verify `role = 'center_manager'`
2. Check if `center_id` matches the location ID
3. Ensure resources (components, staff, etc.) have correct `location_id`

### Issue: RLS Policies Not Working

**Solution:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View active policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Test as specific user (run as admin)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub = 'user-uuid-here';
SELECT * FROM public.locations;
RESET ROLE;
```

---

## Security Best Practices

1. **Never expose sensitive functions to public**
   - All helper functions are `SECURITY DEFINER` and safe
   - Row Level Security is enforced at database level

2. **Always use Supabase client with auth**
   ```typescript
   // Good - RLS is enforced
   const { data } = await supabase.auth.getUser();
   const locations = await supabase.from('locations').select();
   
   // Bad - Service role bypasses RLS (use only for admin operations)
   const adminClient = createClient(url, SERVICE_ROLE_KEY);
   ```

3. **Validate on backend**
   - Frontend checks are for UX only
   - Database RLS policies are the true security layer

4. **Audit access regularly**
   ```sql
   -- Check all managers and their access
   SELECT * FROM public.user_access_summary 
   WHERE role LIKE '%manager%'
   ORDER BY segment_code, access_level;
   ```

5. **Log important changes**
   - Consider adding audit tables for role changes
   - Track when users are promoted/demoted

---

## Next Steps

1. ✅ Run the migration script (`04_rbac_segment_access.sql`)
2. ✅ Update existing data with segment codes
3. ✅ Create test users for each role
4. ✅ Test access control from frontend
5. ✅ Update frontend components to respect new roles
6. ✅ Add segment/center selectors in admin UI
7. ✅ Document your team's role assignments
8. ✅ Train managers on their access scope

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs in Dashboard → Logs
3. Test with SQL queries directly in SQL Editor
4. Verify RLS policies are active

---

**Last Updated**: January 2026
**Version**: 1.0
