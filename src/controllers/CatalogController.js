'use strict';

const { pool }              = require('../config/database');
const EventRepository       = require('../repositories/EventRepository');
const ShowRepository        = require('../repositories/ShowRepository');
const ShowSeatRepository    = require('../repositories/ShowSeatRepository');
const VenueRepository       = require('../repositories/VenueRepository');
const CatalogService        = require('../services/CatalogService');

const catalogSvc = new CatalogService({
  eventRepository:    new EventRepository(pool),
  showRepository:     new ShowRepository(pool),
  showSeatRepository: new ShowSeatRepository(pool),
  venueRepository:    new VenueRepository(pool),
});

class CatalogController {
  async index(req, res, next) {
    try {
      const events = await catalogSvc.getPublishedEvents({});
      res.render('public/home', { title: 'Browse Events', events, user: req.user || null, filters: {} });
    } catch (err) { next(err); }
  }

  async search(req, res, next) {
    try {
      const filters = { type: req.query.type, genre: req.query.genre, search: req.query.search };
      const events  = await catalogSvc.getPublishedEvents(filters);
      res.render('public/home', { title: 'Search Results', events, user: req.user || null, filters });
    } catch (err) { next(err); }
  }

  async eventDetails(req, res, next) {
    try {
      const { event, shows } = await catalogSvc.getEventDetails(parseInt(req.params.eventId, 10));
      res.render('public/eventDetails', { title: event.title, event, shows, user: req.user || null });
    } catch (err) { next(err); }
  }

  async showSeats(req, res, next) {
    try {
      const { show, venue, seats } = await catalogSvc.getShowSeats(parseInt(req.params.showId, 10));
      res.render('public/seatMap', { title: 'Select Seats', show, venue, seats, user: req.user || null });
    } catch (err) { next(err); }
  }
}

module.exports = new CatalogController();
