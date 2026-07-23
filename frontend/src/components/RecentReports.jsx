import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase";
import ReportDetailsModal from "./ReportDetailsModal";

export default function RecentReports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const reportsQuery = query(
      collection(db, "pollutionReports"),
      orderBy("createdAt", "desc"),
      limit(6)
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
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
          "Recent reports loading failed:",
          snapshotError
        );

        setError(
          "Recent reports load avvaledu. Firestore permissions or createdAt field check cheyyandi."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

          <p className="text-sm text-slate-400">
            Loading recent pollution reports...
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                Latest Reports
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Recent Pollution Reports
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Citizens submit chesina latest river pollution
                incidents and AI risk results.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                Latest Reports
              </p>

              <p className="mt-1 text-3xl font-bold text-white">
                {reports.length}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!error && reports.length === 0 && (
          <div className="p-10 text-center">
            <div className="text-4xl">📄</div>

            <h3 className="mt-4 text-lg font-bold text-white">
              No Reports Available
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Citizen pollution report submit chesina tarvata
              ikkada display avutundi.
            </p>
          </div>
        )}

        {!error && reports.length > 0 && (
          <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
              <RecentReportCard
                key={report.id}
                report={report}
                onViewDetails={() =>
                  setSelectedReport(report)
                }
              />
            ))}
          </div>
        )}
      </section>

      <ReportDetailsModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
      />
    </>
  );
}

function RecentReportCard({
  report,
  onViewDetails,
}) {
  const riskScore = getRiskScore(report);

  const riskLevel =
    report.riskLevel ||
    getRiskLevel(riskScore);

  const riskStyle = getRiskStyle(riskScore);

  const riverName =
    report.riverName ||
    report.river ||
    "Unknown River";

  const location =
    report.location ||
    report.pollutionLocation ||
    report.area ||
    "Location not provided";

  const status =
    report.status || "Pending";

  return (
    <article className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/50 p-5 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            {report.pollutionType ||
              "Pollution Incident"}
          </p>

          <h3 className="mt-2 truncate text-lg font-bold text-white">
            {riverName}
          </h3>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${riskStyle.badge}`}
        >
          {riskLevel}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">
        {report.description ||
          "No report description provided."}
      </p>

      <div className="mt-5 space-y-2 text-sm text-slate-400">
        <p className="truncate">
          📍 {location}
        </p>

        <p>
          📊 Risk Score:{" "}
          <strong className={riskStyle.text}>
            {riskScore}/100
          </strong>
        </p>

        <p>
          📌 Status:{" "}
          <span className="font-medium text-slate-200">
            {status}
          </span>
        </p>

        <p>
          🕒 {formatDate(report.createdAt)}
        </p>
      </div>

      <div className="mt-auto border-t border-slate-800 pt-5">
        <button
          type="button"
          onClick={onViewDetails}
          className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
        >
          View Details
        </button>
      </div>
    </article>
  );
}

function getRiskScore(report) {
  const score = Number(report.riskScore);

  if (Number.isFinite(score)) {
    return Math.min(
      Math.max(Math.round(score), 0),
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

function getRiskLevel(score) {
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
      badge:
        "border-red-500/30 bg-red-500/10 text-red-300",
    };
  }

  if (score >= 60) {
    return {
      text: "text-orange-300",
      badge:
        "border-orange-500/30 bg-orange-500/10 text-orange-300",
    };
  }

  if (score >= 40) {
    return {
      text: "text-amber-300",
      badge:
        "border-amber-500/30 bg-amber-500/10 text-amber-300",
    };
  }

  return {
    text: "text-emerald-300",
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  };
}

function formatDate(value) {
  if (!value) {
    return "Recently";
  }

  let date;

  if (value?.toDate) {
    date = value.toDate();
  } else if (value?.seconds) {
    date = new Date(value.seconds * 1000);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}