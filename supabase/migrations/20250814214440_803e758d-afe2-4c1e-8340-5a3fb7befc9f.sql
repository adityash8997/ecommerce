-- Check if semesters table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'semesters') THEN
        CREATE TABLE public.semesters (
            id SERIAL PRIMARY KEY,
            semester_number INTEGER UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view semesters" 
        ON public.semesters 
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
    END IF;
END
$$;

-- Check if semester_combos table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'semester_combos') THEN
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
        
        ALTER TABLE public.semester_combos ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can view semester combos" 
        ON public.semester_combos 
        FOR SELECT 
        USING (true);
    END IF;
END
$$;

-- Update semester_books table structure if needed and populate with data
INSERT INTO public.semester_books (semester_id, book_name, author, publisher, edition, base_price, subject_category) 
VALUES
-- 1st Semester Books
(1, 'Advanced Engineering Mathematics', 'Kreyszig E.', 'Wiley', '9th ed', 850, 'Mathematics'),
(1, 'Differential Calculus', 'Shanti Narayan & P.K. Mittal', 'S. Chand', '', 450, 'Mathematics'),
(1, 'Programming in C', 'Pradip Dey & Manas Ghosh', 'OXFORD', '', 550, 'Programming'),
(1, 'Engineering Chemistry', 'Jain & Jain', '', '16th ed', 680, 'Chemistry'),
(1, 'Basic Electronics', 'D. Chattopadhyay & P.C. Rakshit', '', '', 720, 'Electronics'),
(1, 'Technical Communication Principles & Practices', '', '', '', 390, 'Professional Communication'),
(1, 'Environmental Chemistry', 'A.K. De', '', '7th ed', 480, 'Environmental Science'),
-- 2nd Semester Books
(2, 'Advanced Engineering Mathematics', 'Kreyszig E.', 'Wiley', '9th ed', 850, 'Mathematics'),
(2, 'Differential Calculus', 'Shanti Narayan & P.K. Mittal', 'S. Chand', '', 450, 'Mathematics'),
(2, 'OOP with C++', 'E. Balaguruswamy', '', '', 650, 'Programming'),
(2, 'Engineering Physics', 'B.K. Pandey & S. Chaturvedi', '', '', 750, 'Physics'),
(2, 'Engineering Mechanics', 'S. Timoshenko, D.H. Young & J.V. Rao', '', '', 820, 'Mechanics'),
(2, 'Basic Electrical Engineering', 'D.C. Kulshreshtha', 'Tata McGraw', '', 690, 'Electrical Engineering')
ON CONFLICT DO NOTHING;