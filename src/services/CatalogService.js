'use strict';

class CatalogService {
  constructor({ eventRepository, showRepository, showSeatRepository, venueRepository }) {
    this.eventRepo    = eventRepository;
    this.showRepo     = showRepository;
    this.showSeatRepo = showSeatRepository;
    this.venueRepo    = venueRepository;
  }

  async getPublishedEvents(filters = {}) {
    return this.eventRepo.findPublished(filters);
  }

  async getEventDetails(eventId) {
    const event = await this.eventRepo.findById(eventId);
    if (!event || !event.isPublished) {
      const err = new Error('Event not found');
      err.code = 'NOT_FOUND';
      throw err;
    }
    const shows = await this.showRepo.findByEvent(eventId);
    return { event, shows };
  }

  async getShowSeats(showId) {
    const show = await this.showRepo.findById(showId);
    if (!show) { throw Object.assign(new Error('Show not found'), { code: 'NOT_FOUND' }); }
    const venue = await this.venueRepo.findById(show.venueId);
    const seats = await this.showSeatRepo.findByShow(showId);
    return { show, venue, seats };
  }
}

module.exports = CatalogService;
