import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

export default function EmergencyAlert() {
  const [criticalReports, setCriticalReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const reportsReference = collection(
      db,
      "pollutionReports"
    );

    const highRiskQuery = query(
      reportsReference,
      where("riskLevel", "in", [
        "High Risk",
        "Critical Risk",
      ])
    );

    const unsubscribe = onSnapshot(
      highRiskQuery,
      (snapshot) => {
        const reportData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setCriticalReports(reportData);
        setLoading(false);

        if (reportData.length > 0) {
          setDismissed(false);
        }
      },
      (error) => {
        console.error(
          "Unable to load emergency alerts:",
          error
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (
    loading ||
    criticalReports.length === 0 ||
    dismissed
  ) {
    return null;
  }

  const criticalCount = criticalReports.filter(
    (report) => report.riskLevel === "Critical Risk"
  ).length;

  const highRiskCount = criticalReports.filter(
    (report) => report.riskLevel === "High Risk"
  ).length;

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-red-500/40 bg-red-500/10">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-2xl">
            🚨
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-red-400">
              Emergency Pollution Alert
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white">
              Immediate environmental attention required
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-red-100/80">
              AquaGuard AI has detected{" "}
              <strong>{criticalReports.length}</strong>{" "}
              high-priority pollution report
              {criticalReports.length !== 1 ? "s" : ""}.
              Authorities should review these incidents and
              take appropriate action.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {criticalCount > 0 && (
                <span className="rounded-full border border-red-500/40 bg-red-500/20 px-3 py-1 text-sm font-semibold text-red-300">
                  Critical Risk: {criticalCount}
                </span>
              )}

              {highRiskCount > 0 && (
                <span className="rounded-full border border-orange-500/40 bg-orange-500/20 px-3 py-1 text-sm font-semibold text-orange-300">
                  High Risk: {highRiskCount}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="self-start rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
        >
          Dismiss
        </button>
      </div>

      <div className="border-t border-red-500/20 bg-slate-950/30 px-6 py-4">
        <p className="mb-3 text-sm font-semibold text-slate-300">
          Affected rivers
        </p>

        <div className="flex flex-wrap gap-2">
          {criticalReports.slice(0, 5).map((report) => (
            <span
              key={report.id}
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-300"
            >
              {report.riverName || "Unknown River"} —{" "}
              <span
                className={
                  report.riskLevel === "Critical Risk"
                    ? "font-semibold text-red-400"
                    : "font-semibold text-orange-400"
                }
              >
                {report.riskLevel}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}