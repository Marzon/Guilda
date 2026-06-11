-- Corrigir função get_cohort_member_evolution com tipo correto e usar created_at como fallback
DROP FUNCTION IF EXISTS get_cohort_member_evolution();

CREATE OR REPLACE FUNCTION get_cohort_member_evolution()
RETURNS TABLE(
  month text,
  cohort_name text,
  new_members bigint,
  cumulative_members numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      TO_CHAR(DATE_TRUNC('month', COALESCE(s.purchased_at, s.created_at)), 'YYYY-MM') as month_str,
      c.id as cohort_id,
      c.name as cname,
      COUNT(*) as new_count
    FROM subscriptions s
    JOIN cohorts c ON c.id = s.cohort_id
    WHERE s.cohort_id IS NOT NULL
    GROUP BY DATE_TRUNC('month', COALESCE(s.purchased_at, s.created_at)), c.id, c.name
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