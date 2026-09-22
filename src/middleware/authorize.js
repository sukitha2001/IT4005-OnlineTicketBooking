'use strict';

/**
 * authorize — Factory Pattern middleware generator.
 * Design Pattern: Factory — returns a different middleware for each role set.
 *
 * Usage:
 *   router.get('/admin/users', authenticate, authorize('SYSTEM_ADMIN'), ...)
 *   router.get('/organizer', authenticate, authorize('ORGANIZER'), ...)
 *
 * @param {...string} allowedRoles
 * @returns {Function} Express middleware
 */
function authorize(...allowedRoles) {
  return function authorizationMiddleware(req, res, next) {
    if (!req.user) {
      return res.redirect('/login');
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).render('errors/403', {
        title: 'Access Denied',
        user: req.user,
      });
    }
    next();
  };
}

module.exports = authorize;
