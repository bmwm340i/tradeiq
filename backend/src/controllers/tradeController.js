const Trade = require('../models/Trade');

exports.createTrade = async (req, res, next) => {
  try {
    const trade = await Trade.create({ ...req.body, user: req.user._id });
    res.status(201).json({ trade });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next(err);
  }
};

exports.getTrades = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      symbol,
      direction,
      setup,
      market,
      isWin,
      startDate,
      endDate,
      sortBy = 'entryTime',
      sortOrder = 'desc'
    } = req.query;

    const filter = { user: req.user._id };
    if (symbol) filter.symbol = symbol.toUpperCase();
    if (direction) filter.direction = direction;
    if (setup) filter.setup = setup;
    if (market) filter.market = market;
    if (isWin !== undefined) filter.isWin = isWin === 'true';
    if (startDate || endDate) {
      filter.entryTime = {};
      if (startDate) filter.entryTime.$gte = new Date(startDate);
      if (endDate) filter.entryTime.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [trades, total] = await Promise.all([
      Trade.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Trade.countDocuments(filter)
    ]);

    res.json({
      trades,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, user: req.user._id });
    if (!trade) return res.status(404).json({ error: 'Trade not found' });
    res.json({ trade });
  } catch (err) {
    next(err);
  }
};

exports.updateTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!trade) return res.status(404).json({ error: 'Trade not found' });
    res.json({ trade });
  } catch (err) {
    next(err);
  }
};

exports.deleteTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!trade) return res.status(404).json({ error: 'Trade not found' });
    res.json({ message: 'Trade deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const matchFilter = { user: req.user._id };

    if (startDate || endDate) {
      matchFilter.entryTime = {};
      if (startDate) matchFilter.entryTime.$gte = new Date(startDate);
      if (endDate) matchFilter.entryTime.$lte = new Date(endDate);
    }

    const [overview, bySetup, bySymbol, byHour, byEmotion, recent] = await Promise.all([
      // Overview stats
      Trade.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalTrades: { $sum: 1 },
            wins: { $sum: { $cond: ['$isWin', 1, 0] } },
            losses: { $sum: { $cond: ['$isWin', 0, 1] } },
            totalPnl: { $sum: '$pnl' },
            avgPnl: { $avg: '$pnl' },
            bestTrade: { $max: '$pnl' },
            worstTrade: { $min: '$pnl' },
            avgRMultiple: { $avg: '$rMultiple' },
            profitFactor: {
              $sum: {
                $cond: [{ $gt: ['$pnl', 0] }, '$pnl', 0]
              }
            },
            grossLoss: {
              $sum: {
                $cond: [{ $lt: ['$pnl', 0] }, { $abs: '$pnl' }, 0]
              }
            }
          }
        }
      ]),

      // By setup
      Trade.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$setup',
            count: { $sum: 1 },
            wins: { $sum: { $cond: ['$isWin', 1, 0] } },
            totalPnl: { $sum: '$pnl' }
          }
        },
        { $addFields: { winRate: { $multiply: [{ $divide: ['$wins', '$count'] }, 100] } } },
        { $sort: { totalPnl: -1 } }
      ]),

      // By symbol
      Trade.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$symbol',
            count: { $sum: 1 },
            wins: { $sum: { $cond: ['$isWin', 1, 0] } },
            totalPnl: { $sum: '$pnl' }
          }
        },
        { $addFields: { winRate: { $multiply: [{ $divide: ['$wins', '$count'] }, 100] } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // By hour of day
      Trade.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: { $hour: '$entryTime' },
            count: { $sum: 1 },
            wins: { $sum: { $cond: ['$isWin', 1, 0] } },
            totalPnl: { $sum: '$pnl' }
          }
        },
        { $addFields: { winRate: { $multiply: [{ $divide: ['$wins', '$count'] }, 100] } } },
        { $sort: { _id: 1 } }
      ]),

      // By emotion
      Trade.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$emotion.before',
            count: { $sum: 1 },
            wins: { $sum: { $cond: ['$isWin', 1, 0] } },
            avgPnl: { $avg: '$pnl' }
          }
        },
        { $addFields: { winRate: { $multiply: [{ $divide: ['$wins', '$count'] }, 100] } } }
      ]),

      // Recent daily PnL (last 30 days)
      Trade.aggregate([
        {
          $match: {
            ...matchFilter,
            entryTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$entryTime' }
            },
            dailyPnl: { $sum: '$pnl' },
            count: { $sum: 1 },
            wins: { $sum: { $cond: ['$isWin', 1, 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const stats = overview[0] || {
      totalTrades: 0, wins: 0, losses: 0, totalPnl: 0,
      avgPnl: 0, bestTrade: 0, worstTrade: 0, profitFactor: 0, grossLoss: 0
    };

    res.json({
      overview: {
        ...stats,
        winRate: stats.totalTrades > 0 ? (stats.wins / stats.totalTrades * 100) : 0,
        profitFactor: stats.grossLoss > 0 ? (stats.profitFactor / stats.grossLoss) : null
      },
      bySetup,
      bySymbol,
      byHour,
      byEmotion,
      dailyPnl: recent
    });
  } catch (err) {
    next(err);
  }
};
