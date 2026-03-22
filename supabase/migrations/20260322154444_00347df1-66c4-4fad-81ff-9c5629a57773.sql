
-- Subjects table
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Books table for each subject
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  author text,
  isbn text,
  publisher text,
  edition text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Class fee templates
CREATE TABLE public.class_fee_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  fee_type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- School settings key-value store
CREATE TABLE public.school_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_fee_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- Subjects policies
CREATE POLICY "auth read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert subjects" ON public.subjects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update subjects" ON public.subjects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete subjects" ON public.subjects FOR DELETE TO authenticated USING (true);

-- Books policies
CREATE POLICY "auth read books" ON public.books FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert books" ON public.books FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update books" ON public.books FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete books" ON public.books FOR DELETE TO authenticated USING (true);

-- Class fee templates policies
CREATE POLICY "auth read class_fee_templates" ON public.class_fee_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert class_fee_templates" ON public.class_fee_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update class_fee_templates" ON public.class_fee_templates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete class_fee_templates" ON public.class_fee_templates FOR DELETE TO authenticated USING (true);

-- School settings policies
CREATE POLICY "auth read school_settings" ON public.school_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth manage school_settings" ON public.school_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default school settings
INSERT INTO public.school_settings (key, value) VALUES
  ('school_name', 'Schoolers Academy'),
  ('principal', 'Dr. Angela White'),
  ('email', 'admin@schoolers.com'),
  ('phone', '+977-1-1234567'),
  ('address', 'Kathmandu, Nepal');
