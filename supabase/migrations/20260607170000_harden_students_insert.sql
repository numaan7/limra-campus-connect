-- Harden students INSERT: trainers can only assign students to themselves; admins can assign anyone.
DROP POLICY IF EXISTS "Trainers can add students" ON public.students;

CREATE POLICY "Admins can insert any student"
  ON public.students FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Trainers can insert their own students"
  ON public.students FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'trainer') AND trainer_id = auth.uid());
