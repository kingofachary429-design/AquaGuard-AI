import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";

import { db } from "../firebase";

export default function PredictionAnalytics() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const predictionsQuery = query(
      collection(db, "aiPredictions")
    );

    const unsubscribe = onSnapshot(
      predictionsQuery,
      (snapshot) => {
        const predictionData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setPredictions(predictionData);
        setLoading(false);
        setErrorMessage("");
      },
      (error) => {
        console.error(
          "Unable to load prediction analytics:",
          error
        );

        setErrorMessage(
          "Unable to load prediction analytics."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const analytics = useMemo(() => {
    const total = predictions.length;

    const critical = predictions.filter(
      (prediction) =>
        prediction.riskLevel === "Critical Risk"
    ).length;

    const high = predictions.filter(
      (prediction) =>
        prediction.riskLevel === "High Risk"
    ).length;

    const medium = predictions.filter(
      (prediction) =>
        prediction.riskLevel === "Medium Risk"
    ).length;

    const low = predictions.filter(
      (prediction) =>
        prediction.riskLevel === "Low Risk"
    ).length;

    const totalScore = predictions.reduce(
      (sum, prediction) =>
        sum + Number(prediction.riskScore || 0),
      0
    );

    const averageScore =
      total > 0 ? Math.round(totalScore / total) : 0;

    return {
      total,
      critical,
      high,
      medium,
      low,
      averageScore,
    };
  }, [predictions]);

  const getPercentage = (count) => {
    if (analytics.total === 0) {
      return 0;
    }

    return Math.round(
      (count / analytics.total) * 100
    );
  };

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-violet-400" />

          <span>Loading AI analytics...</span>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
        {errorMessage}
      </section>
    );
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Environmental Intelligence
        </p>

        <h2 className="mt-1 text-2xl font-bold text-white">
          AI Prediction Analytics
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Live statistical analysis of pollution risk predictions.
        </p>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          title="Total Predictions"
          value={analytics.total}
          icon="📊"
          description="All AI analysis records"
        />

        <AnalyticsCard
          title="Average Risk Score"
          value={`${analytics.averageScore}/100`}
          icon="🧠"
          description="Average pollution risk"
        />

        <AnalyticsCard
          title="Critical Predictions"
          value={analytics.critical}
          icon="🚨"
          description="Immediate action required"
        />

        <AnalyticsCard
          title="High-Risk Predictions"
          value={analytics.high}
          icon="⚠️"
          description="Rapid inspection required"
        />
      </div>

      <div className="grid gap-6 border-t border-slate-800 p-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
          <h3 className="text-lg font-semibold text-white">
            Risk Distribution
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Percentage of predictions under each risk category.
          </p>

          <div className="mt-6 space-y-5">
            <RiskBar
              label="Critical Risk"
              count={analytics.critical}
              percentage={getPercentage(
                analytics.critical
              )}
              barClass="bg-red-500"
              badgeClass="bg-red-500/10 text-red-300"
            />

            <RiskBar
              label="High Risk"
              count={analytics.high}
              percentage={getPercentage(
                analytics.high
              )}
              barClass="bg-orange-500"
              badgeClass="bg-orange-500/10 text-orange-300"
            />

            <RiskBar
              label="Medium Risk"
              count={analytics.medium}
              percentage={getPercentage(
                analytics.medium
              )}
              barClass="bg-amber-500"
              badgeClass="bg-amber-500/10 text-amber-300"
            />

            <RiskBar
              label="Low Risk"
              count={analytics.low}
              percentage={getPercentage(
                analytics.low
              )}
              barClass="bg-emerald-500"
              badgeClass="bg-emerald-500/10 text-emerald-300"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
          <h3 className="text-lg font-semibold text-white">
            Environmental Summary
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Automatic summary generated from current prediction data.
          </p>

          <div className="mt-6 space-y-4">
            <SummaryItem
              label="Safe Predictions"
              value={analytics.low}
              description="Predictions classified under low risk."
            />

            <SummaryItem
              label="Moderate Alerts"
              value={analytics.medium}
              description="Predictions requiring continued monitoring."
            />

            <SummaryItem
              label="Serious Alerts"
              value={
                analytics.high +
                analytics.critical
              }
              description="High and critical predictions requiring investigation."
            />

            <SummaryItem
              label="Overall Risk Status"
              value={getOverallStatus(
                analytics.averageScore
              )}
              description="Calculated using the average prediction score."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function AnalyticsCard({
  title,
  value,
  icon,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function RiskBar({
  label,
  count,
  percentage,
  barClass,
  badgeClass,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <span className="text-sm font-medium text-slate-300">
            {label}
          </span>

          <span
            className={`ml-2 rounded-full px-2 py-1 text-xs ${badgeClass}`}
          >
            {count}
          </span>
        </div>

        <span className="text-sm font-semibold text-white">
          {percentage}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  description,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div>
        <p className="text-sm font-semibold text-white">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <span className="text-right text-lg font-bold text-cyan-400">
        {value}
      </span>
    </div>
  );
}

function getOverallStatus(averageScore) {
  if (averageScore >= 80) {
    return "Critical";
  }

  if (averageScore >= 60) {
    return "High";
  }

  if (averageScore >= 35) {
    return "Medium";
  }

  return "Low";
}