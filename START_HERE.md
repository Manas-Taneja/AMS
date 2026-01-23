# 🚀 START HERE - RBAC Implementation

## What Has Been Created For You

I've implemented a **complete Role-Based Access Control (RBAC) system** that provides:

✅ **Segment-wise Access Control**
- PSSL managers see all PSSL centers
- IIDT managers see all IIDT centers  
- Prakhar managers see all Prakhar centers

✅ **Center-wise Access Control**
- Mumbai manager sees only Mumbai center
- Chennai manager sees only Chennai center
- Each center manager restricted to their location

✅ **Headquarters View**
- HQ managers can see All India (all segments, all centers combined)

✅ **Automatic Security**
- Database-level access control (Row Level Security)
- Data automatically filtered based on user role
- No way to bypass security from frontend

---

## 📂 Files Created

### SQL Files (Run on Supabase)
1. **`supabase/04_rbac_segment_access.sql`** - Main RBAC system (RUN THIS FIRST)
2. **`supabase/05_data_migration_rbac.sql`** - Migrates existing data (RUN THIS SECOND)

### Documentation Files (Read These)
1. **`RBAC_IMPLEMENTATION_CHECKLIST.md`** ⭐ **START HERE** - Step-by-step checklist
2. **`RBAC_QUICK_REFERENCE.md`** - Quick lookup for creating users
3. **`RBAC_ROLE_STRUCTURE.md`** - Visual diagrams and examples
4. **`RBAC_IMPLEMENTATION_GUIDE.md`** - Complete detailed guide
5. **`RBAC_IMPLEMENTATION_SUMMARY.md`** - Overview and benefits

### Code Files (Already Updated)
1. **`src/context/AuthContext.tsx`** - Updated with new role functions

---

## 🎯 Quick Start (30 Minutes)

### Step 1: Run SQL Scripts (10 min)

1. Go to **Supabase Dashboard** → Your AMS Project
2. Click **SQL Editor** → **New Query**
3. Copy content from `supabase/04_rbac_segment_access.sql`
4. Paste and click **Run**
5. Wait for success message
6. Repeat for `supabase/05_data_migration_rbac.sql`

### Step 2: Create Admin User (5 min)

1. Go to **Authentication** → **Users** → **Add user**
2. Enter your email and password
3. Check "Auto Confirm User"
4. **Copy the UUID** that appears
5. Go to **Table Editor** → **profiles** → **Insert row**
6. Fill in:
   ```
   id: [PASTE UUID]
   email: your@email.com
   username: admin
   full_name: Your Name
   role: admin
   access_level: all
   segment_code: NULL
   center_id: NULL
   is_active: true
   ```
7. Click Save

### Step 3: Create Test Managers (10 min)

Create 2-3 test users to verify the system works:

**Test User 1: PSSL Segment Manager**
- Create auth user: `pssl.test@test.com`
- Create profile with:
  - role: `segment_manager`
  - segment_code: `PSSL`
  - access_level: `segment`

**Test User 2: Mumbai Center Manager**  
- Create auth user: `mumbai.test@test.com`
- Create profile with:
  - role: `center_manager`
  - segment_code: `PSSL`
  - center_id: `4`
  - access_level: `center`

### Step 4: Test Access (5 min)

Login as each user and run:
```sql
SELECT id, name, segment_code FROM locations;
```

**Expected Results:**
- Admin: Sees all 8 locations
- PSSL Manager: Sees 3 PSSL locations (IDs: 1, 4, 7)
- Mumbai Manager: Sees 1 location (ID: 4 only)

---

## 📋 Role Types You Can Create

| Role | Sees | Example |
|------|------|---------|
| **Admin** | Everything | System Administrator |
| **HQ Manager** | All segments, all centers | National Operations Manager |
| **Segment Manager** | Their segment only | PSSL Division Head |
| **Center Manager** | Their center only | Mumbai Branch Manager |
| **User** | Limited access | Regular staff |

---

## 🔑 Your Segments

| Code | Name | Centers |
|------|------|---------|
| **PSSL** | Prakhar Softwares Systems | HQ (1), Mumbai (4), Data Center (7) |
| **IIDT** | Indian Institute of Drone Tech | Research Center (2), Chennai (5), Dehradun (8) |
| **PRAKHAR** | Prakhar Aviation Services | Training Center (3), Maintenance Hub (6) |

---

## 📖 Which Document To Read When

### I want to get started NOW
→ Read: **`RBAC_IMPLEMENTATION_CHECKLIST.md`**  
Follow the checklist step-by-step

### I need to create a user quickly
→ Read: **`RBAC_QUICK_REFERENCE.md`**  
Copy-paste templates for each role type

### I want to understand how it works
→ Read: **`RBAC_ROLE_STRUCTURE.md`**  
Visual diagrams and examples

### I need complete details
→ Read: **`RBAC_IMPLEMENTATION_GUIDE.md`**  
Everything you need to know

### I want an overview
→ Read: **`RBAC_IMPLEMENTATION_SUMMARY.md`**  
What was done and why

---

## ✅ Success Checklist

