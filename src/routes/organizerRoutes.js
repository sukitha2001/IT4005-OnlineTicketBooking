'use strict';
const router    = require('express').Router();
const auth      = require('../middleware/authenticate');
const authz     = require('../middleware/authorize');
const organizer = require('../controllers/OrganizerController');
const { eventRules, showRules, handleValidation } = require('../middleware/validate');

router.use(auth, authz('ORGANIZER'));

router.get('/events',                                     organizer.listEvents.bind(organizer));
router.get('/events/new',                                 organizer.showNewEvent.bind(organizer));
router.post('/events',               eventRules, handleValidation, organizer.createEvent.bind(organizer));
router.get('/events/:eventId/edit',                       organizer.showEditEvent.bind(organizer));
router.post('/events/:eventId',      eventRules, handleValidation, organizer.updateEvent.bind(organizer));
router.post('/events/:eventId/publish',                   organizer.publishEvent.bind(organizer));
router.post('/events/:eventId/unpublish',                 organizer.unpublishEvent.bind(organizer));
router.get('/events/:eventId/shows/new',                  organizer.showNewShow.bind(organizer));
router.post('/events/:eventId/shows', showRules, handleValidation, organizer.createShow.bind(organizer));
router.post('/events/:eventId/announcements',             organizer.createAnnouncement.bind(organizer));

module.exports = router;
