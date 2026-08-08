"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch("http://localhost:8000/districts")
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
    fetch("http://localhost:8000/predict", {
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
      .then((data) => setResult(data));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <h1 className="text-xl font-bold">DengueWatch LK</h1>
          <p className="text-sm text-slate-500">Dengue outbreak early-warning tool for Sri Lanka</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-6">
        {/* Input card */}
        <section className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Forecast conditions</h2>

          <label className="block text-sm font-medium mb-1">District</label>
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4"
            value={district}
            onChange={(e) => handleDistrictChange(e.target.value)}
          >
            {districts.map((d) => (
              <option key={d.district} value={d.district}>{d.district}</option>
            ))}
          </select>

          <label className="block text-sm font-medium mb-1">Forecast month (1-12)</label>
          <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4"
            value={month} onChange={(e) => setMonth(Number(e.target.value))} />

          <label className="block text-sm font-medium mb-1">Last month&apos;s cases</label>
          <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4"
            value={lastMonthCases} onChange={(e) => setLastMonthCases(Number(e.target.value))} />

          <label className="block text-sm font-medium mb-1">3-month average cases</label>
          <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4"
            value={recentAvgCases} onChange={(e) => setRecentAvgCases(Number(e.target.value))} />

          <label className="block text-sm font-medium mb-1">Last month&apos;s avg temp (°C)</label>
          <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4"
            value={temp} onChange={(e) => setTemp(Number(e.target.value))} />

          <label className="block text-sm font-medium mb-1">Last month&apos;s avg precipitation (mm/day)</label>
          <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4"
            value={precip} onChange={(e) => setPrecip(Number(e.target.value))} />

          <label className="block text-sm font-medium mb-1">Last month&apos;s avg humidity (%)</label>
          <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4"
            value={humidity} onChange={(e) => setHumidity(Number(e.target.value))} />

          <button
            onClick={handlePredict}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg py-2.5 transition-colors"
          >
            Predict Risk
          </button>
        </section>

        {/* Result card */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          {result ? (
            <>
              <div
                className={`text-2xl font-bold px-4 py-1 rounded-full mb-3 ${
                  result.risk_tier === "Elevated"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {result.risk_tier}
              </div>
              <p className="text-sm text-slate-500 mb-4">
                {(result.confidence * 100).toFixed(1)}% model confidence
              </p>
              <p className="text-sm">{result.message}</p>
            </>
          ) : (
            <p className="text-slate-400 text-sm">Fill in the form and click Predict Risk to see a result.</p>
          )}
        </section>
      </main>
    </div>
  );
}