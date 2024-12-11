-- PostgreSQL database tables initialization script

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS artworks;
DROP TABLE IF EXISTS artcomments;
DROP TABLE IF EXISTS userlikes;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE artworks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE artcomments (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE
);

CREATE TABLE userlikes (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE,
    is_liked BOOLEAN NOT NULL,
    PRIMARY KEY (user_id, artwork_id)
);