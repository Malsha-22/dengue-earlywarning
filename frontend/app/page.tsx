"use client";

import { useEffect, useState } from "react";
import RiskGauge from "./components/RiskGauge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type District = {
  district: string;
  historical_avg_cases: number;
};

type PredictResult = {
  district: string;
  risk_tier: string;
  confidence: number;
  district_avg_cases: number;
  message: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Home() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [district, setDistrict] = useState("");
  const [month, setMonth] = useState(8);
  const [lastMonthCases, setLastMonthCases] = useState(0);
  const [recentAvgCases, setRecentAvgCases] = useState(0);
  const [temp, setTemp] = useState(27);
  const [precip, setPrecip] = useState(2);
  const [humidity, setHumidity] = useState(78);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/districts`)
      .then((res) => res.json())
      .then((data) => {
        setDistricts(data);
        if (data.length > 0) {
          setDistrict(data[0].district);
          setLastMonthCases(Math.round(data[0].historical_avg_cases));
          setRecentAvgCases(Math.round(data[0].historical_avg_cases));
        }
      });
  }, []);

  function handleDistrictChange(name: string) {
    setDistrict(name);
    const d = districts.find((x) => x.district === name);
    if (d) {
      setLastMonthCases(Math.round(d.historical_avg_cases));
      setRecentAvgCases(Math.round(d.historical_avg_cases));
    }
  }

  function handlePredict() {
    setLoading(true);
    fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        district,
        month,
        last_month_cases: lastMonthCases,
        recent_avg_cases: recentAvgCases,
        last_month_temp: temp,
        last_month_precipitation: precip,
        last_month_humidity: humidity,
      }),
    })
      .then((res) => res.json())
      .then((data) => setResult(data))
      .finally(() => setLoading(false));
  }

  const inputClass =
    "w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow bg-white";
  const labelClass = "block text-sm font-medium mb-1.5 text-slate-700";
  const cardClass = "bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-6 shadow-sm";
  const numberBoxClass =
    "w-20 text-sm font-mono text-teal-700 border border-teal-200 rounded px-1.5 py-0.5 text-right bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-teal-800">DengueWatch LK</span>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
            AI Challenge Sri Lanka 2026
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-10 pb-4">
        <p className="text-xs font-semibold tracking-widest text-teal-700 uppercase mb-2">
          Live model &middot; Random Forest &middot; 2021 held-out
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
          Where will dengue <span className="text-teal-600 italic">strike next</span>?
        </h1>
        <p className="text-slate-600 max-w-2xl">
          A district-level early-warning model trained on three years of Sri Lankan rainfall,
          temperature, and dengue case data. Adjust last month&apos;s conditions to see this
          month&apos;s outbreak-risk outlook.
        </p>
      </div>

      <main className="max-w-4xl mx-auto px-6 pb-10 pt-4 grid md:grid-cols-2 gap-8">
        <section className={cardClass}>
          <h2 className="font-semibold mb-4 text-slate-800">Forecast conditions</h2>

          <label className={labelClass}>District</label>
          <select
            className={inputClass}
            value={district}
            onChange={(e) => handleDistrictChange(e.target.value)}
          >
            {districts.map((d) => (
              <option key={d.district} value={d.district}>{d.district}</option>
            ))}
          </select>

          <label className={labelClass}>Forecast month</label>
          <div className="grid grid-cols-6 gap-1.5 mb-4">
            {MONTHS.map((label, i) => {
              const m = i + 1;
              const isSelected = month === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonth(m)}
                  className={`text-xs font-medium py-2 rounded-md border transition-colors ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-emerald-400"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium text-slate-700">Last month&apos;s cases</label>
            <input type="number" className={numberBoxClass}
              value={lastMonthCases} onChange={(e) => setLastMonthCases(Number(e.target.value))} />
          </div>
          <input type="range" min={0} max={3000} step={1}
            value={lastMonthCases} onChange={(e) => setLastMonthCases(Number(e.target.value))}
            className="w-full accent-teal-600 mb-4" />

          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium text-slate-700">3-month average cases</label>
            <input type="number" className={numberBoxClass}
              value={recentAvgCases} onChange={(e) => setRecentAvgCases(Number(e.target.value))} />
          </div>
          <input type="range" min={0} max={3000} step={1}
            value={recentAvgCases} onChange={(e) => setRecentAvgCases(Number(e.target.value))}
            className="w-full accent-teal-600 mb-4" />

          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium text-slate-700">Last month&apos;s avg temp (&deg;C)</label>
            <input type="number" step="0.1" className={numberBoxClass}
              value={temp} onChange={(e) => setTemp(Number(e.target.value))} />
          </div>
          <input type="range" min={15} max={32} step={0.1}
            value={temp} onChange={(e) => setTemp(Number(e.target.value))}
            className="w-full accent-teal-600 mb-4" />

          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium text-slate-700">Last month&apos;s avg precipitation (mm/day)</label>
            <input type="number" step="0.1" className={numberBoxClass}
              value={precip} onChange={(e) => setPrecip(Number(e.target.value))} />
          </div>
          <input type="range" min={0} max={20} step={0.1}
            value={precip} onChange={(e) => setPrecip(Number(e.target.value))}
            className="w-full accent-teal-600 mb-4" />

          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium text-slate-700">Last month&apos;s avg humidity (%)</label>
            <input type="number" step="0.1" className={numberBoxClass}
              value={humidity} onChange={(e) => setHumidity(Number(e.target.value))} />
          </div>
          <input type="range" min={30} max={100} step={0.5}
            value={humidity} onChange={(e) => setHumidity(Number(e.target.value))}
            className="w-full accent-teal-600 mb-4" />

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 transition-colors"
          >
            {loading ? "Predicting..." : "Predict Risk"}
          </button>
        </section>

        <section className={`${cardClass} flex flex-col items-center justify-center text-center`}>
          {result ? (
            <>
              <RiskGauge
                tier={result.risk_tier as "Normal" | "Elevated"}
                confidence={result.confidence}
              />
              <p className="text-sm text-slate-600 mt-4">{result.message}</p>
            </>
          ) : (
            <>
              <RiskGauge tier={null} confidence={null} />
              <p className="text-slate-400 text-sm mt-4">Fill in the form and click Predict Risk to see a result.</p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}