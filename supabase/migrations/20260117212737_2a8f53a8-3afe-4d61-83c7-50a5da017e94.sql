-- Add acceleration_updates column to email_preferences
ALTER TABLE email_preferences 
ADD COLUMN IF NOT EXISTS acceleration_updates BOOLEAN DEFAULT true;

-- Create RPC function for acceleration analytics
CREATE OR REPLACE FUNCTION get_acceleration_analytics(p_cohort_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overview', (
      SELECT jsonb_build_object(
        'total_founders', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'ACTIVE'),
        'stuck', COUNT(*) FILTER (WHERE status = 'STUCK'),
        'died', COUNT(*) FILTER (WHERE status = 'DIED'),
        'completed', COUNT(*) FILTER (WHERE status = 'COMPLETED'),
        'pending', COUNT(*) FILTER (WHERE status = 'PENDING'),
        'survival_rate', ROUND(
          COUNT(*) FILTER (WHERE status IN ('ACTIVE', 'COMPLETED'))::numeric / 
          NULLIF(COUNT(*), 0) * 100, 1
        ),
        'completion_rate', ROUND(
          COUNT(*) FILTER (WHERE status = 'COMPLETED')::numeric / 
          NULLIF(COUNT(*), 0) * 100, 1
        )
      )
      FROM acceleration_user_progress
      WHERE (p_cohort_id IS NULL OR cohort_id = p_cohort_id)
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
      FROM acceleration_submissions
      WHERE (p_cohort_id IS NULL OR cohort_id = p_cohort_id)
    ),
    'daily_activity', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'date', activity_date,
        'submissions', cnt
      ) ORDER BY activity_date), '[]'::jsonb)
      FROM (
        SELECT date_trunc('day', submitted_at)::date as activity_date, COUNT(*) as cnt
        FROM acceleration_submissions
        WHERE submitted_at > NOW() - INTERVAL '30 days'
          AND (p_cohort_id IS NULL OR cohort_id = p_cohort_id)
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
        GROUP BY status
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users (admins will check in code)
GRANT EXECUTE ON FUNCTION get_acceleration_analytics(UUID) TO authenticated;