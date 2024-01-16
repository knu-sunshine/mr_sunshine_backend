const express = require('express');
const router = express.Router();
const roomController = require('./roomController');

router.post('/room/:room_id/autoon',roomController.setAutoModeOn);
router.post('/room/:room_id/autooff',roomController.setAutoModeOff);
module.exports = router;