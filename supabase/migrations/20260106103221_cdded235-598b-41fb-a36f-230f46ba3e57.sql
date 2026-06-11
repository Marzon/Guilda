-- Função para obter métricas de engajamento por cohort
CREATE OR REPLACE FUNCTION get_cohort_engagement_metrics()
RETURNS TABLE(
  id uuid,
  name text,
  matches_30d bigint,
  messages_30d bigint,
  active_7d bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH cohort_users AS (
    SELECT DISTINCT s.user_id, s.cohort_id
    FROM subscriptions s
    WHERE s.cohort_id IS NOT NULL
      AND s.member_status IN ('ACTIVE', 'GRADUATED')
  ),
  matches_count AS (
    SELECT cu.cohort_id, COUNT(*) as total_matches
    FROM cohort_users cu
    JOIN matches m ON m.requester_id = cu.user_id OR m.target_id = cu.user_id
    WHERE m.created_at >= now() - interval '30 days'
    GROUP BY cu.cohort_id
  ),
  messages_count AS (
    SELECT cu.cohort_id, COUNT(*) as total_messages
    FROM cohort_users cu
    JOIN messages msg ON msg.sender_id = cu.user_id
    WHERE msg.created_at >= now() - interval '30 days'
    GROUP BY cu.cohort_id
  ),
  active_users AS (
    SELECT cu.cohort_id, COUNT(*) as active_count
    FROM cohort_users cu
    JOIN profiles p ON p.id = cu.user_id
    WHERE p.last_seen_at >= now() - interval '7 days'
    GROUP BY cu.cohort_id
  )
  SELECT 
    c.id,
    c.name,
    COALESCE(mc.total_matches, 0)::bigint as matches_30d,
    COALESCE(msg.total_messages, 0)::bigint as messages_30d,
    COALESCE(au.active_count, 0)::bigint as active_7d
  FROM cohorts c
  LEFT JOIN matches_count mc ON mc.cohort_id = c.id
  LEFT JOIN messages_count msg ON msg.cohort_id = c.id
  LEFT JOIN active_users au ON au.cohort_id = c.id
  ORDER BY c.created_at DESC;
END;
$$;

-- Função para obter evolução de membros por mês
CREATE OR REPLACE FUNCTION get_cohort_member_evolution()
RETURNS TABLE(
  month text,
  cohort_name text,
  new_members bigint,
  cumulative_members bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      TO_CHAR(DATE_TRUNC('month', s.purchased_at), 'YYYY-MM') as month_str,
      c.id as cohort_id,
      c.name as cname,
      COUNT(*) as new_count
    FROM subscriptions s
    JOIN cohorts c ON c.id = s.cohort_id
    WHERE s.purchased_at IS NOT NULL
    GROUP BY DATE_TRUNC('month', s.purchased_at), c.id, c.name
  )
  SELECT 
    md.month_str as month,
    md.cname as cohort_name,
    md.new_count as new_members,
    SUM(md.new_count) OVER (PARTITION BY md.cohort_id ORDER BY md.month_str) as cumulative_members
  FROM monthly_data md
  ORDER BY md.month_str DESC
  LIMIT 24;
END;
$$;