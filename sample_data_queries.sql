-- ============================================================
-- SAMPLE SQL QUERIES FOR CHART CLICK NAVIGATION FEATURE
-- ============================================================
-- These queries help you set up data that matches the chart categories
-- Run these if you want to populate your database with matching data

-- ============================================================
-- 1. ADD SUBCATEGORY COLUMN (if not exists)
-- ============================================================
-- This allows for better filtering when clicking on drone subcategories

ALTER TABLE components ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_components_category_subcategory ON components(category, subcategory);


-- ============================================================
-- 2. UPDATE EXISTING DRONE COMPONENTS WITH SUBCATEGORIES
-- ============================================================
-- Match components to drone project types based on keywords

-- Aerial Photography
UPDATE components 
SET subcategory = 'Aerial Photography' 
WHERE category = 'Drones' 
AND (
  name ILIKE '%photography%' OR 
  description ILIKE '%photography%' OR 
  description ILIKE '%aerial photo%' OR
  project ILIKE '%photography%'
);

-- Surveying & Mapping
UPDATE components 
SET subcategory = 'Surveying & Mapping' 
WHERE category = 'Drones' 
AND (
  name ILIKE '%survey%' OR 
  description ILIKE '%mapping%' OR 
  description ILIKE '%surveying%' OR
  project ILIKE '%survey%' OR
  project ILIKE '%mapping%'
);

-- Search & Rescue
UPDATE components 
SET subcategory = 'Search & Rescue' 
WHERE category = 'Drones' 
AND (
  name ILIKE '%rescue%' OR 
  description ILIKE '%search%' OR 
  description ILIKE '%emergency%' OR
  project ILIKE '%rescue%'
);

-- Agricultural Monitoring
UPDATE components 
SET subcategory = 'Agricultural Monitoring' 
WHERE category = 'Drones' 
AND (
  name ILIKE '%agricultural%' OR 
  description ILIKE '%farming%' OR 
  description ILIKE '%crop%' OR
  project ILIKE '%agricultural%'
);

-- Infrastructure Inspection
UPDATE components 
SET subcategory = 'Infrastructure Inspection' 
WHERE category = 'Drones' 
AND (
  name ILIKE '%inspection%' OR 
  description ILIKE '%infrastructure%' OR 
  description ILIKE '%bridge%' OR
  description ILIKE '%power line%' OR
  project ILIKE '%inspection%'
);

-- Security & Surveillance
UPDATE components 
SET subcategory = 'Security & Surveillance' 
WHERE category = 'Drones' 
AND (
  name ILIKE '%security%' OR 
  description ILIKE '%surveillance%' OR 
  description ILIKE '%monitoring%' OR
  project ILIKE '%security%' OR
  project ILIKE '%surveillance%'
);


-- ============================================================
-- 3. INSERT SAMPLE DRONE COMPONENTS (OPTIONAL)
-- ============================================================
-- Only run this if you want to add sample data for testing

INSERT INTO components (name, category, subcategory, status, location, project, owner, description, serial_number, purchase_date, warranty_expiry)
VALUES 
  ('DJI Phantom 4 Pro', 'Drones', 'Aerial Photography', 'Active', 'Headquarters', 'Real Estate Photography', 'PSSL', 'Professional drone for aerial photography', 'DJI-PP4-001', '2024-01-15', '2026-01-15'),
  ('DJI Matrice 300 RTK', 'Drones', 'Surveying & Mapping', 'Active', 'Branch Office A', 'Land Surveying Project', 'PSSL', 'Industrial drone for surveying and mapping', 'DJI-M300-002', '2024-02-20', '2026-02-20'),
  ('Autel EVO II Dual', 'Drones', 'Search & Rescue', 'Active', 'Headquarters', 'Emergency Response', 'PSSL', 'Thermal imaging drone for search and rescue', 'AUT-EVO2-003', '2024-03-10', '2026-03-10'),
  ('DJI Agras T30', 'Drones', 'Agricultural Monitoring', 'Active', 'Warehouse', 'Crop Monitoring', 'PSSL', 'Agricultural drone for crop monitoring', 'DJI-AGT30-004', '2024-04-05', '2026-04-05'),
  ('DJI Mavic 2 Enterprise', 'Drones', 'Infrastructure Inspection', 'Active', 'Branch Office B', 'Power Line Inspection', 'PSSL', 'Enterprise drone for infrastructure inspection', 'DJI-M2E-005', '2024-05-12', '2026-05-12'),
  ('Parrot Anafi USA', 'Drones', 'Security & Surveillance', 'Active', 'Headquarters', 'Perimeter Security', 'PSSL', 'Security drone for surveillance operations', 'PAR-USA-006', '2024-06-18', '2026-06-18')
