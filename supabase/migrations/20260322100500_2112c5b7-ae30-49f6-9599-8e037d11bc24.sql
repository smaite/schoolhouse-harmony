
-- Teacher salaries
CREATE TABLE public.teacher_salaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  month text NOT NULL,
  year integer NOT NULL,
  base_salary numeric NOT NULL DEFAULT 0,
  bonus numeric NOT NULL DEFAULT 0,
  deductions numeric NOT NULL DEFAULT 0,
  net_salary numeric GENERATED ALWAYS AS (base_salary + bonus - deductions) STORED,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Paid','Partial')),
  paid_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.teacher_salaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read salaries" ON public.teacher_salaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert salaries" ON public.teacher_salaries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update salaries" ON public.teacher_salaries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete salaries" ON public.teacher_salaries FOR DELETE TO authenticated USING (true);

-- Buses
CREATE TABLE public.buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_number text NOT NULL UNIQUE,
  driver_name text NOT NULL,
  driver_phone text,
  capacity integer NOT NULL DEFAULT 40,
  route_name text NOT NULL,
  route_stops text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive','Maintenance')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read buses" ON public.buses FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert buses" ON public.buses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update buses" ON public.buses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete buses" ON public.buses FOR DELETE TO authenticated USING (true);

-- Bus student assignments
CREATE TABLE public.bus_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id uuid NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  pickup_stop text,
  dropoff_stop text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);
ALTER TABLE public.bus_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read bus_assignments" ON public.bus_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert bus_assignments" ON public.bus_assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update bus_assignments" ON public.bus_assignments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete bus_assignments" ON public.bus_assignments FOR DELETE TO authenticated USING (true);

-- Bus sign-ins (daily check-in/check-out)
CREATE TABLE public.bus_sign_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id uuid NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  sign_in_time timestamptz,
  sign_out_time timestamptz,
  status text NOT NULL DEFAULT 'Absent' CHECK (status IN ('Signed In','Signed Out','Absent')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(bus_id, student_id, date)
);
ALTER TABLE public.bus_sign_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read bus_sign_ins" ON public.bus_sign_ins FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert bus_sign_ins" ON public.bus_sign_ins FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update bus_sign_ins" ON public.bus_sign_ins FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete bus_sign_ins" ON public.bus_sign_ins FOR DELETE TO authenticated USING (true);

-- Seed some buses
INSERT INTO public.buses (bus_number, driver_name, driver_phone, capacity, route_name, route_stops) VALUES
  ('BUS-001', 'John Miller', '+1 555-3001', 40, 'North Route', ARRAY['Main St', 'Oak Ave', 'Pine Rd', 'School']),
  ('BUS-002', 'Sarah Connor', '+1 555-3002', 35, 'South Route', ARRAY['Elm St', 'Maple Dr', 'Cedar Ln', 'School']),
  ('BUS-003', 'Mike Chen', '+1 555-3003', 45, 'East Route', ARRAY['River Rd', 'Lake Ave', 'Hill St', 'School']);

-- Seed some salary records
INSERT INTO public.teacher_salaries (teacher_id, month, year, base_salary, bonus, deductions, status, paid_date) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'March', 2026, 4500, 200, 150, 'Paid', '2026-03-15'),
  ('a1000000-0000-0000-0000-000000000002', 'March', 2026, 5000, 300, 200, 'Paid', '2026-03-15'),
  ('a1000000-0000-0000-0000-000000000003', 'March', 2026, 5500, 0, 180, 'Pending', NULL),
  ('a1000000-0000-0000-0000-000000000004', 'March', 2026, 4800, 150, 160, 'Pending', NULL),
  ('a1000000-0000-0000-0000-000000000005', 'March', 2026, 4200, 0, 140, 'Paid', '2026-03-15'),
  ('a1000000-0000-0000-0000-000000000006', 'March', 2026, 4000, 100, 130, 'Pending', NULL);
