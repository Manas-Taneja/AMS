# RBAC Implementation Checklist

## ✅ Complete Implementation Checklist

### Phase 1: Database Setup (15 minutes)

#### Task 1.1: Run Main RBAC Migration
- [ ] Open Supabase Dashboard (https://supabase.com/dashboard)
- [ ] Navigate to your AMS project
- [ ] Go to SQL Editor
- [ ] Click "+ New Query"
- [ ] Open file: `supabase/04_rbac_segment_access.sql`
- [ ] Copy entire content
- [ ] Paste into SQL Editor
- [ ] Click "Run" (or press Ctrl+Enter)
- [ ] Wait for completion message
- [ ] Verify no errors in output

**Expected Result**: All tables, functions, and policies created successfully

#### Task 1.2: Run Data Migration
- [ ] Still in SQL Editor
- [ ] Click "+ New Query" for a new query
- [ ] Open file: `supabase/05_data_migration_rbac.sql`
- [ ] Copy entire content
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Review the summary reports at the end
- [ ] Note any unmapped data warnings

**Expected Result**: Existing data migrated to new structure with summary report

#### Task 1.3: Verify Setup
- [ ] In SQL Editor, run verification queries:

```sql
-- Check segments exist
SELECT * FROM public.segments;
-- Should show: PSSL, IIDT, PRAKHAR

-- Check locations have segments
SELECT id, name, segment_code, is_headquarters 
FROM public.locations 
ORDER BY segment_code;
-- All locations should have segment_code

-- Check helper functions work
SELECT current_user_segment(), current_user_access_level();
-- Should not error (may return NULL if not logged in as user)

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('profiles', 'locations', 'staff', 'components');
-- All should show rowsecurity = true
```

**Expected Result**: All queries return expected data without errors

---

### Phase 2: Create Manager Users (5 minutes per user)

#### Task 2.1: Create Admin User
- [ ] Go to Authentication → Users
- [ ] Click "+ Add user"
- [ ] Fill in:
  - [ ] Email: `admin@yourcompany.com` (your email)
  - [ ] Password: (auto-generate or custom)
  - [ ] Check "Auto Confirm User"
- [ ] Click "Save"
- [ ] **COPY THE UUID** (you'll need it next)
- [ ] Go to Table Editor → profiles → "+ Insert row"
- [ ] Fill in:
  ```
  id: [PASTE-UUID-HERE]
  email: admin@yourcompany.com
  username: admin
  full_name: Your Name
  role: admin
  access_level: all
  segment_code: NULL
  center_id: NULL
  is_active: true
  is_superuser: true
  is_oauth_user: false
  ```
- [ ] Click "Save"

**Test**: Login with this account and verify you can see all data

#### Task 2.2: Create HQ Manager (Optional but Recommended)
- [ ] Create auth user in Authentication → Users
- [ ] Copy UUID
- [ ] Create profile in Table Editor → profiles
- [ ] Use template from `RBAC_QUICK_REFERENCE.md` (Template 2)
- [ ] Verify fields:
  - [ ] role: `hq_manager`
  - [ ] access_level: `headquarters`
  - [ ] segment_code: `NULL`
  - [ ] center_id: `NULL`

**Test**: Login and verify they see all segments and centers

#### Task 2.3: Create PSSL Segment Manager
- [ ] Create auth user: `pssl.manager@yourcompany.com`
- [ ] Copy UUID
- [ ] Create profile with:
  - [ ] role: `segment_manager`
  - [ ] access_level: `segment`
  - [ ] segment_code: `PSSL`
  - [ ] center_id: `NULL`

**Test**: Login and verify they see only PSSL locations (IDs: 1, 4, 7)

#### Task 2.4: Create IIDT Segment Manager
- [ ] Create auth user: `iidt.manager@yourcompany.com`
- [ ] Copy UUID
- [ ] Create profile with:
  - [ ] role: `segment_manager`
  - [ ] access_level: `segment`
  - [ ] segment_code: `IIDT`
  - [ ] center_id: `NULL`

**Test**: Login and verify they see only IIDT locations (IDs: 2, 5, 8)

#### Task 2.5: Create Prakhar Segment Manager
- [ ] Create auth user: `prakhar.manager@yourcompany.com`
- [ ] Copy UUID
- [ ] Create profile with:
  - [ ] role: `segment_manager`
  - [ ] access_level: `segment`
  - [ ] segment_code: `PRAKHAR`
  - [ ] center_id: `NULL`

**Test**: Login and verify they see only Prakhar locations (IDs: 3, 6)

#### Task 2.6: Create Test Center Manager (Mumbai)
- [ ] Create auth user: `mumbai.manager@yourcompany.com`
- [ ] Copy UUID
- [ ] Find Mumbai location ID:
  ```sql
  SELECT id FROM locations WHERE name LIKE '%Mumbai%';
  -- Should be: 4
  ```
- [ ] Create profile with:
  - [ ] role: `center_manager`
  - [ ] access_level: `center`
  - [ ] segment_code: `PSSL`
  - [ ] center_id: `4`

**Test**: Login and verify they see ONLY Mumbai location (ID: 4)

---

### Phase 3: Test Access Control (10 minutes)

#### Task 3.1: Test Admin Access
- [ ] Login as admin
- [ ] Run query:
  ```sql
  SELECT COUNT(*) FROM locations;
  ```
- [ ] Expected: 8 locations
- [ ] Try viewing staff:
  ```sql
  SELECT COUNT(*) FROM staff;
  ```
- [ ] Expected: All staff visible

#### Task 3.2: Test HQ Manager Access
- [ ] Login as HQ Manager
- [ ] Run query:
  ```sql
  SELECT COUNT(*) FROM locations;
  ```
- [ ] Expected: 8 locations (same as admin)
- [ ] Try viewing all segments:
  ```sql
  SELECT DISTINCT segment_code FROM locations;
  ```
- [ ] Expected: PSSL, IIDT, PRAKHAR

#### Task 3.3: Test Segment Manager Access (PSSL)
- [ ] Login as PSSL Segment Manager
- [ ] Run query:
  ```sql
  SELECT id, name, segment_code FROM locations;
  ```
- [ ] Expected: Only 3 PSSL locations (IDs: 1, 4, 7)
- [ ] Try viewing staff:
  ```sql
  SELECT COUNT(*) FROM staff WHERE segment_code = 'PSSL';
  ```
- [ ] Expected: Only PSSL staff

#### Task 3.4: Test Center Manager Access (Mumbai)
- [ ] Login as Mumbai Center Manager
- [ ] Run query:
  ```sql
  SELECT id, name FROM locations;
  ```
- [ ] Expected: Only 1 location (Mumbai, ID: 4)
- [ ] Try viewing staff:
  ```sql
  SELECT * FROM staff;
  ```
- [ ] Expected: Only Mumbai staff (if any)

#### Task 3.5: Test Data Isolation
- [ ] Login as PSSL Manager
- [ ] Try to view IIDT locations:
  ```sql
  SELECT * FROM locations WHERE segment_code = 'IIDT';
  ```
- [ ] Expected: Empty result (RLS blocks access)
- [ ] Login as Mumbai Manager
- [ ] Try to view PSSL HQ data:
  ```sql
  SELECT * FROM locations WHERE id = 1;
  ```
- [ ] Expected: Empty result (RLS blocks access)

---

### Phase 4: Verify RLS Policies (5 minutes)

#### Task 4.1: Check Policy Status
```sql
-- View all active policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as command,
  CASE WHEN qual IS NOT NULL THEN 'Has Filter' ELSE 'No Filter' END as has_filter
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
- [ ] Run query in SQL Editor
- [ ] Verify policies exist for: profiles, segments, locations, components, staff, training, projects, bills
- [ ] Each table should have multiple policies (select, insert, update, delete)

#### Task 4.2: Test User Access Summary View
```sql
SELECT * FROM public.user_access_summary;
```
- [ ] Run query
- [ ] Verify all created users appear
- [ ] Check access_description is correct for each user
- [ ] Verify segment_code and center_id are set correctly

---

### Phase 5: Frontend Integration (Optional - 15 minutes)

#### Task 5.1: Verify AuthContext Updates
- [ ] Open file: `src/context/AuthContext.tsx`
- [ ] Verify User interface includes:
  - [ ] `segment_code?: string`
  - [ ] `center_id?: number`
  - [ ] `access_level?: string`
- [ ] Verify new functions exist:
  - [ ] `isCenterManager()`
  - [ ] `isSegmentManager()`
  - [ ] `isHQManager()`
  - [ ] `getUserSegment()`
  - [ ] `getUserCenter()`
  - [ ] `getUserAccessLevel()`

#### Task 5.2: Test Frontend Authentication
- [ ] Start your development server
  ```bash
  npm run dev
  ```
- [ ] Login as admin
- [ ] Open browser console
- [ ] Check user object:
  ```javascript
  // In console
  console.log(user);
  ```
- [ ] Verify segment_code, center_id, access_level are present

#### Task 5.3: Test Data Fetching
- [ ] Login as PSSL Manager
- [ ] Navigate to Locations page
- [ ] Verify only PSSL locations are shown
- [ ] Navigate to Staff page
- [ ] Verify only PSSL staff are shown
- [ ] Login as Mumbai Manager
- [ ] Verify only Mumbai data is shown

---

### Phase 6: Documentation & Training (15 minutes)

#### Task 6.1: Review Documentation
- [ ] Read `RBAC_IMPLEMENTATION_SUMMARY.md` (overview)
- [ ] Bookmark `RBAC_QUICK_REFERENCE.md` (quick lookup)
- [ ] Review `RBAC_ROLE_STRUCTURE.md` (visual guide)
- [ ] Keep `RBAC_IMPLEMENTATION_GUIDE.md` for detailed reference

#### Task 6.2: Document Your Role Assignments
Create a document listing:
- [ ] Admin users (who they are)
- [ ] HQ Managers (who they are)
- [ ] Segment Managers for each segment
- [ ] Center Managers for each location
- [ ] Keep this document updated

#### Task 6.3: Create User Guide for Managers (Optional)
- [ ] Explain what each manager role can do
- [ ] Provide login instructions
- [ ] Show how to view their scope of data
- [ ] Explain how to create/edit resources in their scope

---

### Phase 7: Production Deployment (10 minutes)

#### Task 7.1: Backup Current Database
- [ ] In Supabase Dashboard → Database → Backups
- [ ] Create manual backup before deploying to production
- [ ] Note backup ID/timestamp

#### Task 7.2: Run Migrations on Production
- [ ] Repeat Phase 1 steps on production database
- [ ] Verify all migrations succeed
- [ ] Check data migration reports

#### Task 7.3: Create Production Users
- [ ] Create real manager accounts (not test accounts)
- [ ] Use official email addresses
- [ ] Set strong passwords
- [ ] Assign correct roles and scopes

#### Task 7.4: Final Production Tests
- [ ] Test each role type in production
- [ ] Verify data isolation
- [ ] Test create/edit operations
- [ ] Verify RLS policies are working

---

### Phase 8: Ongoing Maintenance

#### Regular Tasks
- [ ] Review user access monthly
  ```sql
  SELECT * FROM user_access_summary 
  WHERE is_active = true 
  ORDER BY role, segment_code;
  ```
- [ ] Audit manager permissions quarterly
- [ ] Update documentation when roles change
- [ ] Train new managers on their access scope

#### When Adding New Center Manager
- [ ] Create auth user
- [ ] Find location ID:
  ```sql
  SELECT id, name, segment_code FROM locations WHERE name = 'Center Name';
  ```
- [ ] Create profile with correct center_id
- [ ] Test their access
- [ ] Document the assignment

#### When Adding New Segment
- [ ] Insert into segments table:
  ```sql
  INSERT INTO segments (code, name, description) 
  VALUES ('NEWCODE', 'New Segment Name', 'Description');
  ```
- [ ] Update locations with new segment_code
- [ ] Create segment manager profile
- [ ] Update documentation

---

## Quick Troubleshooting Checklist

### User Can't Login
- [ ] Check user exists in Authentication → Users
- [ ] Check profile exists in profiles table
- [ ] Verify is_active = true
- [ ] Check email matches between auth and profile

### User Can't See Any Data
- [ ] Check role is not 'pending'
- [ ] Verify segment_code is set (if needed)
- [ ] Check center_id is set (if center manager)
- [ ] Verify is_active = true
- [ ] Run: `SELECT * FROM user_access_summary WHERE email = 'user@email.com';`

### User Sees Too Much Data
- [ ] Check access_level (should be 'center' or 'segment', not 'all')
- [ ] Verify segment_code matches their segment
- [ ] Check center_id is set (for center managers)
- [ ] Run: `SELECT role, access_level, segment_code, center_id FROM profiles WHERE email = 'user@email.com';`

### RLS Not Working
- [ ] Verify RLS is enabled:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
  ```
- [ ] Check policies exist:
  ```sql
  SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
  ```
- [ ] Test with specific user:
  ```sql
  SET LOCAL role TO authenticated;
  SET LOCAL request.jwt.claims.sub TO 'user-uuid';
  SELECT * FROM locations;
  RESET ROLE;
  ```

---

## Completion Checklist

### Core Implementation
- [ ] Phase 1: Database Setup (Complete)
- [ ] Phase 2: Create Users (At least Admin + 2 managers)
- [ ] Phase 3: Test Access Control (All tests pass)
- [ ] Phase 4: Verify RLS (Policies active)

### Optional Enhancements
- [ ] Phase 5: Frontend Integration
- [ ] Phase 6: Documentation & Training
- [ ] Phase 7: Production Deployment
- [ ] Phase 8: Maintenance Plan

### Sign-off
- [ ] Admin can see all data
- [ ] HQ Manager can see all segments
- [ ] Segment Managers see only their segment
- [ ] Center Managers see only their center
- [ ] Data isolation is working correctly
- [ ] No security warnings or errors
- [ ] Documentation is updated
- [ ] Team is trained

---

## Success Criteria

✅ **System is Ready When:**
1. All SQL migrations run without errors
2. At least 3 different role types created and tested
3. RLS policies confirmed working (data isolation verified)
4. Segment managers can't see other segments' data
5. Center managers can't see other centers' data
6. Admin/HQ managers can see all data
7. Frontend authentication works with new user attributes
8. All tests pass

---

## Support Resources

- **Quick Reference**: `RBAC_QUICK_REFERENCE.md`
- **Full Guide**: `RBAC_IMPLEMENTATION_GUIDE.md`
- **Visual Guide**: `RBAC_ROLE_STRUCTURE.md`
- **Summary**: `RBAC_IMPLEMENTATION_SUMMARY.md`

---

## Estimated Time

- **Minimum Setup**: 30 minutes (Phases 1-4)
- **Full Implementation**: 1-2 hours (All phases)
- **With Frontend**: 2-3 hours (Including Phase 5)

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Status**: Ready for Implementation  

---

Good luck with your implementation! Follow each step carefully and test thoroughly at each phase.
