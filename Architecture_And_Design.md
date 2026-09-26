# Architecture and Design Explanation: Online Ticket Booking System

This document outlines the software engineering principles, architecture, design patterns, testing strategy, and requirement analysis applied to the Online Ticket Booking System for the IT 4005 Advanced Software Engineering module.

---

## 1. Layered Architecture

The application implements a strict **N-Tier (Layered) Architecture**, cleanly separating concerns to make the codebase maintainable, scalable, and testable.

*   **Presentation Layer (`src/controllers/`, `src/routes/`, `src/views/`)**
    *   **Routes:** Define the API and web endpoints, applying necessary middlewares (like `authenticate` and `authorize`).
    *   **Controllers:** Handle HTTP requests and responses. They extract data from requests (e.g., `req.body`), pass it to the service layer, and render the appropriate EJS views.
    *   **Views:** Server-side rendered HTML using EJS templates (e.g., `seatMap.ejs`, `eventDetails.ejs`), enriched by the controllers.
*   **Business Logic Layer (`src/services/`)**
    *   This is the core of the application where the business rules execute.
    *   For example, `BookingService.js` coordinates checking seat availability, calculating totals, creating bookings, processing payments, and generating tickets. It never interacts with HTTP objects directly, keeping it decoupled from Express.
*   **Data Access Layer (`src/repositories/`)**
    *   Isolates all database logic (SQL queries).
    *   The services use repositories (like `UserRepository` or `BookingRepository`) to fetch and save data, meaning the service doesn't need to know anything about MySQL syntax.
*   **Domain Model Layer (`src/models/`)**
    *   Represents business entities (e.g., `User`, `Booking`, `ShowSeat`).
    *   They are not just data containers; they contain business logic related to state transitions and validation.

---

## 2. Object-Oriented Programming (OOP) Concepts

The system heavily leverages Object-Oriented principles, primarily in the `models/` and `repositories/` directories:

### Encapsulation
*   Classes like `User.js`, `Booking.js`, and `ShowSeat.js` use **private fields** (e.g., `#status`, `#price`, `#passwordHash`). 
*   State is exposed only via getters, and modification is restricted to specific behavioral methods. 
*   *Example:* In `ShowSeat.js`, you cannot just set a seat status. You must call `markBooked()`, which throws an error if the seat is not currently `AVAILABLE`, preventing invalid state transitions at the model level.

### Inheritance
*   **Models:** `Customer.js`, `Organizer.js`, and `SystemAdministrator.js` inherit from the base `User.js` class, extending role-specific behaviors.
*   **Repositories:** `UserRepository`, `BookingRepository`, etc., inherit from `BaseRepository.js`, sharing common database query logic and transaction handling.

### Polymorphism
*   **Hydration:** In `UserRepository.js`, the `hydrate(row)` function returns a different subclass (`Customer`, `Organizer`, `SystemAdministrator`) based on the `role` column in the database, allowing polymorphic behavior for different user types.
*   **Strategy Execution:** The `BookingService` can execute a payment using any class that implements the `PaymentStrategy` interface, treating them polymorphically.

### Abstraction
*   The `BaseRepository` hides the complexity of raw database connection pools and transaction rollbacks.
*   The models hide sensitive data (like `passwordHash` never being exposed in `toJSON()` serialization).

---

## 3. Architectural and Design Patterns Used

Design patterns solve common architectural problems. This project implements both high-level architectural patterns and standard GoF (Gang of Four) patterns:

### MVC (Model-View-Controller) Architectural Pattern
*   **What it is:** An architectural pattern that separates the application into three interconnected components.
*   **Where:** 
    *   **Model:** `src/models/` manages the data, logic, and rules.
    *   **View:** `src/views/` (EJS templates) handles the visual layout and UI.
    *   **Controller:** `src/controllers/` accepts user input, delegates to services/models, and returns the appropriate view.
*   **Why:** It decouples the user interface from the business logic, making it easier to maintain, test, and scale.

