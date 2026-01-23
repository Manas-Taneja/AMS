-- Asset Transfer Feature
-- Adds ability to track when assets are borrowed/transferred between centers

-- Add transfer tracking columns to components table
ALTER TABLE public.components
  ADD COLUMN IF NOT EXISTS home_location text,
  ADD COLUMN IF NOT EXISTS current_location text,
  ADD COLUMN IF NOT EXISTS is_transferred boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS transferred_to text,
  ADD COLUMN IF NOT EXISTS transfer_date timestamptz,
  ADD COLUMN IF NOT EXISTS expected_return_date timestamptz,
  ADD COLUMN IF NOT EXISTS transfer_notes text,
  ADD COLUMN IF NOT EXISTS transfer_approved_by uuid REFERENCES public.profiles(id);

-- Migrate existing location data to home_location and current_location
UPDATE public.components
SET 
  home_location = location,
  current_location = location
WHERE home_location IS NULL;

-- Create a transfer history table for audit trail
CREATE TABLE IF NOT EXISTS public.component_transfers (
  id bigserial PRIMARY KEY,
  component_id bigint NOT NULL REFERENCES public.components(id) ON DELETE CASCADE,
  from_location text NOT NULL,
  to_location text NOT NULL,
  transfer_date timestamptz NOT NULL DEFAULT now(),
  expected_return_date timestamptz,
  actual_return_date timestamptz,
  transfer_reason text,
  notes text,
  initiated_by uuid NOT NULL REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

ALTER TABLE public.component_transfers ENABLE ROW LEVEL SECURITY;

-- Policies for component_transfers
CREATE POLICY component_transfers_select ON public.component_transfers
  FOR SELECT USING (public.is_staff());

CREATE POLICY component_transfers_insert ON public.component_transfers
  FOR INSERT WITH CHECK (public.is_staff() AND initiated_by = auth.uid());

CREATE POLICY component_transfers_update ON public.component_transfers
  FOR UPDATE USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY component_transfers_delete ON public.component_transfers
  FOR DELETE USING (public.is_admin());

-- Trigger for component_transfers updated_at
CREATE TRIGGER trg_touch_component_transfers 
  BEFORE UPDATE ON public.component_transfers
  FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();

-- Function to initiate a transfer
CREATE OR REPLACE FUNCTION public.initiate_component_transfer(
  p_component_id bigint,
  p_to_location text,
  p_expected_return_date timestamptz DEFAULT NULL,
  p_transfer_reason text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_from_location text;
  v_transfer_id bigint;
BEGIN
  -- Get current location
  SELECT current_location INTO v_from_location
  FROM public.components
  WHERE id = p_component_id;

  -- Insert transfer record
  INSERT INTO public.component_transfers (
    component_id,
    from_location,
    to_location,
    expected_return_date,
    transfer_reason,
    notes,
    initiated_by,
    status
  ) VALUES (
    p_component_id,
    v_from_location,
    p_to_location,
    p_expected_return_date,
    p_transfer_reason,
    p_notes,
    auth.uid(),
    'active'
  ) RETURNING id INTO v_transfer_id;

  -- Update component
  UPDATE public.components
  SET
    is_transferred = true,
    transferred_to = p_to_location,
    current_location = p_to_location,
    transfer_date = now(),
    expected_return_date = p_expected_return_date,
    transfer_notes = p_notes
  WHERE id = p_component_id;

  RETURN v_transfer_id;
END;
$$;

-- Function to return a component to home location
CREATE OR REPLACE FUNCTION public.return_component_from_transfer(
  p_component_id bigint,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_home_location text;
BEGIN
  -- Get home location
  SELECT home_location INTO v_home_location
  FROM public.components
  WHERE id = p_component_id;

  -- Update active transfer record
  UPDATE public.component_transfers
  SET
    actual_return_date = now(),
    status = 'completed',
    notes = COALESCE(p_notes, notes)
  WHERE component_id = p_component_id
    AND status = 'active';

  -- Update component
  UPDATE public.components
  SET
    is_transferred = false,
    transferred_to = NULL,
    current_location = v_home_location,
    transfer_date = NULL,
    expected_return_date = NULL,
    transfer_notes = NULL
  WHERE id = p_component_id;
END;
$$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_components_is_transferred ON public.components(is_transferred);
CREATE INDEX IF NOT EXISTS idx_components_current_location ON public.components(current_location);
CREATE INDEX IF NOT EXISTS idx_component_transfers_component_id ON public.component_transfers(component_id);
CREATE INDEX IF NOT EXISTS idx_component_transfers_status ON public.component_transfers(status);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.initiate_component_transfer TO authenticated;
GRANT EXECUTE ON FUNCTION public.return_component_from_transfer TO authenticated;

COMMENT ON COLUMN public.components.home_location IS 'Original/home location of the asset';
COMMENT ON COLUMN public.components.current_location IS 'Current physical location of the asset';
COMMENT ON COLUMN public.components.is_transferred IS 'Whether the asset is currently transferred to another location';
COMMENT ON COLUMN public.components.transferred_to IS 'Location the asset is transferred to';
COMMENT ON TABLE public.component_transfers IS 'Audit trail of all asset transfers between locations';
