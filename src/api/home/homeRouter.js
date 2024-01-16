const express = require('express');
const router = express.Router();
const roomController = require('./homeController');

router.post('/addRoom', roomController.addRoom);
router.get('/',roomController.getRoomList);
router.get('/getSunriseTime',roomController.getSunriseTime);
router.get('/getSunsetTime',roomController.getSunsetTime);

module.exports = router;