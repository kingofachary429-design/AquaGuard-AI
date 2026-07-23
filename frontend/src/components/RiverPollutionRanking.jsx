import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";

export default function RiverPollutionRanking() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "pollutionReports"),
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
          "River pollution ranking loading failed:",
          snapshotError
        );

        setError(
          "River pollution ranking load avvaledu."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const rankedRivers = useMemo(() => {
    const riverGroups = {};

    reports.forEach((report) => {
      const riverName = normalizeRiverName(
        report.riverName ||
          report.river ||
          "Unknown River"
      );

      if (!riverGroups[riverName]) {
        riverGroups[riverName] = {
          riverName,
          totalReports: 0,
          totalRiskScore: 0,
          criticalReports: 0,
          highReports: 0,
          resolvedReports: 0,
        };
      }

      const riskScore = getRiskScore(report);
      const riskLevel = getRiskLevel(
        report,
        riskScore
      );
      const status = String(
        report.status || ""
      ).toLowerCase();

      riverGroups[riverName].totalReports += 1;

      riverGroups[riverName].totalRiskScore +=
        riskScore;

      if (riskLevel === "Critical") {
        riverGroups[riverName].criticalReports += 1;
      }

      if (riskLevel === "High") {
        riverGroups[riverName].highReports += 1;
      }

      if (status === "resolved") {
        riverGroups[riverName].resolvedReports += 1;
      }
    });

    return Object.values(riverGroups)
      .map((river) => {
        const averageRiskScore =
          river.totalReports > 0
            ? Math.round(
                river.totalRiskScore /
                  river.totalReports
              )
            : 0;

        const pollutionIndex = calculatePollutionIndex(
          averageRiskScore,
          river.criticalReports,
          river.highReports,
          river.totalReports
        );

        return {
          ...river,
          averageRiskScore,
          pollutionIndex,
          riskLevel: getLevelFromScore(
            pollutionIndex
          ),
        };
      })
      .sort(
        (firstRiver, secondRiver) =>
          secondRiver.pollutionIndex -
          firstRiver.pollutionIndex
      )
      .slice(0, 10);
  }, [reports]);

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

          <p className="text-sm text-slate-400">
            Calculating river pollution rankings...
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
              River Intelligence
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              River-wise Pollution Ranking
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Report count, critical incidents and average
              pollution risk score batti rivers rank avutayi.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Rivers Monitored
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
              {rankedRivers.length}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && rankedRivers.length === 0 && (
        <div className="p-10 text-center">
          <div className="text-4xl">🌊</div>

          <h3 className="mt-4 text-lg font-bold text-white">
            No River Data Available
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Reports submit chesina tarvata river pollution
            ranking display avutundi.
          </p>
        </div>
      )}

      {!error && rankedRivers.length > 0 && (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Rank
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    River
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Reports
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Avg Risk
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Critical
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Pollution Index
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {rankedRivers.map((river, index) => (
                  <RiverRankingRow
                    key={river.riverName}
                    river={river}
                    rank={index + 1}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 p-5 md:hidden">
            {rankedRivers.map((river, index) => (
              <RiverRankingCard
                key={river.riverName}
                river={river}
                rank={index + 1}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function RiverRankingRow({ river, rank }) {
  const style = getRiskStyle(
    river.pollutionIndex
  );

  return (
    <tr className="border-b border-slate-800 transition hover:bg-slate-800/40">
      <td className="px-6 py-5">
        <RankBadge rank={rank} />
      </td>

      <td className="px-6 py-5">
        <p className="font-semibold text-white">
          {river.riverName}
        </p>
      </td>

      <td className="px-6 py-5 text-sm text-slate-300">
        {river.totalReports}
      </td>

      <td className="px-6 py-5 text-sm text-slate-300">
        {river.averageRiskScore}/100
      </td>

      <td className="px-6 py-5 text-sm text-red-300">
        {river.criticalReports}
      </td>

      <td className="px-6 py-5">
        <div className="min-w-32">
          <div className="mb-2 flex justify-between text-xs">
            <span className={style.text}>
              {river.pollutionIndex}/100
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full ${style.progress}`}
              style={{
                width: `${river.pollutionIndex}%`,
              }}
            />
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${style.badge}`}
        >
          {river.riskLevel}
        </span>
      </td>
    </tr>
  );
}

function RiverRankingCard({ river, rank }) {
  const style = getRiskStyle(
    river.pollutionIndex
  );

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <RankBadge rank={rank} />

          <div>
            <h3 className="font-bold text-white">
              {river.riverName}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {river.totalReports} reports
            </p>
          </div>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${style.badge}`}
        >
          {river.riskLevel}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-800/70 p-3">
          <p className="text-lg font-bold text-white">
            {river.averageRiskScore}
          </p>

          <p className="text-xs text-slate-400">
            Avg Risk
          </p>
        </div>

        <div className="rounded-xl bg-slate-800/70 p-3">
          <p className="text-lg font-bold text-red-300">
            {river.criticalReports}
          </p>

          <p className="text-xs text-slate-400">
            Critical
          </p>
        </div>

        <div className="rounded-xl bg-slate-800/70 p-3">
          <p className={`text-lg font-bold ${style.text}`}>
            {river.pollutionIndex}
          </p>

          <p className="text-xs text-slate-400">
            Index
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${style.progress}`}
          style={{
            width: `${river.pollutionIndex}%`,
          }}
        />
      </div>
    </article>
  );
}

function RankBadge({ rank }) {
  let style =
    "border-slate-700 bg-slate-800 text-slate-300";

  let label = `#${rank}`;

  if (rank === 1) {
    style =
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
    label = "🥇";
  }

  if (rank === 2) {
    style =
      "border-slate-400/30 bg-slate-400/10 text-slate-200";
    label = "🥈";
  }

  if (rank === 3) {
    style =
      "border-orange-500/30 bg-orange-500/10 text-orange-300";
    label = "🥉";
  }

  return (
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${style}`}
    >
      {label}
    </span>
  );
}

function normalizeRiverName(riverName) {
  const trimmedName = String(
    riverName || "Unknown River"
  ).trim();

  if (!trimmedName) {
    return "Unknown River";
  }

  return trimmedName
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}

function calculatePollutionIndex(
  averageRiskScore,
  criticalReports,
  highReports,
  totalReports
) {
  if (totalReports === 0) {
    return 0;
  }

  const criticalPercentage =
    (criticalReports / totalReports) * 100;

  const highPercentage =
    (highReports / totalReports) * 100;

  const pollutionIndex =
    averageRiskScore * 0.6 +
    criticalPercentage * 0.25 +
    highPercentage * 0.15;

  return Math.min(
    Math.max(Math.round(pollutionIndex), 0),
    100
  );
}

function getRiskScore(report) {
  const riskScore = Number(
    report.riskScore
  );

  if (Number.isFinite(riskScore)) {
    return Math.min(
      Math.max(Math.round(riskScore), 0),
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

  return 25;
}

function getRiskLevel(report, riskScore) {
  const existingRiskLevel = String(
    report.riskLevel || ""
  ).toLowerCase();

  if (existingRiskLevel.includes("critical")) {
    return "Critical";
  }

  if (existingRiskLevel.includes("high")) {
    return "High";
  }

  if (
    existingRiskLevel.includes("moderate") ||
    existingRiskLevel.includes("medium")
  ) {
    return "Moderate";
  }

  if (existingRiskLevel.includes("low")) {
    return "Low";
  }

  return getLevelFromScore(riskScore);
}

function getLevelFromScore(score) {
  if (score >= 80) {
    return "Critical";
  }

  if (score >= 60) {
    return "High";
  }

  if (score >= 40) {
    return "Moderate";
  }

  return "Low";
}

function getRiskStyle(score) {
  if (score >= 80) {
    return {
      text: "text-red-300",
      progress: "bg-red-500",
      badge:
        "border-red-500/30 bg-red-500/10 text-red-300",
    };
  }

  if (score >= 60) {
    return {
      text: "text-orange-300",
      progress: "bg-orange-500",
      badge:
        "border-orange-500/30 bg-orange-500/10 text-orange-300",
    };
  }

  if (score >= 40) {
    return {
      text: "text-amber-300",
      progress: "bg-amber-500",
      badge:
        "border-amber-500/30 bg-amber-500/10 text-amber-300",
    };
  }

  return {
    text: "text-emerald-300",
    progress: "bg-emerald-500",
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  };
}