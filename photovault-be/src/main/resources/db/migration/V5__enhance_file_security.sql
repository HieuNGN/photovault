-- Create storage locations table
CREATE TABLE storage_locations (
       id BIGSERIAL PRIMARY KEY,
       name VARCHAR(100) UNIQUE NOT NULL,
       base_path VARCHAR(500) NOT NULL,
       storage_type VARCHAR(50) DEFAULT 'LOCAL',
       is_active BOOLEAN DEFAULT TRUE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default storage location
INSERT INTO storage_locations (name, base_path, storage_type)
VALUES ('default-local', '${DB_LOCATION}', 'LOCAL');

-- Create file metadata table
CREATE TABLE file_metadata (
       id BIGSERIAL PRIMARY KEY,
       image_id BIGINT UNIQUE REFERENCES images(id) ON DELETE CASCADE,
       storage_location_id BIGINT REFERENCES storage_locations(id),
       relative_path VARCHAR(500) NOT NULL,
       last_accessed TIMESTAMP,
       access_count BIGINT DEFAULT 0,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Move existing file paths to file_metadata
INSERT INTO file_metadata (image_id, storage_location_id, relative_path)
SELECT id, 1, stored_filename
FROM images;

-- Create performance indexes
CREATE INDEX idx_file_metadata_image_id ON file_metadata(image_id);
CREATE INDEX idx_file_metadata_storage_location ON file_metadata(storage_location_id);