- [ ] Ran both SQL migration files successfully
- [ ] Created admin user and can login
- [ ] Created at least 2 test managers (different roles)
- [ ] Tested that segment manager sees only their segment
- [ ] Tested that center manager sees only their center
- [ ] Verified data isolation is working
- [ ] Understood the role hierarchy
- [ ] Know where to find documentation

---

## 🆘 Need Help?

### Common Issues

**Issue**: User can't see any data  
**Fix**: Check `is_active = true` and role is not 'pending'

**Issue**: Manager sees too much data  
**Fix**: Verify `access_level` and `segment_code` are set correctly

**Issue**: SQL migration fails  
**Fix**: Ensure you're running scripts in order (04 before 05)

### Where To Look

- **Quick fixes** → `RBAC_QUICK_REFERENCE.md` (bottom section)
- **Detailed troubleshooting** → `RBAC_IMPLEMENTATION_GUIDE.md` (Troubleshooting section)
- **Verification queries** → `RBAC_IMPLEMENTATION_CHECKLIST.md` (Phase 4)

---

## 🎓 Example: Complete Setup For One Manager

Let's create a Mumbai Branch Manager from scratch:

### 1. Create Auth User
- Supabase → Authentication → Users → Add user
- Email: `sneha.patel@pssl.com`
- Auto-confirm: ✓
- Copy UUID: `abc123-def456-...`

### 2. Find Location ID
```sql
SELECT id FROM locations WHERE name LIKE '%Mumbai%';
-- Result: 4
```

### 3. Create Profile
- Table Editor → profiles → Insert row
- Fill in:
  ```
  id: abc123-def456-...
  email: sneha.patel@pssl.com
  username: sneha_patel
  full_name: Ms. Sneha Patel
  role: center_manager
  access_level: center
  segment_code: PSSL
  center_id: 4
  is_active: true
  ```

### 4. Test
- Login as `sneha.patel@pssl.com`
- Query: `SELECT * FROM locations;`
- Should see: Only Mumbai (1 row)

Done! 🎉

---

## 🚀 What To Do On Supabase

### Required Steps (Must Do)

1. **SQL Editor** → Run `04_rbac_segment_access.sql`
2. **SQL Editor** → Run `05_data_migration_rbac.sql`  
3. **Authentication → Users** → Create manager accounts
4. **Table Editor → profiles** → Create profiles for each manager

### How To Create A Profile

For each manager:

1. Create auth user (get UUID)
2. Go to Table Editor → profiles
3. Click "+ Insert row"
4. Fill required fields (see templates in `RBAC_QUICK_REFERENCE.md`)
5. Save

---

## 📊 What You'll Have After Setup

### Database Changes
- ✅ New `segments` table (PSSL, IIDT, PRAKHAR)
- ✅ All locations linked to segments
- ✅ All staff/components/training linked to locations and segments
- ✅ Row Level Security policies on all tables
- ✅ Helper functions for access control

### Users You Can Create
- ✅ Admin (sees everything)
- ✅ HQ Manager (all India)
- ✅ Segment Managers (per segment)
- ✅ Center Managers (per location)
- ✅ Regular users (limited access)

### Security Features
- ✅ Automatic data filtering by role
- ✅ Database-level security (can't be bypassed)
- ✅ Segment isolation
- ✅ Center isolation
- ✅ Audit trail via user_access_summary view

---

## 🎯 Your Next Steps

1. ⭐ **Read**: `RBAC_IMPLEMENTATION_CHECKLIST.md` (your step-by-step guide)
2. 🚀 **Do**: Run the two SQL migration files
3. 👤 **Create**: Admin user for yourself
4. 🧪 **Test**: Create 2-3 test managers and verify access
5. 📝 **Document**: Note down who has what role
6. 🎓 **Train**: Share relevant docs with your managers

---

## ⏱️ Time Estimate

- **Minimum viable setup**: 30 minutes
- **With testing**: 45 minutes  
- **Complete with documentation**: 1-2 hours

---

## 🎉 You're Ready!

Everything you need is in this folder:

1. SQL files to run
2. Documentation to follow
3. Templates to copy
4. Examples to learn from

**Start with**: `RBAC_IMPLEMENTATION_CHECKLIST.md`

---

## 📞 System Overview

```
                    ADMIN
                      |
                  HQ MANAGER (All India)
                      |
         +-----------+-----------+
         |           |           |
      PSSL         IIDT      PRAKHAR
    Seg. Mgr    Seg. Mgr    Seg. Mgr
         |           |           |
   +---------+   +-------+   +-------+
   |   |   |     |   |   |   |       |
  HQ Mum DC    RC Che Deh  TC      MH
  Mgr Mgr Mgr  Mgr Mgr Mgr Mgr    Mgr
  
  Center Managers (Single Location)
```

Each level sees only their scope:
- HQ Manager → All boxes
- Segment Manager → Their segment's boxes only
- Center Manager → Their single box only

---

**Ready?** → Open `RBAC_IMPLEMENTATION_CHECKLIST.md` and start with Phase 1! 🚀

---

**Last Updated**: January 2026  
**Status**: Ready to Deploy  
**Estimated Setup Time**: 30-60 minutes  
