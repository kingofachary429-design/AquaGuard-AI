import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function RiverHealthScore() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const reportsReference = collection(
      db,
      "pollutionReports"
    );

    const unsubscribe = onSnapshot(
      reportsReference,
      (snapshot) => {
        const reportData = snapshot.docs.map(
          (reportDocument) => ({
            id: reportDocument.id,
            ...reportDocument.data(),
          })
        );

        setReports(reportData);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error(
          "River health reports error:",
          snapshotError
        );

        setError(
          "River health information load avvaledu."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const riverHealthData = useMemo(() => {
    const groupedRivers = {};

    reports.forEach((report) => {
      const riverName =
        report.riverName?.trim() || "Unknown River";

      if (!groupedRivers[riverName]) {
        groupedRivers[riverName] = {
          riverName,
          totalScore: 0,
          reportCount: 0,
          criticalReports: 0,
          latestRisk: "Under Review",
        };
      }

      const healthScore =
        calculateReportHealthScore(report);

      groupedRivers[riverName].totalScore +=
        healthScore;

      groupedRivers[riverName].reportCount += 1;

      groupedRivers[riverName].latestRisk =
        report.riskLevel || "Under Review";

      if (
        String(report.riskLevel || "")
          .toLowerCase()
          .includes("critical")
      ) {
        groupedRivers[
          riverName
        ].criticalReports += 1;
      }
    });

    return Object.values(groupedRivers)
      .map((river) => {
        const averageScore = Math.round(
          river.totalScore / river.reportCount
        );

        return {
          ...river,
          healthScore: averageScore,
          healthStatus:
            getHealthStatus(averageScore),
        };
      })
      .sort(
        (firstRiver, secondRiver) =>
          firstRiver.healthScore -
          secondRiver.healthScore
      );
  }, [reports]);

  const overallHealthScore = useMemo(() => {
    if (riverHealthData.length === 0) {
      return 0;
    }

    const totalScore = riverHealthData.reduce(
      (total, river) =>
        total + river.healthScore,
      0
    );

    return Math.round(
      totalScore / riverHealthData.length
    );
  }, [riverHealthData]);

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-center gap-3 py-10 text-slate-400">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

          <p>Calculating river health scores...</p>
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
              Environmental Intelligence
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              River Health Score
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              AI risk score, pH, turbidity,
              dissolved oxygen and pollution
              reports based river condition.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Overall Health
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
              {overallHealthScore}%
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {
                getHealthStatus(
                  overallHealthScore
                ).label
              }
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="m-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error &&
        riverHealthData.length === 0 && (
          <div className="p-10 text-center">
            <div className="text-4xl">🌊</div>

            <h3 className="mt-4 text-lg font-bold text-white">
              No River Reports Available
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Citizen pollution report submit
              chesina tarvata health score
              automatic ga display avutundi.
            </p>
          </div>
        )}

      {riverHealthData.length > 0 && (
        <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
          {riverHealthData.map((river) => (
            <RiverHealthCard
              key={river.riverName}
              river={river}
            />
          ))}
        </div>
      )}

      {riverHealthData.length > 0 && (
        <div className="border-t border-slate-800 bg-slate-950/30 px-6 py-4 text-sm text-slate-400">
          Monitoring{" "}
          <span className="font-semibold text-white">
            {riverHealthData.length}
          </span>{" "}
          rivers from{" "}
          <span className="font-semibold text-white">
            {reports.length}
          </span>{" "}
          pollution reports.
        </div>
      )}
    </section>
  );
}

function RiverHealthCard({ river }) {
  const status = river.healthStatus;

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 transition hover:-translate-y-1 hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl ${status.iconBackground}`}
          >
            {status.icon}
          </div>

          <h3 className="mt-4 text-lg font-bold text-white">
            {river.riverName}
          </h3>

          <p
            className={`mt-1 text-sm font-semibold ${status.textColor}`}
          >
            {status.label}
          </p>
        </div>

        <div className="text-right">
          <p
            className={`text-3xl font-bold ${status.textColor}`}
          >
            {river.healthScore}%
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Health Score
          </p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${status.progressColor}`}
          style={{
            width: `${river.healthScore}%`,
          }}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
          <p className="text-xs text-slate-500">
            Reports
          </p>

          <p className="mt-1 text-lg font-bold text-white">
            {river.reportCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
          <p className="text-xs text-slate-500">
            Critical Reports
          </p>

          <p className="mt-1 text-lg font-bold text-red-300">
            {river.criticalReports}
          </p>
        </div>
      </div>
    </article>
  );
}

function calculateReportHealthScore(report) {
  let score = 100;

  const riskScore = Number(report.riskScore);

  if (!Number.isNaN(riskScore)) {
    score -= Math.min(
      Math.max(riskScore, 0),
      100
    );
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

  const turbidity = Number(
    report.turbidity
  );

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
      icon: "💧",
      textColor: "text-emerald-300",
      progressColor: "bg-emerald-500",
      iconBackground: "bg-emerald-500/10",
    };
  }

  if (score >= 60) {
    return {
      label: "Moderate",
      icon: "🌊",
      textColor: "text-amber-300",
      progressColor: "bg-amber-500",
      iconBackground: "bg-amber-500/10",
    };
  }

  if (score >= 40) {
    return {
      label: "Poor",
      icon: "⚠️",
      textColor: "text-orange-300",
      progressColor: "bg-orange-500",
      iconBackground: "bg-orange-500/10",
    };
  }

  return {
    label: "Critical",
    icon: "🚨",
    textColor: "text-red-300",
    progressColor: "bg-red-500",
    iconBackground: "bg-red-500/10",
  };
}