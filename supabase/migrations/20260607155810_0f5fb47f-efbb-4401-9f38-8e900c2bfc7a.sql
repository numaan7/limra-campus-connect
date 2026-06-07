
-- 1) handle_new_user: pin search_path and lock down EXECUTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
    RETURN new;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2) Applications: remove public INSERT (server route now handles submissions via service role)
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.applications;

-- 3) Application courses: remove public INSERT (server route now handles submissions)
DROP POLICY IF EXISTS "Anyone can add application_courses" ON public.application_courses;

-- 4) Attendance: replace open ALL policy with role-gated policies + explicit WITH CHECK
DROP POLICY IF EXISTS "Trainers can manage attendance for assigned students" ON public.attendance;

CREATE POLICY "Trainers/admins view attendance"
  ON public.attendance
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'trainer') AND trainer_id = auth.uid())
  );

CREATE POLICY "Trainers/admins insert attendance"
  ON public.attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'trainer') AND trainer_id = auth.uid())
  );

CREATE POLICY "Trainers/admins update attendance"
  ON public.attendance
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'trainer') AND trainer_id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'trainer') AND trainer_id = auth.uid())
  );

CREATE POLICY "Trainers/admins delete attendance"
  ON public.attendance
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'trainer') AND trainer_id = auth.uid())
  );

-- 5) student_courses: restrict trainer assignments to their own students; admins keep full control
DROP POLICY IF EXISTS "Trainers/admins manage student_courses" ON public.student_courses;

CREATE POLICY "Admins manage student_courses"
  ON public.student_courses
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Trainers view own student_courses"
  ON public.student_courses
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'trainer')
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_courses.student_id AND s.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers manage own student_courses"
  ON public.student_courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'trainer')
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_courses.student_id AND s.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers delete own student_courses"
  ON public.student_courses
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'trainer')
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_courses.student_id AND s.trainer_id = auth.uid()
    )
  );
