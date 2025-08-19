-- Create combos for 1st semester
INSERT INTO public.semester_combos (semester_number, combo_name, combo_price, discount_percentage, description, book_ids)
SELECT 
    1,
    'Complete 1st Semester Book Set',
    ROUND((SUM(base_price) * 0.85)::numeric, 0),
    15,
    'All essential books for 1st semester with 15% discount',
    array_agg(id)
FROM public.semester_books 
WHERE semester = 1
ON CONFLICT DO NOTHING;

-- Create combos for 2nd semester
INSERT INTO public.semester_combos (semester_number, combo_name, combo_price, discount_percentage, description, book_ids)
SELECT 
    2,
    'Complete 2nd Semester Book Set',
    ROUND((SUM(base_price) * 0.85)::numeric, 0),
    15,
    'All essential books for 2nd semester with 15% discount',
    array_agg(id)
FROM public.semester_books 
WHERE semester = 2
ON CONFLICT DO NOTHING;