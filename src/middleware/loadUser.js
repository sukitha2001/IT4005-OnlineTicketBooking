'use strict';

const { pool } = require('../config/database');
const UserRepository = require('../repositories/UserRepository');
const userRepo = new UserRepository(pool);

/**
 * loadUser middleware — silently loads req.user from session if a userId
 * is present. Unlike `authenticate`, this never redirects; it simply
 * populates req.user so that public views (navbar, seat map, etc.) can
 * show the correct state for logged-in visitors.
 *
 * Must be registered as global middleware in app.js BEFORE routes.
 */
async function loadUser(req, res, next) {
  if (!req.session.userId) {
    return next();
  }
  try {
    const user = await userRepo.findById(req.session.userId);
    if (user && user.isActive) {
      req.user = user;
    } else {
      // Session references an invalid/inactive account — clear it silently.
      req.session.destroy(() => {});
    }
  } catch (_err) {
    // Non-fatal: if the DB lookup fails we just proceed without a user.
  }
  next();
}

module.exports = loadUser;
