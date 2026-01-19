-- ============================================
-- Sample Data Insertion SQL
-- Online Food Ordering and Delivery System
-- ============================================

-- ============================================
-- Insert Admin User
-- ============================================
INSERT INTO users (username, email, password, role, full_name, phone) VALUES
('admin', 'admin@fooddelivery.com', '$2a$10$fKHXdJ3mPrfQQc70w4KP.udwJhC5P7COcMQ/dhNrS90pT9ELptcVq', 'admin', 'System Administrator', '1234567890');

-- ============================================
-- Insert Sample Customers
-- ============================================
INSERT INTO users (username, email, password, role, full_name, phone, address) VALUES
('john_doe', 'john@example.com', '$2a$10$fKHXdJ3mPrfQQc70w4KP.udwJhC5P7COcMQ/dhNrS90pT9ELptcVq', 'customer', 'John Doe', '9876543210', '123 Main Street, City'),
('jane_smith', 'jane@example.com', '$2a$10$fKHXdJ3mPrfQQc70w4KP.udwJhC5P7COcMQ/dhNrS90pT9ELptcVq', 'customer', 'Jane Smith', '9876543211', '456 Oak Avenue, City'),
('bob_wilson', 'bob@example.com', '$2a$10$fKHXdJ3mPrfQQc70w4KP.udwJhC5P7COcMQ/dhNrS90pT9ELptcVq', 'customer', 'Bob Wilson', '9876543212', '789 Pine Road, City');

-- ============================================
-- Insert Sample Restaurants
-- ============================================
INSERT INTO users (username, email, password, role, full_name, phone) VALUES
('pizza_place', 'pizza@restaurant.com', '$2a$10$fKHXdJ3mPrfQQc70w4KP.udwJhC5P7COcMQ/dhNrS90pT9ELptcVq', 'restaurant', 'Pizza Place Owner', '1111111111'),
('burger_joint', 'burger@restaurant.com', '$2a$10$fKHXdJ3mPrfQQc70w4KP.udwJhC5P7COcMQ/dhNrS90pT9ELptcVq', 'restaurant', 'Burger Joint Owner', '2222222222'),
('sushi_bar', 'sushi@restaurant.com', '$2a$10$fKHXdJ3mPrfQQc70w4KP.udwJhC5P7COcMQ/dhNrS90pT9ELptcVq', 'restaurant', 'Sushi Bar Owner', '3333333333');

-- Insert restaurant details
INSERT INTO restaurants (user_id, restaurant_name, description, address, phone, cuisine_type, opening_time, closing_time) VALUES
(2, 'Pizza Place', 'Best pizza in town! Fresh ingredients, authentic Italian recipes.', '100 Food Street, City', '1111111111', 'Italian', '10:00:00', '22:00:00'),
(3, 'Burger Joint', 'Juicy burgers made with premium beef. Fast and delicious!', '200 Food Street, City', '2222222222', 'American', '11:00:00', '23:00:00'),
(4, 'Sushi Bar', 'Fresh sushi and Japanese cuisine. Traditional recipes with modern twist.', '300 Food Street, City', '3333333333', 'Japanese', '12:00:00', '22:00:00');

-- ============================================
-- Insert Sample Riders
-- ============================================
INSERT INTO users (username, email, password, role, full_name, phone) VALUES
('rider1', 'rider1@delivery.com', '$2a$10$fKHXdJ3mPrfQQc70w4KP.udwJhC5P7COcMQ/dhNrS90pT9ELptcVq', 'rider', 'Mike Rider', '4444444444'),
('rider2', 'rider2@delivery.com', '$2a$10$fKHXdJ3mPrfQQc70w4KP.udwJhC5P7COcMQ/dhNrS90pT9ELptcVq', 'rider', 'Sarah Rider', '5555555555');

-- Insert rider details
INSERT INTO riders (user_id, vehicle_type, license_number, is_available) VALUES
(5, 'Motorcycle', 'LIC001', TRUE),
(6, 'Bicycle', 'LIC002', TRUE);

-- ============================================
-- Insert Menu Items for Pizza Place
-- ============================================
INSERT INTO menu_items (restaurant_id, item_name, description, price, category, is_available) VALUES
(1, 'Margherita Pizza', 'Classic pizza with tomato, mozzarella, and basil', 12.99, 'Pizza', TRUE),
(1, 'Pepperoni Pizza', 'Pizza topped with pepperoni and cheese', 14.99, 'Pizza', TRUE),
(1, 'Hawaiian Pizza', 'Pizza with ham, pineapple, and cheese', 15.99, 'Pizza', TRUE),
(1, 'Garlic Bread', 'Fresh baked garlic bread with herbs', 4.99, 'Sides', TRUE),
(1, 'Caesar Salad', 'Fresh romaine lettuce with Caesar dressing', 8.99, 'Salads', TRUE);

-- ============================================
-- Insert Menu Items for Burger Joint
-- ============================================
INSERT INTO menu_items (restaurant_id, item_name, description, price, category, is_available) VALUES
(2, 'Classic Burger', 'Beef patty with lettuce, tomato, and special sauce', 9.99, 'Burgers', TRUE),
(2, 'Cheeseburger', 'Classic burger with melted cheese', 10.99, 'Burgers', TRUE),
(2, 'Bacon Burger', 'Burger with crispy bacon and cheese', 12.99, 'Burgers', TRUE),
(2, 'French Fries', 'Crispy golden fries', 3.99, 'Sides', TRUE),
(2, 'Onion Rings', 'Battered and fried onion rings', 4.99, 'Sides', TRUE),
(2, 'Chicken Wings', 'Spicy chicken wings with sauce', 8.99, 'Appetizers', TRUE);

-- ============================================
-- Insert Menu Items for Sushi Bar
-- ============================================
INSERT INTO menu_items (restaurant_id, item_name, description, price, category, is_available) VALUES
(3, 'Salmon Sashimi', 'Fresh salmon sashimi (6 pieces)', 18.99, 'Sashimi', TRUE),
(3, 'Tuna Sashimi', 'Fresh tuna sashimi (6 pieces)', 19.99, 'Sashimi', TRUE),
(3, 'California Roll', 'Crab, avocado, cucumber roll', 8.99, 'Rolls', TRUE),
(3, 'Dragon Roll', 'Eel and cucumber topped with avocado', 14.99, 'Rolls', TRUE),
(3, 'Miso Soup', 'Traditional Japanese miso soup', 3.99, 'Soups', TRUE),
(3, 'Edamame', 'Steamed soybeans with salt', 5.99, 'Appetizers', TRUE);

-- ============================================
-- IMPORTANT: Password Hashing
-- ============================================
-- The password hashes below are placeholders.
-- To generate proper bcrypt hashes, use: node scripts/hashPassword.js <password>
-- Default password for all sample users: 'password123'
-- 
-- Example hash for 'password123': $2a$10$fKHXdJ3mPrfQQc70w4KP.udwJhC5P7COcMQ/dhNrS90pT9ELptcVq
-- Replace the placeholder hashes with actual bcrypt hashes before inserting data.
-- ============================================
