-- Enable Row Level Security on images table
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own images
CREATE POLICY images_user_policy ON images
    FOR ALL TO PUBLIC
    USING (user_id = current_setting('app.current_user_id')::bigint);

-- Create policy for admins to see all images
CREATE POLICY images_admin_policy ON images
    FOR ALL TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = current_setting('app.current_user_id')::bigint
            AND role = 'ADMIN'
        )
    );

-- Enable RLS on collections table
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY collections_user_policy ON collections
    FOR ALL TO PUBLIC
    USING (user_id = current_setting('app.current_user_id')::bigint);

-- Enable RLS on image_states table
ALTER TABLE image_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY image_states_user_policy ON image_states
    FOR ALL TO PUBLIC
    USING (user_id = current_setting('app.current_user_id')::bigint);

-- Create function to set current user context
CREATE OR REPLACE FUNCTION set_current_user_context(user_id bigint)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql;
