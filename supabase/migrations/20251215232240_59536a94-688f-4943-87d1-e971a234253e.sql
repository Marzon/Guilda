-- =====================================================
-- Drop obsolete waitlist tables and functions with CASCADE
-- =====================================================

-- First drop triggers explicitly
DROP TRIGGER IF EXISTS on_waitlist_change ON public.waitlist_signups;
DROP TRIGGER IF EXISTS set_queue_position ON public.waitlist_signups;

-- Drop waitlist-related functions with CASCADE
DROP FUNCTION IF EXISTS public.get_waitlist_count() CASCADE;
DROP FUNCTION IF EXISTS public.get_waitlist_signup(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_waitlist_referrals_count(text) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_queue_position(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.increment_referrer_invites(text) CASCADE;
DROP FUNCTION IF EXISTS public.generate_referral_code() CASCADE;
DROP FUNCTION IF EXISTS public.decrement_counter_offset() CASCADE;
DROP FUNCTION IF EXISTS public.update_queue_positions() CASCADE;

-- Drop waitlist_signups table
DROP TABLE IF EXISTS public.waitlist_signups CASCADE;

-- Drop waitlist_config table
DROP TABLE IF EXISTS public.waitlist_config CASCADE;