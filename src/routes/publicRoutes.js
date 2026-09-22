'use strict';
const router     = require('express').Router();
const catalog    = require('../controllers/CatalogController');

router.get('/',                    catalog.index.bind(catalog));
router.get('/events',              catalog.search.bind(catalog));
router.get('/events/:eventId',     catalog.eventDetails.bind(catalog));
router.get('/shows/:showId/seats', catalog.showSeats.bind(catalog));

module.exports = router;
