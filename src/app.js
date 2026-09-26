'use strict';

require('dotenv').config();
const express      = require('express');
const path         = require('path');
const session      = require('express-session');
const flash        = require('connect-flash');
const sessionCfg   = require('./config/session');

const publicRoutes   = require('./routes/publicRoutes');
const authRoutes     = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
const adminRoutes    = require('./routes/adminRoutes');
const errorHandler   = require('./middleware/errorHandler');
const loadUser       = require('./middleware/loadUser');

const app = express();

// ── View engine ──────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static files ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Body parsing ─────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Session ───────────────────────────────────────────────────
app.use(session(sessionCfg));

// ── Flash messages ────────────────────────────────────────────
app.use(flash());

// ── Load user from session (non-redirecting) ──────────────────
app.use(loadUser);

// ── Make flash + user available in all views ─────────────────
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error   = req.flash('error');
  res.locals.user    = req.user || null;
  next();
});

// ── Routes ───────────────────────────────────────────────────
app.use('/',            publicRoutes);
app.use('/',            authRoutes);
app.use('/customer',    customerRoutes);
app.use('/organizer',   organizerRoutes);
app.use('/admin',       adminRoutes);

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('errors/404', { title: '404 Not Found', user: req.user || null });
});

// ── Central error handler (must be last) ─────────────────────
app.use(errorHandler);

module.exports = app;
