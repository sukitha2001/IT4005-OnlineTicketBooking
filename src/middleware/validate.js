'use strict';

const { body, param, validationResult } = require('express-validator');

/** Helper — collect errors and redirect with flash if invalid. */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    req.flash('error', messages.join('; '));
    return res.redirect('back');
  }
  next();
}

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const bookingRules = [
  body('showSeatIds').isArray({ min: 1 }).withMessage('Select at least one seat'),
  body('showSeatIds.*').isInt({ min: 1 }).withMessage('Invalid seat ID'),
  body('showId').isInt({ min: 1 }).withMessage('Invalid show'),
];

const eventRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['MOVIE','CONCERT','SPORT','THEATRE','OTHER']).withMessage('Invalid event type'),
];

const showRules = [
  body('venueId').isInt({ min: 1 }).withMessage('Venue is required'),
  body('startTime').isISO8601().withMessage('Valid start time required'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be 0 or more'),
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  bookingRules,
  eventRules,
  showRules,
};
