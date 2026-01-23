-- ============================================================================
-- ROLE-BASED ACCESS CONTROL FOR SEGMENT & CENTER MANAGEMENT
-- ============================================================================
-- This migration adds segment-wise and center-wise access control
-- Use Cases:
--   1. Center Manager - sees only their center's data
--   2. Segment Manager - sees all centers in their segment (e.g., all PSSL centers)
--   3. HQ Manager - sees all centers across all segments (All India)
--   4. Admin - full access to everything
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Segments (Organizations/Departments) Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.segments (
  id bigserial PRIMARY KEY,
  code text NOT NULL UNIQUE, -- e.g., 'PSSL', 'IIDT', 'PRAKHAR'
  name text NOT NULL, -- e.g., 'PSSL Division', 'IIDT Research'
  description text,
  headquarters_location_id bigint, -- Reference to headquarters location
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Update Profiles Table with Segment & Center Access
-- ============================================================================
-- Add new columns to profiles for segment and center association
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS segment_code text REFERENCES public.segments(code),
  ADD COLUMN IF NOT EXISTS center_id bigint REFERENCES public.locations(id),
  ADD COLUMN IF NOT EXISTS access_level text DEFAULT 'center' 
    CHECK (access_level IN ('center', 'segment', 'headquarters', 'all'));

-- Update the role check to include new roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('pending','user','center_manager','segment_manager','hq_manager','admin'));

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.segment_code IS 'Segment/organization this user belongs to (e.g., PSSL, IIDT)';
COMMENT ON COLUMN public.profiles.center_id IS 'Specific center/location this user manages (for center managers)';
COMMENT ON COLUMN public.profiles.access_level IS 'Data access scope: center (single location), segment (all locations in segment), headquarters (segment-wide), all (cross-segment)';

-- ============================================================================
-- STEP 3: Update Locations Table to Link with Segments
-- ============================================================================
-- Add segment reference to locations
ALTER TABLE public.locations 
  ADD COLUMN IF NOT EXISTS segment_code text REFERENCES public.segments(code),
  ADD COLUMN IF NOT EXISTS is_headquarters boolean DEFAULT false;

-- Update existing locations type to include 'headquarters'
ALTER TABLE public.locations DROP CONSTRAINT IF EXISTS locations_type_check;
ALTER TABLE public.locations 
  ADD CONSTRAINT locations_type_check 
  CHECK (type IN ('branch', 'headquarters', 'satellite', 'field_station'));

COMMENT ON COLUMN public.locations.segment_code IS 'Segment/organization this location belongs to';
COMMENT ON COLUMN public.locations.is_headquarters IS 'Whether this location is a headquarters for the segment';

-- ============================================================================
-- STEP 4: Update Other Tables to Include Segment & Location References
-- ============================================================================

-- Components table
ALTER TABLE public.components 
  ADD COLUMN IF NOT EXISTS segment_code text REFERENCES public.segments(code),
  ADD COLUMN IF NOT EXISTS location_id bigint REFERENCES public.locations(id);

COMMENT ON COLUMN public.components.segment_code IS 'Segment this component belongs to (derived from location)';
COMMENT ON COLUMN public.components.location_id IS 'Location ID instead of text location field';

-- Staff table
ALTER TABLE public.staff 
  ADD COLUMN IF NOT EXISTS segment_code text REFERENCES public.segments(code),
  ADD COLUMN IF NOT EXISTS location_id bigint REFERENCES public.locations(id);

COMMENT ON COLUMN public.staff.segment_code IS 'Segment this staff member belongs to';
COMMENT ON COLUMN public.staff.location_id IS 'Location ID instead of text location field';

-- Projects table
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS segment_code text REFERENCES public.segments(code);

COMMENT ON COLUMN public.projects.segment_code IS 'Primary segment associated with this project';

-- Training table
ALTER TABLE public.training 
  ADD COLUMN IF NOT EXISTS segment_code text REFERENCES public.segments(code),
  ADD COLUMN IF NOT EXISTS location_id bigint REFERENCES public.locations(id);

COMMENT ON COLUMN public.training.segment_code IS 'Segment offering this training';
COMMENT ON COLUMN public.training.location_id IS 'Location where training is conducted';

-- Bills table
ALTER TABLE public.bills 
  ADD COLUMN IF NOT EXISTS segment_code text REFERENCES public.segments(code),
  ADD COLUMN IF NOT EXISTS location_id bigint REFERENCES public.locations(id);

