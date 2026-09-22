'use strict';

const { pool }               = require('../config/database');
const BookingRepository      = require('../repositories/BookingRepository');
const BookingSeatRepository  = require('../repositories/BookingSeatRepository');
const ShowSeatRepository     = require('../repositories/ShowSeatRepository');
const PaymentRepository      = require('../repositories/PaymentRepository');
const TicketRepository       = require('../repositories/TicketRepository');
const AuditLogRepository     = require('../repositories/AuditLogRepository');
const AuditService           = require('../services/AuditService');
const TicketService          = require('../services/TicketService');
const BookingService         = require('../services/BookingService');
const SimulatedPaymentStrategy = require('../strategies/SimulatedPaymentStrategy');

const auditSvc   = new AuditService({ auditLogRepository: new AuditLogRepository(pool) });
const ticketRepo = new TicketRepository(pool);
const ticketSvc  = new TicketService({ ticketRepository: ticketRepo });

const bookingSvc = new BookingService({
  bookingRepository:     new BookingRepository(pool),
  bookingSeatRepository: new BookingSeatRepository(pool),
  showSeatRepository:    new ShowSeatRepository(pool),
  paymentRepository:     new PaymentRepository(pool),
  ticketRepository:      ticketRepo,
  paymentStrategy:       new SimulatedPaymentStrategy(),
  ticketService:         ticketSvc,
  auditService:          auditSvc,
});

class BookingController {
  async createBooking(req, res, next) {
    try {
      let { showId, showSeatIds, paymentMethod, simulatedResult } = req.body;
      showId       = parseInt(showId, 10);
      showSeatIds  = (Array.isArray(showSeatIds) ? showSeatIds : [showSeatIds]).map(Number).filter(Boolean);
      const { booking, ticket } = await bookingSvc.createBooking({
        userId: req.user.id, showId, showSeatIds,
        paymentMethod: paymentMethod || 'SIMULATED',
        simulatedResult: simulatedResult || 'success',
      });
      res.redirect(`/customer/bookings/${booking.id}`);
    } catch (err) {
      if (err.code === 'SEAT_CONFLICT' || err.code === 'PAYMENT_FAILED') {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      next(err);
    }
  }

  async bookingHistory(req, res, next) {
    try {
      const bookings = await bookingSvc.getBookingHistory(req.user.id);
      res.render('customer/bookingHistory', { title: 'My Bookings', bookings, user: req.user });
    } catch (err) { next(err); }
  }

  async bookingDetails(req, res, next) {
    try {
      const { booking, seats, ticket } = await bookingSvc.getBookingDetails(
        parseInt(req.params.bookingId, 10), req.user.id
      );
      res.render('customer/bookingDetails', { title: `Booking ${booking.reference}`, booking, seats, ticket, user: req.user });
    } catch (err) { next(err); }
  }

  async showTicket(req, res, next) {
    try {
      const { ticket, qrDataUrl } = await ticketSvc.getTicketWithQR(parseInt(req.params.ticketId, 10));
      // Verify ownership via booking
      const { booking } = await bookingSvc.getBookingDetails(ticket.bookingId, req.user.id);
      res.render('customer/ticket', { title: 'E-Ticket', ticket, booking, qrDataUrl, user: req.user });
    } catch (err) { next(err); }
  }
}

module.exports = new BookingController();
