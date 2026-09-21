-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  role text check (role in ('admin', 'teacher')) not null default 'teacher',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- 2. Students Table
create table public.students (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  parent_email text not null,
  timezone text default 'UTC',
  access_token uuid default uuid_generate_v4() not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on students
alter table public.students enable row level security;

-- 3. Teachers Table (additional info beyond profile)
create table public.teachers (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null unique,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on teachers
alter table public.teachers enable row level security;

-- 4. Classes (Assignments)
create table public.classes (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  teacher_id uuid references public.teachers(id) on delete cascade not null,
  student_fee_per_session numeric(10, 2) not null default 0.00,
  teacher_payout_per_session numeric(10, 2) not null default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, teacher_id)
);

-- Enable RLS on classes
alter table public.classes enable row level security;

-- 5. Sessions
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  session_date date not null,
  status text check (status in ('attended', 'missed', 'canceled')) not null default 'attended',
  surah text,
  ayahs text,
  memorization_score integer check (memorization_score >= 0 and memorization_score <= 100),
  tajweed_remarks text,
  homework text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on sessions
alter table public.sessions enable row level security;

-- 6. Schedules
create table public.schedules (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  day_of_week integer check (day_of_week >= 0 and day_of_week <= 6) not null, -- 0 = Sunday
  time_utc time not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on schedules
alter table public.schedules enable row level security;


-- ==============================================================================
-- RLS POLICIES
-- ==============================================================================

-- Profiles: Admins can do everything. Users can read their own profile.
create policy "Admins can do everything on profiles" on public.profiles
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Students: Admins can do everything. Teachers can read their assigned students.
create policy "Admins can do everything on students" on public.students
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Teachers can read assigned students" on public.students
  for select using (
    exists (
      select 1 from public.classes c
      join public.teachers t on c.teacher_id = t.id
      where c.student_id = public.students.id and t.profile_id = auth.uid()
    )
  );

-- Teachers: Admins can do everything. Anyone authenticated can read teachers.
create policy "Admins can do everything on teachers" on public.teachers
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can read teachers" on public.teachers
  for select using (auth.role() = 'authenticated');

-- Classes: Admins can do everything. Teachers can read their assigned classes.
create policy "Admins can do everything on classes" on public.classes
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Teachers can read assigned classes" on public.classes
  for select using (
    exists (
      select 1 from public.teachers t
      where t.id = public.classes.teacher_id and t.profile_id = auth.uid()
    )
  );

-- Sessions: Admins can do everything. Teachers can manage sessions for their classes.
create policy "Admins can do everything on sessions" on public.sessions
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Teachers can read their class sessions" on public.sessions
  for select using (
    exists (
      select 1 from public.classes c
      join public.teachers t on c.teacher_id = t.id
      where c.id = public.sessions.class_id and t.profile_id = auth.uid()
    )
  );

create policy "Teachers can insert sessions for their classes" on public.sessions
  for insert with check (
    exists (
      select 1 from public.classes c
      join public.teachers t on c.teacher_id = t.id
      where c.id = class_id and t.profile_id = auth.uid()
    )
  );

create policy "Teachers can update sessions for their classes" on public.sessions
  for update using (
    exists (
      select 1 from public.classes c
      join public.teachers t on c.teacher_id = t.id
      where c.id = class_id and t.profile_id = auth.uid()
    )
  );

-- Schedules: Admins can do everything. Teachers can read schedules for their classes.
create policy "Admins can do everything on schedules" on public.schedules
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Teachers can read their class schedules" on public.schedules
  for select using (
    exists (
      select 1 from public.classes c
      join public.teachers t on c.teacher_id = t.id
      where c.id = public.schedules.class_id and t.profile_id = auth.uid()
    )
  );

-- ==============================================================================
-- TRIGGERS
-- ==============================================================================
-- Function to automatically create a profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  -- If role is specified in metadata, update it (useful for initial admin setup)
  if new.raw_user_meta_data->>'role' is not null then
    update public.profiles set role = new.raw_user_meta_data->>'role' where id = new.id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to automatically create a teacher entry when a teacher profile is created
create or replace function public.handle_new_teacher()
returns trigger as $$
begin
  if new.role = 'teacher' then
    insert into public.teachers (profile_id) values (new.id)
    on conflict (profile_id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_teacher_created
  after insert or update of role on public.profiles
  for each row execute procedure public.handle_new_teacher();
