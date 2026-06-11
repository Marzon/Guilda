-- Create tool_usage_events table for tracking tool usage
CREATE TABLE public.tool_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'calculation', 'download', 'save', 'share')),
  event_data JSONB DEFAULT '{}',
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for fast queries
CREATE INDEX idx_tool_usage_tool_name ON public.tool_usage_events(tool_name);
CREATE INDEX idx_tool_usage_user_id ON public.tool_usage_events(user_id);
CREATE INDEX idx_tool_usage_created_at ON public.tool_usage_events(created_at DESC);
CREATE INDEX idx_tool_usage_session ON public.tool_usage_events(session_id);
CREATE INDEX idx_tool_usage_event_type ON public.tool_usage_events(event_type);

-- Enable RLS
ALTER TABLE public.tool_usage_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (including anonymous users)
CREATE POLICY "Anyone can insert tool usage events"
ON public.tool_usage_events
FOR INSERT
WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can view all tool usage events"
ON public.tool_usage_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RPC function for aggregated stats
CREATE OR REPLACE FUNCTION public.get_tool_usage_stats(
  p_start_date TIMESTAMPTZ DEFAULT (now() - interval '30 days'),
  p_end_date TIMESTAMPTZ DEFAULT now()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'total_events', (SELECT COUNT(*) FROM tool_usage_events WHERE created_at BETWEEN p_start_date AND p_end_date),
    'total_page_views', (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'page_view' AND created_at BETWEEN p_start_date AND p_end_date),
    'total_calculations', (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'calculation' AND created_at BETWEEN p_start_date AND p_end_date),
    'total_downloads', (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'download' AND created_at BETWEEN p_start_date AND p_end_date),
    'unique_users', (SELECT COUNT(DISTINCT user_id) FROM tool_usage_events WHERE user_id IS NOT NULL AND created_at BETWEEN p_start_date AND p_end_date),
    'unique_sessions', (SELECT COUNT(DISTINCT session_id) FROM tool_usage_events WHERE created_at BETWEEN p_start_date AND p_end_date),
    'anonymous_sessions', (SELECT COUNT(DISTINCT session_id) FROM tool_usage_events WHERE user_id IS NULL AND created_at BETWEEN p_start_date AND p_end_date),
    'tools_ranking', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT tool_name, COUNT(*) as uses, COUNT(DISTINCT session_id) as sessions
        FROM tool_usage_events
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY tool_name
        ORDER BY uses DESC
      ) t
    ),
    'event_types', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT event_type, COUNT(*) as count
        FROM tool_usage_events
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY event_type
      ) t
    ),
    'device_breakdown', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT COALESCE(device_type, 'unknown') as device, COUNT(*) as count
        FROM tool_usage_events
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY device_type
      ) t
    ),
    'daily_trend', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT DATE(created_at) as date, COUNT(*) as events, COUNT(DISTINCT session_id) as sessions
        FROM tool_usage_events
        WHERE created_at BETWEEN p_start_date AND p_end_date
        GROUP BY DATE(created_at)
        ORDER BY date
      ) t
    ),
    'user_tool_distribution', (
      SELECT json_build_object(
        'used_1_tool', (SELECT COUNT(*) FROM (SELECT session_id FROM tool_usage_events WHERE event_type = 'page_view' AND created_at BETWEEN p_start_date AND p_end_date GROUP BY session_id HAVING COUNT(DISTINCT tool_name) = 1) s),
        'used_2_3_tools', (SELECT COUNT(*) FROM (SELECT session_id FROM tool_usage_events WHERE event_type = 'page_view' AND created_at BETWEEN p_start_date AND p_end_date GROUP BY session_id HAVING COUNT(DISTINCT tool_name) BETWEEN 2 AND 3) s),
        'used_4_plus_tools', (SELECT COUNT(*) FROM (SELECT session_id FROM tool_usage_events WHERE event_type = 'page_view' AND created_at BETWEEN p_start_date AND p_end_date GROUP BY session_id HAVING COUNT(DISTINCT tool_name) >= 4) s)
      )
    ),
    'conversion_funnel', (
      SELECT json_build_object(
        'views_to_calc', ROUND(
          CASE WHEN (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'page_view' AND created_at BETWEEN p_start_date AND p_end_date) > 0
          THEN (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'calculation' AND created_at BETWEEN p_start_date AND p_end_date)::numeric / 
               (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'page_view' AND created_at BETWEEN p_start_date AND p_end_date)::numeric * 100
          ELSE 0 END, 1
        ),
        'calc_to_download', ROUND(
          CASE WHEN (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'calculation' AND created_at BETWEEN p_start_date AND p_end_date) > 0
          THEN (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'download' AND created_at BETWEEN p_start_date AND p_end_date)::numeric / 
               (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'calculation' AND created_at BETWEEN p_start_date AND p_end_date)::numeric * 100
          ELSE 0 END, 1
        ),
        'calc_to_save', ROUND(
          CASE WHEN (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'calculation' AND created_at BETWEEN p_start_date AND p_end_date) > 0
          THEN (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'save' AND created_at BETWEEN p_start_date AND p_end_date)::numeric / 
               (SELECT COUNT(*) FROM tool_usage_events WHERE event_type = 'calculation' AND created_at BETWEEN p_start_date AND p_end_date)::numeric * 100
          ELSE 0 END, 1
        )
      )
    )
  ) INTO result;

  RETURN result;
END;
$$;