const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are TradeIQ's AI analyst — an elite trading psychology expert and performance coach. You analyze trading journals to identify behavioral patterns, psychological biases, and areas for improvement.

Your analysis is:
- Data-driven and specific (reference actual trade details)
- Psychologically insightful (identify cognitive biases and emotional patterns)
- Actionable (give concrete, implementable advice)
- Honest but constructive (don't sugarcoat mistakes)

You detect these specific patterns:
- REVENGE TRADING: Trading immediately after a loss with larger size or worse entries
- OVERSIZING: Position sizes that exceed risk management rules
- FOMO: Entering late in moves, chasing breakouts without pullbacks
- NO STOP LOSS: Trades without defined risk or letting losers run
- EMOTIONAL TRADING: Decisions driven by fear, greed, or frustration
- PLAN DEVIATION: Not following the stated trading plan or setup criteria
- OVERTRADING: Too many trades in a session, especially after losers

Always respond in valid JSON format as specified.`;

exports.analyzeWeeklyTrades = async (trades, userStats, userProfile) => {
  const tradesSummary = trades.map(t => ({
    date: new Date(t.entryTime).toLocaleDateString(),
    time: new Date(t.entryTime).toLocaleTimeString(),
    symbol: t.symbol,
    direction: t.direction,
    setup: t.setup,
    pnl: t.pnl?.toFixed(2),
    rMultiple: t.rMultiple?.toFixed(2),
    emotion: t.emotion,
    followedPlan: t.followedPlan,
    notes: t.notes,
    hasStopLoss: !!t.stopLoss
  }));

  const prompt = `Analyze this trader's performance for the past week.

TRADER PROFILE:
- Trading style: ${userProfile.tradingStyle}
- Risk per trade: ${userProfile.riskPerTrade}%
- Account size: $${userProfile.accountSize?.toLocaleString()}

WEEKLY STATS:
- Total trades: ${userStats.totalTrades}
- Win rate: ${userStats.winRate?.toFixed(1)}%
- Total P&L: $${userStats.totalPnl?.toFixed(2)}
- Average P&L per trade: $${userStats.avgPnl?.toFixed(2)}
- Best trade: $${userStats.bestTrade?.toFixed(2)}
- Worst trade: $${userStats.worstTrade?.toFixed(2)}
- Profit factor: ${userStats.profitFactor?.toFixed(2)}

TRADES THIS WEEK:
${JSON.stringify(tradesSummary, null, 2)}

Provide a comprehensive weekly analysis. Return ONLY valid JSON in this exact format:
{
  "overallGrade": "A/B/C/D/F",
  "gradeRationale": "One sentence explaining the grade",
  "summary": "2-3 sentence executive summary of their trading week",
  "behavioralPatterns": [
    {
      "pattern": "Pattern name",
      "severity": "high/medium/low",
      "detected": true/false,
      "description": "Specific description with trade examples",
      "frequency": "How often detected",
      "impact": "Financial impact estimate"
    }
  ],
  "strengths": [
    {
      "title": "Strength name",
      "description": "What they did well with specific examples"
    }
  ],
  "improvements": [
    {
      "priority": 1,
      "title": "Improvement title",
      "description": "Specific description of the problem",
      "actionStep": "Concrete action to take",
      "expectedImpact": "Expected improvement in results"
    }
  ],
  "psychologicalInsight": "Deep psychological insight about their trading mindset",
  "bestTradingWindow": {
    "timeRange": "Time range they trade best",
    "winRate": "Win rate during this window",
    "recommendation": "Specific recommendation"
  },
  "nextWeekFocus": ["Focus point 1", "Focus point 2", "Focus point 3"],
  "aiConfidence": 0.85
}`;

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');
  return JSON.parse(jsonMatch[0]);
};

exports.flagTradePatterns = async (trades) => {
  if (!trades.length) return [];

  const tradeData = trades.map(t => ({
    id: t._id,
    symbol: t.symbol,
    direction: t.direction,
    entryTime: t.entryTime,
    pnl: t.pnl,
    contracts: t.contracts,
    emotion: t.emotion?.before,
    followedPlan: t.followedPlan,
    hasStopLoss: !!t.stopLoss,
    notes: t.notes?.substring(0, 200)
  }));

  const prompt = `Analyze these trades for behavioral red flags.

TRADES:
${JSON.stringify(tradeData, null, 2)}

Return ONLY valid JSON array:
[
  {
    "tradeId": "id",
    "flags": ["revenge_trade", "oversize", "fomo", "no_stop_loss", "emotional", "plan_deviation", "overtrading"]
  }
]

Only include trades that have flags. Use empty array [] if no flags detected.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  return JSON.parse(jsonMatch[0]);
};

exports.getQuickInsight = async (trade) => {
  const prompt = `Quickly analyze this single trade and provide brief feedback.

TRADE:
- Symbol: ${trade.symbol} (${trade.direction})
- Entry: $${trade.entryPrice} → Exit: $${trade.exitPrice}
- P&L: $${trade.pnl?.toFixed(2)} (${trade.pnlPercent?.toFixed(1)}%)
- Setup: ${trade.setup}
- Emotion before: ${trade.emotion?.before}
- Followed plan: ${trade.followedPlan}
- Notes: ${trade.notes}

Return ONLY valid JSON:
{
  "quality": "excellent/good/average/poor",
  "insight": "One specific insight about this trade",
  "lesson": "Key takeaway or lesson",
  "flags": []
}`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  return JSON.parse(jsonMatch[0]);
};
