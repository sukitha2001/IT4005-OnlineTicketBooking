'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * BookingService — the most critical service.
 *
 * createBooking() executes the full transactional booking workflow:
 *  1. Begin transaction + lock show_seat rows (SELECT FOR UPDATE)
 *  2. Validate availability (server-side, never trust client)
 *  3. Calculate total from DB prices (never trust client total)
 *  4. Create PENDING booking
 *  5. Call PaymentStrategy.processPayment()
 *  6. On success: insert booking_seats, mark show_seats BOOKED, confirm booking, save payment, generate ticket
 *  7. On failure: record PAYMENT_FAILED, rollback seat reservation
 *  8. Commit
 */
class BookingService {
  constructor({
    bookingRepository, bookingSeatRepository, showSeatRepository,
    paymentRepository, ticketRepository, paymentStrategy, ticketService, auditService,
  }) {
    this.bookingRepo     = bookingRepository;
    this.bookingSeatRepo = bookingSeatRepository;
    this.showSeatRepo    = showSeatRepository;
    this.paymentRepo     = paymentRepository;
    this.ticketRepo      = ticketRepository;
    this.paymentStrategy = paymentStrategy;   // Strategy pattern — injected dependency
    this.ticketSvc       = ticketService;
    this.auditSvc        = auditService;
  }

  /**
   * Full transactional booking flow.
   * @param {{ userId, showId, showSeatIds: number[], paymentMethod, simulatedResult }} params
   */
  async createBooking({ userId, showId, showSeatIds, paymentMethod = 'SIMULATED', simulatedResult = 'success' }) {
    return this.bookingRepo.transaction(async (conn) => {
      // ── Step 1: Lock show_seat rows ──────────────────────────
      const lockedSeats = await this.showSeatRepo.lockForUpdate(showSeatIds, conn);

      // ── Step 2: Validate ─────────────────────────────────────
      if (lockedSeats.length !== showSeatIds.length) {
        throw Object.assign(new Error('One or more seats not found'), { code: 'SEAT_NOT_FOUND' });
      }
      const unavailable = lockedSeats.filter(ss => !ss.isAvailable);
      if (unavailable.length > 0) {
        const labels = unavailable.map(ss => ss.label).join(', ');
        throw Object.assign(new Error(`Seats no longer available: ${labels}`), { code: 'SEAT_CONFLICT' });
      }
      for (const ss of lockedSeats) {
        if (ss.showId !== showId) {
          throw Object.assign(new Error('Seat does not belong to this show'), { code: 'SEAT_MISMATCH' });
        }
      }

      // ── Step 3: Calculate total from DB prices ───────────────
      const totalAmount = lockedSeats.reduce((sum, ss) => sum + ss.price, 0);

      // ── Step 4: Create PENDING booking ───────────────────────
      const reference = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`;
      const booking   = await this.bookingRepo.create({ userId, showId, reference, totalAmount }, conn);

      // ── Step 5: Process payment (Strategy Pattern) ───────────
      booking.startPayment();
      await this.bookingRepo.updateStatus(booking.id, 'PAYMENT_PROCESSING', conn);

      const paymentResult = await this.paymentStrategy.processPayment({
        amount: totalAmount, method: paymentMethod, simulatedResult,
      });

      if (paymentResult.status !== 'SUCCESS') {
        // ── Step 7: Record failure ────────────────────────────
        booking.fail();
        await this.bookingRepo.updateStatus(booking.id, 'PAYMENT_FAILED', conn);
        await this.paymentRepo.create({
          bookingId: booking.id, method: paymentMethod, amount: totalAmount,
          status: 'FAILED', transactionReference: null, paidAt: null,
        }, conn);
        throw Object.assign(new Error('Payment was declined. Please try again.'), { code: 'PAYMENT_FAILED', booking });
      }

      // ── Step 6 (success path) ─────────────────────────────────
      // Insert booking seats
      await this.bookingSeatRepo.createBulk(booking.id, lockedSeats, conn);
      // Mark show seats as BOOKED
      await this.showSeatRepo.updateStatus(showSeatIds, 'BOOKED', conn);
      // Confirm booking
      booking.confirm();
      await this.bookingRepo.updateStatus(booking.id, 'CONFIRMED', conn);
      // Save payment record
      const payment = await this.paymentRepo.create({
        bookingId: booking.id, method: paymentMethod, amount: totalAmount,
        status: 'SUCCESS', transactionReference: paymentResult.transactionReference,
        paidAt: new Date(),
      }, conn);
      // Generate ticket
      const ticket = await this.ticketSvc.generateTicket({ bookingId: booking.id }, conn);

      await this.auditSvc.log({
        actorId: userId, action: 'BOOKING_CONFIRMED',
        entityType: 'BOOKING', entityId: booking.id,
        details: { reference, totalAmount, seats: showSeatIds.length },
      });

      return { booking, payment, ticket };
    });
  }

  async getBookingHistory(userId) {
    return this.bookingRepo.findByUser(userId);
  }

  async getBookingDetails(bookingId, userId) {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw Object.assign(new Error('Booking not found'), { code: 'NOT_FOUND' });
    if (!booking.isOwnedBy(userId)) throw Object.assign(new Error('Access denied'), { code: 'FORBIDDEN' });
    const seats  = await this.bookingSeatRepo.findByBooking(bookingId);
    const ticket = await this.ticketRepo.findByBooking(bookingId);
    return { booking, seats, ticket };
  }
}

module.exports = BookingService;
