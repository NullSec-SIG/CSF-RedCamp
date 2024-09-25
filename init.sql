CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance INT DEFAULT 1000
);

INSERT INTO users (username, password) VALUES ('john_tan', 'ilovekittens123');
INSERT INTO users (username, password, balance) VALUES ('george_lim', 'nullsexksbackd00r', 999999999);
