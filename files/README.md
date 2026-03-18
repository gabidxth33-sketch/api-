# Headline Sentiment API

A fast, zero-dependency sentiment analyzer for news headlines. Returns `positive`, `negative`, or `neutral` with a confidence score and matched signal words.

---

## Quick start

```bash
npm install
npm start
# Server runs on http://localhost:3000
```

---

## Endpoints

### `GET /analyze`
```
GET /analyze?headline=Apple+hits+record+profits+in+Q4
```
**Response:**
```json
{
  "headline": "Apple hits record profits in Q4",
  "label": "positive",
  "score": 2,
  "confidence": "99%",
  "signals": {
    "positive": ["record", "profit"],
    "negative": []
  }
}
```

---

### `POST /analyze`
```json
POST /analyze
{ "headline": "Markets crash amid recession fears" }
```
**Response:**
```json
{
  "headline": "Markets crash amid recession fears",
  "label": "negative",
  "score": -2,
  "confidence": "99%",
  "signals": {
    "positive": [],
    "negative": ["crash", "recession"]
  }
}
```

---

### `POST /batch`
Analyze up to 50 headlines in one request.
```json
POST /batch
{
  "headlines": [
    "Tech stocks surge on strong earnings",
    "Layoffs hit major banks amid downturn",
    "Fed holds rates steady"
  ]
}
```
**Response:**
```json
{
  "count": 3,
  "results": [
    { "headline": "Tech stocks surge...", "label": "positive", "score": 1, "confidence": "99%", "signals": {...} },
    { "headline": "Layoffs hit...",       "label": "negative", "score": -2, "confidence": "99%", "signals": {...} },
    { "headline": "Fed holds rates...",   "label": "neutral",  "score": 0,  "confidence": "0%",  "signals": {...} }
  ]
}
```

---

## Deploying to Railway (free tier)

1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo — Railway auto-detects Node.js
4. Your API gets a public URL like `https://your-app.up.railway.app`

---

## Listing on RapidAPI

1. Go to [rapidapi.com/provider](https://rapidapi.com/provider) and create an account
2. Click **Add New API** → give it a name and description
3. Set **Base URL** to your Railway URL
4. Add your 3 endpoints with descriptions and example responses
5. Set pricing:
   - **Free tier**: 100 requests/month (gets you reviews and subscribers)
   - **Basic**: $9.99/month — 5,000 requests
   - **Pro**: $29.99/month — 50,000 requests
6. Submit for review (usually approved within 24–48 hrs)

---

## Response fields

| Field | Type | Description |
|---|---|---|
| `label` | string | `positive`, `negative`, or `neutral` |
| `score` | number | Raw sentiment score (positive = good, negative = bad) |
| `confidence` | string | How certain the model is (0–99%) |
| `signals.positive` | array | Positive words detected |
| `signals.negative` | array | Negative words detected |
