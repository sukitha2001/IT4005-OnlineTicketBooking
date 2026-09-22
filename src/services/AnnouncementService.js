'use strict';

class AnnouncementService {
  constructor({ notificationSender, eventRepository }) {
    this.notifier  = notificationSender; // Strategy pattern
    this.eventRepo = eventRepository;
  }

  async createEventAnnouncement(organizerId, eventId, message) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw Object.assign(new Error('Event not found'), { code: 'NOT_FOUND' });
    if (!event.isOwnedBy(organizerId)) throw Object.assign(new Error('Access denied'), { code: 'FORBIDDEN' });
    return this.notifier.send({ authorId: organizerId, eventId, audience: 'CUSTOMERS', message });
  }

  async createPlatformAnnouncement(adminId, message) {
    return this.notifier.send({ authorId: adminId, eventId: null, audience: 'ALL', message });
  }
}

module.exports = AnnouncementService;
