const Trade = require('../models/Trade');
const aiService = require('../services/aiService');

exports.getWeeklyAnalysis = async (req, res, next) => {
  try {
    const { weekOffset = 0 } = req.query;
    const offset = parseInt(weekOffset);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() - offset * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const trades = await Trade.find({
      user: req.user._id,
      entryTime: { $gte: startOfWeek, $lte: endOfWeek }
    }).sort({ entryTime: 1 });

    if (trades.length === 0) {
      return res.json({
        message: 'No trades found for this week',
        weekRange: { start: startOfWeek, end: endOfWeek },
        analysis: null
      });
    }

    // Calculate weekly stats
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.isWin).length;
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossProfit = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));

    const weeklyStats = {
      totalTrades,
      wins,
      losses: totalTrades - wins,
      winRate: totalTrades > 0 ? (wins / totalTrades * 100) : 0,
      totalPnl,
      avgPnl: totalTrades > 0 ? totalPnl / totalTrades : 0,
      bestTrade: Math.max(...trades.map(t => t.pnl || 0)),
      worstTrade: Math.min(...trades.map(t => t.pnl || 0)),
      profitFactor: grossLoss > 0 ? grossProfit / grossLoss : null
    };

    const analysis = await aiService.analyzeWeeklyTrades(trades, weeklyStats, {
      tradingStyle: req.user.tradingStyle,
      riskPerTrade: req.user.riskPerTrade,
      accountSize: req.user.accountSize
    });

    res.json({
      weekRange: { start: startOfWeek, end: endOfWeek },
      weeklyStats,
      analysis,
      tradeCount: trades.length
    });
  } catch (err) {
    next(err);
  }
};

exports.flagTrades = async (req, res, next) => {
  try {
    const { tradeIds } = req.body;

    let trades;
    if (tradeIds && tradeIds.length > 0) {
      trades = await Trade.find({ _id: { $in: tradeIds }, user: req.user._id });
    } else {
      // Flag last 50 unanalyzed trades
      trades = await Trade.find({ user: req.user._id, aiAnalyzed: false })
        .sort({ entryTime: -1 })
        .limit(50);
    }

    if (trades.length === 0) {
      return res.json({ message: 'No trades to analyze', flagged: [] });
    }

    const flagResults = await aiService.flagTradePatterns(trades);

    // Update trades with AI flags
    const updatePromises = flagResults.map(result =>
      Trade.findByIdAndUpdate(result.tradeId, {
        aiFlags: result.flags,
        aiAnalyzed: true
      })
    );

    // Mark analyzed trades that had no flags
    const flaggedIds = new Set(flagResults.map(r => r.tradeId));
    const noFlagUpdates = trades
      .filter(t => !flaggedIds.has(t._id.toString()))
      .map(t => Trade.findByIdAndUpdate(t._id, { aiAnalyzed: true }));

    await Promise.all([...updatePromises, ...noFlagUpdates]);

    res.json({
      analyzed: trades.length,
      flagged: flagResults.length,
      results: flagResults
    });
  } catch (err) {
    next(err);
  }
};

exports.getQuickInsight = async (req, res, next) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.tradeId, user: req.user._id });
    if (!trade) return res.status(404).json({ error: 'Trade not found' });

    const insight = await aiService.getQuickInsight(trade);
    res.json({ insight });
  } catch (err) {
    next(err);
  }
};
