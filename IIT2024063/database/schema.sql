-- Stored XSS demo schema. Run as a MySQL admin user:
--   mysql -u root -p < database/schema.sql
-- Then change the password below (and put the same one in .env).

CREATE DATABASE IF NOT EXISTS stored_xss_demo
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE stored_xss_demo;

CREATE TABLE IF NOT EXISTS comments (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  author     VARCHAR(50)   NOT NULL,
  message    TEXT          NOT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Least-privilege application account (localhost only).
CREATE USER IF NOT EXISTS 'xss_app'@'localhost' IDENTIFIED BY 'Surbhi@2007';
GRANT SELECT, INSERT ON stored_xss_demo.comments TO 'xss_app'@'localhost';
FLUSH PRIVILEGES;
