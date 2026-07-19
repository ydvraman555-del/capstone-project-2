# 🧠 Brain — Capstone Project: Global GHG Emissions Intelligence System

> **Last updated:** 2026-07-19
> **Purpose:** Quick-reference knowledge base so the entire codebase doesn't need to be re-read on every session.

---

## 0. Deployment

| Layer    | Platform | URL / Notes                              |
|----------|----------|------------------------------------------|
| Frontend | Vercel   | React SPA deployed separately            |
| Backend  | Render   | Free tier — cold starts after ~15 min idle |

**Cold Start Problem & Optimization:** Render free tier spins down. Previously, reloading the 186MB model at startup took ~1 min, causing pings from **UptimeRobot** to time out with `503 Service Unavailable`.
To resolve this:
1. **Lazy Loading:** ML artifacts (model and encoders) are loaded lazily and thread-safely on the first prediction/forecast request.
2. **Compressed Model:** The application uses `rf.pkl.gz` (~39MB) instead of the 186MB uncompressed model, reducing loading time to ~15-20 seconds.
This allows the server to start up instantly (<1s) and immediately answer UptimeRobot ping requests (hitting `/metadata` or `/`) with a `200 OK`.


## 1. Project Overview

**What it is:** A full-stack ML-powered web app that predicts and visualizes Global Greenhouse Gas (GHG) Emissions (CH4, CO2, N2O) by country/area, with historical data + future forecasting (up to 2031).

**Deployment target:** Render (Web Service)
**Python version:** 3.12.x (see `.python-version`)
**Repository:** `ydvraman555-del/capstone-project-2`

---

## 2. Tech Stack

### Backend
| Component        | Tech                    |
|------------------|-------------------------|
| Framework        | Flask 3.0.0             |
| CORS             | Flask-CORS 4.0.0        |
| ML Model         | RandomForestRegressor (scikit-learn 1.3.2) |
| Data Processing  | pandas 2.0.3, numpy 1.24.3 |
| Server (prod)    | gunicorn 21.2.0         |
| Other ML         | xgboost 1.7.5 (in requirements, not actively used in app.py) |
| Viz (server-side)| matplotlib 3.7.1, seaborn 0.12.2, plotly 5.15.0 |
| Presentations    | python-pptx 1.0.2       |

### Frontend
| Component        | Tech                    |
|------------------|-------------------------|
| Framework        | React 18.2.0            |
| Build Tool       | Vite 5.1.4              |
| CSS              | TailwindCSS 3.4.19      |
| Routing          | react-router-dom 6.30.3 |
| Charts           | Recharts 2.15.4         |
| Animations       | framer-motion 11.18.2   |
| HTTP Client      | axios 1.14.0            |
| Icons            | lucide-react 0.323.0    |
| PDF Export       | jspdf 4.2.1 + html2canvas 1.4.1 |

---

## 3. Directory Structure

```
Capstone Project second/
├── backend/
│   ├── app.py                          # Flask app — ALL API routes + model loading
│   └── historical_events.json          # 📂 JSON database of historical events & mitigation pathways
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                    # React entry point
│   │   ├── App.jsx                     # Router: "/" → Landing, "/predict" → Predictor
│   │   ├── index.css                   # Global styles (TailwindCSS directives)
│   │   └── components/
│   │       ├── Landing.jsx             # Landing page (hero, features, CTA)
│   │       ├── Predictor.jsx           # Main prediction dashboard (39KB — largest file)
│   │       └── Atmosphere.jsx          # Animated background particles effect
│   ├── index.html                      # Vite HTML entry
│   ├── package.json                    # npm dependencies
│   ├── vite.config.js                  # Vite config
│   ├── tailwind.config.js              # Tailwind config
│   ├── postcss.config.js              # PostCSS config
│   └── vercel.json                     # Vercel rewrite configuration for client-side routing
│
├── research_and_utilities/             # 📂 Reorganized research, notebooks, and utility tools
│   ├── notebooks/
│   │   └── Practice Capstone Project .ipynb # Jupyter Notebook (EDA + model training)
│   ├── presentations/
│   │   ├── GHG_Capstone_Presentation.pptx
│   │   └── Global-GHG-Emissions-Intelligence-System_1.pptx
│   ├── training_scripts/
│   │   ├── retrain.py                  # Script to retrain RandomForest
│   │   ├── compress_model.py           # Compresses random_forest.pkl
│   │   ├── fast_loader.py              # Drop-in fast model loader
│   │   ├── generate_presentation.py    # Auto-generates presentation slides
│   │   └── verify_preds.py / extract_*.py # Auxiliary scripts
│
├── Global Green House Gas Emissions.csv  # 344KB — Source dataset
├── random_forest.pkl                     # 186MB — Trained RF model (LARGE!)
├── rf.pkl.gz                             # 39MB — Compressed version of the model
├── area_encoder.pkl                      # LabelEncoder for Area column
├── element_encoder.pkl                   # LabelEncoder for Element column
│
├── wsgi.py                              # WSGI entry point (imports from backend/app.py)
├── Procfile                             # Render: gunicorn --bind 0.0.0.0:$PORT wsgi:app
├── build.sh                             # Render build: npm install + vite build + pip install
├── requirements.txt                     # Root Python deps (used by Render)
├── .python-version                      # "3.12.x"
└── .gitignore
```

