DengueWatch LK

AI-powered dengue outbreak early-warning system for Sri Lanka
Built for AI Challenge Sri Lanka 2026 — AI Buildathon (Phase 1)

Live prototype: https://dengue-earlywarning.vercel.app
Backend API docs: https://dengue-earlywarning-production.up.railway.app/docs

Overview

DengueWatch LK forecasts each Sri Lankan district's dengue outbreak risk (Normal / Elevated) one month ahead, using recent case trends and weather conditions. Instead of a single national case-count threshold — which would flag Colombo as "high risk" almost year-round while missing genuine spikes in smaller districts — risk is defined relative to each district's own historical baseline, so the model catches real anomalies wherever they occur.

Problem Statement

Dengue surveillance in Sri Lanka is largely reactive: health authorities and vector-control teams typically respond after case counts have already risen. Weather conditions (rainfall, temperature, humidity) are known drivers of Aedes mosquito breeding and dengue transmission, but this relationship isn't currently built into an accessible, district-level forecasting tool. Case burden also varies enormously across Sri Lanka's 25 districts — Colombo averages over 1,000 cases/month, while districts like Mullaitivu average around 10 — so a single national threshold is meaningless for most of the country.

SDG Alignment

SDG 3 — Good Health and Well-being. DengueWatch LK gives district health authorities and Public Health Inspectors a data-driven, low-cost tool to anticipate outbreaks before they escalate — time to intensify breeding-site inspections, issue community advisories, and pre-position hospital resources ahead of a spike rather than reacting after one.

AI Architecture

District case history + weather history (2019–2021)
→ Feature engineering (month t-1 case count, 3-month rolling case average, month t-1 temperature/precipitation/humidity, district encoding)
→ Random Forest classifier (scikit-learn)
→ Risk tier: Normal / Elevated (+ confidence score)

No data leakage: forecasting month t's risk uses only information available before month t begins — never that month's own case count — so this is a genuine forecast, not hindsight.

Risk labeling: each month's label is computed from that district's own historical mean and standard deviation (z-score), not a fixed national cutoff. As a sanity check, the model's top anomalies by z-score independently line up with Sri Lanka's documented November–December 2019 dengue outbreak.

Model Performance (held-out 2021 data)

Trained on 2019–2020, tested on 2021 (chronological split — not random shuffling, since this is time-series data).

Metric	Value	Why it matters
Overall accuracy	87%	General correctness
Recall (Elevated risk)	71%	Catches most real outbreak spikes
Precision (Elevated risk)	22%	Trade-off: favors catching spikes over avoiding false alarms

The precision/recall trade-off is a deliberate design choice, not an unaddressed limitation: for a public-health early-warning tool, missing a real outbreak is costlier than an occasional false alarm that prompts an extra vector-control check.

Technology Stack
Frontend: Next.js / React, Tailwind CSS
Backend: FastAPI (Python), serving a trained scikit-learn model behind a REST API
Model: Random Forest classifier (scikit-learn), joblib-serialized
Dataset: "Dengue Dataset with Weather Data in LK 2019-2021" (Kaggle) — monthly case counts merged with average temperature, precipitation, and humidity across all 25 Sri Lankan districts (900 rows: 25 districts × 3 years × 12 months)
Deployment: backend on Railway, frontend on Vercel — both auto-deploy from GitHub on push
Repository Structure

dengue-earlywarning/
├── backend/ — FastAPI app, model serving, /predict and /districts endpoints
├── frontend/ — Next.js what-if UI
└── README.md

Running Locally

Backend:
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

Frontend:
cd frontend && npm install && npm run dev

The frontend expects the backend URL in NEXT_PUBLIC_API_URL (defaults to http://localhost:8000 for local development).

Links
Live prototype: https://dengue-earlywarning.vercel.app
Backend API docs: https://dengue-earlywarning-production.up.railway.app/docs
Demo video: https://youtu.be/JYP7MC5hIe8

Built by Team Sync3 for AI Challenge Sri Lanka 2026.
