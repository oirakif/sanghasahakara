CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,  -- Marks whether the email is verified
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users_email_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id), -- Foreign key to link with the user
    token VARCHAR(255) NOT NULL, -- Verification token
    expires_at TIMESTAMP NOT NULL, -- Expiration time for the token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);