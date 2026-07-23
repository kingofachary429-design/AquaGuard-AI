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

export default function RealtimeNotificationCenter() {
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

  const [updatingId, setUpdatingId] =
    useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      setReports([]);
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
          "Realtime notifications loading failed:",
          snapshotError
        );

        setError(
          "Realtime notifications load avvaledu. Firestore permissions check cheyyandi."
        );

        setLoadingReports(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const activeNotifications = useMemo(() => {
    return reports
      .filter((report) => {
        const status = normalizeStatus(
          report.status
        );

        const riskScore = getRiskScore(report);

        const riskLevel = String(
          report.riskLevel || ""
        )
          .trim()
          .toLowerCase();

        const isResolved =
          status === "resolved";

        const isHighRisk =
          riskScore >= 60 ||
          riskLevel === "high" ||
          riskLevel === "critical";

        const alertGenerated =
          report.alertGenerated !== false;

        return (
          !isResolved &&
          isHighRisk &&
          alertGenerated
        );
      })
      .sort((firstReport, secondReport) => {
        const firstUnread =
          normalizeNotificationStatus(
            firstReport.notificationStatus
          ) === "unread"
            ? 1
            : 0;

        const secondUnread =
          normalizeNotificationStatus(
            secondReport.notificationStatus
          ) === "unread"
            ? 1
            : 0;

        if (secondUnread !== firstUnread) {
          return secondUnread - firstUnread;
        }

        const riskDifference =
          getRiskScore(secondReport) -
          getRiskScore(firstReport);

        if (riskDifference !== 0) {
          return riskDifference;
        }

        return (
          getTimestamp(secondReport.createdAt) -
          getTimestamp(firstReport.createdAt)
        );
      })
      .slice(0, 10);
  }, [reports]);

  const unreadCount = useMemo(() => {
    return activeNotifications.filter(
      (report) =>
        normalizeNotificationStatus(
          report.notificationStatus
        ) === "unread"
    ).length;
  }, [activeNotifications]);

  const markAsRead = async (reportId) => {
    if (!user) {
      setError(
        "Notification update cheyyadaniki login avvali."
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
          notificationStatus: "Read",

          notificationReadBy: user.uid,

          notificationReadByEmail:
            user.email || "",

          notificationReadAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      setMessage(
        "Notification read ga mark ayyindi."
      );
    } catch (updateError) {
      console.error(
        "Notification read update failed:",
        updateError
      );

      if (
        updateError.code ===
        "permission-denied"
      ) {
        setError(
          "Notification update permission ledu. Firestore rules check cheyyandi."
        );
      } else {
        setError(
          "Notification update avvaledu."
        );
      }
    } finally {
      setUpdatingId("");
    }
  };

  const markAsUnread = async (reportId) => {
    if (!user) {
      setError(
        "Notification update cheyyadaniki login avvali."
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
          notificationStatus: "Unread",

          notificationReadBy: "",

          notificationReadByEmail: "",

          notificationReadAt: null,

          updatedAt:
            serverTimestamp(),
        }
      );

      setMessage(
        "Notification unread ga mark ayyindi."
      );
    } catch (updateError) {
      console.error(
        "Notification unread update failed:",
        updateError
      );

      if (
        updateError.code ===
        "permission-denied"
      ) {
        setError(
          "Notification update permission ledu. Firestore rules check cheyyandi."
        );
      } else {
        setError(
          "Notification update avvaledu."
        );
      }
    } finally {
      setUpdatingId("");
    }
  };

  const markAllAsRead = async () => {
    if (!user) {
      setError(
        "Notifications update cheyyadaniki login avvali."
      );
      return;
    }

    const unreadNotifications =
      activeNotifications.filter(
        (report) =>
          normalizeNotificationStatus(
            report.notificationStatus
          ) === "unread"
      );

    if (unreadNotifications.length === 0) {
      setMessage(
        "Unread notifications emi levu."
      );
      return;
    }

    setUpdatingId("all");
    setError("");
    setMessage("");

    try {
      await Promise.all(
        unreadNotifications.map((report) =>
          updateDoc(
            doc(
              db,
              "pollutionReports",
              report.id
            ),
            {
              notificationStatus: "Read",

              notificationReadBy:
                user.uid,

              notificationReadByEmail:
                user.email || "",

              notificationReadAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp(),
            }
          )
        )
      );

      setMessage(
        "All notifications read ga mark ayyayi."
      );
    } catch (updateError) {
      console.error(
        "Mark all notifications failed:",
        updateError
      );

      if (
        updateError.code ===
        "permission-denied"
      ) {
        setError(
          "Notifications update permission ledu. Firestore rules check cheyyandi."
        );
      } else {
        setError(
          "All notifications update avvaledu."
        );
      }
    } finally {
      setUpdatingId("");
    }
  };

  if (loadingRole || loadingReports) {
    return (
      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-red-400" />

          <p className="text-sm text-slate-400">
            Loading realtime alerts...
          </p>
        </div>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <section className="mt-8 overflow-hidden rounded-2xl border border-red-500/20 bg-slate-900">
        <div className="border-b border-slate-800 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-red-400">
                Live Environmental Alerts
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Realtime Notification Center
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                High and Critical pollution reports
                matrame ikkada display avutayi. Resolved
                reports automatic ga remove avutayi.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-300">
                  Active Alerts
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {activeNotifications.length}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Unread
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {unreadCount}
                </p>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <div className="mt-5">
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={
                  updatingId === "all"
                }
                className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingId === "all"
                  ? "Updating..."
                  : "Mark All as Read"}
              </button>
            </div>
          )}
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
          activeNotifications.length === 0 && (
            <div className="p-10 text-center">
              <div className="text-5xl">
                ✅
              </div>

              <h3 className="mt-4 text-lg font-bold text-white">
                No Active High-Risk Alerts
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                High or Critical unresolved pollution
                reports currently levu.
              </p>
            </div>
          )}

        {!error &&
          activeNotifications.length > 0 && (
            <div className="space-y-4 p-6">
              {activeNotifications.map(
                (report) => (
                  <NotificationCard
                    key={report.id}
                    report={report}
                    updating={
                      updatingId === report.id
                    }
                    isAuthority={isAuthority}
                    onViewDetails={() =>
                      setSelectedReport(report)
                    }
                    onMarkAsRead={() =>
                      markAsRead(report.id)
                    }
                    onMarkAsUnread={() =>
                      markAsUnread(report.id)
                    }
                  />
                )
              )}
            </div>
          )}
      </section>

      <ReportDetailsModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() =>
          setSelectedReport(null)
        }
      />
    </>
  );
}

