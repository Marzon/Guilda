-- Update trigger function to only advance day when ALL tasks in the day are approved
CREATE OR REPLACE FUNCTION update_progress_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  task_day INTEGER;
  task_cohort_id UUID;
  total_tasks_in_day INTEGER;
  approved_tasks_in_day INTEGER;
  is_completed BOOLEAN;
BEGIN
  -- Only trigger when status changes to APPROVED
  IF NEW.status = 'APPROVED' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'APPROVED') THEN
    -- Get the day number and cohort_id of the approved task
    SELECT t.day_number, p.cohort_id INTO task_day, task_cohort_id
    FROM public.acceleration_tasks t
    JOIN public.acceleration_phases p ON t.phase_id = p.id
    WHERE t.id = NEW.task_id;
    
    IF task_day IS NOT NULL AND task_cohort_id IS NOT NULL THEN
      -- Count total tasks in this day for this cohort
      SELECT COUNT(*) INTO total_tasks_in_day
      FROM public.acceleration_tasks t
      JOIN public.acceleration_phases p ON t.phase_id = p.id
      WHERE t.day_number = task_day AND p.cohort_id = task_cohort_id;
      
      -- Count approved tasks in this day for this user
      SELECT COUNT(*) INTO approved_tasks_in_day
      FROM public.acceleration_submissions s
      JOIN public.acceleration_tasks t ON s.task_id = t.id
      JOIN public.acceleration_phases p ON t.phase_id = p.id
      WHERE s.user_id = NEW.user_id 
        AND p.cohort_id = task_cohort_id
        AND t.day_number = task_day
        AND s.status = 'APPROVED';
      
      -- Only advance if ALL tasks in the day are approved
      IF approved_tasks_in_day >= total_tasks_in_day THEN
        is_completed := (task_day + 1) > 15;
        
        UPDATE public.acceleration_user_progress
        SET current_day = task_day + 1,
            status = CASE WHEN is_completed THEN 'COMPLETED' ELSE status END,
            last_activity_at = NOW()
        WHERE user_id = NEW.user_id
          AND cohort_id = task_cohort_id
          AND current_day <= task_day;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;