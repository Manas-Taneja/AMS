# RBAC Quick Reference Guide

## 🎯 What You Need to Do on Supabase

### Step 1: Run the Migration Scripts (5 minutes)

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy and Run**: `04_rbac_segment_access.sql` (main RBAC setup)
3. **Copy and Run**: `05_data_migration_rbac.sql` (migrate existing data)
4. **Verify**: Check that segments table has data: `SELECT * FROM segments;`

---

### Step 2: Create Auth Users for Managers (2 minutes per user)

1. **Go to**: Supabase Dashboard → Authentication → Users
2. **Click**: "+ Add user"
3. **Enter**:
   - Email: `manager@domain.com`
   - Password: Auto-generate or set custom
   - Email Confirm: Check "Auto Confirm User"
4. **Save** and **copy the UUID** (you'll need it next)

---

### Step 3: Create Profiles for Managers (3 minutes per user)

1. **Go to**: Table Editor → profiles → "+ Insert row"
2. **Fill in based on role type below**

---

## 📋 Role Configuration Templates

### Template 1: Admin (Full Access)
```
id: [AUTH_USER_UUID_HERE]
email: admin@company.com
username: admin
full_name: System Administrator
role: admin
access_level: all
segment_code: NULL
center_id: NULL
is_active: true
```

### Template 2: HQ Manager (All India - All Segments)
```
id: [AUTH_USER_UUID_HERE]
email: hq.manager@company.com
username: hq_manager
full_name: National Operations Manager
role: hq_manager
access_level: headquarters
segment_code: NULL
center_id: NULL
is_active: true
```

### Template 3: PSSL Segment Manager (All PSSL Centers)
```
id: [AUTH_USER_UUID_HERE]
email: rajesh.kumar@pssl.com
username: rajesh_kumar
full_name: Dr. Rajesh Kumar
role: segment_manager
access_level: segment
segment_code: PSSL
center_id: NULL
is_active: true
```

### Template 4: IIDT Segment Manager (All IIDT Centers)
```
id: [AUTH_USER_UUID_HERE]
email: priya.sharma@iidt.org
username: priya_sharma
full_name: Prof. Priya Sharma
role: segment_manager
access_level: segment
segment_code: IIDT
center_id: NULL
is_active: true
```

### Template 5: Prakhar Segment Manager (All Prakhar Centers)
```
id: [AUTH_USER_UUID_HERE]
email: amit.singh@prakharaviation.com
username: amit_singh
full_name: Capt. Amit Singh
role: segment_manager
access_level: segment
segment_code: PRAKHAR
center_id: NULL
is_active: true
```

### Template 6: Center Manager (Single Location Only)
```
id: [AUTH_USER_UUID_HERE]
email: mumbai.manager@pssl.com
username: mumbai_manager
full_name: Ms. Sneha Patel
role: center_manager
access_level: center
segment_code: PSSL
center_id: 4  ← Get this from locations table
is_active: true
```

---

## 🔍 How to Find Location IDs for Center Managers

Run this query in SQL Editor:
```sql
SELECT 
  id as location_id,
  name as location_name,
  segment_code,
  manager as suggested_manager_name,
  address
FROM public.locations
ORDER BY segment_code, name;
```

**Results:**
| location_id | location_name | segment_code | suggested_manager_name |
|-------------|---------------|--------------|------------------------|
| 1 | PSSL Headquarters | PSSL | Dr. Rajesh Kumar |
| 4 | PSSL Branch Office - Mumbai | PSSL | Ms. Sneha Patel |
| 7 | PSSL Data Center | PSSL | Mr. Arjun Mehta |
| 2 | IIDT Research Center | IIDT | Prof. Priya Sharma |
| 5 | IIDT Satellite Office - Chennai | IIDT | Mr. Karthik Reddy |
| 8 | IIDT Field Station - Dehradun | IIDT | Dr. Meera Joshi |
| 3 | Prakhar Aviation Training Center | PRAKHAR | Capt. Amit Singh |
| 6 | Prakhar Aviation Maintenance Hub | PRAKHAR | Mr. Deepak Verma |

Use the `location_id` as `center_id` when creating center manager profiles.

---

## 🎭 Role Comparison Table

| Role | Code | Sees | Can Edit | Access Level |
|------|------|------|----------|--------------|
| **Admin** | `admin` | Everything | Everything | `all` |
| **HQ Manager** | `hq_manager` | All segments, all centers | Most things | `headquarters` |
| **Segment Manager** | `segment_manager` | Their segment only | Their segment | `segment` |
| **Center Manager** | `center_manager` | Their center only | Their center | `center` |
| **User** | `user` | Limited view | Limited | `center` |
| **Pending** | `pending` | Nothing | Nothing | None |

---

## 🔑 Segment Codes

| Code | Name | Description |
|------|------|-------------|
| `PSSL` | PSSL Division | Prakhar Softwares Systems Limited |
| `IIDT` | IIDT Research | Indian Institute of Drone Technology |
| `PRAKHAR` | Prakhar Aviation | Aviation Services - Training & Maintenance |

---

## 🧪 Test Your Setup

### Test 1: Verify User Access
```sql
-- Login as the user you created, then run:
SELECT * FROM public.user_access_summary 
WHERE email = 'your-email@domain.com';
```

Expected: Shows their role, segment, center, and access description

### Test 2: Check What They Can See
```sql
-- As HQ Manager: Should see ALL locations
SELECT id, name, segment_code FROM public.locations;

-- As PSSL Segment Manager: Should see only PSSL locations
SELECT id, name, segment_code FROM public.locations;

-- As Mumbai Center Manager: Should see only Mumbai location (id=4)
SELECT id, name, segment_code FROM public.locations;
```

### Test 3: Check Staff Access
```sql
-- Each role should see different staff based on their access level
SELECT id, name, segment_code, location_id FROM public.staff;
```

### Test 4: Verify the View
```sql
-- See all users and their access
SELECT * FROM public.user_access_summary;
```

---

## 🚨 Common Issues & Quick Fixes

### Issue: User can't see any data
**Fix:** Check these in order:
1. User has profile in `profiles` table? → Create it
2. `is_active = true`? → Update to true
3. `role` is not 'pending'? → Change role
4. `segment_code` matches their data? → Fix segment_code

### Issue: Segment manager sees all data (should see only their segment)
**Fix:**
```sql
UPDATE profiles 
SET access_level = 'segment', segment_code = 'PSSL' -- or IIDT or PRAKHAR
WHERE email = 'manager@domain.com';
```

### Issue: Center manager sees too much data
**Fix:**
```sql
UPDATE profiles 
SET access_level = 'center', center_id = 4 -- correct location ID
WHERE email = 'center.manager@domain.com';
```

---

## 📝 Example: Complete Setup for Mumbai Center Manager

### Step-by-step:

1. **Create auth user** in Supabase Auth
   - Email: `sneha.patel@pssl.com`
   - Copy UUID: `12345678-1234-1234-1234-123456789abc`

2. **Find location ID**:
   ```sql
   SELECT id FROM locations WHERE name = 'PSSL Branch Office - Mumbai';
   -- Result: 4
   ```

3. **Insert profile** in Table Editor → profiles:
   ```
   id: 12345678-1234-1234-1234-123456789abc
   email: sneha.patel@pssl.com
   username: sneha_patel
   full_name: Ms. Sneha Patel
   role: center_manager
   access_level: center
   segment_code: PSSL
   center_id: 4
   is_active: true
   ```

4. **Test**:
   ```sql
   -- Login as sneha.patel@pssl.com, then:
   SELECT * FROM locations;
   -- Should see ONLY Mumbai location (id=4)
   
   SELECT * FROM staff;
   -- Should see ONLY staff at Mumbai location
   ```

---

## 🎯 Quick Commands

### See all segments:
```sql
SELECT * FROM segments;
```

### See all locations with their segments:
```sql
SELECT id, name, segment_code, is_headquarters FROM locations;
```

### See all users and their access:
```sql
SELECT * FROM user_access_summary;
```

### Update user role:
```sql
UPDATE profiles 
SET role = 'segment_manager', access_level = 'segment', center_id = NULL
WHERE email = 'user@domain.com';
```

### Add new center manager:
```sql
-- 1. Create auth user first in Supabase Auth UI
-- 2. Then insert profile:
INSERT INTO profiles (id, email, username, full_name, role, access_level, segment_code, center_id, is_active)
VALUES ('AUTH-UUID', 'manager@email.com', 'username', 'Full Name', 'center_manager', 'center', 'PSSL', 4, true);
```

---

## 📚 Need More Help?

- **Full Details**: See `RBAC_IMPLEMENTATION_GUIDE.md`
- **SQL Scripts**: 
  - `04_rbac_segment_access.sql` - Main RBAC setup
  - `05_data_migration_rbac.sql` - Data migration
- **Supabase Docs**: https://supabase.com/docs/guides/auth/row-level-security

---

**Last Updated**: January 2026
