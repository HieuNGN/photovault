-- Create image states table for better normalization
CREATE TABLE image_states (
                              id BIGSERIAL PRIMARY KEY,
                              image_id BIGINT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
                              user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                              is_favorite BOOLEAN DEFAULT FALSE,
                              is_archived BOOLEAN DEFAULT FALSE,
                              view_count BIGINT DEFAULT 0,
                              last_viewed TIMESTAMP,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              UNIQUE(image_id, user_id)
);

-- Migrate existing favorite/archive data
INSERT INTO image_states (image_id, user_id, is_favorite, is_archived)
SELECT id, user_id, is_favorite, is_archived
FROM images
WHERE user_id IS NOT NULL;

-- Add indexes for performance
CREATE INDEX idx_image_states_user_favorite ON image_states(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_image_states_user_archived ON image_states(user_id, is_archived) WHERE is_archived = TRUE;
CREATE INDEX idx_image_states_image_id ON image_states(image_id);

-- Add trigger for automatic updates
CREATE TRIGGER update_image_states_updated_at BEFORE UPDATE ON image_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
