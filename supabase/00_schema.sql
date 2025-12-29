-- Supabase schema for migrating AMS FastAPI backend (CRUD-first)
-- Assumes roles are stored in auth.jwt() ->> 'role' and mirrored in profiles.role

-- Helpers
create or replace function public.current_role()
returns text
language sql
security definer
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'role', ''),
    (select role from public.profiles where id = auth.uid())
  );
$$;

-- Profiles table (mirror of backend users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  username text not null unique,
  full_name text not null,
  role text not null default 'pending' check (role in ('pending','user','manager','admin')),
  is_active boolean not null default true,
  is_superuser boolean not null default false,
  is_oauth_user boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.profiles enable row level security;

-- Profiles policies
create policy profiles_self_select on public.profiles
  for select using (auth.uid() = id or public.current_role() in ('manager','admin'));

create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

create policy profiles_admin_manage on public.profiles
  for all using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Common check helpers
create or replace function public.is_staff()
returns boolean
language sql
as $$ select public.current_role() in ('user','manager','admin'); $$;

create or replace function public.is_manager()
returns boolean
language sql
as $$ select public.current_role() in ('manager','admin'); $$;

create or replace function public.is_admin()
returns boolean
language sql
as $$ select public.current_role() = 'admin'; $$;

-- Bills
create table if not exists public.bills (
  id bigserial primary key,
  title text not null,
  description text,
  amount double precision not null,
  currency text not null default 'USD',
  bill_date timestamptz not null,
  due_date timestamptz,
  vendor text not null,
  category text not null,
  status text not null default 'pending',
  file_path text not null,
  file_name text not null,
  file_size bigint not null,
  file_type text not null,
  uploaded_by uuid not null references public.profiles(id),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table public.bills enable row level security;

create policy bills_select on public.bills
  for select using (
    public.is_staff()
    and (
      public.is_manager()
      or uploaded_by = auth.uid()
      or status = 'approved'
    )
  );

create policy bills_insert on public.bills
  for insert with check (public.is_staff() and uploaded_by = auth.uid());

create policy bills_update on public.bills
  for update using (
    public.is_staff()
    and (public.is_manager() or (uploaded_by = auth.uid() and status <> 'approved'))
  )
  with check (
    public.is_staff()
    and (public.is_manager() or (uploaded_by = auth.uid() and status <> 'approved'))
  );

create policy bills_delete on public.bills
  for delete using (public.is_manager());

-- Components
create table if not exists public.components (
  id bigserial primary key,
  name text not null,
  category text not null,
  status text not null,
  location text not null,
  project text not null,
  owner text not null,
  description text,
  serial_number text,
  purchase_date timestamptz,
  warranty_expiry timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table public.components enable row level security;

create policy components_select on public.components
  for select using (public.is_staff());

create policy components_insert on public.components
  for insert with check (public.is_manager());

create policy components_update on public.components
  for update using (public.is_manager()) with check (public.is_manager());

create policy components_delete on public.components
  for delete using (public.is_admin());

-- Locations
create table if not exists public.locations (
  id bigserial primary key,
  name text not null,
  address text not null,
  team integer not null,
  manager text not null,
  project text not null,
  status text not null default 'active',
  type text not null default 'branch',
  point_of_contact text not null default '',
  asset_count integer not null default 0,
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table public.locations enable row level security;

create policy locations_select on public.locations
  for select using (public.is_staff());

create policy locations_insert on public.locations
  for insert with check (public.is_manager());

create policy locations_update on public.locations
  for update using (public.is_manager()) with check (public.is_manager());

create policy locations_delete on public.locations
  for delete using (public.is_admin());

-- Projects
create table if not exists public.projects (
  id bigserial primary key,
  thumbnail_url text,
  name text not null,
  status text not null,
  progress integer not null,
  category text,
  funding_type text,
  funding_body text,
  funding_received integer,
  report_links text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table public.projects enable row level security;

create policy projects_select on public.projects
  for select using (public.is_staff());

create policy projects_insert on public.projects
  for insert with check (public.is_admin());

create policy projects_update on public.projects
  for update using (public.is_manager()) with check (public.is_manager());

create policy projects_delete on public.projects
  for delete using (public.is_admin());

-- Staff
create table if not exists public.staff (
  id bigserial primary key,
  name text not null,
  email text not null,
  phone text,
  department text not null,
  status text not null default 'active',
  designation text not null,
  skills text not null,
  location text not null,
  availability text not null,
  project text not null,
  company text not null,
  reports_to text,
  experience text,
  join_date text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table public.staff enable row level security;

create policy staff_select on public.staff
  for select using (public.is_staff());

create policy staff_insert on public.staff
  for insert with check (public.is_admin());

create policy staff_update on public.staff
  for update using (public.is_manager()) with check (public.is_manager());

create policy staff_delete on public.staff
  for delete using (public.is_admin());

-- Training
create table if not exists public.training (
  id bigserial primary key,
  name text not null,
  institution text not null,
  duration text not null,
  level text not null,
  description text,
  full_description text,
  prerequisites text,
  learning_objectives text,
  course_outline text,
  instructor_name text,
  instructor_credentials text,
  instructor_experience text,
  instructor_image text,
  schedule_start_date timestamptz,
  schedule_end_date timestamptz,
  schedule_format text,
  schedule_location text,
  pricing_amount numeric(10,2),
  pricing_currency text default 'USD',
  pricing_includes text,
  enrolled_count integer default 0,
  completed_count integer default 0,
  max_capacity integer,
  status text default 'active',
  category text,
  tags text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id)
);
alter table public.training enable row level security;

create policy training_select on public.training
  for select using (public.is_staff());

create policy training_insert on public.training
  for insert with check (public.is_manager());

create policy training_update on public.training
  for update using (public.is_manager()) with check (public.is_manager());

create policy training_delete on public.training
  for delete using (public.is_admin());

-- Storage bucket for bill files
insert into storage.buckets (id, name, public)
  values ('bill-files','bill-files', false)
  on conflict (id) do nothing;

-- Storage policies: staff and above can read/upload
create policy storage_bills_read on storage.objects
  for select using (bucket_id = 'bill-files' and public.is_staff());

create policy storage_bills_insert on storage.objects
  for insert with check (bucket_id = 'bill-files' and public.is_staff());

create policy storage_bills_delete on storage.objects
  for delete using (
    bucket_id = 'bill-files' and public.is_manager()
  );

-- Function to keep updated_at current
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_touch_components before update on public.components
for each row execute procedure public.touch_updated_at();

create trigger trg_touch_locations before update on public.locations
for each row execute procedure public.touch_updated_at();

create trigger trg_touch_projects before update on public.projects
for each row execute procedure public.touch_updated_at();

create trigger trg_touch_staff before update on public.staff
for each row execute procedure public.touch_updated_at();

create trigger trg_touch_training before update on public.training
for each row execute procedure public.touch_updated_at();

create trigger trg_touch_bills before update on public.bills
for each row execute procedure public.touch_updated_at();

