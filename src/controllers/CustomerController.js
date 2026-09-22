'use strict';

const { pool }        = require('../config/database');
const UserRepository  = require('../repositories/UserRepository');
const AuditLogRepository = require('../repositories/AuditLogRepository');
const AuditService    = require('../services/AuditService');
const AuthService     = require('../services/AuthService');

const auditSvc = new AuditService({ auditLogRepository: new AuditLogRepository(pool) });
const authSvc  = new AuthService({ userRepository: new UserRepository(pool), auditService: auditSvc });

class CustomerController {
  showProfile(req, res) {
    res.render('customer/profile', { title: 'My Profile', user: req.user });
  }

  async updateProfile(req, res, next) {
    try {
      const { name, email } = req.body;
      await authSvc.updateProfile({ userId: req.user.id, name, email });
      req.flash('success', 'Profile updated successfully');
      res.redirect('/customer/profile');
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') {
        req.flash('error', err.message);
        return res.redirect('/customer/profile');
      }
      next(err);
    }
  }
}

module.exports = new CustomerController();
