'use strict';
const router   = require('express').Router();
const auth     = require('../middleware/authenticate');
const authz    = require('../middleware/authorize');
const booking  = require('../controllers/BookingController');
const customer = require('../controllers/CustomerController');

// All routes require login + CUSTOMER role
router.use(auth, authz('CUSTOMER'));

router.get('/profile',               customer.showProfile.bind(customer));
router.post('/profile',              customer.updateProfile.bind(customer));
router.post('/bookings',             booking.createBooking.bind(booking));
router.get('/bookings',              booking.bookingHistory.bind(booking));
router.get('/bookings/:bookingId',   booking.bookingDetails.bind(booking));
router.get('/tickets/:ticketId',     booking.showTicket.bind(booking));

module.exports = router;