---

## 4. Architecture & Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│  CSV Dataset │────────►│  retrain.py  │────────►│  .pkl models   │
│  (344KB)     │         │  (training)  │         │  (encoders +   │
└─────────────┘         └──────────────┘         │   RF model)    │
                                                  └───────┬────────┘
                                                          │ loaded at startup
                                                          ▼
┌──────────────┐  HTTP   ┌──────────────────────────────────────┐
│   React SPA  │◄───────►│  Flask API (backend/app.py)          │
│   (Vite)     │  JSON   │                                      │
│              │         │  Routes:                              │
│  Landing     │         │    POST /predict → single prediction  │
│  Predictor   │         │    GET  /forecast → hist + 10yr fcast │
│  Atmosphere  │         │    GET  /metadata → areas, elements   │
│              │         │    GET  /* → serve frontend dist/     │
└──────────────┘         └──────────────────────────────────────┘
```

### Deployment Flow (Render)
1. `build.sh` runs:
   - `cd frontend && npm install && vite build` → builds to `frontend/dist/`
   - `pip install -r requirements.txt`
2. `Procfile` starts: `gunicorn --bind 0.0.0.0:$PORT wsgi:app`
3. `wsgi.py` imports `app` from `backend/app.py`
4. Flask serves both API routes AND the static frontend from `frontend/dist/`

---

## 5. API Routes (backend/app.py)

### `POST /predict`
- **Body:** `{ "Area": "India", "Element": "Emissions (CO2)", "Year": 2025 }`
- **Response:** `{ "prediction": 1234.56, "insight": "Medium", "status": "success" }`
- **Insight thresholds:** >10000 → "High", ≥1000 → "Medium", <1000 → "Low"

### `GET /forecast?area=India&element=Emissions (CO2)`
- **Response:** `{ "history": [{Year, Value}...], "forecast": [{Year, Value}...], "status": "success" }`
- Forecast covers years **2022–2031**

### `GET /events?area=India&element=Emissions (CO2)`
- **Response:** `{ "status": "success", "drivers": "...", "timeline": [{year, type, title, description}...], "mitigation": [...] }`
- Returns historical event attributions (peaks, valleys) and climate mitigation recommendations.

### `GET /metadata`
- **Response:** `{ "areas": [...], "elements": [...], "years": [1990..2031] }`

### `GET /` and `GET /<path>`
- Serves the built React frontend from `frontend/dist/`
- Falls back to `index.html` for SPA routing

---

## 6. ML Model Details

### Training (`retrain.py`)
- **Algorithm:** RandomForestRegressor (100 trees, random_state=42, n_jobs=-1)
- **Features:** `['Area', 'Year', 'Element']` — all encoded via LabelEncoder
- **Target:** `Value` (emission value in kilotonnes)
- **Data prep:** CSV is melted from wide format (separate CH4/CO2/N2O columns) into long format

### Prediction Logic (`get_smart_prediction()` in app.py)
This is the **core intelligence** — NOT a simple model.predict():

1. **Historical lookup first:** If the year exists in the CSV, return the exact historical value
2. **RF prediction as base:** For unknown years, use the model
3. **Dynamic slope adjustment:** For future years (>2021):
   - Calculate real historical slope from last 10 data points using `np.polyfit`
   - Apply: `prediction = RF_base + (slope × years_ahead_from_2021)`
4. **Fallback:** If model fails, use 2% annual growth from last known value
5. **Extreme fallback:** Find closest historical data point

### Pickle Files Used by app.py
| `rf.pkl.gz`           | Compressed RF model (39MB)          | ✅ YES (Lazy, primary) |
| `random_forest.pkl`   | Trained RF model (186MB)            | ✅ YES (Lazy, fallback) |
| `area_encoder.pkl`    | LabelEncoder for Area               | ✅ YES (Lazy)  |
| `element_encoder.pkl` | LabelEncoder for Element            | ✅ YES (Lazy)  |
| `model.pkl`           | Older/alternate model (315KB)       | ❌ NO   |
| `scaler.pkl`          | StandardScaler                      | ❌ NO   |
| `label_encoder.pkl`   | Another label encoder               | ❌ NO   |

---

## 7. Frontend Details

### Routing (App.jsx)
| Path       | Component     | Description                          |
|------------|---------------|--------------------------------------|
| `/`        | `Landing.jsx` | Hero page with features & CTA button |
| `/predict` | `Predictor.jsx` | Full prediction dashboard          |

### Key Component: Predictor.jsx (~40KB)
This is the main dashboard with:
- **Area/Element/Year selectors** (dropdowns populated from `/metadata`)
- **Single prediction** form (calls `POST /predict`)
- **Forecast chart** (calls `GET /forecast`, renders with Recharts)
- **Threat level indicator** & **Mitigation Strategy Advisor** (dynamic recommendations)
- **Historical Event Timeline** (peaking/troughing driver attributions)
- **Collapsible Projections Table** & **Interactive Policy Simulator & Offset Calculator**
- **Multi-page PDF export** (html2canvas + jspdf)
- **Animated transitions** (framer-motion)

### Key Component: Landing.jsx (~14KB)
- Hero section with animated background (Atmosphere.jsx)
- Feature cards, stats section
- CTA button → navigates to `/predict`

### Key Component: Atmosphere.jsx (~1.4KB)
- Animated floating particles/dots background effect
- Used as visual backdrop on Landing page

### Styling
- TailwindCSS 3.x with custom dark theme (`bg-[#0f172a]` as base)
- Custom animations via framer-motion
- Responsive design

---

## 8. Dataset

**File:** `Global Green House Gas Emissions.csv` (344KB)
**Format (wide):**
| Column          | Type    |
|-----------------|---------|
| Area            | String  | (country/region names)
| Year            | Integer | (1990–2021 range)
| Emissions (CH4) | Float  | (kilotonnes)
| Emissions (CO2) | Float  | (kilotonnes)
| Emissions (N2O) | Float  | (kilotonnes)

**Melted (long format used internally):**
| Column  | Type    |
|---------|---------|
| Area    | String  |
| Year    | Integer |
| Element | String  | ("Emissions (CH4)", "Emissions (CO2)", "Emissions (N2O)")
| Value   | Float   |

---

## 9. How to Run Locally

### Backend
```bash
cd "Capstone Project second"
pip install -r requirements.txt
python backend/app.py
# Runs on http://localhost:5000
```

### Frontend (development)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173 (Vite default)
```

### Frontend (production build)
```bash
cd frontend
npm run build
# Output: frontend/dist/
# Then backend serves it at http://localhost:5000
```

### Retrain Model
```bash
python retrain.py
# Outputs: random_forest.pkl, area_encoder.pkl, element_encoder.pkl
```

---

## 10. Key Gotchas & Notes

1. **Compressed Model Used (39MB)** — The application now primarily loads `rf.pkl.gz` (39MB) instead of `random_forest.pkl` (186MB) to ensure fast loading times on startup.

2. **Feature column order matters** — Training uses `['Area', 'Year', 'Element']`. Prediction must match this exact order or results will be wrong.

3. **TRAIN_END_YEAR = 2021** — Hardcoded in `get_smart_prediction()`. Historical data ends at 2021; anything after uses model + slope adjustment.

4. **Flask serves both API and frontend** — The static_folder points to `frontend/dist/`. If the frontend isn't built, the catch-all route returns a 500.

5. **Unused pickle files deleted** — Experimental model files (`model.pkl`, `scaler.pkl`, `label_encoder.pkl`) have been deleted from the repository to clean up disk space.

6. **Backend requirements.txt deleted** — Previously, `backend/requirements.txt` existed as a duplicate, which has been removed. Render uses the root `requirements.txt` file.

7. **Vite build command is explicit** — `package.json` uses `node node_modules/vite/bin/vite.js build` instead of `npx vite build` to avoid issues on Render.

8. **CORS is enabled** — `Flask-CORS` is applied globally, allowing frontend dev server (port 5173) to call backend (port 5000).

9. **No database** — Everything is file-based (CSV + pickle). No DB setup required.

10. **Prediction values are clamped to ≥0** — `max(0, dynamic_pred)` ensures no negative emission predictions.

11. **Cold start optimization is fully wired in** — The model loading in `app.py` has been optimized. It now loads `rf.pkl.gz` (39MB) instead of the 186MB `random_forest.pkl`, and uses a thread-safe lazy-loading function `load_artifacts_lazy()` which is only invoked on prediction/forecast requests.

12. **UptimeRobot pings succeed instantly** — Since `app.py` loads the model lazily, the server starts up in <1s and answers UptimeRobot pings to `/metadata` or `/` immediately (without waiting for the model to load). This prevents UptimeRobot timeouts and 503 errors.

13. **Frontend on Vercel, Backend on Render** — These are separate deployments. Frontend calls backend API via absolute URL (must be configured in frontend env/config).

14. **NumPy 1.x / 2.x Compatibility Patch** — A custom `NumPyRenameUnpickler` subclass of `pickle.Unpickler` has been implemented in `backend/app.py` and `fast_loader.py` to intercept module loads and replace `numpy._core` with `numpy.core` on-the-fly. This scopes the change completely within the pickle process and avoids modifying the global `sys.modules`, which previously caused a Gunicorn worker segmentation fault.

15. **PDF Export Variable Fix** — Fixed a ReferenceError in `downloadPDF` inside `Predictor.jsx` where the undefined variable `trend2031` was referenced instead of the correct `trendVariable`.

16. **Scroll to Top on Route Change** — Added a `useEffect` inside `AnimatedRoutes` (in `App.jsx`) to scroll the window to the top (`window.scrollTo(0, 0)`) when the route path changes, preventing the page from loading scrolled-down when transitioning between pages.

17. **Vercel Client-Side Routing Refresh Fix** — Added `frontend/vercel.json` with a rewrite rule to redirect all routes to `index.html`. This prevents Vercel from returning a `404: NOT_FOUND` error when refreshing a subpage like `/predict`.

18. **PDF Export Overlapping Fix** — Set the font size of climate mitigation roadmap items to `10` and adjusted their horizontal spacing and wrapping limits in `Predictor.jsx` to prevent the `[Action Item X]` label from overlapping with the action text.

19. **UptimeRobot 503 Timeout Fix (Lazy Loading)** — Converted model loading to a thread-safe lazy-loaded process in `backend/app.py`. The model is loaded from `rf.pkl.gz` (fallback to `random_forest.pkl`) only when prediction or forecast is requested, preventing the server from blocking during startup and ensuring that health pings (e.g. UptimeRobot) succeed instantly.

20. **Root Route 500 Error Fix** — Modified the root route handler `serve(path)` in `backend/app.py` so that it returns a healthy `200 OK` JSON API status if the frontend static assets (`index.html`) are missing on Render. This avoids returning a `500 Internal Server Error` to UptimeRobot when pinging the root URL.

21. **Forecast Horizon Range (2031)** — Locked the forecast years range in `backend/app.py` back to 2031 (`range(2022, 2032)` and `range(1990, 2032)`) to align with data boundaries.

22. **Year Input Bounds Validation** — Implemented strict validation on the forecast year input in `Predictor.jsx`. Inputs are instantly clamped/snapped back to `2031` (or `1990`) on keystroke if a user types or pastes a 4+ digit number outside the bounds. Values are also clamped on blur, and form submissions are blocked with an alert if a year outside these bounds is submitted.

23. **3D Tilt-on-Hover Card Animations** — Applied the premium 3D tilt-on-hover effect across all cards in the Landing page (Features Grid, Technical Workflow Grid, and Future Roadmap Grid) using Framer Motion (`motion.div` with perspective) for layout consistency and dynamic visual responsiveness.

