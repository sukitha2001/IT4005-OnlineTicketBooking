'use strict';

class EventService {
  constructor({ eventRepository, showRepository, showSeatRepository, seatRepository, venueRepository, auditService }) {
    this.eventRepo    = eventRepository;
    this.showRepo     = showRepository;
    this.showSeatRepo = showSeatRepository;
    this.seatRepo     = seatRepository;
    this.venueRepo    = venueRepository;
    this.auditSvc     = auditService;
  }

  async createEvent(organizerId, data) {
    return this.eventRepo.create({ ...data, organizerId });
  }

  async updateEvent(eventId, organizerId, data) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw Object.assign(new Error('Event not found'), { code: 'NOT_FOUND' });
    if (!event.isOwnedBy(organizerId)) throw Object.assign(new Error('Access denied'), { code: 'FORBIDDEN' });
    return this.eventRepo.update({ id: eventId, ...data });
  }

  async publishEvent(eventId, organizerId) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw Object.assign(new Error('Event not found'), { code: 'NOT_FOUND' });
    if (!event.isOwnedBy(organizerId)) throw Object.assign(new Error('Access denied'), { code: 'FORBIDDEN' });
    event.publish(); // Model validates state transition
    await this.eventRepo.updateStatus(eventId, 'PUBLISHED');
    await this.auditSvc.log({ actorId: organizerId, action: 'EVENT_PUBLISHED', entityType: 'EVENT', entityId: eventId });
  }

  async unpublishEvent(eventId, organizerId) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw Object.assign(new Error('Event not found'), { code: 'NOT_FOUND' });
    if (!event.isOwnedBy(organizerId)) throw Object.assign(new Error('Access denied'), { code: 'FORBIDDEN' });
    event.unpublish();
    await this.eventRepo.updateStatus(eventId, 'UNPUBLISHED');
    await this.auditSvc.log({ actorId: organizerId, action: 'EVENT_UNPUBLISHED', entityType: 'EVENT', entityId: eventId });
  }

  async createShow(eventId, organizerId, { venueId, startTime, basePrice }) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw Object.assign(new Error('Event not found'), { code: 'NOT_FOUND' });
    if (!event.isOwnedBy(organizerId)) throw Object.assign(new Error('Access denied'), { code: 'FORBIDDEN' });
    const show = await this.showRepo.create({ eventId, venueId, startTime, basePrice });
    // Auto-populate show_seats from venue seats
    const seats = await this.seatRepo.findByVenue(venueId);
    await this.showSeatRepo.createBulk(show.id, seats.map(s => ({ seatId: s.id, price: basePrice })));
    return show;
  }

  async getOrganizerEvents(organizerId) {
    return this.eventRepo.findByOrganizer(organizerId);
  }
}

module.exports = EventService;
