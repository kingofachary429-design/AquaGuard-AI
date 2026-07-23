import { useState } from "react";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const initialFormData = {
  ph: "",
  turbidity: "",
  dissolvedOxygen: "",
  rainfall: "",
  industrialActivity: "Low",
};

export default function AIPollutionPredictor() {
  const [formData, setFormData] = useState(initialFormData);
  const [prediction, setPrediction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
const [saveMessage, setSaveMessage] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const calculatePrediction = async () => {
    const ph = Number(formData.ph);
    const turbidity = Number(formData.turbidity);
    const dissolvedOxygen = Number(formData.dissolvedOxygen);
    const rainfall = Number(formData.rainfall);

    if (
      formData.ph === "" ||
      formData.turbidity === "" ||
      formData.dissolvedOxygen === "" ||
      formData.rainfall === ""
    ) {
      setErrorMessage("Please enter all water-quality parameters.");
      return;
    }

    if (
      Number.isNaN(ph) ||
      Number.isNaN(turbidity) ||
      Number.isNaN(dissolvedOxygen) ||
      Number.isNaN(rainfall)
    ) {
      setErrorMessage("Please enter valid numerical values.");
      return;
    }

    if (ph < 0 || ph > 14) {
      setErrorMessage("pH value must be between 0 and 14.");
      return;
    }

    if (turbidity < 0 || dissolvedOxygen < 0 || rainfall < 0) {
      setErrorMessage("Parameter values cannot be negative.");
      return;
    }

    let riskScore = 0;
    const detectedIssues = [];
    const recommendations = [];

    // pH risk calculation
    if (ph < 5 || ph > 10) {
      riskScore += 30;
      detectedIssues.push("Dangerous pH level");

      recommendations.push(
        "Conduct immediate chemical contamination testing."
      );
    } else if (ph < 6.5 || ph > 8.5) {
      riskScore += 18;
      detectedIssues.push("Abnormal pH level");

      recommendations.push(
        "Monitor pH levels and identify possible chemical discharge."
      );
    } else {
      riskScore += 3;
    }

    // Turbidity risk calculation
    if (turbidity > 100) {
      riskScore += 25;
      detectedIssues.push("Extremely high turbidity");

      recommendations.push(
        "Inspect the river for industrial waste, sewage, or soil runoff."
      );
    } else if (turbidity > 50) {
      riskScore += 18;
      detectedIssues.push("High turbidity");

      recommendations.push(
        "Increase sediment and suspended-particle monitoring."
      );
    } else if (turbidity > 10) {
      riskScore += 10;
      detectedIssues.push("Moderate turbidity");
    } else {
      riskScore += 2;
    }

    // Dissolved Oxygen risk calculation
    if (dissolvedOxygen < 2) {
      riskScore += 30;
      detectedIssues.push("Critically low dissolved oxygen");

      recommendations.push(
        "Take immediate action to protect aquatic life."
      );
    } else if (dissolvedOxygen < 4) {
      riskScore += 22;
      detectedIssues.push("Low dissolved oxygen");

      recommendations.push(
        "Investigate organic waste and sewage contamination."
      );
    } else if (dissolvedOxygen < 6) {
      riskScore += 12;
      detectedIssues.push("Reduced dissolved oxygen");
    } else {
      riskScore += 2;
    }

    // Rainfall risk calculation
    if (rainfall > 150) {
      riskScore += 12;
      detectedIssues.push("Heavy rainfall and runoff risk");

      recommendations.push(
        "Monitor agricultural runoff and overflowing drainage systems."
      );
    } else if (rainfall > 75) {
      riskScore += 7;
      detectedIssues.push("Moderate rainfall runoff risk");
    }

    // Industrial activity calculation
    if (formData.industrialActivity === "High") {
      riskScore += 20;
      detectedIssues.push("High nearby industrial activity");

      recommendations.push(
        "Inspect nearby industries for untreated wastewater discharge."
      );
    } else if (formData.industrialActivity === "Medium") {
      riskScore += 12;
      detectedIssues.push("Moderate nearby industrial activity");
    } else {
      riskScore += 3;
    }

    const finalScore = Math.min(Math.round(riskScore), 100);

    let riskLevel = "Low Risk";
    let riskMessage =
      "Water conditions appear relatively stable. Continue regular monitoring.";

    if (finalScore >= 80) {
      riskLevel = "Critical Risk";
      riskMessage =
        "Severe pollution risk detected. Immediate authority intervention is required.";
    } else if (finalScore >= 60) {
      riskLevel = "High Risk";
      riskMessage =
        "Major pollution indicators detected. Rapid investigation is recommended.";
    } else if (finalScore >= 35) {
      riskLevel = "Medium Risk";
      riskMessage =
        "Some pollution indicators require closer monitoring and inspection.";
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Continue routine water-quality monitoring.",
        "Collect periodic samples for laboratory verification."
      );
    }

    recommendations.push(
      "Verify this prediction using certified laboratory testing."
    );

 const predictionResult = {
  score: finalScore,
  level: riskLevel,
  message: riskMessage,
  detectedIssues,
  recommendations: [...new Set(recommendations)],
};

setPrediction(predictionResult);
setErrorMessage("");
setSaveMessage("");

try {
  setSaving(true);

  await addDoc(collection(db, "aiPredictions"), {
    ph,
    turbidity,
    dissolvedOxygen,
    rainfall,
    industrialActivity: formData.industrialActivity,

    riskScore: predictionResult.score,
    riskLevel: predictionResult.level,
    riskMessage: predictionResult.message,

    detectedIssues: predictionResult.detectedIssues,
    recommendations: predictionResult.recommendations,

    userId: auth.currentUser?.uid || "",
    userEmail: auth.currentUser?.email || "",

    createdAt: serverTimestamp(),
  });

  setSaveMessage("Prediction saved successfully.");
} catch (error) {
  console.error("Unable to save AI prediction:", error);

  if (error.code === "permission-denied") {
    setSaveMessage(
      "Prediction generated, but Firestore permission was denied."
    );
  } else {
    setSaveMessage(
      "Prediction generated, but it could not be saved."
    );
  }
  } finally {
    setSaving(false);
  }
};

const resetPrediction = () => {
  setFormData(initialFormData);
  setPrediction(null);
  setErrorMessage("");
  setSaveMessage("");
};

  const getRiskStyles = (riskLevel) => {
    if (riskLevel === "Critical Risk") {
      return {
        badge:
          "border-red-500/40 bg-red-500/15 text-red-300",
        progress: "bg-red-500",
      };
    }

    if (riskLevel === "High Risk") {
      return {
        badge:
          "border-orange-500/40 bg-orange-500/15 text-orange-300",
        progress: "bg-orange-500",
      };
    }

    if (riskLevel === "Medium Risk") {
      return {
        badge:
          "border-amber-500/40 bg-amber-500/15 text-amber-300",
        progress: "bg-amber-500",
      };
    }

    return {
      badge:
        "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
      progress: "bg-emerald-500",
    };
  };

  const riskStyles = prediction
    ? getRiskStyles(prediction.level)
    : null;

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">
          AI Environmental Intelligence
        </p>

        <h2 className="mt-1 text-2xl font-bold text-white">
          Pollution Risk Prediction
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Enter environmental parameters to estimate the river
          pollution risk level and receive recommended actions.
        </p>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
          <h3 className="text-lg font-semibold text-white">
            Environmental Parameters
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InputField
              label="pH Level"
              name="ph"
              value={formData.ph}
              onChange={handleInputChange}
              placeholder="Example: 7.2"
              step="0.1"
              min="0"
              max="14"
            />

            <InputField
              label="Turbidity (NTU)"
              name="turbidity"
              value={formData.turbidity}
              onChange={handleInputChange}
              placeholder="Example: 25"
              step="0.1"
              min="0"
            />

            <InputField
              label="Dissolved Oxygen (mg/L)"
              name="dissolvedOxygen"
              value={formData.dissolvedOxygen}
              onChange={handleInputChange}
              placeholder="Example: 6.5"
              step="0.1"
              min="0"
            />

            <InputField
              label="Rainfall (mm)"
              name="rainfall"
              value={formData.rainfall}
              onChange={handleInputChange}
              placeholder="Example: 80"
              step="0.1"
              min="0"
            />

            <div className="sm:col-span-2">
              <label
                htmlFor="industrialActivity"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Nearby Industrial Activity
              </label>

              <select
                id="industrialActivity"
                name="industrialActivity"
                value={formData.industrialActivity}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}
          {saveMessage && (
  <div
    className={`mt-4 rounded-lg border p-3 text-sm ${
      saveMessage.includes("successfully")
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
        : "border-amber-500/30 bg-amber-500/10 text-amber-300"
    }`}
  >
    {saveMessage}
  </div>
)}

          <div className="mt-5 flex flex-wrap gap-3">
           <button
  type="button"
  onClick={calculatePrediction}
  disabled={saving}
  className="rounded-lg bg-violet-500 px-5 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
