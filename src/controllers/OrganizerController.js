'use strict';

const { pool }               = require('../config/database');
const EventRepository        = require('../repositories/EventRepository');
const ShowRepository         = require('../repositories/ShowRepository');
const ShowSeatRepository     = require('../repositories/ShowSeatRepository');
const SeatRepository         = require('../repositories/SeatRepository');
const VenueRepository        = require('../repositories/VenueRepository');
const AnnouncementRepository = require('../repositories/AnnouncementRepository');
const AuditLogRepository     = require('../repositories/AuditLogRepository');
const AuditService           = require('../services/AuditService');
const EventService           = require('../services/EventService');
const AnnouncementService    = require('../services/AnnouncementService');
const OnScreenNotificationSender = require('../strategies/OnScreenNotificationSender');

const auditSvc = new AuditService({ auditLogRepository: new AuditLogRepository(pool) });
const annRepo  = new AnnouncementRepository(pool);
const eventSvc = new EventService({
  eventRepository:    new EventRepository(pool),
  showRepository:     new ShowRepository(pool),
  showSeatRepository: new ShowSeatRepository(pool),
  seatRepository:     new SeatRepository(pool),
  venueRepository:    new VenueRepository(pool),
  auditService:       auditSvc,
});
const annSvc = new AnnouncementService({
  notificationSender: new OnScreenNotificationSender(annRepo),
  eventRepository:    new EventRepository(pool),
});

class OrganizerController {
  async listEvents(req, res, next) {
    try {
      const events = await eventSvc.getOrganizerEvents(req.user.id);
      res.render('organizer/dashboard', { title: 'My Events', events, user: req.user });
    } catch (err) { next(err); }
  }

  showNewEvent(req, res) {
    res.render('organizer/eventForm', { title: 'New Event', event: null, user: req.user });
  }

  async createEvent(req, res, next) {
    try {
      const { title, description, type, genre, durationMinutes, imageUrl } = req.body;
      await eventSvc.createEvent(req.user.id, { title, description, type, genre, durationMinutes: parseInt(durationMinutes,10), imageUrl });
      req.flash('success', 'Event created successfully');
      res.redirect('/organizer/events');
    } catch (err) { next(err); }
  }

  async showEditEvent(req, res, next) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const events  = await eventSvc.getOrganizerEvents(req.user.id);
      const event   = events.find(e => e.id === eventId);
      if (!event) return next(Object.assign(new Error('Not found'), { code: 'NOT_FOUND' }));
      const venues  = await new VenueRepository(pool).findAll();
      res.render('organizer/eventForm', { title: 'Edit Event', event, venues, user: req.user });
    } catch (err) { next(err); }
  }

  async updateEvent(req, res, next) {
    try {
      const { title, description, type, genre, durationMinutes, imageUrl } = req.body;
      await eventSvc.updateEvent(parseInt(req.params.eventId, 10), req.user.id,
        { title, description, type, genre, durationMinutes: parseInt(durationMinutes,10), imageUrl });
      req.flash('success', 'Event updated');
      res.redirect('/organizer/events');
    } catch (err) { next(err); }
  }

  async unpublishEvent(req, res, next) {
    try {
      await eventSvc.unpublishEvent(parseInt(req.params.eventId, 10), req.user.id);
      req.flash('success', 'Event unpublished');
      res.redirect('/organizer/events');
    } catch (err) { next(err); }
  }

  async publishEvent(req, res, next) {
    try {
      await eventSvc.publishEvent(parseInt(req.params.eventId, 10), req.user.id);
      req.flash('success', 'Event published');
      res.redirect('/organizer/events');
    } catch (err) { next(err); }
  }

  async showNewShow(req, res, next) {
    try {
      const venues = await new VenueRepository(pool).findAll();
      res.render('organizer/showForm', { title: 'Add Show', eventId: req.params.eventId, venues, user: req.user });
    } catch (err) { next(err); }
  }

  async createShow(req, res, next) {
    try {
      const { venueId, startTime, basePrice } = req.body;
      await eventSvc.createShow(parseInt(req.params.eventId, 10), req.user.id,
        { venueId: parseInt(venueId, 10), startTime, basePrice: parseFloat(basePrice) });
      req.flash('success', 'Show added successfully');
      res.redirect('/organizer/events');
    } catch (err) { next(err); }
  }

  async createAnnouncement(req, res, next) {
    try {
      await annSvc.createEventAnnouncement(req.user.id, parseInt(req.params.eventId, 10), req.body.message);
      req.flash('success', 'Announcement sent');
      res.redirect('/organizer/events');
    } catch (err) { next(err); }
  }
}

module.exports = new OrganizerController();
