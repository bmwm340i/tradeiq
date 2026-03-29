const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/stats', tradeController.getStats);
router.get('/', tradeController.getTrades);
router.post('/', tradeController.createTrade);
router.get('/:id', tradeController.getTrade);
router.put('/:id', tradeController.updateTrade);
router.delete('/:id', tradeController.deleteTrade);

module.exports = router;