ON CONFLICT DO NOTHING;


-- ============================================================
-- 4. UPDATE STAFF DEPARTMENTS TO MATCH CHART CATEGORIES
-- ============================================================
-- Ensure staff department names match the chart categories

-- Map existing departments to standard names
UPDATE staff 
SET department = 'Management'
WHERE department IN ('management', 'Manager', 'Executive', 'Leadership');

UPDATE staff 
SET department = 'Technical Staff'
WHERE department IN ('Engineering', 'IT', 'Software', 'Development', 'Tech');

UPDATE staff 
SET department = 'Administrative'
WHERE department IN ('Admin', 'HR', 'Finance', 'Administration');

UPDATE staff 
SET department = 'Sales & Marketing'
WHERE department IN ('Sales', 'Marketing', 'Business Development');

UPDATE staff 
SET department = 'Support Staff'
WHERE department IN ('Support', 'Helpdesk', 'Customer Service');

UPDATE staff 
SET department = 'Research & Development'
WHERE department IN ('R&D', 'Research', 'Innovation', 'Product Development');


-- ============================================================
-- 5. VIEW CURRENT DATA DISTRIBUTION
-- ============================================================
-- Use these queries to check how your data is distributed

-- Check drone subcategory distribution
SELECT 
  subcategory,
  COUNT(*) as count,
  status
FROM components
WHERE category = 'Drones'
GROUP BY subcategory, status
ORDER BY count DESC;

-- Check staff department distribution
SELECT 
  department,
  COUNT(*) as count,
  availability
FROM staff
GROUP BY department, availability
ORDER BY count DESC;

-- Check IT components distribution
SELECT 
  category,
  COUNT(*) as count
FROM components
WHERE category IN ('Servers', 'Network Equipment', 'Workstations', 'Storage Devices', 'Security Equipment', 'Peripherals')
GROUP BY category
ORDER BY count DESC;


-- ============================================================
-- 6. VERIFICATION QUERIES
-- ============================================================
-- Run these to verify the chart click navigation will work

-- Check if drones have subcategories assigned
SELECT 
  CASE 
    WHEN subcategory IS NULL THEN 'Missing Subcategory'
    ELSE 'Has Subcategory'
  END as status,
  COUNT(*) as count
FROM components
WHERE category = 'Drones'
GROUP BY status;

-- List all unique subcategories for drones
SELECT DISTINCT subcategory
FROM components
WHERE category = 'Drones' AND subcategory IS NOT NULL
ORDER BY subcategory;

-- Check staff department coverage
SELECT DISTINCT department
FROM staff
ORDER BY department;


-- ============================================================
-- 7. CLEANUP (IF NEEDED)
-- ============================================================
-- Run these if you want to reset subcategories

-- Clear all subcategories
-- UPDATE components SET subcategory = NULL WHERE category = 'Drones';

-- Drop the subcategory column (WARNING: This will delete all subcategory data)
-- ALTER TABLE components DROP COLUMN IF EXISTS subcategory;


-- ============================================================
-- NOTES:
-- ============================================================
-- 1. The chart categories are defined in: /src/data/sampleChartData.ts
-- 2. Current chart categories are:
--    Drones: Aerial Photography, Surveying & Mapping, Search & Rescue, 
--            Agricultural Monitoring, Infrastructure Inspection, Security & Surveillance
--    
--    Staff: Management, Technical Staff, Administrative, Sales & Marketing, 
--           Support Staff, Research & Development
--    
--    IT Components: Servers, Network Equipment, Workstations, Storage Devices, 
--                   Security Equipment, Peripherals
--
-- 3. You can modify the chart categories in sampleChartData.ts if you want 
--    different category names
--
-- 4. Make sure your database data matches the chart categories for best results
-- ============================================================
