-- ============================================================================
-- DATA MIGRATION FOR RBAC IMPLEMENTATION
-- ============================================================================
-- This script migrates existing data to work with the new RBAC system
-- Run this AFTER running 04_rbac_segment_access.sql
-- ============================================================================

-- ============================================================================
-- STEP 1: Link Existing Locations to Segments
-- ============================================================================

-- Update PSSL locations
UPDATE public.locations 
SET 
  segment_code = 'PSSL',
  is_headquarters = (name = 'PSSL Headquarters'),
  type = CASE 
    WHEN name LIKE '%Headquarters%' THEN 'headquarters'
    WHEN name LIKE '%Branch%' THEN 'branch'
    WHEN name LIKE '%Data Center%' THEN 'branch'
    ELSE type
  END
WHERE name LIKE '%PSSL%';

-- Update IIDT locations
UPDATE public.locations 
SET 
  segment_code = 'IIDT',
  is_headquarters = (name = 'IIDT Research Center'),
  type = CASE 
    WHEN name LIKE '%Research Center%' THEN 'headquarters'
    WHEN name LIKE '%Satellite%' THEN 'satellite'
    WHEN name LIKE '%Field Station%' THEN 'field_station'
    ELSE type
  END
WHERE name LIKE '%IIDT%';

-- Update Prakhar Aviation locations
UPDATE public.locations 
SET 
  segment_code = 'PRAKHAR',
  is_headquarters = (name = 'Prakhar Aviation Training Center'),
  type = CASE 
    WHEN name LIKE '%Training Center%' THEN 'headquarters'
    WHEN name LIKE '%Maintenance%' THEN 'branch'
    ELSE type
  END
WHERE name LIKE '%Prakhar%' OR name LIKE '%Aviation%';

-- Set headquarters location IDs in segments table
UPDATE public.segments s
SET headquarters_location_id = l.id
FROM public.locations l
WHERE s.code = l.segment_code 
  AND l.is_headquarters = true;

-- Verify location updates
SELECT 
  id, 
  name, 
  segment_code, 
  is_headquarters, 
  type,
  manager,
  address
FROM public.locations 
ORDER BY segment_code, is_headquarters DESC, id;

-- ============================================================================
-- STEP 2: Migrate Components Data
-- ============================================================================

-- Create a temporary mapping of location names to IDs
DO $$
DECLARE
  comp_record RECORD;
  loc_id BIGINT;
BEGIN
  FOR comp_record IN SELECT id, location FROM public.components WHERE location_id IS NULL
  LOOP
    -- Try exact match first
    SELECT id INTO loc_id FROM public.locations WHERE name = comp_record.location LIMIT 1;
    
    -- If no exact match, try partial match
    IF loc_id IS NULL THEN
      SELECT id INTO loc_id FROM public.locations WHERE name LIKE '%' || comp_record.location || '%' LIMIT 1;
    END IF;
    
    -- Update if we found a match
    IF loc_id IS NOT NULL THEN
      UPDATE public.components 
      SET location_id = loc_id 
      WHERE id = comp_record.id;
      
      RAISE NOTICE 'Updated component % with location_id %', comp_record.id, loc_id;
    ELSE
      RAISE WARNING 'No location found for component % with location: %', comp_record.id, comp_record.location;
    END IF;
  END LOOP;
END $$;

-- The segment_code will be automatically populated by the trigger
-- Verify components update
SELECT 
  id, 
  name, 
  location as location_text, 
  location_id, 
  segment_code,
  category,
  status
FROM public.components 
LIMIT 20;

-- Check for components without location_id
SELECT 
  COUNT(*) as unmapped_count,
  location as location_text
FROM public.components 
WHERE location_id IS NULL
GROUP BY location;

-- ============================================================================
-- STEP 3: Migrate Staff Data
-- ============================================================================

-- Map staff to locations
DO $$
DECLARE
  staff_record RECORD;
  loc_id BIGINT;
BEGIN
  FOR staff_record IN SELECT id, location FROM public.staff WHERE location_id IS NULL
  LOOP
    -- Try exact match first
    SELECT id INTO loc_id FROM public.locations WHERE name = staff_record.location LIMIT 1;
    
    -- If no exact match, try partial match
    IF loc_id IS NULL THEN
      SELECT id INTO loc_id FROM public.locations WHERE name LIKE '%' || staff_record.location || '%' LIMIT 1;
    END IF;
    
    -- Update if we found a match
    IF loc_id IS NOT NULL THEN
      UPDATE public.staff 
      SET location_id = loc_id 
      WHERE id = staff_record.id;
      
      RAISE NOTICE 'Updated staff % with location_id %', staff_record.id, loc_id;
    ELSE
      RAISE WARNING 'No location found for staff % with location: %', staff_record.id, staff_record.location;
    END IF;
  END LOOP;
