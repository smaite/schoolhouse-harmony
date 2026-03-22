
-- Announcements table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  author text NOT NULL DEFAULT 'Admin',
  category text NOT NULL DEFAULT 'Notice',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update announcements" ON public.announcements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete announcements" ON public.announcements FOR DELETE TO authenticated USING (true);

-- Seed announcements
INSERT INTO public.announcements (title, body, author, category, pinned) VALUES
  ('Annual Sports Day — March 28', 'All students are expected to participate. Report to the sports ground by 8:00 AM.', 'Admin', 'Event', true),
  ('Mid-term Exam Schedule Released', 'Mid-term examinations will be held from April 7–14. Timetable has been uploaded to the portal.', 'Academic Office', 'Academic', true),
  ('Parent-Teacher Meeting — Grade 10', 'PTM for Grade 10 parents is scheduled for March 30 at 10:00 AM in the auditorium.', 'Admin', 'Meeting', false),
  ('Library Book Return Reminder', 'All overdue library books must be returned by March 25 to avoid fines.', 'Librarian', 'Notice', false),
  ('New Computer Lab Now Open', 'The new computer lab on the 3rd floor is now open for student use during free periods.', 'IT Department', 'Facility', false);

-- Schedule periods table
CREATE TABLE public.schedule_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  subject text NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  room text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read schedule" ON public.schedule_periods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert schedule" ON public.schedule_periods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update schedule" ON public.schedule_periods FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete schedule" ON public.schedule_periods FOR DELETE TO authenticated USING (true);
