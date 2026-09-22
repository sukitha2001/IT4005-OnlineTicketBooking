'use strict';

class ReportService {
  constructor({ bookingRepository, bookingSeatRepository, eventRepository }) {
    this.bookingRepo     = bookingRepository;
    this.bookingSeatRepo = bookingSeatRepository;
    this.eventRepo       = eventRepository;
  }

  async getEventReport(eventId, organizerId) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw Object.assign(new Error('Event not found'), { code: 'NOT_FOUND' });
    if (!event.isOwnedBy(organizerId)) throw Object.assign(new Error('Access denied'), { code: 'FORBIDDEN' });
    const bookings = await this.bookingRepo.findByShow(eventId); // approximation — can refine
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    return { event, bookingCount: bookings.length, totalRevenue, bookings };
  }
}

module.exports = ReportService;
