require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Trade = require('./models/Trade');

const SYMBOLS = ['ES', 'NQ', 'SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT', 'META'];
const SETUPS = ['breakout', 'pullback', 'reversal', 'trend_follow', 'range', 'other'];
const EMOTIONS = ['calm', 'confident', 'anxious', 'excited', 'fearful', 'greedy', 'neutral'];
const AFTER_EMOTIONS = ['calm', 'satisfied', 'regretful', 'angry', 'relieved', 'neutral'];

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.random() * (max - min) + min;

function generateTrade(userId, daysAgo) {
  const entryDate = new Date();
  entryDate.setDate(entryDate.getDate() - daysAgo);
  entryDate.setHours(Math.floor(randomBetween(9, 16)), Math.floor(randomBetween(0, 59)), 0, 0);

  const exitDate = new Date(entryDate);
  exitDate.setMinutes(exitDate.getMinutes() + Math.floor(randomBetween(5, 240)));

  const symbol = randomChoice(SYMBOLS);
  const basePrice = symbol === 'ES' ? 5200 : symbol === 'NQ' ? 18000 : randomBetween(100, 500);
  const direction = randomChoice(['long', 'short']);
  const isWinner = Math.random() > 0.45;
  const entryPrice = parseFloat(basePrice.toFixed(2));
  const movePercent = randomBetween(0.1, 1.5) / 100;
  const exitPrice = isWinner
    ? parseFloat((entryPrice * (direction === 'long' ? 1 + movePercent : 1 - movePercent)).toFixed(2))
    : parseFloat((entryPrice * (direction === 'long' ? 1 - movePercent : 1 + movePercent)).toFixed(2));

  const contracts = Math.floor(randomBetween(1, 10));
  const emotionBefore = randomChoice(EMOTIONS);

  const notes = isWinner
    ? randomChoice([
        'Clean breakout, held my target. Felt in control.',
        'Followed my plan perfectly. Nice R:R trade.',
        'Trend continuation, got in on the pullback.',
        'Setup was crystal clear. Let profits run.'
      ])
    : randomChoice([
        'Entered too early, got stopped out.',
        'Chased the move, bad entry price.',
        'Moved my stop loss, paid for it.',
        'Revenge trade after morning loss. Knew it was wrong.'
      ]);

  return {
    user: userId,
    symbol,
    direction,
    entryPrice,
    exitPrice,
    contracts,
    entryTime: entryDate,
    exitTime: exitDate,
    setup: randomChoice(SETUPS),
    market: ['ES', 'NQ'].includes(symbol) ? 'futures' : 'stocks',
    emotion: {
      before: emotionBefore,
      during: randomChoice(EMOTIONS),
      after: randomChoice(AFTER_EMOTIONS)
    },
    followedPlan: isWinner ? Math.random() > 0.2 : Math.random() > 0.5,
    stopLoss: parseFloat((entryPrice * (direction === 'long' ? 0.99 : 1.01)).toFixed(2)),
    notes
  };
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing demo data
    await User.deleteOne({ email: 'demo@tradeiq.app' });

    const user = await User.create({
      name: 'Alex Trader',
      email: 'demo@tradeiq.app',
      password: 'demo1234',
      tradingStyle: 'day_trading',
      preferredMarkets: ['futures', 'stocks'],
      accountSize: 50000,
      riskPerTrade: 1
    });

    console.log('✅ Demo user created: demo@tradeiq.app / demo1234');

    // Generate 90 days of trades (2-5 trades per day on weekdays)
    const trades = [];
    for (let day = 90; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

      const numTrades = Math.floor(randomBetween(2, 6));
      for (let i = 0; i < numTrades; i++) {
        trades.push(generateTrade(user._id, day));
      }
    }

    await Trade.insertMany(trades);
    console.log(`✅ ${trades.length} sample trades created`);
    console.log('\n🎉 Seed complete! Login with: demo@tradeiq.app / demo1234');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
