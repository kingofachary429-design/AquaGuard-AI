import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../firebase";

export default function AIRecommendationsPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "pollutionReports"),
      (snapshot) => {
        const reportData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setReports(reportData);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error(
          "AI recommendations loading failed:",
          snapshotError
        );

        setError("AI recommendations load avvaledu.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const recommendations = useMemo(() => {
    const generatedRecommendations = [];

    reports.forEach((report) => {
      const reportRecommendations =
        generateRecommendations(report);

      reportRecommendations.forEach((recommendation) => {
        generatedRecommendations.push({
          ...recommendation,
          reportId: report.id,
          riverName:
            report.riverName ||
            report.river ||
            "Unknown River",
          location:
            report.location ||
            report.pollutionLocation ||
            report.area ||
            "Location not provided",
        });
      });
    });

    return generatedRecommendations
      .sort(
        (firstRecommendation, secondRecommendation) =>
          secondRecommendation.priorityScore -
          firstRecommendation.priorityScore
      )
      .slice(0, 8);
  }, [reports]);

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

          <p className="text-sm text-slate-400">
            Generating AI recommendations...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-6 md:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              AI Decision Support
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Environmental Recommendations
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Pollution risk and water-quality parameters batti
              automatic response recommendations generate chestundi.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Active Actions
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
              {recommendations.length}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && recommendations.length === 0 && (
        <div className="p-10 text-center">
          <div className="text-4xl">🤖</div>

          <h3 className="mt-4 text-lg font-bold text-white">
            No Recommendations Available
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Environmental values tho reports submit chesina
            tarvata AI recommendations display avutayi.
          </p>
        </div>
      )}

      {!error && recommendations.length > 0 && (
        <div className="grid gap-5 p-6 md:grid-cols-2">
          {recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={`${recommendation.reportId}-${recommendation.type}-${index}`}
              recommendation={recommendation}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function RecommendationCard({ recommendation }) {
  const style = getPriorityStyle(
    recommendation.priority
  );

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${style.background}`}
        >
          {recommendation.icon}
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${style.badge}`}
        >
          {recommendation.priority}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-bold text-white">
        {recommendation.title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-300">
        {recommendation.message}
      </p>

      <div className="mt-5 space-y-2 border-t border-slate-800 pt-4">
        <p className="text-sm text-slate-400">
          🌊{" "}
          <span className="font-semibold text-white">
            {recommendation.riverName}
          </span>
        </p>

        <p className="text-sm text-slate-400">
          📍 {recommendation.location}
        </p>
      </div>
    </article>
  );
}

function generateRecommendations(report) {
  const recommendations = [];

  const riskScore = getRiskScore(report);
  const riskLevel = String(
    report.riskLevel || ""
  ).toLowerCase();

  const ph = toValidNumber(report.ph);
  const turbidity = toValidNumber(
    report.turbidity
  );
  const dissolvedOxygen = toValidNumber(
    report.dissolvedOxygen
  );
  const rainfall = toValidNumber(
    report.rainfall
  );
  const industrialActivity = toValidNumber(
    report.industrialActivity
  );

  if (
    riskScore >= 80 ||
    riskLevel.includes("critical")
  ) {
    recommendations.push({
      type: "emergency-response",
      title: "Immediate Field Inspection",
      message:
        "Environmental authority team ni immediate ga deploy chesi water samples collect cheyyali. Pollution source ni isolate cheyyali.",
      priority: "Critical",
      priorityScore: 100,
      icon: "🚨",
    });
  } else if (
    riskScore >= 60 ||
    riskLevel.includes("high")
  ) {
    recommendations.push({
      type: "urgent-monitoring",
      title: "Urgent River Monitoring",
      message:
        "River location lo additional monitoring conduct chesi pollution spread ni track cheyyali.",
      priority: "High",
      priorityScore: 85,
      icon: "⚠️",
    });
  }

  if (ph !== null && (ph < 6.5 || ph > 8.5)) {
    recommendations.push({
      type: "ph-control",
      title: "Abnormal pH Investigation",
      message:
        "Water pH safe range lo ledu. Chemical discharge, industrial effluent and acidic or alkaline waste sources ni investigate cheyyali.",
      priority:
        ph < 5 || ph > 9
          ? "Critical"
          : "High",
      priorityScore:
        ph < 5 || ph > 9
          ? 95
          : 75,
      icon: "🧪",
    });
  }

  if (
    turbidity !== null &&
    turbidity > 20
  ) {
    recommendations.push({
      type: "turbidity-control",
      title: "High Turbidity Control",
      message:
        "Suspended particles and solid waste levels ekkuva unnayi. Sediment, construction waste and sewage discharge sources ni check cheyyali.",
      priority:
        turbidity > 50
          ? "Critical"
          : "High",
      priorityScore:
        turbidity > 50
          ? 90
          : 70,
      icon: "🌫️",
    });
  }

  if (
    dissolvedOxygen !== null &&
    dissolvedOxygen < 5
  ) {
    recommendations.push({
      type: "oxygen-restoration",
      title: "Restore Dissolved Oxygen",
      message:
        "Dissolved oxygen level takkuvaga undi. Sewage discharge ni stop chesi aeration and biological restoration measures initiate cheyyali.",
      priority:
        dissolvedOxygen < 3
          ? "Critical"
          : "High",
      priorityScore:
        dissolvedOxygen < 3
          ? 92
          : 72,
      icon: "💨",
    });
  }

  if (
    industrialActivity !== null &&
    industrialActivity >= 7
  ) {
    recommendations.push({
      type: "industrial-inspection",
      title: "Inspect Nearby Industries",
      message:
        "Industrial activity high ga undi. Nearby factories effluent treatment systems and discharge permissions ni verify cheyyali.",
      priority: "High",
      priorityScore: 82,
      icon: "🏭",
    });
  }

  if (
    rainfall !== null &&
    rainfall > 50
  ) {
    recommendations.push({
      type: "rainfall-monitoring",
      title: "Monitor Rainfall Runoff",
      message:
        "Heavy rainfall valla agricultural chemicals, sewage and solid waste river loki enter ayye risk undi. Runoff monitoring increase cheyyali.",
      priority: "Moderate",
      priorityScore: 60,
      icon: "🌧️",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "routine-monitoring",
      title: "Continue Routine Monitoring",
      message:
        "Current environmental parameters major danger indicate cheyyatledu. Regular sampling and citizen reporting continue cheyyali.",
      priority: "Low",
      priorityScore: 30,
      icon: "✅",
    });
  }

  return recommendations;
}

function getRiskScore(report) {
  const savedRiskScore = Number(
    report.riskScore
  );

  if (Number.isFinite(savedRiskScore)) {
    return Math.min(
      Math.max(savedRiskScore, 0),
      100
    );
  }

  const riskLevel = String(
    report.riskLevel || ""
  ).toLowerCase();

  if (riskLevel.includes("critical")) {
    return 90;
  }

  if (riskLevel.includes("high")) {
    return 70;
  }

  if (
    riskLevel.includes("moderate") ||
    riskLevel.includes("medium")
  ) {
    return 50;
  }

  if (riskLevel.includes("low")) {
    return 25;
  }

  return 40;
}

function toValidNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : null;
}

function getPriorityStyle(priority) {
  if (priority === "Critical") {
    return {
      background: "bg-red-500/10",
      badge:
        "border-red-500/30 bg-red-500/10 text-red-300",
    };
  }

  if (priority === "High") {
    return {
      background: "bg-orange-500/10",
      badge:
        "border-orange-500/30 bg-orange-500/10 text-orange-300",
    };
  }

  if (priority === "Moderate") {
    return {
      background: "bg-amber-500/10",
      badge:
        "border-amber-500/30 bg-amber-500/10 text-amber-300",
    };
  }

  return {
    background: "bg-emerald-500/10",
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  };
}