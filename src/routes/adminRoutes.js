'use strict';
const router = require('express').Router();
const auth   = require('../middleware/authenticate');
const authz  = require('../middleware/authorize');
const admin  = require('../controllers/AdminController');

router.use(auth, authz('SYSTEM_ADMIN'));

router.get('/dashboard',                admin.dashboard.bind(admin));
router.get('/users',                    admin.listUsers.bind(admin));
router.post('/users/:userId/status',    admin.toggleUserStatus.bind(admin));
router.get('/logs',                     admin.viewLogs.bind(admin));
router.post('/announcements',           admin.createAnnouncement.bind(admin));

module.exports = router;
