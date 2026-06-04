
-- Junction: students <-> courses
CREATE TABLE public.student_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_courses TO authenticated;
GRANT ALL ON public.student_courses TO service_role;
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trainers/admins manage student_courses" ON public.student_courses
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','trainer')))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','trainer')));

-- Junction: applications <-> courses
CREATE TABLE public.application_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, course_id)
);
GRANT SELECT, INSERT ON public.application_courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_courses TO authenticated;
GRANT ALL ON public.application_courses TO service_role;
ALTER TABLE public.application_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can add application_courses" ON public.application_courses
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Admins/trainers view application_courses" ON public.application_courses
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','trainer')));
CREATE POLICY "Admins manage application_courses" ON public.application_courses
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Missing DELETE policies for CRUD
CREATE POLICY "Trainers/admins can delete students" ON public.students
  FOR DELETE TO authenticated
  USING (trainer_id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update applications" ON public.applications
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete applications" ON public.applications
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
