import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function CriticalReportsPanel() {
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
          "Critical reports loading failed:",
          snapshotError
        );

        setError(
          "Critical pollution reports load avvaledu."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const criticalReports = useMemo(() => {
    return reports
      .map((report) => ({
        ...report,
        calculatedRiskScore:
          getReportRiskScore(report),
      }))
      .filter((report) => {
        const riskLevel = String(
          report.riskLevel || ""
        ).toLowerCase();

        return (
          riskLevel.includes("critical") ||
          riskLevel.includes("high") ||
          report.calculatedRiskScore >= 60
        );
      })
      .sort(
        (firstReport, secondReport) =>
          secondReport.calculatedRiskScore -
          firstReport.calculatedRiskScore
      )
      .slice(0, 5);
  }, [reports]);

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-red-500/20 bg-slate-900 p-8">
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-red-400" />

          <p className="text-sm text-slate-400">
            Loading critical reports...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-red-500/20 bg-slate-900">
      <div className="border-b border-slate-800 p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-red-300">
              Emergency Monitoring
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Critical Pollution Reports
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              High-risk river pollution incidents requiring
              immediate authority attention.
            </p>
          </div>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-center">
            <p className="text-xs uppercase tracking-wider text-red-300">
              Critical Reports
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
              {criticalReports.length}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && criticalReports.length === 0 && (
        <div className="p-10 text-center">
          <div className="text-4xl">
            ✅
          </div>

          <h3 className="mt-4 text-lg font-bold text-white">
            No Critical Reports
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Currently no high-risk pollution incidents
            require immediate attention.
          </p>
        </div>
      )}

      {criticalReports.length > 0 && (
        <div className="space-y-4 p-6">
          {criticalReports.map(
            (report, index) => (
              <CriticalReportCard
                key={report.id}
                report={report}
                priority={index + 1}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

function CriticalReportCard({
  report,
  priority,
}) {
  const riskScore =
    report.calculatedRiskScore;

  const riskStyle =
    getRiskStyle(riskScore);

  const riverName =
    report.riverName ||
    report.river ||
    "Unknown River";

  const location =
    report.location ||
    report.pollutionLocation ||
    report.area ||
    "Location not provided";

  const description =
    report.description ||
    report.issueDescription ||
    report.pollutionType ||
    "No description provided";

  const status =
    report.status ||
    "Pending Investigation";

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 font-bold text-red-300">
            #{priority}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-white">
                {riverName}
              </h3>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskStyle.badge}`}
              >
                {report.riskLevel ||
                  riskStyle.label}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              📍 {location}
            </p>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {description}
            </p>
          </div>
        </div>

        <div className="min-w-32 rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Risk Score
          </p>

          <p
            className={`mt-1 text-3xl font-bold ${riskStyle.text}`}
          >
            {riskScore}%
          </p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${riskStyle.progress}`}
          style={{
            width: `${riskScore}%`,
          }}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
        <div>
          <p className="text-xs text-slate-500">
            Current Status
          </p>

          <p className="mt-1 text-sm font-semibold text-amber-300">
            {status}
          </p>
        </div>

        <p className="text-xs text-slate-500">
          Report ID: {report.id.slice(0, 8)}
        </p>
      </div>
    </article>
  );
}

function getReportRiskScore(report) {
  const savedRiskScore = Number(
    report.riskScore
  );

  if (!Number.isNaN(savedRiskScore)) {
    return Math.min(
      Math.max(
        Math.round(savedRiskScore),
        0
      ),
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
    riskLevel.includes("medium") ||
    riskLevel.includes("moderate")
  ) {
    return 50;
  }

  if (riskLevel.includes("low")) {
    return 25;
  }

  return 40;
}

function getRiskStyle(score) {
  if (score >= 80) {
    return {
      label: "Critical Risk",
      text: "text-red-300",
      progress: "bg-red-500",
      badge:
        "border-red-500/30 bg-red-500/10 text-red-300",
    };
  }

  if (score >= 60) {
    return {
      label: "High Risk",
      text: "text-orange-300",
      progress: "bg-orange-500",
      badge:
        "border-orange-500/30 bg-orange-500/10 text-orange-300",
    };
  }

  return {
    label: "Moderate Risk",
    text: "text-amber-300",
    progress: "bg-amber-500",
    badge:
      "border-amber-500/30 bg-amber-500/10 text-amber-300",
  };
}