-- Create users table
CREATE TABLE users (
       id BIGSERIAL PRIMARY KEY,
       username VARCHAR(50) UNIQUE NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password_hash VARCHAR(255) NOT NULL,
       role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
       is_active BOOLEAN DEFAULT TRUE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- Insert a default admin user (change password immediately!)
INSERT INTO users (username, email, password_hash, role) VALUES
    ('admin', 'admin@photovault.com', 'photovault25q2!@', 'ADMIN');
