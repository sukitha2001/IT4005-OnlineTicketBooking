# Online Ticket Booking System 🎟️

A full-stack web application for booking event tickets online, built with a strictly layered architecture implementing solid Object-Oriented Programming (OOP) principles and industry-standard design patterns.

## Features

- **Role-Based Access Control (RBAC)**: Supports `CUSTOMER`, `ORGANIZER`, and `SYSTEM_ADMIN` roles.
- **Interactive Seat Selection**: Visual, interactive seat map for choosing specific seats (Standard/VIP) at various venues.
- **Transactional Bookings**: Robust booking flow using MySQL `SELECT ... FOR UPDATE` locks to prevent double-booking in high-concurrency environments.
- **Simulated Payment Gateway**: Uses the Strategy Pattern to mock a payment provider cleanly.
- **E-Tickets with QR Codes**: Automatically generates e-tickets with unique QR identifiers upon successful payment.
- **Event Management**: Organizers can create, edit, publish, and unpublish events and schedule shows.
- **Admin Dashboard**: System administrators can view audit logs, manage users (suspend/activate), and broadcast platform-wide announcements.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL (with `mysql2/promise`)
- **Frontend**: EJS (Embedded JavaScript templates), custom BEM-structured CSS, vanilla JavaScript for interactive elements.
- **Authentication**: `express-session`, `bcrypt` for secure password hashing.
- **Testing**: Jest, Supertest.

## Architecture & Design Patterns

This project adheres to a strict layered architecture:
1. **Controllers**: Map HTTP requests to business logic.
2. **Services**: Contain pure business logic and transaction management.
3. **Repositories**: Handle all SQL queries and database interactions.
4. **Models**: Encapsulate domain entities and their state machines.

### Key Design Patterns Used:
- **MVC (Model-View-Controller)**: Separates the presentation layer from the business logic.
- **Repository Pattern**: Abstracts database calls away from the service layer.
- **Strategy Pattern**: Applied in `PaymentStrategy` and `NotificationSender` for interchangeable behaviors without altering the core service.
- **Template Method Pattern**: Used in `BaseRepository.transaction()` to enforce a strict BEGIN/COMMIT/ROLLBACK lifecycle.
- **Factory Pattern**: Used to generate role-checking middleware dynamically.

## Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Server (v8+ recommended)

### 1. Clone the repository
```bash
git clone <your-github-repo-url>
cd online-ticket-booking
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory based on the provided example:
```bash
cp .env.example .env
```
Update the `.env` file with your MySQL database credentials.

### 4. Database Setup
Ensure MySQL is running, then run the initialization scripts to create the schema and seed data:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p ticket_booking < database/seeds/seed.sql
```

### 5. Start the Server
```bash
npm run dev
```
The application will be running at `http://localhost:3000`.

## Demo Accounts

The database seed provides the following accounts (Password for all: `Password123!`):
- **Admin**: `admin@test.com`
- **Organizer**: `organizer@test.com`
- **Customer**: `customer@test.com`

## Running Tests

Run the unit and integration test suites via Jest:
```bash
npm run test:unit
```

## License
MIT License.
