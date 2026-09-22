'use strict';

const { pool }               = require('../config/database');
const UserRepository         = require('../repositories/UserRepository');
const AnnouncementRepository = require('../repositories/AnnouncementRepository');
const AuditLogRepository     = require('../repositories/AuditLogRepository');
const EventRepository        = require('../repositories/EventRepository');
const AuditService           = require('../services/AuditService');
const UserService            = require('../services/UserService');
const AnnouncementService    = require('../services/AnnouncementService');
const OnScreenNotificationSender = require('../strategies/OnScreenNotificationSender');

const auditSvc = new AuditService({ auditLogRepository: new AuditLogRepository(pool) });
const userSvc  = new UserService({ userRepository: new UserRepository(pool), auditService: auditSvc });
const annSvc   = new AnnouncementService({
  notificationSender: new OnScreenNotificationSender(new AnnouncementRepository(pool)),
  eventRepository:    new EventRepository(pool),
});

class AdminController {
  async dashboard(req, res, next) {
    try {
      const users = await userSvc.getAllUsers({});
      res.render('admin/dashboard', { title: 'Admin Dashboard', users, user: req.user });
    } catch (err) { next(err); }
  }

  async listUsers(req, res, next) {
    try {
      const { search, role } = req.query;
      const users = await userSvc.getAllUsers({ search, role });
      res.render('admin/users', { title: 'User Management', users, user: req.user, filters: { search, role } });
    } catch (err) { next(err); }
  }

  async toggleUserStatus(req, res, next) {
    try {
      await userSvc.toggleStatus(parseInt(req.params.userId, 10), req.user.id);
      req.flash('success', 'User status updated');
      res.redirect('/admin/users');
    } catch (err) { next(err); }
  }

  async viewLogs(req, res, next) {
    try {
      const logs = await auditSvc.getLogs({ limit: 100 });
      res.render('admin/logs', { title: 'Audit Logs', logs, user: req.user });
    } catch (err) { next(err); }
  }

  async createAnnouncement(req, res, next) {
    try {
      await annSvc.createPlatformAnnouncement(req.user.id, req.body.message);
      req.flash('success', 'Announcement created');
      res.redirect('/admin/dashboard');
    } catch (err) { next(err); }
  }
}

module.exports = new AdminController();
