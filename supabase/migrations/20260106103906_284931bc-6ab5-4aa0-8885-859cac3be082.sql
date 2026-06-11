-- Função para obter ranking de engajamento dos membros de cohort
CREATE OR REPLACE FUNCTION get_cohort_member_engagement_ranking()
RETURNS TABLE(
  user_id uuid,
  username text,
  cohort_name text,
  matches bigint,
  messages bigint,
  is_active integer,
  engagement_score bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH cohort_members AS (
    SELECT s.user_id, s.cohort_id, c.name as cname, p.username as uname
    FROM subscriptions s
    JOIN cohorts c ON c.id = s.cohort_id
    JOIN profiles p ON p.id = s.user_id
    WHERE s.member_status IN ('ACTIVE', 'GRADUATED', 'ENROLLED')
  ),
  member_matches AS (
    SELECT cm.user_id, COUNT(*)::bigint as matches_count
    FROM cohort_members cm
    JOIN matches m ON m.requester_id = cm.user_id OR m.target_id = cm.user_id
    WHERE m.created_at >= now() - interval '30 days'
    GROUP BY cm.user_id
  ),
  member_messages AS (
    SELECT cm.user_id, COUNT(*)::bigint as messages_count
    FROM cohort_members cm
    JOIN messages msg ON msg.sender_id = cm.user_id
    WHERE msg.created_at >= now() - interval '30 days'
    GROUP BY cm.user_id
  ),
  member_activity AS (
    SELECT cm.user_id, 
      CASE WHEN p.last_seen_at >= now() - interval '7 days' THEN 1 ELSE 0 END as active_flag
    FROM cohort_members cm
    JOIN profiles p ON p.id = cm.user_id
  )
  SELECT 
    cm.user_id,
    cm.uname as username,
    cm.cname as cohort_name,
    COALESCE(mm.matches_count, 0)::bigint as matches,
    COALESCE(msg.messages_count, 0)::bigint as messages,
    COALESCE(ma.active_flag, 0)::integer as is_active,
    (COALESCE(mm.matches_count, 0) * 2 + COALESCE(msg.messages_count, 0) + COALESCE(ma.active_flag, 0) * 10)::bigint as engagement_score
  FROM cohort_members cm
  LEFT JOIN member_matches mm ON mm.user_id = cm.user_id
  LEFT JOIN member_messages msg ON msg.user_id = cm.user_id
  LEFT JOIN member_activity ma ON ma.user_id = cm.user_id
  ORDER BY engagement_score DESC
  LIMIT 30;
END;
$$;