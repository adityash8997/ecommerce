-- Remove duplicate combos (keep only one per semester)
DELETE FROM semester_combos 
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY semester_number ORDER BY created_at) as rn
        FROM semester_combos
    ) t 
    WHERE rn > 1
);