COMMENT ON COLUMN public.bills.segment_code IS 'Segment this bill belongs to';
COMMENT ON COLUMN public.bills.location_id IS 'Location associated with this bill';

-- ============================================================================
-- STEP 5: Create Helper Functions for Access Control
-- ============================================================================

-- Get user's segment
CREATE OR REPLACE FUNCTION public.current_user_segment()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT segment_code 
  FROM public.profiles 
  WHERE id = auth.uid();
$$;

-- Get user's center/location
CREATE OR REPLACE FUNCTION public.current_user_center()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT center_id 
  FROM public.profiles 
  WHERE id = auth.uid();
$$;

-- Get user's access level
CREATE OR REPLACE FUNCTION public.current_user_access_level()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT access_level 
  FROM public.profiles 
  WHERE id = auth.uid();
$$;

-- Enhanced role checking functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$ 
  SELECT public.current_role() = 'admin'; 
$$;

CREATE OR REPLACE FUNCTION public.is_hq_manager()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$ 
  SELECT public.current_role() IN ('hq_manager', 'admin'); 
$$;

CREATE OR REPLACE FUNCTION public.is_segment_manager()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$ 
  SELECT public.current_role() IN ('segment_manager', 'hq_manager', 'admin'); 
$$;

CREATE OR REPLACE FUNCTION public.is_center_manager()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$ 
  SELECT public.current_role() IN ('center_manager', 'segment_manager', 'hq_manager', 'admin'); 
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$ 
  SELECT public.current_role() IN ('center_manager', 'segment_manager', 'hq_manager', 'admin'); 
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$ 
  SELECT public.current_role() IN ('user', 'center_manager', 'segment_manager', 'hq_manager', 'admin'); 
$$;

-- Check if user can access a specific segment
CREATE OR REPLACE FUNCTION public.can_access_segment(target_segment_code text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    -- Admins and HQ managers can access all segments
    public.is_admin() OR 
    public.current_user_access_level() IN ('all', 'headquarters') OR
    -- Segment managers can access their own segment
    (public.is_segment_manager() AND public.current_user_segment() = target_segment_code) OR
    -- Center managers can access their segment
    (public.is_center_manager() AND public.current_user_segment() = target_segment_code);
$$;

-- Check if user can access a specific location/center
CREATE OR REPLACE FUNCTION public.can_access_location(target_location_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    -- Admins and HQ managers can access all locations
    public.is_admin() OR 
    public.current_user_access_level() IN ('all', 'headquarters') OR
    -- Segment managers can access all locations in their segment
    (public.is_segment_manager() AND 
     EXISTS (
       SELECT 1 FROM public.locations 
       WHERE id = target_location_id 
       AND segment_code = public.current_user_segment()
     )
    ) OR
    -- Center managers can only access their specific center
    (public.is_center_manager() AND public.current_user_center() = target_location_id);
$$;

-- ============================================================================
-- STEP 6: Update Row Level Security Policies
-- ============================================================================

-- Drop existing policies (we'll recreate them with segment awareness)
DROP POLICY IF EXISTS profiles_self_select ON public.profiles;
DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_manage ON public.profiles;

-- Segments policies
CREATE POLICY segments_select ON public.segments
  FOR SELECT USING (
    public.is_staff() AND (
      public.is_admin() OR
      public.current_user_access_level() IN ('all', 'headquarters') OR
      code = public.current_user_segment()
    )
  );

CREATE POLICY segments_insert ON public.segments
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY segments_update ON public.segments
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY segments_delete ON public.segments
  FOR DELETE USING (public.is_admin());

-- Profiles policies (updated)
CREATE POLICY profiles_self_select ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    public.is_manager() OR
    -- Managers can see profiles in their scope
    (public.is_segment_manager() AND segment_code = public.current_user_segment()) OR
    (public.is_center_manager() AND center_id = public.current_user_center())
  );

CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_admin_manage ON public.profiles
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Locations policies (updated)
DROP POLICY IF EXISTS locations_select ON public.locations;
DROP POLICY IF EXISTS locations_insert ON public.locations;
DROP POLICY IF EXISTS locations_update ON public.locations;
DROP POLICY IF EXISTS locations_delete ON public.locations;

CREATE POLICY locations_select ON public.locations
  FOR SELECT USING (
    public.is_staff() AND (
      public.is_admin() OR
      public.current_user_access_level() IN ('all', 'headquarters') OR
      segment_code = public.current_user_segment() OR
      (public.is_center_manager() AND id = public.current_user_center())
    )
  );

CREATE POLICY locations_insert ON public.locations
  FOR INSERT WITH CHECK (
    public.is_segment_manager() AND 
    (public.is_admin() OR 
     segment_code = public.current_user_segment() OR
     public.current_user_access_level() IN ('all', 'headquarters'))
  );

CREATE POLICY locations_update ON public.locations
  FOR UPDATE USING (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_location(id)
    )
  )
  WITH CHECK (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_location(id)
    )
  );

