'use strict';

/**
 * Central error handler — the last middleware in the chain.
 * Distinguishes validation, auth, ownership, not-found, and server errors.
 */
function errorHandler(err, req, res, next) {
  console.error('[ErrorHandler]', err.message, err.stack);

  if (err.code === 'NOT_FOUND') {
    return res.status(404).render('errors/404', { title: 'Not Found', user: req.user });
  }
  if (err.code === 'FORBIDDEN') {
    return res.status(403).render('errors/403', { title: 'Access Denied', user: req.user });
  }
  if (err.code === 'AUTH_FAILED') {
    req.flash('error', err.message);
    return res.redirect('/login');
  }
  if (err.code === 'SEAT_CONFLICT') {
    req.flash('error', err.message);
    return res.redirect('back');
  }
  if (err.code === 'PAYMENT_FAILED') {
    req.flash('error', err.message);
    return res.redirect('back');
  }
  if (err.code === 'EMAIL_TAKEN') {
    req.flash('error', err.message);
    return res.redirect('back');
  }

  // Generic server error — show correlation ID, hide internals from user
  const correlationId = Date.now();
  console.error(`[${correlationId}]`, err);
  return res.status(500).render('errors/500', {
    title: 'Server Error',
    correlationId,
    user: req.user,
  });
}

module.exports = errorHandler;
