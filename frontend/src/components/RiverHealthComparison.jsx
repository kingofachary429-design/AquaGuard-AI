import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function RiverHealthComparison() {
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
          "River health comparison error:",
          snapshotError
        );

        setError("River comparison data load avvaledu.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const riverComparisonData = useMemo(() => {
    const groupedRivers = {};

    reports.forEach((report) => {
      const riverName =
        report.riverName?.trim() || "Unknown River";

      if (!groupedRivers[riverName]) {
        groupedRivers[riverName] = {
          riverName,
          totalScore: 0,
          reportCount: 0,
        };
      }

      const healthScore =
        calculateReportHealthScore(report);

      groupedRivers[riverName].totalScore += healthScore;
      groupedRivers[riverName].reportCount += 1;
    });

    return Object.values(groupedRivers)
      .map((river) => {
        const averageScore = Math.round(
          river.totalScore / river.reportCount
        );

        return {
          riverName: river.riverName,
          reportCount: river.reportCount,
          healthScore: averageScore,
          status: getHealthStatus(averageScore),
        };
      })
      .sort(
        (firstRiver, secondRiver) =>
          secondRiver.healthScore - firstRiver.healthScore
      );
  }, [reports]);

  const healthiestRiver = riverComparisonData[0];

  const mostPollutedRiver =
    riverComparisonData.length > 0
      ? riverComparisonData[
          riverComparisonData.length - 1
        ]
      : null;

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-center gap-3 py-10 text-slate-400">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

          <p>Preparing river comparison...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          River Analytics
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          River Health Comparison
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Health score basis meeda monitored rivers-ni
          compare chestundi.
        </p>
      </div>

      {error && (
        <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && riverComparisonData.length === 0 && (
        <div className="p-10 text-center">
          <div className="text-4xl">📊</div>

          <h3 className="mt-4 text-lg font-bold text-white">
            No Comparison Data
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Pollution reports submit chesina tarvata
            comparison chart display avutundi.
          </p>
        </div>
      )}

      {riverComparisonData.length > 0 && (
        <>
          <div className="grid gap-4 border-b border-slate-800 p-6 md:grid-cols-2">
            <SummaryCard
              title="Healthiest River"
              riverName={healthiestRiver?.riverName}
              score={healthiestRiver?.healthScore}
              icon="🏆"
              textClass="text-emerald-300"
            />

            <SummaryCard
              title="Needs Immediate Attention"
              riverName={mostPollutedRiver?.riverName}
              score={mostPollutedRiver?.healthScore}
              icon="🚨"
              textClass="text-red-300"
            />
          </div>

          <div className="space-y-6 p-6 md:p-8">
            {riverComparisonData.map((river, index) => (
              <RiverBar
                key={river.riverName}
                river={river}
                position={index + 1}
              />
            ))}
          </div>

          <div className="border-t border-slate-800 bg-slate-950/30 px-6 py-4 text-sm text-slate-400">
            Comparing{" "}
            <span className="font-semibold text-white">
              {riverComparisonData.length}
            </span>{" "}
            monitored rivers.
          </div>
        </>
      )}
    </section>
  );
}

function RiverBar({ river, position }) {
  return (
    <article>
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-slate-300">
            {position}
          </div>

          <div>
            <h3 className="font-semibold text-white">
              {river.riverName}
            </h3>

            <p className="text-xs text-slate-500">
              {river.reportCount} pollution report
              {river.reportCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p
            className={`text-xl font-bold ${river.status.textColor}`}
          >
            {river.healthScore}%
          </p>

          <p
            className={`text-xs font-semibold ${river.status.textColor}`}
          >
            {river.status.label}
          </p>
        </div>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${river.status.progressColor}`}
          style={{
            width: `${river.healthScore}%`,
          }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-600">
        <span>Critical</span>
        <span>Moderate</span>
        <span>Healthy</span>
      </div>
    </article>
  );
}

function SummaryCard({
  title,
  riverName,
  score,
  icon,
  textClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h3 className="mt-2 text-lg font-bold text-white">
            {riverName || "Not Available"}
          </h3>

          <p className={`mt-2 text-2xl font-bold ${textClass}`}>
            {score ?? 0}%
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function calculateReportHealthScore(report) {
  let score = 100;

  const riskScore = Number(report.riskScore);

  if (!Number.isNaN(riskScore)) {
    score -= Math.min(Math.max(riskScore, 0), 100);
  } else {
    const riskLevel = String(
      report.riskLevel || ""
    ).toLowerCase();

    if (riskLevel.includes("critical")) {
      score -= 75;
    } else if (riskLevel.includes("high")) {
      score -= 55;
    } else if (
      riskLevel.includes("medium") ||
      riskLevel.includes("moderate")
    ) {
      score -= 35;
    } else if (riskLevel.includes("low")) {
      score -= 15;
    } else {
      score -= 25;
    }
  }

  const ph = Number(report.ph);

  if (!Number.isNaN(ph)) {
    if (ph < 5 || ph > 9) {
      score -= 15;
    } else if (ph < 6.5 || ph > 8.5) {
      score -= 7;
    }
  }

  const turbidity = Number(report.turbidity);

  if (!Number.isNaN(turbidity)) {
    if (turbidity > 50) {
      score -= 15;
    } else if (turbidity > 20) {
      score -= 8;
    }
  }

  const dissolvedOxygen = Number(
    report.dissolvedOxygen
  );

  if (!Number.isNaN(dissolvedOxygen)) {
    if (dissolvedOxygen < 3) {
      score -= 15;
    } else if (dissolvedOxygen < 5) {
      score -= 8;
    }
  }

  return Math.min(
    Math.max(Math.round(score), 0),
    100
  );
}

function getHealthStatus(score) {
  if (score >= 80) {
    return {
      label: "Healthy",
      textColor: "text-emerald-300",
      progressColor: "bg-emerald-500",
    };
  }

  if (score >= 60) {
    return {
      label: "Moderate",
      textColor: "text-amber-300",
      progressColor: "bg-amber-500",
    };
  }

  if (score >= 40) {
    return {
      label: "Poor",
      textColor: "text-orange-300",
      progressColor: "bg-orange-500",
    };
  }

  return {
    label: "Critical",
    textColor: "text-red-300",
    progressColor: "bg-red-500",
  };
}