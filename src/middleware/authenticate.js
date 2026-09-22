'use strict';

const { pool } = require('../config/database');
const UserRepository = require('../repositories/UserRepository');
const userRepo = new UserRepository(pool);

/**
 * authenticate middleware — checks session, loads user, attaches to req.user.
 * Redirects to /login if unauthenticated.
 */
async function authenticate(req, res, next) {
  if (!req.session.userId) {
    req.flash('error', 'Please log in to continue');
    return res.redirect('/login');
  }
  try {
    const user = await userRepo.findById(req.session.userId);
    if (!user || !user.isActive) {
      req.session.destroy(() => {});
      req.flash('error', 'Your session has expired. Please log in again.');
      return res.redirect('/login');
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;
