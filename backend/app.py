from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("risk_model.joblib")
district_encoder = joblib.load("district_encoder.joblib")
district_baselines = pd.read_csv("district_baselines.csv").set_index("District")


@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/districts")
def list_districts():
    return [
        {"district": d, "historical_avg_cases": round(row["d_mean"], 1)}
        for d, row in district_baselines.iterrows()
    ]

class PredictRequest(BaseModel):
    district: str
    month: int = Field(..., ge=1, le=12)
    last_month_cases: float
    recent_avg_cases: float
    last_month_temp: float
    last_month_precipitation: float
    last_month_humidity: float


FEATURE_ORDER = [
    "district_enc", "Month",
    "Cases_lag1", "Cases_roll3",
    "Temp_avg_lag1", "Precipitation_avg_lag1", "Humidity_avg_lag1",
]


@app.post("/predict")
def predict(req: PredictRequest):
    if req.district not in district_encoder.classes_:
        raise HTTPException(status_code=400, detail=f"Unknown district: {req.district}")
    district_enc = district_encoder.transform([req.district])[0]

    row = pd.DataFrame([{
        "district_enc": district_enc,
        "Month": req.month,
        "Cases_lag1": req.last_month_cases,
        "Cases_roll3": req.recent_avg_cases,
        "Temp_avg_lag1": req.last_month_temp,
        "Precipitation_avg_lag1": req.last_month_precipitation,
        "Humidity_avg_lag1": req.last_month_humidity,
    }])[FEATURE_ORDER]

    prediction = model.predict(row)[0]
    probabilities = model.predict_proba(row)[0]
    confidence = float(max(probabilities))

    avg_cases = district_baselines.loc[req.district, "d_mean"]

    return {
        "district": req.district,
        "risk_tier": prediction,
        "confidence": round(confidence, 3),
        "district_avg_cases": round(float(avg_cases), 1),
        "message": f"Predicted risk for {req.district} is {prediction}, relative to a historical baseline of ~{avg_cases:.0f} cases/month."
    }