END $$;

-- Verify staff update
SELECT 
  id, 
  name, 
  location as location_text, 
  location_id, 
  segment_code,
  department,
  designation,
  company
FROM public.staff 
LIMIT 20;

-- Check staff distribution by segment
SELECT 
  s.segment_code,
  seg.name as segment_name,
  COUNT(*) as staff_count
FROM public.staff s
LEFT JOIN public.segments seg ON s.segment_code = seg.code
GROUP BY s.segment_code, seg.name
ORDER BY staff_count DESC;

-- ============================================================================
-- STEP 4: Migrate Training Data
-- ============================================================================

-- Map training to locations
DO $$
DECLARE
  training_record RECORD;
  loc_id BIGINT;
BEGIN
  FOR training_record IN 
    SELECT id, schedule_location, institution 
    FROM public.training 
    WHERE location_id IS NULL
  LOOP
    loc_id := NULL;
    
    -- Try to match schedule_location first
    IF training_record.schedule_location IS NOT NULL THEN
      SELECT id INTO loc_id 
      FROM public.locations 
      WHERE name = training_record.schedule_location 
      LIMIT 1;
    END IF;
    
    -- Try partial match on schedule_location
    IF loc_id IS NULL AND training_record.schedule_location IS NOT NULL THEN
      SELECT id INTO loc_id 
      FROM public.locations 
      WHERE name LIKE '%' || training_record.schedule_location || '%' 
      LIMIT 1;
    END IF;
    
    -- Try to match institution name
    IF loc_id IS NULL AND training_record.institution IS NOT NULL THEN
      SELECT id INTO loc_id 
      FROM public.locations 
      WHERE name LIKE '%' || training_record.institution || '%' 
      LIMIT 1;
    END IF;
    
    -- Update if we found a match
    IF loc_id IS NOT NULL THEN
      UPDATE public.training 
      SET location_id = loc_id 
      WHERE id = training_record.id;
      
      RAISE NOTICE 'Updated training % with location_id %', training_record.id, loc_id;
    ELSE
      RAISE WARNING 'No location found for training % (institution: %, location: %)', 
        training_record.id, training_record.institution, training_record.schedule_location;
    END IF;
  END LOOP;
END $$;

-- For trainings without a matched location, try to infer from institution patterns
UPDATE public.training t
SET 
  segment_code = CASE 
    WHEN institution LIKE '%PSSL%' THEN 'PSSL'
    WHEN institution LIKE '%IIDT%' THEN 'IIDT'
    WHEN institution LIKE '%Prakhar%' OR institution LIKE '%Aviation%' THEN 'PRAKHAR'
    ELSE NULL
  END
WHERE segment_code IS NULL AND location_id IS NULL;

-- Verify training update
SELECT 
  id, 
  name, 
  institution,
  schedule_location, 
  location_id, 
  segment_code,
  level,
  status
FROM public.training 
LIMIT 20;

-- ============================================================================
-- STEP 5: Migrate Projects Data (if they belong to specific segments)
-- ============================================================================

-- Assign projects to segments based on name patterns or category
UPDATE public.projects 
SET segment_code = 'PSSL'
WHERE name LIKE '%Autonomous%' 
   OR name LIKE '%Delivery%' 
   OR name LIKE '%Data Processing%'
   OR name LIKE '%Survey%';

UPDATE public.projects 
SET segment_code = 'IIDT'
WHERE name LIKE '%Surveillance%' 
   OR name LIKE '%Agriculture%' 
   OR name LIKE '%Environmental%'
   OR name LIKE '%Research%';

UPDATE public.projects 
SET segment_code = 'PRAKHAR'
WHERE name LIKE '%Training%' 
   OR name LIKE '%Pilot%' 
   OR name LIKE '%Maintenance%'
   OR name LIKE '%Fleet%';

-- Verify projects update
SELECT 
  id, 
  name, 
  segment_code,
  category,
  status,
  progress
FROM public.projects 
ORDER BY segment_code, name;

-- ============================================================================
-- STEP 6: Create Sample Manager Profiles (COMMENTED OUT - CUSTOMIZE FIRST)
-- ============================================================================

