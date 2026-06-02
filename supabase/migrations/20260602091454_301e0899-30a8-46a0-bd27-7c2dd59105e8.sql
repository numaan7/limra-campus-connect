-- Create role enum
create type public.app_role as enum ('admin', 'trainer', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    unique (user_id, role)
);

-- Grant data API access
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    avatar_url text,
    phone text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Create courses table
CREATE TABLE public.courses (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    duration text,
    price text,
    image_url text,
    category text,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create trainers table
CREATE TABLE public.trainers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    bio text,
    photo_url text,
    specialty text,
    is_active boolean default true,
    created_at timestamptz default now()
);

GRANT SELECT ON public.trainers TO anon;
GRANT SELECT ON public.trainers TO authenticated;
GRANT ALL ON public.trainers TO service_role;

ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active trainers" ON public.trainers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage trainers" ON public.trainers FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create students table
CREATE TABLE public.students (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    email text,
    phone text not null,
    course_id uuid references public.courses(id) on delete set null,
    trainer_id uuid references auth.users(id) on delete set null,
    status text default 'active',
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view assigned students" ON public.students FOR SELECT TO authenticated USING (
    trainer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Trainers can update assigned students" ON public.students FOR UPDATE TO authenticated USING (
    trainer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Trainers can add students" ON public.students FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'trainer'))
);

-- Create attendance table
CREATE TABLE public.attendance (
    id uuid primary key default gen_random_uuid(),
    student_id uuid references public.students(id) on delete cascade not null,
    date date not null,
    status text not null default 'present',
    notes text,
    trainer_id uuid references auth.users(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(student_id, date)
);

GRANT SELECT, INSERT, UPDATE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage attendance for assigned students" ON public.attendance FOR ALL TO authenticated USING (
    trainer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create announcements table
CREATE TABLE public.announcements (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    content text not null,
    is_active boolean default true,
    priority integer default 0,
    created_at timestamptz default now()
);

GRANT SELECT ON public.announcements TO anon;
GRANT SELECT ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create testimonials table
CREATE TABLE public.testimonials (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    text text not null,
    rating integer default 5,
    photo_url text,
    is_approved boolean default false,
    created_at timestamptz default now()
);

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT ON public.testimonials TO authenticated;
GRANT INSERT ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials FOR SELECT USING (is_approved = true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create applications/inquiries table
CREATE TABLE public.applications (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    email text,
    phone text not null,
    course_id uuid references public.courses(id) on delete set null,
    message text,
    status text default 'pending',
    created_at timestamptz default now()
);

GRANT INSERT ON public.applications TO anon;
GRANT INSERT ON public.applications TO authenticated;
GRANT SELECT ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit applications" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins and trainers can view applications" ON public.applications FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'trainer'))
);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
