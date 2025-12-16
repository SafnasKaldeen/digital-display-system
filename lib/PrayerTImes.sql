-- Function to update displays with next day's prayer times
CREATE OR REPLACE FUNCTION update_display_prayer_times()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_timestamp TIMESTAMP WITH TIME ZONE := NOW();
  current_date DATE := current_timestamp::DATE;
  current_time TIME := current_timestamp::TIME;
  current_month INTEGER := EXTRACT(MONTH FROM current_date);
  current_day INTEGER := EXTRACT(DAY FROM current_date);
  next_month INTEGER;
  next_day INTEGER;
  display_record RECORD;
  prayer_record RECORD;
  isha_time TIME;
  display_label TEXT;
BEGIN
  -- Loop through all active displays with prayer time templates
  FOR display_record IN 
    SELECT id, config 
    FROM public.displays 
    WHERE status = 'active' 
    AND template_type IN ('prayer_times', 'mosque_display') -- adjust template types as needed
    AND config->>'label' IS NOT NULL
  LOOP
    -- Get the label from this specific display's config
    display_label := display_record.config->>'label';
    
    -- Get current prayer times SPECIFICALLY for this display's label
    SELECT isha INTO isha_time
    FROM public.prayer_times
    WHERE label = display_label
    AND month = current_month
    AND day = current_day
    LIMIT 1;
    
    -- Only proceed if we found prayer times for this specific label and Isha has passed
    IF isha_time IS NOT NULL AND current_time > isha_time THEN
      -- Calculate next day
      next_month := EXTRACT(MONTH FROM (current_date + INTERVAL '1 day'));
      next_day := EXTRACT(DAY FROM (current_date + INTERVAL '1 day'));
      
      -- Get next day's prayer times for this specific label
      SELECT * INTO prayer_record
      FROM public.prayer_times
      WHERE label = display_label
      AND month = next_month
      AND day = next_day
      LIMIT 1;
      
      -- Update display config with next day's times
      IF prayer_record IS NOT NULL THEN
        UPDATE public.displays
        SET config = jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    config,
                    '{fajr}', to_jsonb(prayer_record.fajr)
                  ),
                  '{sunrise}', to_jsonb(prayer_record.sunrise)
                ),
                '{dhuhr}', to_jsonb(prayer_record.dhuhr)
              ),
              '{asr}', to_jsonb(prayer_record.asr)
            ),
            '{maghrib}', to_jsonb(prayer_record.maghrib)
          ),
          '{isha}', to_jsonb(prayer_record.isha)
        ),
        updated_at = NOW()
        WHERE id = display_record.id;
        
        RAISE NOTICE 'Updated display % (label: %) with prayer times for %/%', 
          display_record.id, display_label, next_month, next_day;
      ELSE
        RAISE NOTICE 'No prayer times found for display % (label: %) for next day %/%',
          display_record.id, display_label, next_month, next_day;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Create a scheduled job using pg_cron (requires pg_cron extension)
-- This runs every hour to check if Isha has passed
-- Install pg_cron: CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'update-prayer-times',
  '0 * * * *', -- Every hour at minute 0
  'SELECT update_display_prayer_times();'
);

-- Alternative: If pg_cron is not available, you can call this function from your application
-- or use a cron job that connects to the database and runs:
-- SELECT update_display_prayer_times();

-- To manually test the function:
-- SELECT update_display_prayer_times();

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule (if needed):
-- SELECT cron.unschedule('update-prayer-times');


-- ============================================================================
-- VERIFICATION & MANAGEMENT QUERIES
-- ============================================================================

-- 1. View all scheduled cron jobs
SELECT * FROM cron.job;

-- 2. View cron job execution history (recent runs)
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;

-- 3. Check if your specific job exists
SELECT * FROM cron.job 
WHERE jobname = 'update-prayer-times';

-- 4. Manually test the function (simulate what cron will do)
SELECT update_display_prayer_times();

-- 5. Check recent display updates
SELECT id, name, config->>'label' as label, updated_at 
FROM public.displays 
WHERE status = 'active'
ORDER BY updated_at DESC;

-- 6. View prayer times for today to see current Isha time
SELECT * FROM public.prayer_times 
WHERE month = EXTRACT(MONTH FROM CURRENT_DATE)
AND day = EXTRACT(DAY FROM CURRENT_DATE);

-- 7. Unschedule the job (if needed)
-- SELECT cron.unschedule('update-prayer-times');

-- 8. Reschedule with different timing (if needed)
-- SELECT cron.unschedule('update-prayer-times');
-- SELECT cron.schedule('update-prayer-times', '0 * * * *', 'SELECT update_display_prayer_times();');