-- IMPORTANT: Uncomment and customize these after creating auth users in Supabase

-- Example 1: System Admin
-- INSERT INTO public.profiles (
--   id, 
--   email, 
--   username, 
--   full_name, 
--   role, 
--   access_level,
--   segment_code,
--   center_id,
--   is_active
-- ) VALUES (
--   'REPLACE-WITH-AUTH-USER-UUID',
--   'admin@company.com',
--   'admin',
--   'System Administrator',
--   'admin',
--   'all',
--   NULL,
--   NULL,
--   true
-- );

-- Example 2: Headquarters Manager (All India)
-- INSERT INTO public.profiles (
--   id, 
--   email, 
--   username, 
--   full_name, 
--   role, 
--   access_level,
--   segment_code,
--   center_id,
--   is_active
-- ) VALUES (
--   'REPLACE-WITH-AUTH-USER-UUID',
--   'hq.manager@company.com',
--   'hq_manager',
--   'National Operations Manager',
--   'hq_manager',
--   'headquarters',
--   NULL,
--   NULL,
--   true
-- );

-- Example 3: PSSL Segment Manager
-- INSERT INTO public.profiles (
--   id, 
--   email, 
--   username, 
--   full_name, 
--   role, 
--   access_level,
--   segment_code,
--   center_id,
--   is_active
-- ) VALUES (
--   'REPLACE-WITH-AUTH-USER-UUID',
--   'rajesh.kumar@pssl.com',
--   'rajesh_kumar',
--   'Dr. Rajesh Kumar',
--   'segment_manager',
--   'segment',
--   'PSSL',
--   NULL,
--   true
-- );

-- Example 4: IIDT Segment Manager
-- INSERT INTO public.profiles (
--   id, 
--   email, 
--   username, 
--   full_name, 
--   role, 
--   access_level,
--   segment_code,
--   center_id,
--   is_active
-- ) VALUES (
--   'REPLACE-WITH-AUTH-USER-UUID',
--   'priya.sharma@iidt.org',
--   'priya_sharma',
--   'Prof. Priya Sharma',
--   'segment_manager',
--   'segment',
--   'IIDT',
--   NULL,
--   true
-- );

-- Example 5: Prakhar Segment Manager
-- INSERT INTO public.profiles (
--   id, 
--   email, 
--   username, 
--   full_name, 
--   role, 
--   access_level,
--   segment_code,
--   center_id,
--   is_active
-- ) VALUES (
--   'REPLACE-WITH-AUTH-USER-UUID',
--   'amit.singh@prakharaviation.com',
--   'amit_singh',
--   'Capt. Amit Singh',
--   'segment_manager',
--   'segment',
--   'PRAKHAR',
--   NULL,
--   true
-- );

-- Example 6: Mumbai Center Manager (PSSL Branch)
-- INSERT INTO public.profiles (
--   id, 
--   email, 
--   username, 
--   full_name, 
--   role, 
--   access_level,
--   segment_code,
--   center_id,
--   is_active
-- ) VALUES (
--   'REPLACE-WITH-AUTH-USER-UUID',
--   'sneha.patel@pssl.com',
--   'sneha_patel',
--   'Ms. Sneha Patel',
--   'center_manager',
--   'center',
--   'PSSL',
--   4, -- Mumbai location ID
--   true
-- );

-- Example 7: Chennai Center Manager (IIDT Satellite)
-- INSERT INTO public.profiles (
--   id, 
--   email, 
--   username, 
--   full_name, 
--   role, 
--   access_level,
--   segment_code,
--   center_id,
--   is_active
-- ) VALUES (
--   'REPLACE-WITH-AUTH-USER-UUID',
--   'karthik.reddy@iidt.org',
--   'karthik_reddy',
--   'Mr. Karthik Reddy',
--   'center_manager',
--   'center',
--   'IIDT',
--   5, -- Chennai location ID
--   true
-- );

-- ============================================================================
-- STEP 7: Data Validation and Reports
-- ============================================================================

-- Summary Report
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RBAC DATA MIGRATION SUMMARY REPORT';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- Segments Summary
SELECT 
  '=== SEGMENTS ===' as report_section,
  code,
  name,
  headquarters_location_id,
  (SELECT COUNT(*) FROM public.locations WHERE segment_code = s.code) as location_count,
  (SELECT COUNT(*) FROM public.staff WHERE segment_code = s.code) as staff_count,
  (SELECT COUNT(*) FROM public.components WHERE segment_code = s.code) as component_count