function NotificationCard({
  report,
  updating,
  isAuthority,
  onViewDetails,
  onMarkAsRead,
  onMarkAsUnread,
}) {
  const riskScore = getRiskScore(report);

  const riskLevel =
    report.riskLevel ||
    getRiskLevel(riskScore);

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

  const notificationStatus =
    normalizeNotificationStatus(
      report.notificationStatus
    );

  const isUnread =
    notificationStatus === "unread";

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 transition ${
        isUnread
          ? "border-red-500/40 bg-red-500/10"
          : "border-slate-800 bg-slate-950/50"
      }`}
    >
      {isUnread && (
        <div className="absolute right-4 top-4">
          <span className="flex h-3 w-3">
            <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-red-400 opacity-75" />

            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
        </div>
      )}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskStyle.badge}`}
            >
              {riskLevel} Risk
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                isUnread
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-slate-700 bg-slate-800 text-slate-300"
              }`}
            >
              {isUnread
                ? "Unread"
                : "Read"}
            </span>

            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
              {report.status || "Pending"}
            </span>
          </div>

          <h3 className="mt-4 text-xl font-bold text-white">
            {riverName}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            📍 {location}
          </p>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
            {report.description ||
              "No report description provided."}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
            <span>
              🧪{" "}
              {report.pollutionType ||
                "Pollution Incident"}
            </span>

            <span>
              📊 Risk Score:{" "}
              <strong
                className={riskStyle.text}
              >
                {riskScore}/100
              </strong>
            </span>

            <span>
              🕒{" "}
              {formatDate(
                report.createdAt
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 lg:max-w-sm lg:justify-end">
          <button
            type="button"
            onClick={onViewDetails}
            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
          >
            View Details
          </button>

          {isUnread ? (
            <button
              type="button"
              onClick={onMarkAsRead}
              disabled={updating}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating
                ? "Updating..."
                : "Mark as Read"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onMarkAsUnread}
              disabled={updating}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating
                ? "Updating..."
                : "Mark as Unread"}
            </button>
          )}

          {isAuthority && (
            <span className="flex items-center rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-300">
              Authority Access
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function getRiskScore(report) {
  const riskScore = Number(
    report.riskScore
  );

  if (Number.isFinite(riskScore)) {
    return Math.min(
      Math.max(
        Math.round(riskScore),
        0
      ),
      100
    );
  }

  const riskLevel = String(
    report.riskLevel || ""
  ).toLowerCase();

  if (
    riskLevel.includes("critical")
  ) {
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

  return {
    text: "text-amber-300",

    badge:
      "border-amber-500/30 bg-amber-500/10 text-amber-300",
  };
}

function normalizeStatus(status) {
  return String(
    status || "Pending"
  )
    .trim()
    .toLowerCase();
}

function normalizeNotificationStatus(
  status
) {
  const normalizedStatus = String(
    status || "Unread"
  )
    .trim()
    .toLowerCase();

  return normalizedStatus === "read"
    ? "read"
    : "unread";
}

function getTimestamp(value) {
  if (!value) {
    return 0;
  }

  if (
    typeof value.toMillis === "function"
  ) {
    return value.toMillis();
  }

  if (
    typeof value.toDate === "function"
  ) {
    return value
      .toDate()
      .getTime();
  }

  if (value.seconds) {
    return value.seconds * 1000;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 0
    : date.getTime();
}

function formatDate(value) {
  const timestamp =
    getTimestamp(value);

  if (!timestamp) {
    return "Recently";
  }

  return new Date(
    timestamp
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}