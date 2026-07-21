import { useState } from "react";
import { predictPollution } from "../utils/aiPrediction";

export default function AIPredictor() {
  const [ph, setPh] = useState(7);
  const [turbidity, setTurbidity] = useState(20);
  const [oxygen, setOxygen] = useState(7);
  const [industries, setIndustries] = useState(5);
  const [rainfall, setRainfall] = useState("Moderate");

  const result = predictPollution(
    ph,
    turbidity,
    oxygen,
    industries,
    rainfall
  );

  return (
    <section className="bg-slate-950 py-20 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">

        {/* Left */}
        <div className="bg-slate-900 rounded-3xl p-8">

          <h2 className="text-3xl font-bold text-white mb-6">
            AI Pollution Simulator
          </h2>

          <label className="text-white">pH</label>
          <input
            type="range"
            min="0"
            max="14"
            step="0.1"
            value={ph}
            onChange={(e) => setPh(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-cyan-400">{ph}</p>

          <label className="text-white mt-5 block">Turbidity</label>
          <input
            type="range"
            min="0"
            max="100"
            value={turbidity}
            onChange={(e) => setTurbidity(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-cyan-400">{turbidity}</p>

          <label className="text-white mt-5 block">
            Dissolved Oxygen
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={oxygen}
            onChange={(e) => setOxygen(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-cyan-400">{oxygen}</p>

          <label className="text-white mt-5 block">
            Nearby Industries
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={industries}
            onChange={(e) => setIndustries(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-cyan-400">{industries}</p>

          <label className="text-white mt-5 block">Rainfall</label>

          <select
            value={rainfall}
            onChange={(e) => setRainfall(e.target.value)}
            className="w-full bg-slate-800 text-white p-3 rounded-xl"
          >
            <option>Low</option>
            <option>Moderate</option>
            <option>Heavy</option>
          </select>

        </div>

        {/* Right */}
        <div className="bg-slate-900 rounded-3xl p-8">

          <h2 className="text-3xl font-bold text-cyan-400 mb-8">
            AI Prediction
          </h2>

          <h3 className="text-6xl font-bold text-white">
            {result.score}%
          </h3>

          <p className="text-2xl mt-5 text-cyan-300">
            {result.status}
          </p>

          <div className="mt-8 bg-cyan-500/10 rounded-xl p-5">

            <h4 className="text-xl text-cyan-300 font-bold">
              AI Recommendation
            </h4>

            <p className="text-gray-300 mt-3">
              {result.score >= 70
                ? "Immediate inspection required. Notify authorities and monitor water quality continuously."
                : result.score >= 40
                ? "Increase sampling frequency and monitor industrial discharge."
                : "River is currently safe. Continue regular monitoring."}
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}