CREATE POLICY locations_delete ON public.locations
  FOR DELETE USING (public.is_admin());

-- Components policies (updated)
DROP POLICY IF EXISTS components_select ON public.components;
DROP POLICY IF EXISTS components_insert ON public.components;
DROP POLICY IF EXISTS components_update ON public.components;
DROP POLICY IF EXISTS components_delete ON public.components;

CREATE POLICY components_select ON public.components
  FOR SELECT USING (
    public.is_staff() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  );

CREATE POLICY components_insert ON public.components
  FOR INSERT WITH CHECK (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  );

CREATE POLICY components_update ON public.components
  FOR UPDATE USING (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  )
  WITH CHECK (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  );

CREATE POLICY components_delete ON public.components
  FOR DELETE USING (public.is_admin());

-- Staff policies (updated)
DROP POLICY IF EXISTS staff_select ON public.staff;
DROP POLICY IF EXISTS staff_insert ON public.staff;
DROP POLICY IF EXISTS staff_update ON public.staff;
DROP POLICY IF EXISTS staff_delete ON public.staff;

CREATE POLICY staff_select ON public.staff
  FOR SELECT USING (
    public.is_staff() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  );

CREATE POLICY staff_insert ON public.staff
  FOR INSERT WITH CHECK (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  );

CREATE POLICY staff_update ON public.staff
  FOR UPDATE USING (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  )
  WITH CHECK (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  );

CREATE POLICY staff_delete ON public.staff
  FOR DELETE USING (public.is_admin());

-- Projects policies (updated)
DROP POLICY IF EXISTS projects_select ON public.projects;
DROP POLICY IF EXISTS projects_insert ON public.projects;
DROP POLICY IF EXISTS projects_update ON public.projects;
DROP POLICY IF EXISTS projects_delete ON public.projects;

CREATE POLICY projects_select ON public.projects
  FOR SELECT USING (
    public.is_staff() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      segment_code IS NULL -- Projects without segment are visible to all
    )
  );

CREATE POLICY projects_insert ON public.projects
  FOR INSERT WITH CHECK (
    public.is_segment_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code)
    )
  );

CREATE POLICY projects_update ON public.projects
  FOR UPDATE USING (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code)
    )
  )
  WITH CHECK (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code)
    )
  );

CREATE POLICY projects_delete ON public.projects
  FOR DELETE USING (public.is_admin());

-- Training policies (updated)
DROP POLICY IF EXISTS training_select ON public.training;
DROP POLICY IF EXISTS training_insert ON public.training;
DROP POLICY IF EXISTS training_update ON public.training;
DROP POLICY IF EXISTS training_delete ON public.training;

CREATE POLICY training_select ON public.training
  FOR SELECT USING (
    public.is_staff() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  );

CREATE POLICY training_insert ON public.training
  FOR INSERT WITH CHECK (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  );

CREATE POLICY training_update ON public.training
  FOR UPDATE USING (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  )
  WITH CHECK (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  );

CREATE POLICY training_delete ON public.training
  FOR DELETE USING (public.is_admin());

-- Bills policies (updated)
DROP POLICY IF EXISTS bills_select ON public.bills;
DROP POLICY IF EXISTS bills_insert ON public.bills;
DROP POLICY IF EXISTS bills_update ON public.bills;
DROP POLICY IF EXISTS bills_delete ON public.bills;

CREATE POLICY bills_select ON public.bills
  FOR SELECT USING (
    public.is_staff() AND (
      public.is_admin() OR
      uploaded_by = auth.uid() OR
      (public.is_manager() AND (
        public.can_access_segment(segment_code) OR
        public.can_access_location(location_id)
      ))
    )
  );

