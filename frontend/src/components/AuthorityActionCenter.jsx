import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import useUserRole from "../hooks/useUserRole";
import ReportDetailsModal from "./ReportDetailsModal";

export default function AuthorityActionCenter() {
  const {
    user,
    isAuthority,
    loadingRole,
  } = useUserRole();

  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] =
    useState(null);
  const [loadingReports, setLoadingReports] =
    useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthority) {
      setLoadingReports(false);
      return undefined;
    }

    const reportsQuery = query(
      collection(db, "pollutionReports"),
      orderBy("createdAt", "desc")
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
        setLoadingReports(false);
        setError("");
      },
      (snapshotError) => {
        console.error(
          "Authority reports loading failed:",
          snapshotError
        );

        setError(
          "Authority reports load avvaledu. Firestore permissions check cheyyandi."
        );

        setLoadingReports(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthority]);

  const priorityReports = useMemo(() => {
    return reports
      .filter((report) => {
        const status = normalizeStatus(
          report.status
        );

        return status !== "resolved";
      })
      .sort(
        (firstReport, secondReport) =>
          getRiskScore(secondReport) -
          getRiskScore(firstReport)
      )
      .slice(0, 10);
  }, [reports]);

  const updateReportStatus = async (
    reportId,
    newStatus
  ) => {
    if (!user || !isAuthority) {
      setError(
        "Ee action authority or administrator matrame perform cheyyagalaru."
      );
      return;
    }

    setUpdatingId(reportId);
    setError("");
    setMessage("");

    try {
      await updateDoc(
        doc(db, "pollutionReports", reportId),
        {
          status: newStatus,
          authorityAction: newStatus,

          actionUpdatedBy: user.uid,
          actionUpdatedByEmail:
            user.email || "",

          actionUpdatedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      setMessage(
        `Report status "${newStatus}" ga successfully update ayyindi.`
      );
    } catch (updateError) {
      console.error(
        "Report status update failed:",
        updateError
      );

      if (
        updateError.code ===
        "permission-denied"
      ) {
        setError(
          "Permission denied. Authority/Admin Firestore rules check cheyyandi."
        );
      } else {
        setError(
          "Report status update avvaledu."
        );
      }
    } finally {
      setUpdatingId("");
    }
  };

  if (loadingRole || loadingReports) {
    return (
      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-violet-400" />

          <p className="text-sm text-slate-400">
            Loading authority actions...
          </p>
        </div>
      </section>
    );
  }

  if (!isAuthority) {
    return null;
  }

  return (
    <>
      <section className="mt-10 overflow-hidden rounded-2xl border border-violet-500/20 bg-slate-900">
        <div className="border-b border-slate-800 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">
                Government Response Workflow
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Authority Action Center
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Pollution reports ni investigate chesi
                response status update cheyyandi.
              </p>
            </div>

            <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-6 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                Open Cases
              </p>

              <p className="mt-1 text-3xl font-bold text-white">
                {priorityReports.length}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="m-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!error &&
          priorityReports.length === 0 && (
            <div className="p-10 text-center">
              <div className="text-4xl">
                ✅
              </div>

              <h3 className="mt-4 text-lg font-bold text-white">
                No Open Pollution Cases
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Current reports anni resolved ayyayi.
              </p>
            </div>
          )}

        {!error &&
          priorityReports.length > 0 && (
            <div className="space-y-5 p-6">
              {priorityReports.map((report) => (
                <AuthorityReportCard
                  key={report.id}
                  report={report}
                  updating={
                    updatingId === report.id
                  }
                  onUpdateStatus={
                    updateReportStatus
                  }
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

function AuthorityReportCard({
  report,
  updating,
  onUpdateStatus,
  onViewDetails,
}) {
  const riskScore = getRiskScore(report);

  const riskLevel =
    report.riskLevel ||
    getRiskLevel(riskScore);

  const status =
    report.status || "Pending";

  const riverName =
    report.riverName ||
    report.river ||
    "Unknown River";

  const location =
    report.location ||
    report.pollutionLocation ||
    report.area ||
    "Location not provided";

  const style = getRiskStyle(riskScore);

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-white">
              {riverName}
            </h3>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${style.badge}`}
            >
              {riskLevel}
            </span>

            <StatusBadge status={status} />
          </div>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
            {report.description ||
              "No report description provided."}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
            <span>
              📍 {location}
            </span>

            <span>
              🧪{" "}
              {report.pollutionType ||
                "Pollution type not provided"}
            </span>

            <span>
              📊 Risk Score:{" "}
              <strong className={style.text}>
                {riskScore}/100
              </strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 lg:max-w-md lg:justify-end">
          <ActionButton
            label="View Details"
            disabled={false}
            onClick={onViewDetails}
            className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
          />

          <ActionButton
            label="Investigating"
            disabled={
              updating ||
              status === "Investigating"
            }
            onClick={() =>
              onUpdateStatus(
                report.id,
                "Investigating"
              )
            }
            className="border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
          />

          <ActionButton
            label="Action Taken"
            disabled={
              updating ||
              status === "Action Taken"
            }
            onClick={() =>
              onUpdateStatus(
                report.id,
                "Action Taken"
              )
            }
            className="border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
          />

          <ActionButton
            label="Resolved"
            disabled={
              updating ||
              status === "Resolved"
            }
            onClick={() =>
              onUpdateStatus(
                report.id,
                "Resolved"
              )
            }
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
          />
        </div>
      </div>

      {updating && (
        <p className="mt-4 text-xs text-violet-300">
          Updating report status...
        </p>
      )}
    </article>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus =
    normalizeStatus(status);

  let style =
    "border-slate-600 bg-slate-800 text-slate-300";

  if (normalizedStatus === "investigating") {
    style =
      "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  if (
    normalizedStatus === "action taken"
  ) {
    style =
      "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  if (normalizedStatus === "resolved") {
    style =
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
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

function getRiskLevel(riskScore) {
  if (riskScore >= 80) {
    return "Critical";
  }

  if (riskScore >= 60) {
    return "High";
  }

  if (riskScore >= 40) {
    return "Moderate";
  }

  return "Low";
}

function getRiskStyle(riskScore) {
  if (riskScore >= 80) {
    return {
      text: "text-red-300",
      badge:
        "border-red-500/30 bg-red-500/10 text-red-300",
    };
  }

  if (riskScore >= 60) {
    return {
      text: "text-orange-300",
      badge:
        "border-orange-500/30 bg-orange-500/10 text-orange-300",
    };
  }

  if (riskScore >= 40) {
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

function normalizeStatus(status) {
  return String(
    status || "Pending"
  )
    .trim()
    .toLowerCase();
}