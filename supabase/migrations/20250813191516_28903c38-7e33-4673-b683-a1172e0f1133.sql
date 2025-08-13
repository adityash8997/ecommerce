-- Insert sample semester books data
INSERT INTO public.semester_books (semester, book_name, author, edition, publisher, base_price, demand_multiplier) VALUES
-- Semester 1 Books
(1, 'Engineering Mathematics I', 'B.S. Grewal', '44th Edition', 'Khanna Publishers', 650, 1.2),
(1, 'Engineering Physics', 'R.K. Gaur & S.L. Gupta', '7th Edition', 'Dhanpat Rai Publications', 480, 1.1),
(1, 'Programming for Problem Solving (C Language)', 'E. Balagurusamy', '8th Edition', 'McGraw Hill', 520, 1.3),
(1, 'Basic Electrical Engineering', 'D.C. Kulshreshtha', '3rd Edition', 'McGraw Hill', 590, 1.1),
(1, 'English Communication', 'Raman Sharma', '2nd Edition', 'Oxford University Press', 420, 0.9),

-- Semester 2 Books  
(2, 'Engineering Mathematics II', 'B.S. Grewal', '44th Edition', 'Khanna Publishers', 680, 1.2),
(2, 'Chemistry', 'O.P. Tandon', '15th Edition', 'GRB Publications', 550, 1.0),
(2, 'Engineering Mechanics', 'R.S. Khurmi', '14th Edition', 'S. Chand Publishing', 620, 1.1),
(2, 'Basic Electronics Engineering', 'Salivahanan', '4th Edition', 'McGraw Hill', 580, 1.2),
(2, 'Environmental Science', 'Agarwal S.K.', '4th Edition', 'APH Publishing', 380, 0.8),

-- Semester 3 Books (Computer Science)
(3, 'Data Structures and Algorithms', 'Narasimha Karumanchi', '2nd Edition', 'CareerMonk Publications', 720, 1.4),
(3, 'Object Oriented Programming', 'E. Balagurusamy', '8th Edition', 'McGraw Hill', 580, 1.3),
(3, 'Computer Organization', 'Carl Hamacher', '5th Edition', 'McGraw Hill', 850, 1.2),
(3, 'Discrete Mathematics', 'Kenneth Rosen', '7th Edition', 'McGraw Hill', 920, 1.1),
(3, 'Engineering Mathematics III', 'B.S. Grewal', '44th Edition', 'Khanna Publishers', 700, 1.1),

-- Semester 4 Books
(4, 'Database Management Systems', 'Raghu Ramakrishnan', '3rd Edition', 'McGraw Hill', 780, 1.3),
(4, 'Operating Systems', 'Abraham Silberschatz', '10th Edition', 'Wiley', 920, 1.4),
(4, 'Computer Networks', 'Andrew Tanenbaum', '5th Edition', 'Pearson', 850, 1.3),
(4, 'Software Engineering', 'Roger Pressman', '8th Edition', 'McGraw Hill', 820, 1.2),
(4, 'Theory of Computation', 'Michael Sipser', '3rd Edition', 'Cengage Learning', 680, 1.1),

-- Semester 5 Books
(5, 'Machine Learning', 'Tom Mitchell', '1st Edition', 'McGraw Hill', 950, 1.5),
(5, 'Compiler Design', 'Alfred Aho', '2nd Edition', 'Pearson', 880, 1.2),
(5, 'Computer Graphics', 'Donald Hearn', '4th Edition', 'Pearson', 760, 1.1),
(5, 'Web Technology', 'Uttam Roy', '2nd Edition', 'Oxford University Press', 640, 1.3),
(5, 'Artificial Intelligence', 'Stuart Russell', '4th Edition', 'Pearson', 1200, 1.4),

-- Semester 6 Books
(6, 'Advanced Database Systems', 'Elmasri Navathe', '7th Edition', 'Pearson', 920, 1.2),
(6, 'Mobile Application Development', 'Reto Meier', '4th Edition', 'Wrox', 780, 1.3),
(6, 'Cloud Computing', 'Rajkumar Buyya', '1st Edition', 'Wiley', 850, 1.4),
(6, 'Information Security', 'Mark Stamp', '2nd Edition', 'Wiley', 920, 1.3),
(6, 'Project Management', 'K. Nagarajan', '3rd Edition', 'New Age Publishers', 520, 1.0),

-- Semester 7 Books
(7, 'Advanced Machine Learning', 'Christopher Bishop', '1st Edition', 'Springer', 1100, 1.5),
(7, 'Distributed Systems', 'George Coulouris', '5th Edition', 'Pearson', 980, 1.3),
(7, 'Advanced Software Engineering', 'Ian Sommerville', '10th Edition', 'Pearson', 950, 1.2),
(7, 'Natural Language Processing', 'Steven Bird', '2nd Edition', 'O\'Reilly', 850, 1.4),
(7, 'Blockchain Technology', 'Arvind Narayanan', '1st Edition', 'Princeton University Press', 780, 1.3),

-- Semester 8 Books
(8, 'Final Year Project Guide', 'Various Authors', '1st Edition', 'Academic Publishers', 450, 1.0),
(8, 'Advanced Algorithms', 'Thomas Cormen', '4th Edition', 'MIT Press', 1200, 1.3),
(8, 'Research Methodology', 'C.R. Kothari', '4th Edition', 'New Age Publishers', 380, 0.9),
(8, 'Technical Writing', 'Mike Markel', '12th Edition', 'Bedford/St. Martin\'s', 650, 1.1),
(8, 'Entrepreneurship Development', 'Poornima Charantimath', '2nd Edition', 'Pearson', 520, 1.0);

-- Insert sample book inventory (available books for purchase)
INSERT INTO public.book_inventory (semester_book_id, condition, selling_price, status, created_at) 
SELECT 
  sb.id,
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN 'mint'
    WHEN 1 THEN 'good'
    ELSE 'fair'
  END as condition,
  CASE 
    WHEN (ROW_NUMBER() OVER ()) % 3 = 0 THEN ROUND(sb.base_price * sb.demand_multiplier * 1.0)    -- mint condition
    WHEN (ROW_NUMBER() OVER ()) % 3 = 1 THEN ROUND(sb.base_price * sb.demand_multiplier * 0.8)    -- good condition  
    ELSE ROUND(sb.base_price * sb.demand_multiplier * 0.6)                                           -- fair condition
  END as selling_price,
  'available' as status,
  NOW() - (RANDOM() * INTERVAL '30 days') as created_at
FROM public.semester_books sb
WHERE sb.semester IN (1, 2, 3, 4, 5, 6)  -- Only add inventory for semesters 1-6 for now
AND RANDOM() > 0.3;  -- Randomly include about 70% of books to simulate real availability