CREATE POLICY bills_insert ON public.bills
  FOR INSERT WITH CHECK (
    public.is_staff() AND 
    uploaded_by = auth.uid() AND
    (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  );

CREATE POLICY bills_update ON public.bills
  FOR UPDATE USING (
    public.is_staff() AND (
      public.is_manager() AND (
        public.can_access_segment(segment_code) OR
        public.can_access_location(location_id)
      ) OR
      (uploaded_by = auth.uid() AND status <> 'approved')
    )
  )
  WITH CHECK (
    public.is_staff() AND (
      public.is_manager() AND (
        public.can_access_segment(segment_code) OR
        public.can_access_location(location_id)
      ) OR
      (uploaded_by = auth.uid() AND status <> 'approved')
    )
  );

CREATE POLICY bills_delete ON public.bills
  FOR DELETE USING (
    public.is_manager() AND (
      public.is_admin() OR
      public.can_access_segment(segment_code) OR
      public.can_access_location(location_id)
    )
  );

-- ============================================================================
-- STEP 7: Create Triggers for Automatic Segment Assignment
-- ============================================================================

-- Trigger to auto-populate segment_code in components from location
CREATE OR REPLACE FUNCTION public.sync_component_segment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_id IS NOT NULL THEN
    SELECT segment_code INTO NEW.segment_code
    FROM public.locations
    WHERE id = NEW.location_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_component_segment
  BEFORE INSERT OR UPDATE ON public.components
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_component_segment();

-- Trigger to auto-populate segment_code in staff from location
CREATE OR REPLACE FUNCTION public.sync_staff_segment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_id IS NOT NULL THEN
    SELECT segment_code INTO NEW.segment_code
    FROM public.locations
    WHERE id = NEW.location_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_staff_segment
  BEFORE INSERT OR UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_staff_segment();

-- Trigger to auto-populate segment_code in training from location
CREATE OR REPLACE FUNCTION public.sync_training_segment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_id IS NOT NULL THEN
    SELECT segment_code INTO NEW.segment_code
    FROM public.locations
    WHERE id = NEW.location_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_training_segment
  BEFORE INSERT OR UPDATE ON public.training
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_training_segment();

-- ============================================================================
-- STEP 8: Insert Sample Segments Data
-- ============================================================================
INSERT INTO public.segments (code, name, description, is_active) VALUES
  ('PSSL', 'PSSL Division', 'Prakhar Softwares Systems Limited - Main software and autonomous systems division', true),
  ('IIDT', 'IIDT Research', 'Indian Institute of Drone Technology - Research and development wing', true),
  ('PRAKHAR', 'Prakhar Aviation', 'Prakhar Aviation Services - Training and maintenance operations', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- STEP 9: Create View for Easy User Management
-- ============================================================================
CREATE OR REPLACE VIEW public.user_access_summary AS
SELECT 
  p.id,
  p.email,
  p.username,
  p.full_name,
  p.role,
  p.access_level,
  p.segment_code,
  s.name as segment_name,
  p.center_id,
  l.name as center_name,
  l.address as center_address,
  p.is_active,
  CASE 
    WHEN p.role = 'admin' THEN 'Full system access'
    WHEN p.role = 'hq_manager' THEN 'All segments and centers'
    WHEN p.role = 'segment_manager' THEN CONCAT('All centers in ', s.name)
    WHEN p.role = 'center_manager' THEN CONCAT('Only ', l.name)
    ELSE 'Basic user access'
  END as access_description
FROM public.profiles p
LEFT JOIN public.segments s ON p.segment_code = s.code
LEFT JOIN public.locations l ON p.center_id = l.id;

-- Grant access to the view
GRANT SELECT ON public.user_access_summary TO authenticated;

-- ============================================================================
-- STEP 10: Create Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_segment_code ON public.profiles(segment_code);
CREATE INDEX IF NOT EXISTS idx_profiles_center_id ON public.profiles(center_id);
CREATE INDEX IF NOT EXISTS idx_profiles_access_level ON public.profiles(access_level);
CREATE INDEX IF NOT EXISTS idx_locations_segment_code ON public.locations(segment_code);
CREATE INDEX IF NOT EXISTS idx_components_segment_code ON public.components(segment_code);
CREATE INDEX IF NOT EXISTS idx_components_location_id ON public.components(location_id);
CREATE INDEX IF NOT EXISTS idx_staff_segment_code ON public.staff(segment_code);
CREATE INDEX IF NOT EXISTS idx_staff_location_id ON public.staff(location_id);
CREATE INDEX IF NOT EXISTS idx_projects_segment_code ON public.projects(segment_code);
CREATE INDEX IF NOT EXISTS idx_training_segment_code ON public.training(segment_code);
CREATE INDEX IF NOT EXISTS idx_training_location_id ON public.training(location_id);
CREATE INDEX IF NOT EXISTS idx_bills_segment_code ON public.bills(segment_code);
CREATE INDEX IF NOT EXISTS idx_bills_location_id ON public.bills(location_id);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
