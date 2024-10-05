CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance INTEGER DEFAULT 1000,
    last_login TIMESTAMP
);

INSERT INTO users (username, password, last_login) VALUES ('john_tan', 'ilovekittens123',  NOW() - INTERVAL '1 day' * (RANDOM() * 30));
INSERT INTO users (username, password, balance, last_login) 
VALUES ('george_lim', 'NullSecBackdoor', 999999999, NOW() - INTERVAL '1 day' * (RANDOM() * 30));
