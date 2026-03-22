
-- Teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department TEXT NOT NULL DEFAULT 'General',
  subjects TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Active',
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  qualification TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  room TEXT,
  schedule TEXT,
  grade_level INT,
  num_subjects INT NOT NULL DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Present',
  marked_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Grades table
CREATE TABLE public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  term TEXT NOT NULL DEFAULT 'Term 1',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fees table
CREATE TABLE public.fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL DEFAULT 'Tuition',
  amount NUMERIC(10,2) NOT NULL,
  paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Unpaid',
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies: public read for all tables (no auth yet)
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on teachers" ON public.teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on teachers" ON public.teachers FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on classes" ON public.classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on classes" ON public.classes FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert on students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on students" ON public.students FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow public insert on attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on attendance" ON public.attendance FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on grades" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Allow public insert on grades" ON public.grades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on grades" ON public.grades FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on fees" ON public.fees FOR SELECT USING (true);
CREATE POLICY "Allow public insert on fees" ON public.fees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on fees" ON public.fees FOR UPDATE USING (true) WITH CHECK (true);
