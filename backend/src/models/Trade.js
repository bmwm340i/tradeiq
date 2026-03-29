const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: [true, 'Symbol is required'],
    uppercase: true,
    trim: true
  },
  direction: {
    type: String,
    enum: ['long', 'short'],
    required: [true, 'Direction is required']
  },
  entryPrice: {
    type: Number,
    required: [true, 'Entry price is required'],
    min: 0
  },
  exitPrice: {
    type: Number,
    required: [true, 'Exit price is required'],
    min: 0
  },
  contracts: {
    type: Number,
    required: [true, 'Contracts/shares is required'],
    min: 0
  },
  entryTime: {
    type: Date,
    required: [true, 'Entry time is required']
  },
  exitTime: {
    type: Date,
    required: [true, 'Exit time is required']
  },
  setup: {
    type: String,
    enum: ['breakout', 'pullback', 'reversal', 'trend_follow', 'range', 'news', 'other'],
    default: 'other'
  },
  market: {
    type: String,
    enum: ['stocks', 'options', 'futures', 'forex', 'crypto'],
    default: 'stocks'
  },
  emotion: {
    before: {
      type: String,
      enum: ['calm', 'confident', 'anxious', 'excited', 'fearful', 'greedy', 'neutral'],
      default: 'neutral'
    },
    during: {
      type: String,
      enum: ['calm', 'confident', 'anxious', 'excited', 'fearful', 'greedy', 'neutral'],
      default: 'neutral'
    },
    after: {
      type: String,
      enum: ['calm', 'satisfied', 'regretful', 'angry', 'relieved', 'neutral'],
      default: 'neutral'
    }
  },
  followedPlan: {
    type: Boolean,
    default: true
  },
  stopLoss: {
    type: Number,
    default: null
  },
  takeProfit: {
    type: Number,
    default: null
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    default: ''
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  screenshots: [{
    type: String
  }],
  // Computed fields
  pnl: {
    type: Number,
    default: 0
  },
  pnlPercent: {
    type: Number,
    default: 0
  },
  isWin: {
    type: Boolean,
    default: false
  },
  rMultiple: {
    type: Number,
    default: null
  },
  // AI flags
  aiFlags: [{
    type: String,
    enum: ['revenge_trade', 'oversize', 'fomo', 'no_stop_loss', 'emotional', 'plan_deviation', 'overtrading']
  }],
  aiAnalyzed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compute PnL before save
tradeSchema.pre('save', function(next) {
  const multiplier = this.direction === 'long' ? 1 : -1;
  this.pnl = multiplier * (this.exitPrice - this.entryPrice) * this.contracts;
  this.pnlPercent = multiplier * ((this.exitPrice - this.entryPrice) / this.entryPrice) * 100;
  this.isWin = this.pnl > 0;

  if (this.stopLoss && this.entryPrice !== this.stopLoss) {
    const risk = Math.abs(this.entryPrice - this.stopLoss) * this.contracts;
    this.rMultiple = risk > 0 ? this.pnl / risk : null;
  }

  next();
});

// Indexes for common queries
tradeSchema.index({ user: 1, entryTime: -1 });
tradeSchema.index({ user: 1, createdAt: -1 });
tradeSchema.index({ user: 1, symbol: 1 });
tradeSchema.index({ user: 1, isWin: 1 });

module.exports = mongoose.model('Trade', tradeSchema);
