const express = require('express');
const router = express.Router();
const roomController = require('./Controller');

// POST /home/createroom
router.post('/addRoom', roomController.createRoom);
router.get('/',roomController.getRoomList);
router.get('/getSunriseTime',roomController.getSunriseTime);
router.get('/getSunsetTime',roomController.getSunsetTime);

module.exports = router;