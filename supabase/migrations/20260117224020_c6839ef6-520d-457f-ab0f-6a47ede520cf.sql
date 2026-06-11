-- Função que atualiza o progresso quando uma submissão é aprovada
CREATE OR REPLACE FUNCTION update_progress_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  task_day INTEGER;
  is_completed BOOLEAN;
BEGIN
  -- Só dispara quando status muda para APPROVED
  IF NEW.status = 'APPROVED' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'APPROVED') THEN
    -- Busca o dia da tarefa aprovada
    SELECT day_number INTO task_day
    FROM acceleration_tasks
    WHERE id = NEW.task_id;
    
    IF task_day IS NOT NULL THEN
      -- Verifica se completou o programa (15 dias)
      is_completed := (task_day + 1) > 15;
      
      -- Atualiza o progresso se este dia é >= current_day
      UPDATE acceleration_user_progress
      SET current_day = task_day + 1,
          status = CASE WHEN is_completed THEN 'COMPLETED' ELSE status END,
          last_activity_at = NOW()
      WHERE user_id = NEW.user_id
        AND cohort_id = NEW.cohort_id
        AND current_day <= task_day;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS on_submission_approved ON acceleration_submissions;

CREATE TRIGGER on_submission_approved
AFTER INSERT OR UPDATE ON acceleration_submissions
FOR EACH ROW
EXECUTE FUNCTION update_progress_on_approval();