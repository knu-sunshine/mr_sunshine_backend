const express = require('express');
const router = express.Router();
const deviceController = require('./deviceController');

router.post('/room/:roomId/device/:deviceId/setwv', deviceController.setWakeUpValue);

module.exports = router;