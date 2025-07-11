-- Create collections table
CREATE TABLE collections (
         id BIGSERIAL PRIMARY KEY,
         user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
         name VARCHAR(255) NOT NULL,
         description TEXT,
         is_public BOOLEAN DEFAULT FALSE,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         UNIQUE(user_id, name)
);

-- Create tags table
CREATE TABLE tags (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create image-tag relationship table
CREATE TABLE image_tags (
            image_id BIGINT REFERENCES images(id) ON DELETE CASCADE,
            tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (image_id, tag_id)
);

-- Create collection-image relationship table
CREATE TABLE collection_images (
               collection_id BIGINT REFERENCES collections(id) ON DELETE CASCADE,
               image_id BIGINT REFERENCES images(id) ON DELETE CASCADE,
               added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               PRIMARY KEY (collection_id, image_id)
);

-- Create performance indexes
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_image_tags_tag_id ON image_tags(tag_id);
CREATE INDEX idx_collection_images_collection_id ON collection_images(collection_id);
