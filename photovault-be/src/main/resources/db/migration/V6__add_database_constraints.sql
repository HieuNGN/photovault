-- Add automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Soft delete trigger for images
CREATE OR REPLACE FUNCTION soft_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
        NEW.deleted_at = CURRENT_TIMESTAMP;
    ELSIF NEW.is_deleted = FALSE AND OLD.is_deleted = TRUE THEN
        NEW.deleted_at = NULL;
END IF;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Add deleted_at column to images
ALTER TABLE images ADD COLUMN deleted_at TIMESTAMP;

CREATE TRIGGER images_soft_delete BEFORE UPDATE ON images
    FOR EACH ROW EXECUTE FUNCTION soft_delete_trigger();

-- Add better constraints
ALTER TABLE images ADD CONSTRAINT check_file_size_positive CHECK (file_size > 0);
ALTER TABLE images ADD CONSTRAINT check_content_type_valid CHECK (content_type IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp'));

-- Add performance indexes
CREATE INDEX idx_images_user_deleted ON images(user_id, is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX idx_images_user_favorite ON images(user_id, is_favorite) WHERE is_favorite = TRUE AND is_deleted = FALSE;
CREATE INDEX idx_images_user_archived ON images(user_id, is_archived) WHERE is_archived = TRUE AND is_deleted = FALSE;
CREATE INDEX idx_images_upload_date_desc ON images(upload_date DESC);
