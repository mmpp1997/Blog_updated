CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
	password TEXT NOT NULL,
    nickname TEXT NOT NULL,
	location TEXT NOT NULL
);
CREATE TABLE posts(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
	topic TEXT NOT NULL,
    color TEXT NOT NULL,
	userId INTEGER REFERENCES users
    color TEXT NOT NULL
);

INSERT INTO posts(title, topic, color, userId, text)
VALUES ('What to do?', 'Drama', 'blue',1,'how to start programming');

SELECT posts.*,users.email
FROM users
INNER JOIN posts ON users.id=posts.userId;