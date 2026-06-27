# Real-Time Anomaly Detection Service + Dashboard

A Node.js service that consumes TealVue's live mock market feed, runs configurable anomaly-detection strategies per symbol, exposes alerts over a secured REST API, and a React dashboard that streams live prices and surfaces alerts in real time.

---

## Setup & Run

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=4000
ALERTS_API_KEY=<secret-key>
ENABLE_LOAD_TEST=false
```

Run:
```bash
node index.js
```

Project structure:
```
backend/
├── index.js                 ← entry point
└── src/
    ├── config/detectionConfig.js
    ├── feed/socketClient.js
    ├── detection/ (spikeDetector.js, checkMovingAverage.js, burst_guard.js)
    ├── history/history.js
    ├── alerts/ (alertStore.js, alertRoutes.js)
    └── utils/ (normalizeTickerData.js, loadTest.js)
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_BACKEND_URL=http://localhost:4000
VITE_ALERTS_API_KEY=<same-key-as-backend>
```

Run:
```bash
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

---

## Sample Config

Detection strategies are configured per symbol in `backend/src/config/detectionConfig.js`:

```js
const config = {
  RELIANCE: { strategy: 'spike', thresholdPercent: 3, windowSec: 30 },
  TCS: { strategy: 'movingAverage', deviationPercent: 5, sampleSize: 10 },
  INFY: { strategy: 'spike', thresholdPercent: 2.5, windowSec: 20 }
};
```

Only symbols present in this config are subscribed to and monitored — see Assumptions for reasoning. The backend validates these against the real `/api/v1/symbols` catalogue before subscribing.

---

## Sample Alert Output

Real alerts captured from a live test run (console log + stored alert objects):

```
Alert created: {
  alertRef: 'TV-1B7ABD',
  symbol: 'TCS',
  reason: 'price is 0.17% above its 10-day moving average of 2412.61',
  ts: 1782536760000,
  timestamp: '2026-06-27T05:06:00.000Z'
}

{ alertRef: 'TV-0586E1', symbol: 'TCS', reason: 'price is 0.18% above its 10-day moving average of 2408.32', ts: 1782546420000, timestamp: '2026-06-27T07:47:00.000Z' }

{ alertRef: 'TV-E3A6FD', symbol: 'RELIANCE', reason: 'price spiked 0.13% down in the last 30 seconds.', ts: 1782546660000, timestamp: '2026-06-27T07:51:00.000Z' }
```

(Captured during lower-threshold testing to verify alert generation quickly. At the production thresholds above, alerts fire far less often — expected, since anomalies should be rare.)

---

## Burst Behavior (Observed)

Subscribing to RELIANCE triggers an instant replay of every tick since 09:15:00 of the current simulated day — dozens to low hundreds of `"ticker"` events within milliseconds, depending on how far into the trading day the subscription happens. No alerts fire during this replay. Detection only activates once the gap between consecutive ticks exceeds ~1.5s real time (see Burst Handling below).

---

## Architecture

```
TealVue (Socket.IO)
      │ subscribe(symbols)
      ▼
Backend (Node.js)
  ├─ feed ingestion (src/feed/socketClient.js)
  ├─ tick normalization (src/utils/normalizeTickerData.js)
  ├─ rolling history per symbol (src/history/history.js, capped at 50 ticks)
  ├─ burst guard (src/detection/burst_guard.js) — suppresses alerts until live cadence detected
  ├─ detection engine (src/detection/spikeDetector.js, checkMovingAverage.js)
  ├─ alert store (src/alerts/alertStore.js) — last 10 alerts, in-memory
  ├─ secured REST API (src/alerts/alertRoutes.js) — GET /api/alerts, API-key auth
  ├─ optional synthetic load test (src/utils/loadTest.js) — gated by ENABLE_LOAD_TEST
  └─ own Socket.IO server — broadcasts priceUpdate / newAlert events
      │
      ▼
React Frontend
  ├─ PriceChart.jsx — one live incremental chart per symbol (recharts)
  ├─ AlertFeed.jsx — live list of last 10 alerts, seeded via REST on load
  └─ Dashboard.jsx — lays out charts + feed
```

### Burst handling

TealVue can't tell us when burst replay ends, so we infer it: track the real-world gap (`Date.now()`) between consecutive ticks per symbol. Gap > 1.5s → symbol is live, alerts enabled from then on. Ticks still feed the rolling history during burst (so detection has real context once live), but alerting stays off until the live flag flips.

`windowSec`/`sampleSize` math uses each tick's own simulated timestamp (`TS`), never wall-clock time — keeps detection correct at both burst speed and live cadence.

### Scaling notes

TealVue's catalogue is too small to test 1,000+ symbols directly. `loadTest.js` (env-gated, off by default) spins up N synthetic symbols (`SIM_0`...`SIM_999`) through the **same** `addToHistory`/`checkSpike`/`checkMovingAverage` functions used for real data.

Observed on a 1,000-symbol run:
- ~3µs per tick (history update + both checks), via `process.hrtime.bigint()`
- Real symbols kept processing normally throughout, no lag
- Memory stayed flat — history per symbol is capped regardless of symbol count

Always clearly labeled (`SIM_` prefix, logs, this doc) — never presented as real feed data.

---

## Assumptions & Decisions

Full running log in `DECISIONS.md`. Key points:

1. **Price field**: docs say `LTP`, real payload has no such field — uses `CLOSE` instead. Confirmed with interviewer.
2. **Tick interval**: observed ~60s simulated spacing, not the ~15s implied by the REST example. Detection uses live timestamps, not an assumed fixed interval.
3. **`windowSec`**: simulated time (tick `TS`), not wall-clock — stays correct through burst and live alike.
4. **Subscribe scope**: only configured symbols are subscribed, not the full catalogue — keeps "configurable per symbol" meaningful instead of guessing defaults for unconfigured ones.
5. **`/api/alerts` security**: static API key via `x-api-key` header. Proportionate for a read-only, single-purpose, no-auth-system endpoint; JWT would be overkill here.
6. **Frontend key exposure**: the alerts API key lives in a Vite env var, visible client-side. Acceptable for this scope; flagged below as a real limitation.
7. **Unused REST endpoints**: `realtime-current` and `historical` were available but not used — the WebSocket's burst replay on subscribe already provides equivalent same-day tick history, making a separate REST call redundant for this use case.

---

## With More Time, I Would...

- Move the alerts API key out of frontend-visible env vars entirely, behind a backend-for-frontend proxy
- Add a Docker setup for one-command startup of both services
- Replace in-memory alert storage with a small persistent store (e.g. SQLite) so alerts survive a restart
- Polish the dashboard UI — candlestick/volume detail per chart, better color/typography, and a clearer visual distinction between real and simulated symbols
- Persist chart history across page reloads — PriceChart currently starts empty on every reload and rebuilds only from new live ticks, even though the backend's rolling history (used for detection) is unaffected.
## Tech Stack

- **Backend**: Node.js, Express, Socket.IO (client + server), dotenv, cors
- **Frontend**: React (Vite), Recharts, Socket.IO client
