const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/weekly', analysisController.getWeeklyAnalysis);
router.post('/flag-trades', analysisController.flagTrades);
router.get('/insight/:tradeId', analysisController.getQuickInsight);

module.exports = router;
