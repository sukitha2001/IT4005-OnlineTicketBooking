'use strict';

const { pool }           = require('../config/database');
const UserRepository     = require('../repositories/UserRepository');
const AuditLogRepository = require('../repositories/AuditLogRepository');
const AuditService       = require('../services/AuditService');
const AuthService        = require('../services/AuthService');

const userRepo     = new UserRepository(pool);
const auditLogRepo = new AuditLogRepository(pool);
const auditSvc     = new AuditService({ auditLogRepository: auditLogRepo });
const authSvc      = new AuthService({ userRepository: userRepo, auditService: auditSvc });

class AuthController {
  showRegister(req, res) {
    res.render('auth/register', { title: 'Register', errors: [], old: {}, user: null });
  }

  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      await authSvc.register({ name, email, password });
      req.flash('success', 'Account created! Please log in.');
      res.redirect('/login');
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') {
        req.flash('error', err.message);
        return res.redirect('/register');
      }
      next(err);
    }
  }

  showLogin(req, res) {
    res.render('auth/login', { title: 'Login', user: null });
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await authSvc.login({ email, password });
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.userId = user.id;
        req.session.save(() => {
          // Redirect based on role
          if (user.role === 'SYSTEM_ADMIN') return res.redirect('/admin/dashboard');
          if (user.role === 'ORGANIZER')    return res.redirect('/organizer/events');
          res.redirect('/');
        });
      });
    } catch (err) {
      if (err.code === 'AUTH_FAILED') {
        req.flash('error', err.message);
        return res.redirect('/login');
      }
      next(err);
    }
  }

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
}

module.exports = new AuthController();
