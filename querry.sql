CREATE TABLE users(
    id SERIAL PRIMARY KEY UNIQUE,
    username TEXT NOT NULL UNIQUE,
	password TEXT,
    nickname TEXT NOT NULL UNIQUE,
	location TEXT NOT NULL
);
CREATE TABLE posts(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
	topic TEXT NOT NULL,
    color TEXT NOT NULL,
	userId INTEGER REFERENCES users,
    text TEXT NOT NULL
);