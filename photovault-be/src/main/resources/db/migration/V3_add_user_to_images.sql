-- Add user_id column to images table
ALTER TABLE images ADD COLUMN user_id BIGINT;

-- Add foreign key constraint
ALTER TABLE images ADD CONSTRAINT fk_images_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- For existing images, assign them to the admin user
UPDATE images SET user_id = 1 WHERE user_id IS NULL;

-- Make user_id required for new records
ALTER TABLE images ALTER COLUMN user_id SET NOT NULL;

-- Add checksum column for file integrity
ALTER TABLE images ADD COLUMN checksum_sha256 VARCHAR(64);

-- Add index for performance
CREATE INDEX idx_images_user_id ON images(user_id);
