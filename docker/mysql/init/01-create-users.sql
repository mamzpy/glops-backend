CREATE DATABASE IF NOT EXISTS glops_shadow;

CREATE USER IF NOT EXISTS 'glops_migrator'@'%' IDENTIFIED BY 'migrator_password';

GRANT ALL PRIVILEGES ON `glops`.* TO 'glops_migrator'@'%';
GRANT ALL PRIVILEGES ON `glops_shadow`.* TO 'glops_migrator'@'%';

FLUSH PRIVILEGES;