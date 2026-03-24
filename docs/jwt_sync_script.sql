-- 1. Create the Triggers to keep auth.users JWT metadata synchronized
CREATE OR REPLACE FUNCTION sync_user_role_to_jwt() RETURNS TRIGGER AS $$
BEGIN
  -- Safe update of app_metadata inside Supabase secure auth layer
  UPDATE auth.users 
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.auth_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Map trigger to users table
DROP TRIGGER IF EXISTS trg_sync_role ON public.users;
CREATE TRIGGER trg_sync_role
AFTER INSERT OR UPDATE OF role ON public.users
FOR EACH ROW EXECUTE FUNCTION sync_user_role_to_jwt();

-- 2. Synchronize ALL existing users currently in the database
-- (Since the trigger only fires on new updates, we must run this on existing rows!)
UPDATE auth.users au
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', u.role)
FROM public.users u
WHERE au.id = u.auth_id;

-- 3. Synchronize existing 'is_complete' flag for all current profiles natively into user_metadata
UPDATE auth.users au
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('is_complete', sp.is_complete)
FROM public.users u
JOIN public.student_profiles sp ON sp.user_id = u.id
WHERE au.id = u.auth_id;

-- You can safely run this entire script block in your Supabase SQL Editor.
