# Backend Improvement Suggestions

As a senior developer reviewing the AMS system, I recommend the following backend changes to align with Enterprise Asset Management best practices.

## 1. Implement Asset Transfer Endpoints (FastAPI)

To support the new "Asset Transfer" feature when not using direct Supabase calls, implement these endpoints in your FastAPI backend:

### `POST /api/components/{id}/transfer`
**Logic:**
1.  Verify user has `staff` role (or `manager` depending on policy).
2.  Get current component location -> `v_from_location`.
3.  Insert record into `component_transfers` table.
4.  Update `components` table:
    *   Set `is_transferred = true`
    *   Set `current_location = body.to_location`
    *   Set `transferred_to = body.to_location`
    *   Set `transfer_date = now()`
    *   Set `expected_return_date = body.expected_return_date`

### `POST /api/components/{id}/return`
**Logic:**
1.  Verify user permissions.
2.  Get `home_location` from component.
3.  Update active `component_transfers` record: set `status = 'completed'`, `actual_return_date = now()`.
4.  Update `components` table:
    *   Set `is_transferred = false`
    *   Set `current_location = home_location`
    *   Clear `transferred_to`, `transfer_date`, `expected_return_date`.

## 2. New Feature: Maintenance Logs

The current system has a "Schedule Maintenance" button but no backend support.

**Schema Recommendation:**
```sql
CREATE TABLE maintenance_logs (
  id bigserial PRIMARY KEY,
  component_id bigint REFERENCES components(id),
  maintenance_type text NOT NULL, -- 'preventive', 'corrective', 'inspection'
  scheduled_date date NOT NULL,
  completed_date date,
  performed_by uuid REFERENCES profiles(id),
  cost numeric(10,2),
  description text,
  status text DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed'
  created_at timestamptz DEFAULT now()
);
```

**API Endpoints:**
*   `POST /api/maintenance`: Schedule new maintenance.
*   `PATCH /api/maintenance/{id}`: Update status (e.g., mark complete).
*   `GET /api/components/{id}/maintenance`: Get history for an asset.

## 3. New Feature: Asset Assignments (Staff Checkout)

Distinct from moving an asset to a *Location*, you need to track assets issued to specific *Staff*.

**Schema Recommendation:**
```sql
CREATE TABLE asset_assignments (
  id bigserial PRIMARY KEY,
  component_id bigint REFERENCES components(id),
  staff_id bigint REFERENCES staff(id), -- Or profiles(id) if staff are users
  assigned_date timestamptz DEFAULT now(),
  return_date timestamptz,
  status text DEFAULT 'active', -- 'active', 'returned'
  condition_on_checkout text,
  condition_on_return text
);
```

**Business Logic:**
*   When assigned, component status changes to `in_use` or `assigned`.
*   Prevent transfer of assigned assets without return first.

## 4. New Feature: Issue/Incident Reporting

Allow users to report broken items.

**Schema Recommendation:**
```sql
CREATE TABLE issues (
  id bigserial PRIMARY KEY,
  component_id bigint REFERENCES components(id),
  reported_by uuid REFERENCES profiles(id),
  severity text, -- 'low', 'medium', 'critical'
  description text,
  status text DEFAULT 'open', -- 'open', 'investigating', 'resolved'
  resolution_notes text,
  created_at timestamptz DEFAULT now()
);
```

## 5. Data Integrity & Normalization

*   **Locations Table:** The `components` table currently stores `location` as a text string. It should ideally be a Foreign Key to the `locations` table (`location_id`) to ensure consistency and allow renaming locations easily.
*   **Audit Logging:** Implement a generic `audit_logs` table using triggers to track *all* changes to sensitive tables (`bills`, `components`, `users`), capturing the `old_data` and `new_data` JSONB blobs.
