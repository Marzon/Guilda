-- Atualizar a função get_acceleration_analytics para excluir test users (batch managers)
CREATE OR REPLACE FUNCTION public.get_acceleration_analytics(p_cohort_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'progress_stats', (
      SELECT jsonb_build_object(
        'total_members', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'ACTIVE'),
        'completed', COUNT(*) FILTER (WHERE status = 'COMPLETED'),
        'dropped', COUNT(*) FILTER (WHERE status = 'DIED'),
        'avg_day', ROUND(AVG(current_day), 1),
        'max_day', MAX(current_day),
        'completion_rate', ROUND(
          COUNT(*) FILTER (WHERE status = 'COMPLETED')::numeric / 
          NULLIF(COUNT(*), 0) * 100, 1
        )
      )
      FROM acceleration_user_progress
      WHERE (p_cohort_id IS NULL OR cohort_id = p_cohort_id)
        AND is_test_user = false  -- Exclude batch managers
    ),
    'day_distribution', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'day', current_day,
        'count', cnt
      ) ORDER BY current_day), '[]'::jsonb)
      FROM (
        SELECT current_day, COUNT(*) as cnt
        FROM acceleration_user_progress
        WHERE (p_cohort_id IS NULL OR cohort_id = p_cohort_id)
          AND is_test_user = false  -- Exclude batch managers
        GROUP BY current_day
      ) t
    ),
    'submission_stats', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'approved', COUNT(*) FILTER (WHERE status = 'APPROVED'),
        'rejected', COUNT(*) FILTER (WHERE status = 'REJECTED'),
        'pending', COUNT(*) FILTER (WHERE status = 'PENDING'),
        'approval_rate', ROUND(
          COUNT(*) FILTER (WHERE status = 'APPROVED')::numeric / 
          NULLIF(COUNT(*), 0) * 100, 1
        ),
        'avg_attempts_per_task', ROUND(
          COUNT(*)::numeric / NULLIF(COUNT(DISTINCT (user_id, task_id)), 0), 2
        )
      )
      FROM acceleration_submissions s
      WHERE (p_cohort_id IS NULL OR s.cohort_id = p_cohort_id)
        AND NOT EXISTS (
          SELECT 1 FROM acceleration_user_progress p 
          WHERE p.user_id = s.user_id 
            AND p.cohort_id = s.cohort_id 
            AND p.is_test_user = true
        )
    ),
    'daily_activity', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'date', activity_date,
        'submissions', cnt
      ) ORDER BY activity_date), '[]'::jsonb)
      FROM (
        SELECT date_trunc('day', submitted_at)::date as activity_date, COUNT(*) as cnt
        FROM acceleration_submissions s
        WHERE submitted_at > NOW() - INTERVAL '30 days'
          AND (p_cohort_id IS NULL OR s.cohort_id = p_cohort_id)
          AND NOT EXISTS (
            SELECT 1 FROM acceleration_user_progress p 
            WHERE p.user_id = s.user_id 
              AND p.cohort_id = s.cohort_id 
              AND p.is_test_user = true
          )
        GROUP BY date_trunc('day', submitted_at)::date
      ) t
    ),
    'top_performers', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'user_id', p.user_id,
        'username', pr.username,
        'avatar_url', pr.avatar_url,
        'current_day', p.current_day,
        'status', p.status,
        'submissions_count', (
          SELECT COUNT(*) FROM acceleration_submissions s 
          WHERE s.user_id = p.user_id 
            AND (p_cohort_id IS NULL OR s.cohort_id = p_cohort_id)
        )
      )), '[]'::jsonb)
      FROM (
        SELECT * FROM acceleration_user_progress
        WHERE status IN ('ACTIVE', 'COMPLETED')
          AND (p_cohort_id IS NULL OR cohort_id = p_cohort_id)
          AND is_test_user = false  -- Exclude batch managers
        ORDER BY current_day DESC, last_activity_at DESC NULLS LAST
        LIMIT 10
      ) p
      LEFT JOIN profiles pr ON pr.id = p.user_id
    ),
    'status_distribution', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'status', status,
        'count', cnt
      )), '[]'::jsonb)
      FROM (
        SELECT status, COUNT(*) as cnt
        FROM acceleration_user_progress
        WHERE (p_cohort_id IS NULL OR cohort_id = p_cohort_id)
          AND is_test_user = false  -- Exclude batch managers
        GROUP BY status
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;