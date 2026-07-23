import { useEffect, useMemo, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase";

export default function PollutionTrendChart() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const predictionsQuery = query(
      collection(db, "aiPredictions"),
      orderBy("createdAt", "desc"),
      limit(15)
    );

    const unsubscribe = onSnapshot(
      predictionsQuery,
      (snapshot) => {
        const predictionData = snapshot.docs
          .map((document) => ({
            id: document.id,
            ...document.data(),
          }))
          .filter(
            (prediction) =>
              prediction.riskScore !== undefined &&
              prediction.riskScore !== null
          )
          .reverse();

        setPredictions(predictionData);
        setLoading(false);
        setErrorMessage("");
      },
      (error) => {
        console.error(
          "Unable to load pollution trend data:",
          error
        );

        setErrorMessage(
          "Unable to load pollution risk trend."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const chartData = useMemo(() => {
    if (predictions.length === 0) {
      return {
        points: [],
        polylinePoints: "",
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        trendStatus: "No Data",
      };
    }

    const chartWidth = 800;
    const chartHeight = 280;
    const horizontalPadding = 45;
    const verticalPadding = 25;

    const usableWidth =
      chartWidth - horizontalPadding * 2;

    const usableHeight =
      chartHeight - verticalPadding * 2;

    const scores = predictions.map((prediction) =>
      Number(prediction.riskScore || 0)
    );

    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    const averageScore = Math.round(
      scores.reduce((sum, score) => sum + score, 0) /
        scores.length
    );

    const points = predictions.map(
      (prediction, index) => {
        const x =
          predictions.length === 1
            ? chartWidth / 2
            : horizontalPadding +
              (index / (predictions.length - 1)) *
                usableWidth;

        const score = Number(
          prediction.riskScore || 0
        );

        const y =
          verticalPadding +
          ((100 - score) / 100) * usableHeight;

        return {
          id: prediction.id,
          x,
          y,
          score,
          riskLevel:
            prediction.riskLevel || "Unknown",
          date: formatShortDate(
            prediction.createdAt
          ),
        };
      }
    );

    const polylinePoints = points
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];

    let trendStatus = "Stable";

    if (lastScore > firstScore + 5) {
      trendStatus = "Increasing";
    } else if (lastScore < firstScore - 5) {
      trendStatus = "Decreasing";
    }

    return {
      points,
      polylinePoints,
      averageScore,
      highestScore,
      lowestScore,
      trendStatus,
    };
  }, [predictions]);

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

          <span>Loading pollution trend...</span>
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
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 px-6 py-5 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Environmental Trend Analysis
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            Pollution Risk Trend
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Latest AI-generated pollution risk scores displayed
            chronologically.
          </p>
        </div>

        <TrendBadge status={chartData.trendStatus} />
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
        <TrendCard
          title="Average Score"
          value={`${chartData.averageScore}/100`}
          icon="📊"
        />

        <TrendCard
          title="Highest Score"
          value={`${chartData.highestScore}/100`}
          icon="🔺"
        />

        <TrendCard
          title="Lowest Score"
          value={`${chartData.lowestScore}/100`}
          icon="🔻"
        />

        <TrendCard
          title="Records Analyzed"
          value={predictions.length}
          icon="🧠"
        />
      </div>

      {predictions.length === 0 ? (
        <div className="border-t border-slate-800 px-6 py-16 text-center">
          <div className="text-6xl">📈</div>

          <h3 className="mt-4 text-xl font-semibold text-white">
            No trend data available
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Generate at least one AI prediction to display the
            pollution risk trend.
          </p>
        </div>
      ) : (
        <div className="border-t border-slate-800 p-6">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <svg
              viewBox="0 0 800 330"
              className="min-w-[700px] w-full"
              role="img"
              aria-label="Pollution risk score trend chart"
            >
              <ChartGrid />

              <line
                x1="45"
                y1={scoreToY(chartData.averageScore)}
                x2="755"
                y2={scoreToY(chartData.averageScore)}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="7 7"
                className="text-violet-400/70"
              />

              <text
                x="755"
                y={
                  scoreToY(
                    chartData.averageScore
                  ) - 7
                }
                textAnchor="end"
                className="fill-violet-300 text-[11px]"
              >
                Average: {chartData.averageScore}
              </text>

              {chartData.points.length > 1 && (
                <polyline
                  points={chartData.polylinePoints}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-cyan-400"
                />
              )}

              {chartData.points.map((point) => (
                <g key={point.id}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="7"
                    fill="currentColor"
                    className={getPointStyle(
                      point.riskLevel
                    )}
                  />

                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="12"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`${getPointStyle(
                      point.riskLevel
                    )} opacity-30`}
                  />

                  <text
                    x={point.x}
                    y={point.y - 18}
                    textAnchor="middle"
                    className="fill-white text-[12px] font-semibold"
                  >
                    {point.score}
                  </text>

                  <text
                    x={point.x}
                    y="314"
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px]"
                  >
                    {point.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-xs">
            <LegendItem
              label="Critical Risk"
              className="bg-red-500"
            />

            <LegendItem
              label="High Risk"
              className="bg-orange-500"
            />

            <LegendItem
              label="Medium Risk"
              className="bg-amber-500"
            />

            <LegendItem
              label="Low Risk"
              className="bg-emerald-500"
            />

            <LegendItem
              label="Average Score"
              className="bg-violet-500"
            />
          </div>
        </div>
      )}
    </section>
  );
}

function ChartGrid() {
  const gridScores = [100, 80, 60, 40, 20, 0];

  return (
    <>
      {gridScores.map((score) => {
        const y = scoreToY(score);

        return (
          <g key={score}>
            <line
              x1="45"
              y1={y}
              x2="755"
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-800"
            />

            <text
              x="35"
              y={y + 4}
              textAnchor="end"
              className="fill-slate-500 text-[11px]"
            >
              {score}
            </text>
          </g>
        );
      })}

      <line
        x1="45"
        y1="25"
        x2="45"
        y2="255"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-slate-700"
      />

      <line
        x1="45"
        y1="255"
        x2="755"
        y2="255"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-slate-700"
      />
    </>
  );
}

function TrendCard({ title, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TrendBadge({ status }) {
  const styles = {
    Increasing:
      "border-red-500/30 bg-red-500/10 text-red-300",
    Decreasing:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    Stable:
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    "No Data":
      "border-slate-700 bg-slate-800 text-slate-300",
  };

  const icons = {
    Increasing: "↗",
    Decreasing: "↘",
    Stable: "→",
    "No Data": "–",
  };

  return (
    <div
      className={`rounded-full border px-4 py-2 text-sm font-semibold ${
        styles[status]
      }`}
    >
      {icons[status]} Risk Trend: {status}
    </div>
  );
}

function LegendItem({ label, className }) {
  return (
    <div className="flex items-center gap-2 text-slate-400">
      <span
        className={`h-3 w-3 rounded-full ${className}`}
      />

      <span>{label}</span>
    </div>
  );
}

function scoreToY(score) {
  const verticalPadding = 25;
  const usableHeight = 230;

  return (
    verticalPadding +
    ((100 - Number(score || 0)) / 100) *
      usableHeight
  );
}

function getPointStyle(riskLevel) {
  if (riskLevel === "Critical Risk") {
    return "text-red-500";
  }

  if (riskLevel === "High Risk") {
    return "text-orange-500";
  }

  if (riskLevel === "Medium Risk") {
    return "text-amber-500";
  }

  return "text-emerald-500";
}

function formatShortDate(timestamp) {
  if (!timestamp?.toDate) {
    return "Now";
  }

  return timestamp.toDate().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}