### DAO (Data Access Object) / Repository Pattern
*   **What it is:** A structural design pattern that isolates the application layer from the persistence layer (database).
*   **Where:** `src/repositories/` (e.g., `UserRepository.js`, `BookingRepository.js`).
*   **Why:** It provides an object-oriented interface to the database. The rest of the application uses these DAO/Repository objects to retrieve or save data without writing a single line of SQL, keeping database logic tightly contained.

### Strategy Pattern
*   **Where:** `src/strategies/PaymentStrategy.js` and `SimulatedPaymentStrategy.js`.
*   **Why:** Allows the application to switch payment gateways (e.g., from Simulated to Stripe or PayPal) without modifying the core `BookingService`. The service simply calls `processPayment()` on the injected strategy.

### Factory Pattern
*   **Where:** The `authorize(...roles)` middleware (`src/middleware/authorize.js`) and the `hydrate(row)` function in Repositories.
*   **Why:** `authorize` is a middleware factory that generates specific Express middleware functions based on the roles passed to it, dynamically enforcing role-based access control.

### Template Method Pattern
*   **Where:** `BaseRepository.transaction(callback)` in `src/repositories/BaseRepository.js`.
*   **Why:** It defines the exact skeleton of a database transaction (getting the connection, starting the transaction, committing, rolling back on error, releasing the connection). The caller simply provides the specific SQL execution steps in the `callback`, leaving the transaction lifecycle management up to the template method.

### Dependency Injection (DI)
*   **Where:** Across controllers and services (e.g., `new BookingService({ bookingRepository, showSeatRepository, paymentStrategy, ... })`).
*   **Why:** By passing repositories and strategies into the services via their constructors, the modules are loosely coupled. This makes it trivial to pass "mock" repositories during unit testing.

---

## 4. Testing Strategy

The application uses **Jest** as the primary testing framework, along with **Supertest** for endpoint testing.

### Types of Tests Run
*   **Unit Tests (`tests/unit/`)**:
    *   **Models:** Testing encapsulation and business rules. For example, testing that a `Booking` correctly transitions from `PENDING` to `CONFIRMED` or throws an error on invalid transitions (`tests/unit/models/Booking.test.js`).
    *   **Services:** Testing the business logic orchestrations. For instance, testing that `BookingService.js` rolls back a transaction if the `PaymentStrategy` returns a failure state.
*   **Integration Tests (`tests/integration/`)**:
    *   Testing how different layers interact with the database, ensuring SQL queries execute correctly and the `BaseRepository` transactions commit or rollback accurately.

### Testing Features
*   The scripts in `package.json` (`test:unit`, `test:coverage`) utilize Jest's capability to detect open handles (`--detectOpenHandles`) and force exits for async DB connections.
*   Dependency injection allows mocking database dependencies using Jest Mocks during unit tests.

---

## 5. Requirement Analysis and Project Design Document (PDD)

The project follows a stringent design-to-implementation process defined in `Online_Ticket_Booking_System_Design_Specification.md`.

### Requirement Traceability
The project embraces a strict traceability chain:
> **Requirement -> Use Case -> Design Component -> Database Table -> Source-code Module -> Test Case -> Demonstration**

*   **Customer Role:** Focuses on browsing catalogs, picking seats, simulating payments, and receiving QR tickets.
*   **Organizer Role:** Focuses on creating events, setting up shows, pricing seats, and monitoring reports.
*   **Administrator Role:** Focuses on platform health, system audit logging, and managing user access.

### Project Design Document (PDD) Elements
The PDD established critical constraints before coding began:
*   **Database Normalization:** Ensuring the schema (found in `database/schema.sql`) transitions from Unnormalized Form (UNF) up to 3rd Normal Form (3NF), minimizing data redundancy (e.g., splitting `Event`, `Show`, `Venue`, and `Seat`).
*   **Transaction Integrity:** The requirement clearly specified that duplicate seat booking must be prevented at the database level. This resulted in the architectural choice to use `SELECT ... FOR UPDATE` inside `BookingService.js` combined with `BaseRepository` transactions.
*   **Usability Requirements:** Driven by the PDD, the application uses distinct visual layouts, maintains state (preserving total costs), and implements a non-intrusive `loadUser` middleware to maintain navbar states universally across the platform without disrupting public access.