FROM public.segments s
ORDER BY code;

-- Locations by Segment
SELECT 
  '=== LOCATIONS BY SEGMENT ===' as report_section,
  segment_code,
  COUNT(*) as location_count,
  SUM(CASE WHEN is_headquarters THEN 1 ELSE 0 END) as headquarters_count,
  SUM(team) as total_team_size
FROM public.locations
GROUP BY segment_code
ORDER BY segment_code;

-- Components by Segment
SELECT 
  '=== COMPONENTS BY SEGMENT ===' as report_section,
  segment_code,
  COUNT(*) as component_count,
  COUNT(DISTINCT location_id) as locations_with_components
FROM public.components
WHERE segment_code IS NOT NULL
GROUP BY segment_code
ORDER BY segment_code;

-- Staff by Segment
SELECT 
  '=== STAFF BY SEGMENT ===' as report_section,
  segment_code,
  COUNT(*) as staff_count,
  COUNT(DISTINCT location_id) as locations_with_staff,
  COUNT(DISTINCT department) as department_count
FROM public.staff
WHERE segment_code IS NOT NULL
GROUP BY segment_code
ORDER BY segment_code;

-- Training by Segment
SELECT 
  '=== TRAINING BY SEGMENT ===' as report_section,
  COALESCE(segment_code, 'UNMAPPED') as segment_code,
  COUNT(*) as training_count,
  COUNT(DISTINCT location_id) as locations_with_training
FROM public.training
GROUP BY segment_code
ORDER BY segment_code;

-- Projects by Segment
SELECT 
  '=== PROJECTS BY SEGMENT ===' as report_section,
  COALESCE(segment_code, 'UNMAPPED') as segment_code,
  COUNT(*) as project_count,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects
FROM public.projects
GROUP BY segment_code
ORDER BY segment_code;

-- Unmapped Data Report
SELECT '=== UNMAPPED DATA (NEEDS ATTENTION) ===' as report_section;

SELECT 
  'Components without location_id' as data_type,
  COUNT(*) as count,
  STRING_AGG(DISTINCT location, ', ') as unmapped_locations
FROM public.components
WHERE location_id IS NULL;

SELECT 
  'Staff without location_id' as data_type,
  COUNT(*) as count,
  STRING_AGG(DISTINCT location, ', ') as unmapped_locations
FROM public.staff
WHERE location_id IS NULL;

SELECT 
  'Training without location_id or segment' as data_type,
  COUNT(*) as count,
  STRING_AGG(DISTINCT institution, ', ') as unmapped_institutions
FROM public.training
WHERE location_id IS NULL AND segment_code IS NULL;

-- User Access Summary
SELECT 
  '=== USER ACCESS SUMMARY ===' as report_section,
  role,
  access_level,
  COUNT(*) as user_count
FROM public.profiles
GROUP BY role, access_level
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'hq_manager' THEN 2
    WHEN 'segment_manager' THEN 3
    WHEN 'center_manager' THEN 4
    WHEN 'user' THEN 5
    WHEN 'pending' THEN 6
  END;

-- ============================================================================
-- STEP 8: Create Helper Queries for User Management
-- ============================================================================

-- View to help assign location IDs when creating center managers
CREATE OR REPLACE VIEW public.location_manager_mapping AS
SELECT 
  l.id as location_id,
  l.name as location_name,
  l.segment_code,
  s.name as segment_name,
  l.manager as suggested_manager_name,
  l.address,
  l.team as team_size,
  l.is_headquarters,
  -- Count of existing center managers for this location
  (SELECT COUNT(*) FROM public.profiles WHERE center_id = l.id AND role = 'center_manager') as manager_count
FROM public.locations l
LEFT JOIN public.segments s ON l.segment_code = s.code
ORDER BY l.segment_code, l.is_headquarters DESC, l.name;

GRANT SELECT ON public.location_manager_mapping TO authenticated;

-- Query to find location ID for a manager
-- Example usage: SELECT * FROM location_manager_mapping WHERE suggested_manager_name LIKE '%Patel%';

COMMENT ON VIEW public.location_manager_mapping IS 
  'Helper view to find location IDs and segment codes when creating center manager profiles';

-- ============================================================================
-- END OF DATA MIGRATION
-- ============================================================================

SELECT '✅ Data migration completed! Review the summary reports above.' as status;
