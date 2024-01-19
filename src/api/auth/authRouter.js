const express = require('express');
const router = express.Router();
const authController = require('./authController');

router.post('/signup', authController.signUp);
router.get('/login',authController.login);

module.exports = router;