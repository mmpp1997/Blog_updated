CREATE TABLE sessions(
    sid varchar PRIMARY KEY UNIQUE,
    sess json,
	expire timestamp NOT NULL
);
CREATE TABLE users(
    id SERIAL PRIMARY KEY UNIQUE,
    username TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
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

INSERT INTO posts(title, topic, color, userId, text)
VALUES ('What to do?', 'Drama', 'blue',1,'how to start programming');

SELECT posts.*,users.email
FROM users
INNER JOIN posts ON users.id=posts.userId;