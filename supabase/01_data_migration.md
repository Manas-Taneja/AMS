## Data migration from SQLite `backend/ams.db` to Supabase Postgres

1) Export SQLite tables to CSV
```bash
cd /home/mnz/Desktop/AMS/backend
sqlite3 ams.db ".headers on" ".mode csv" "SELECT * FROM users;" > ../supabase/export_users.csv
sqlite3 ams.db ".headers on" ".mode csv" "SELECT * FROM bills;" > ../supabase/export_bills.csv
sqlite3 ams.db ".headers on" ".mode csv" "SELECT * FROM components;" > ../supabase/export_components.csv
sqlite3 ams.db ".headers on" ".mode csv" "SELECT * FROM locations;" > ../supabase/export_locations.csv
sqlite3 ams.db ".headers on" ".mode csv" "SELECT * FROM projects;" > ../supabase/export_projects.csv
sqlite3 ams.db ".headers on" ".mode csv" "SELECT * FROM staff;" > ../supabase/export_staff.csv
sqlite3 ams.db ".headers on" ".mode csv" "SELECT * FROM training;" > ../supabase/export_training.csv
```

2) Import into Supabase Postgres (replace placeholders)
```bash
PG_CONN="postgresql://postgres:<PASSWORD>@db.rovghvozevovgryowmbf.supabase.co:5432/postgres"

psql "$PG_CONN" -c "\\copy profiles(id,email,username,full_name,hashed_password,is_active,is_superuser,role,is_oauth_user,created_at,updated_at) from '/home/mnz/Desktop/AMS/supabase/export_users.csv' csv header"
psql "$PG_CONN" -c "\\copy bills from '/home/mnz/Desktop/AMS/supabase/export_bills.csv' csv header"
psql "$PG_CONN" -c "\\copy components from '/home/mnz/Desktop/AMS/supabase/export_components.csv' csv header"
psql "$PG_CONN" -c "\\copy locations from '/home/mnz/Desktop/AMS/supabase/export_locations.csv' csv header"
psql "$PG_CONN" -c "\\copy projects from '/home/mnz/Desktop/AMS/supabase/export_projects.csv' csv header"
psql "$PG_CONN" -c "\\copy staff from '/home/mnz/Desktop/AMS/supabase/export_staff.csv' csv header"
psql "$PG_CONN" -c "\\copy training from '/home/mnz/Desktop/AMS/supabase/export_training.csv' csv header"
```

3) Re-key auth users
- For each row in `profiles`, create a matching Supabase Auth user (email, password reset) via dashboard or `supabase auth admin createuser`.
- Ensure `app_metadata.role` is set to the same `role` value; JWT will carry it.

4) Files migration
- Upload bill files from `backend/uploads/` into Supabase Storage bucket `bill-files` preserving paths.
- Metadata rows in `bills.file_path` should match storage object paths.

5) Verification queries
```sql
select count(*) from bills;
select status, count(*) from bills group by 1;
select role, count(*) from profiles group by 1;
select count(*) from components where created_at is null;
```

