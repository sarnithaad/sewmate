CREATE DATABASE IF NOT EXISTS sewmate;
USE sewmate;

CREATE TABLE shopkeepers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shopkeeper_id INT,
  name VARCHAR(100),
  email VARCHAR(100),
  FOREIGN KEY (shopkeeper_id) REFERENCES shopkeepers(id)
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shopkeeper_id INT,
  customer_id INT,
  date DATE,
  request TEXT,
  FOREIGN KEY (shopkeeper_id) REFERENCES shopkeepers(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
