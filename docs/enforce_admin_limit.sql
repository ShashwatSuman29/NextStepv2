-- This trigger ensures that there can NEVER be more than 2 users with the 'admin' role in your entire database.

CREATE OR REPLACE FUNCTION enforce_max_admins()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INT;
BEGIN
    -- We only care if the incoming row is trying to become an admin
    IF NEW.role = 'admin' THEN
        -- Count how many existing admins there are, excluding this exact user (if they are just updating their profile)
        SELECT COUNT(*) INTO admin_count 
        FROM public.users 
        WHERE role = 'admin' AND id != NEW.id;

        -- If there are already 2 admins, block the database entirely!
        IF admin_count >= 2 THEN
            RAISE EXCEPTION 'CRITICAL: Maximum limit of 2 Admins reached. You cannot promote this user to Admin.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to the users table
DROP TRIGGER IF EXISTS trg_enforce_max_admins ON public.users;

CREATE TRIGGER trg_enforce_max_admins
BEFORE INSERT OR UPDATE OF role ON public.users
FOR EACH ROW EXECUTE FUNCTION enforce_max_admins();
