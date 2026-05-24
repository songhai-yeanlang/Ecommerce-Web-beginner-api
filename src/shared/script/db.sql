/*
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = '12345678'
DB_DATABASE = 'myportfolio'
DB_PORT = 3306

*/

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    token TEXT,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('admin', 'user'), 
    is_active TINYINT(1) DEFAULT 0,
    is_verified TINYINT(1) DEFAULT 0,
    verification_token VARCHAR(255),
    verification_expires DATETIME,
    last_login_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
