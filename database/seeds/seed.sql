-- ============================================================
-- Seed Data — Demo Accounts & Sample Content
-- Passwords (all): Password123!
-- Bcrypt hash of "Password123!" with saltRounds=10
-- ============================================================
USE ticket_booking;

-- Demo Users
INSERT INTO `user` (`name`, `email`, `password_hash`, `role`, `status`) VALUES
('Admin User',       'admin@test.com',     '$2b$10$46BaWppmklLnSb8xLw8u0eF7gfJjTUBnzoAWOYU5Sm8awJjXraYaq', 'SYSTEM_ADMIN', 'ACTIVE'),
('Event Organizer',  'organizer@test.com', '$2b$10$46BaWppmklLnSb8xLw8u0eF7gfJjTUBnzoAWOYU5Sm8awJjXraYaq', 'ORGANIZER',    'ACTIVE'),
('Jane Customer',    'customer@test.com',  '$2b$10$46BaWppmklLnSb8xLw8u0eF7gfJjTUBnzoAWOYU5Sm8awJjXraYaq', 'CUSTOMER',     'ACTIVE'),
('John Doe',         'john@test.com',      '$2b$10$46BaWppmklLnSb8xLw8u0eF7gfJjTUBnzoAWOYU5Sm8awJjXraYaq', 'CUSTOMER',     'ACTIVE');

-- Venues
INSERT INTO `venue` (`name`, `location`) VALUES
('Majestic Cinema', 'Colombo 03, Sri Lanka'),
('Liberty Theatre',  'Kandy, Sri Lanka'),
('National Stadium', 'Colombo 07, Sri Lanka');

-- Seats for Majestic Cinema (venue_id = 1) — 3 rows × 5 seats
INSERT INTO `seat` (`venue_id`, `row_label`, `seat_number`, `seat_type`) VALUES
(1,'A',1,'VIP'),(1,'A',2,'VIP'),(1,'A',3,'VIP'),(1,'A',4,'VIP'),(1,'A',5,'VIP'),
(1,'B',1,'STANDARD'),(1,'B',2,'STANDARD'),(1,'B',3,'STANDARD'),(1,'B',4,'STANDARD'),(1,'B',5,'STANDARD'),
(1,'C',1,'STANDARD'),(1,'C',2,'STANDARD'),(1,'C',3,'STANDARD'),(1,'C',4,'STANDARD'),(1,'C',5,'STANDARD');

-- Seats for Liberty Theatre (venue_id = 2) — 2 rows × 4 seats
INSERT INTO `seat` (`venue_id`, `row_label`, `seat_number`, `seat_type`) VALUES
(2,'A',1,'VIP'),(2,'A',2,'VIP'),(2,'A',3,'VIP'),(2,'A',4,'VIP'),
(2,'B',1,'STANDARD'),(2,'B',2,'STANDARD'),(2,'B',3,'STANDARD'),(2,'B',4,'STANDARD');

-- Events (organizer_id = 2)
INSERT INTO `event` (`organizer_id`, `title`, `description`, `type`, `genre`, `duration_minutes`, `status`) VALUES
(2, 'Inception', 'A thief who steals corporate secrets through dream-sharing technology.', 'MOVIE', 'Sci-Fi', 148, 'PUBLISHED'),
(2, 'Rock Night 2026', 'An electrifying rock concert featuring top local bands.', 'CONCERT', 'Rock', 180, 'PUBLISHED'),
(2, 'Hamlet', 'Shakespeare classic performed by the National Theatre troupe.', 'THEATRE', 'Drama', 150, 'DRAFT');

-- Shows for Inception (event_id = 1, venue_id = 1)
INSERT INTO `show` (`event_id`, `venue_id`, `start_time`, `base_price`, `status`) VALUES
(1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY),  1500.00, 'SCHEDULED'),
(1, 1, DATE_ADD(NOW(), INTERVAL 4 DAY),  1500.00, 'SCHEDULED');

-- Shows for Rock Night (event_id = 2, venue_id = 3)
INSERT INTO `show` (`event_id`, `venue_id`, `start_time`, `base_price`, `status`) VALUES
(2, 3, DATE_ADD(NOW(), INTERVAL 7 DAY),  2500.00, 'SCHEDULED');

-- Show_Seats for Show 1 (Inception — venue 1 seats 1-15)
INSERT INTO `show_seat` (`show_id`, `seat_id`, `price`, `status`)
SELECT 1, seat_id,
  CASE seat_type WHEN 'VIP' THEN 2000.00 ELSE 1500.00 END,
  'AVAILABLE'
FROM `seat` WHERE venue_id = 1;

-- Show_Seats for Show 2 (Inception show 2 — same venue)
INSERT INTO `show_seat` (`show_id`, `seat_id`, `price`, `status`)
SELECT 2, seat_id,
  CASE seat_type WHEN 'VIP' THEN 2000.00 ELSE 1500.00 END,
  'AVAILABLE'
FROM `seat` WHERE venue_id = 1;

-- Platform Announcement
INSERT INTO `announcement` (`author_id`, `event_id`, `audience`, `message`) VALUES
(1, NULL, 'ALL', 'Welcome to the Online Ticket Booking System! Browse and book your favourite events.');
