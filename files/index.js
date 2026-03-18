const express = require("express");
const app = express();
app.use(express.json());

// ─── Sentiment engine ────────────────────────────────────────────────────────

const POSITIVE_WORDS = [
  "surge", "soar", "gain", "rise", "record", "profit", "growth", "rally",
  "boom", "win", "success", "achieve", "improve", "beat", "strong", "high",
  "breakthrough", "recover", "expand", "positive", "up", "best", "good",
  "great", "excellent", "bullish", "outperform", "jump", "advance", "thrive"
];

const NEGATIVE_WORDS = [
  "crash", "fall", "drop", "loss", "decline", "risk", "fear", "warn",
  "cut", "layoff", "fire", "sue", "ban", "crisis", "fail", "down", "worst",
  "bad", "weak", "miss", "plunge", "tumble", "slump", "bearish", "recession",
  "deficit", "debt", "concern", "threat", "collapse", "negative", "trouble"
];

const INTENSIFIERS = ["very", "extremely", "hugely", "massively", "sharply", "significantly"];
const NEGATORS    = ["not", "no", "never", "neither", "barely", "hardly"];

function analyze(text) {
  const words  = text.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/);
  let score    = 0;
  let pos      = 0;
  let neg      = 0;
  const matched = { positive: [], negative: [] };

  for (let i = 0; i < words.length; i++) {
    const word      = words[i];
    const prev      = words[i - 1] || "";
    const prevPrev  = words[i - 2] || "";
    const isNegated = NEGATORS.includes(prev) || NEGATORS.includes(prevPrev);
    const multiplier = INTENSIFIERS.includes(prev) ? 1.5 : 1;

    if (POSITIVE_WORDS.includes(word)) {
      const delta = isNegated ? -1 * multiplier : 1 * multiplier;
      score += delta;
      if (delta > 0) { pos++; matched.positive.push(word); }
      else           { neg++; matched.negative.push(word); }
    }

    if (NEGATIVE_WORDS.includes(word)) {
      const delta = isNegated ? 1 * multiplier : -1 * multiplier;
      score += delta;
      if (delta < 0) { neg++; matched.negative.push(word); }
      else           { pos++; matched.positive.push(word); }
    }
  }

  const total      = pos + neg || 1;
  const confidence = Math.min(Math.round((Math.abs(score) / total) * 100), 99);
  let   label      = "neutral";
  if      (score >  0.5) label = "positive";
  else if (score < -0.5) label = "negative";

  return {
    label,
    score:      parseFloat(score.toFixed(4)),
    confidence: confidence + "%",
    signals:    matched
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /analyze?headline=...
app.get("/analyze", (req, res) => {
  const headline = (req.query.headline || "").trim();
  if (!headline) {
    return res.status(400).json({ error: "Missing 'headline' query parameter." });
  }
  if (headline.length > 500) {
    return res.status(400).json({ error: "Headline must be 500 characters or fewer." });
  }
  return res.json({ headline, ...analyze(headline) });
});

// POST /analyze  { "headline": "..." }
app.post("/analyze", (req, res) => {
  const headline = (req.body?.headline || "").trim();
  if (!headline) {
    return res.status(400).json({ error: "Missing 'headline' in request body." });
  }
  if (headline.length > 500) {
    return res.status(400).json({ error: "Headline must be 500 characters or fewer." });
  }
  return res.json({ headline, ...analyze(headline) });
});

// POST /batch  { "headlines": ["...", "..."] }
app.post("/batch", (req, res) => {
  const headlines = req.body?.headlines;
  if (!Array.isArray(headlines) || headlines.length === 0) {
    return res.status(400).json({ error: "'headlines' must be a non-empty array." });
  }
  if (headlines.length > 50) {
    return res.status(400).json({ error: "Maximum 50 headlines per batch request." });
  }
  const results = headlines.map(h => ({
    headline: h,
    ...analyze(h)
  }));
  return res.json({ count: results.length, results });
});

// Health check
app.get("/", (req, res) => {
  res.json({
    name:    "Headline Sentiment API",
    version: "1.0.0",
    endpoints: [
      "GET  /analyze?headline=<text>",
      "POST /analyze  { headline }",
      "POST /batch    { headlines: [] }"
    ]
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Headline Sentiment API running on port ${PORT}`));

module.exports = app;
