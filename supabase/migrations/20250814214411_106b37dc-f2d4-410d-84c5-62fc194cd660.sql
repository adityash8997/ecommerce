-- Create semesters table
CREATE TABLE public.semesters (
  id SERIAL PRIMARY KEY,
  semester_number INTEGER UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create semester_books table
CREATE TABLE public.semester_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id INTEGER NOT NULL REFERENCES public.semesters(id),
  book_name TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT,
  edition TEXT,
  base_price NUMERIC NOT NULL DEFAULT 500,
  image_url TEXT,
  subject_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create semester_combos table
CREATE TABLE public.semester_combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id INTEGER NOT NULL REFERENCES public.semesters(id),
  combo_name TEXT NOT NULL,
  combo_price NUMERIC NOT NULL,
  discount_percentage NUMERIC DEFAULT 15,
  description TEXT,
  book_ids UUID[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_combos ENABLE ROW LEVEL SECURITY;

-- Create policies for semesters (public read)
CREATE POLICY "Anyone can view semesters" 
ON public.semesters 
FOR SELECT 
USING (true);

-- Create policies for semester_books (public read)
CREATE POLICY "Anyone can view semester books" 
ON public.semester_books 
FOR SELECT 
USING (true);

-- Create policies for semester_combos (public read)
CREATE POLICY "Anyone can view semester combos" 
ON public.semester_combos 
FOR SELECT 
USING (true);

-- Insert semester data
INSERT INTO public.semesters (semester_number, description) VALUES
(1, '1st Semester'),
(2, '2nd Semester'),
(3, '3rd Semester'),
(4, '4th Semester'),
(5, '5th Semester'),
(6, '6th Semester'),
(7, '7th Semester'),
(8, '8th Semester');

-- Insert 1st semester books
INSERT INTO public.semester_books (semester_id, book_name, author, publisher, edition, base_price, subject_category) VALUES
(1, 'Advanced Engineering Mathematics', 'Kreyszig E.', 'Wiley', '9th ed', 850, 'Mathematics'),
(1, 'Differential Calculus', 'Shanti Narayan & P.K. Mittal', 'S. Chand', '', 450, 'Mathematics'),
(1, 'Programming in C', 'Pradip Dey & Manas Ghosh', 'OXFORD', '', 550, 'Programming'),
(1, 'Engineering Chemistry', 'Jain & Jain', '', '16th ed', 680, 'Chemistry'),
(1, 'Basic Electronics', 'D. Chattopadhyay & P.C. Rakshit', '', '', 720, 'Electronics'),
(1, 'Technical Communication Principles & Practices', '', '', '', 390, 'Professional Communication'),
(1, 'Environmental Chemistry', 'A.K. De', '', '7th ed', 480, 'Environmental Science');

-- Insert 2nd semester books  
INSERT INTO public.semester_books (semester_id, book_name, author, publisher, edition, base_price, subject_category) VALUES
(2, 'Advanced Engineering Mathematics', 'Kreyszig E.', 'Wiley', '9th ed', 850, 'Mathematics'),
(2, 'Differential Calculus', 'Shanti Narayan & P.K. Mittal', 'S. Chand', '', 450, 'Mathematics'),
(2, 'OOP with C++', 'E. Balaguruswamy', '', '', 650, 'Programming'),
(2, 'Engineering Physics', 'B.K. Pandey & S. Chaturvedi', '', '', 750, 'Physics'),
(2, 'Engineering Mechanics', 'S. Timoshenko, D.H. Young & J.V. Rao', '', '', 820, 'Mechanics'),
(2, 'Basic Electrical Engineering', 'D.C. Kulshreshtha', 'Tata McGraw', '', 690, 'Electrical Engineering');

-- Create combos for 1st semester
INSERT INTO public.semester_combos (semester_id, combo_name, combo_price, discount_percentage, description, book_ids) 
SELECT 
  1,
  'Complete 1st Semester Book Set',
  ROUND((SUM(base_price) * 0.85)::numeric, 0),
  15,
  'All essential books for 1st semester with 15% discount',
  array_agg(id)
FROM public.semester_books 
WHERE semester_id = 1;

-- Create combos for 2nd semester
INSERT INTO public.semester_combos (semester_id, combo_name, combo_price, discount_percentage, description, book_ids)
SELECT 
  2,
  'Complete 2nd Semester Book Set', 
  ROUND((SUM(base_price) * 0.85)::numeric, 0),
  15,
  'All essential books for 2nd semester with 15% discount',
  array_agg(id)
FROM public.semester_books 
WHERE semester_id = 2;

-- Create triggers for updated_at
CREATE TRIGGER update_semesters_updated_at
  BEFORE UPDATE ON public.semesters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_semester_books_updated_at
  BEFORE UPDATE ON public.semester_books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_semester_combos_updated_at
  BEFORE UPDATE ON public.semester_combos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();