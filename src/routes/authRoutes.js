'use strict';
const router = require('express').Router();
const auth   = require('../controllers/AuthController');
const { registerRules, loginRules, handleValidation } = require('../middleware/validate');

router.get('/register',  auth.showRegister.bind(auth));
router.post('/register', registerRules, handleValidation, auth.register.bind(auth));
router.get('/login',     auth.showLogin.bind(auth));
router.post('/login',    loginRules, handleValidation, auth.login.bind(auth));
router.post('/logout',   auth.logout.bind(auth));

module.exports = router;