>
  {saving
    ? "Generating Prediction..."
    : "Generate AI Prediction"}
</button>

            <button
              type="button"
              onClick={resetPrediction}
              className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-700"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
          {!prediction ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
              <div className="text-6xl">🤖</div>

              <h3 className="mt-5 text-xl font-bold text-white">
                AI Prediction Awaiting Data
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                Enter the river water-quality parameters and click
                Generate AI Prediction to calculate the pollution
                risk score.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wider text-slate-500">
                    Predicted Risk Score
                  </p>

                  <p className="mt-1 text-5xl font-bold text-white">
                    {prediction.score}
                    <span className="text-2xl text-slate-500">
                      /100
                    </span>
                  </p>
                </div>

                <span
                  className={`rounded-full border px-4 py-2 text-sm font-bold ${riskStyles.badge}`}
                >
                  {prediction.level}
                </span>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${riskStyles.progress}`}
                  style={{ width: `${prediction.score}%` }}
                />
              </div>

              <p className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm leading-6 text-slate-300">
                {prediction.message}
              </p>

              <div className="mt-5">
                <h4 className="font-semibold text-white">
                  Detected Indicators
                </h4>

                {prediction.detectedIssues.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {prediction.detectedIssues.map((issue) => (
                      <span
                        key={issue}
                        className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-emerald-400">
                    No major pollution indicators detected.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-white">
                  Recommended Actions
                </h4>

                <ul className="mt-3 space-y-3">
                  {prediction.recommendations.map(
                    (recommendation) => (
                      <li
                        key={recommendation}
                        className="flex gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-300"
                      >
                        <span className="text-violet-400">✓</span>
                        <span>{recommendation}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950/30 px-6 py-4">
        <p className="text-xs leading-5 text-slate-500">
          This prediction is currently generated using an
          environmental risk-scoring algorithm. It should support,
          not replace, certified laboratory analysis and official
          environmental assessment.
        </p>
      </div>
    </section>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  step,
  min,
  max,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-300"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500"
      />
    </div>
  );
}