import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export default function RecentReports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [userRole, setUserRole] = useState("citizen");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("");

  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  // Current user role fetch
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserRole("citizen");
        return;
      }

      try {
        const userReference = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userReference);

        if (userSnapshot.exists()) {
          setUserRole(userSnapshot.data().role || "citizen");
        } else {
          setUserRole("citizen");
        }
      } catch (error) {
        console.error("Unable to load user role:", error);
        setUserRole("citizen");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Firestore reports fetch
  useEffect(() => {
    const reportsQuery = query(
      collection(db, "pollutionReports"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const reportData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setReports(reportData);
        setLoading(false);
        setErrorMessage("");
      },
      (error) => {
        console.error("Unable to load recent reports:", error);
        setErrorMessage("Unable to load pollution reports.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Escape button closes modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setSelectedReport(null);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "resolved") {
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    }

    if (
      normalizedStatus === "action required" ||
      normalizedStatus === "rejected"
    ) {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    if (normalizedStatus === "under review") {
      return "border-blue-500/30 bg-blue-500/10 text-blue-400";
    }

    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  };

  const getRiskStyle = (riskLevel) => {
    const normalizedRisk = riskLevel?.toLowerCase();

    if (
      normalizedRisk === "critical risk" ||
      normalizedRisk === "high risk" ||
      normalizedRisk === "high"
    ) {
      return "text-red-400";
    }

    if (
      normalizedRisk === "medium risk" ||
      normalizedRisk === "medium"
    ) {
      return "text-amber-400";
    }

    if (
      normalizedRisk === "low risk" ||
      normalizedRisk === "low"
    ) {
      return "text-emerald-400";
    }

    return "text-slate-400";
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) {
      return "Just now";
    }

    return timestamp.toDate().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCoordinate = (coordinate) => {
    if (
      coordinate === undefined ||
      coordinate === null ||
      coordinate === ""
    ) {
      return "Not available";
    }

    const numberValue = Number(coordinate);

    return Number.isNaN(numberValue)
      ? coordinate
      : numberValue.toFixed(6);
  };

  const openReportDetails = (report) => {
    setSelectedReport(report);
    setSelectedStatus(report.status || "Pending");
    setSelectedRisk(report.riskLevel || "Under Review");
    setUpdateMessage("");
  };

  const closeReportDetails = () => {
    setSelectedReport(null);
    setSelectedStatus("");
    setSelectedRisk("");
    setUpdateMessage("");
  };

  const handleReportUpdate = async () => {
    if (!selectedReport) {
      setUpdateMessage("No report was selected.");
      return;
    }

    if (userRole !== "admin") {
      setUpdateMessage("Only an administrator can update reports.");
      return;
    }

    if (!selectedStatus || !selectedRisk) {
      setUpdateMessage("Please select status and risk level.");
      return;
    }

    try {
      setUpdating(true);
      setUpdateMessage("");

      const reportReference = doc(
        db,
        "pollutionReports",
        selectedReport.id
      );

      await updateDoc(reportReference, {
        status: selectedStatus,
        riskLevel: selectedRisk,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || "",
        updatedByEmail: auth.currentUser?.email || "",
      });

      setSelectedReport((previousReport) => ({
        ...previousReport,
        status: selectedStatus,
        riskLevel: selectedRisk,
      }));

      setUpdateMessage("Report updated successfully.");
    } catch (error) {
      console.error("Unable to update report:", error);

      if (error.code === "permission-denied") {
        setUpdateMessage(
          "Permission denied. Check your admin role and Firestore rules."
        );
      } else {
        setUpdateMessage(
          "Unable to update the report. Please try again."
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Live Firestore Data
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white">
              Recent Pollution Reports
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Latest citizen-submitted river pollution incidents.
            </p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300">
            Showing latest {reports.length} reports
          </div>
        </div>

        {loading && (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

            <p className="mt-4 text-sm text-slate-400">
              Loading pollution reports...
            </p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && reports.length === 0 && (
          <div className="px-6 py-14 text-center">
            <div className="text-5xl">🌊</div>

            <h3 className="mt-4 text-lg font-semibold text-white">
              No pollution reports found
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Submit a citizen report to see it displayed here.
            </p>
          </div>
        )}

        {!loading && !errorMessage && reports.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-950/60">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 font-semibold">
                    River
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Pollution Type
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Location
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Risk Level
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Date
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="transition hover:bg-slate-800/40"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-semibold text-white">
                        {report.riverName || "Unknown River"}
                      </div>

                      <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
                        {report.description || "No description"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-300">
                      {report.pollutionType || "Not specified"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-300">
                      <div className="max-w-xs truncate">
                        {report.location || "Location unavailable"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold">
                      <span className={getRiskStyle(report.riskLevel)}>
                        {report.riskLevel || "Under Review"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          report.status
                        )}`}
                      >
                        {report.status || "Pending"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-400">
                      {formatDate(report.createdAt)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        type="button"
                        onClick={() => openReportDetails(report)}
                        className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm"
          onClick={closeReportDetails}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  Pollution Report Details
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  {selectedReport.riverName || "Unknown River"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeReportDetails}
                className="rounded-lg bg-slate-800 px-3 py-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                aria-label="Close report details"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <DetailItem
                label="River Name"
                value={selectedReport.riverName || "Not specified"}
              />

              <DetailItem
                label="Pollution Type"
                value={
                  selectedReport.pollutionType || "Not specified"
                }
              />

              <DetailItem
                label="Status"
                value={selectedReport.status || "Pending"}
              />

              <DetailItem
                label="Risk Level"
                value={selectedReport.riskLevel || "Under Review"}
              />

              <DetailItem
                label="Location"
                value={selectedReport.location || "Not available"}
              />

              <DetailItem
                label="Reported Date"
                value={formatDate(selectedReport.createdAt)}
              />

              <DetailItem
                label="Latitude"
                value={formatCoordinate(selectedReport.latitude)}
              />

              <DetailItem
                label="Longitude"
                value={formatCoordinate(selectedReport.longitude)}
              />

              <DetailItem
                label="Reporter Email"
                value={
                  selectedReport.reporterEmail ||
                  "Email information unavailable"
                }
              />

              <DetailItem
                label="Report ID"
                value={selectedReport.id}
              />

              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Description
                </p>

                <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                    {selectedReport.description ||
                      "No description was provided."}
                  </p>
                </div>
              </div>

              {userRole === "admin" && (
                <div className="sm:col-span-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                  <div className="mb-4">
                    <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                      Admin Controls
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-white">
                      Update Report Assessment
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Change the investigation status and pollution
                      risk level.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="report-status"
                        className="mb-2 block text-sm font-medium text-slate-300"
                      >
                        Report Status
                      </label>

                      <select
                        id="report-status"
                        value={selectedStatus}
                        onChange={(event) =>
                          setSelectedStatus(event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">
                          Under Review
                        </option>
                        <option value="Action Required">
                          Action Required
                        </option>
                        <option value="Resolved">
                          Resolved
                        </option>
                        <option value="Rejected">
                          Rejected
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="risk-level"
                        className="mb-2 block text-sm font-medium text-slate-300"
                      >
                        Pollution Risk Level
                      </label>

                      <select
                        id="risk-level"
                        value={selectedRisk}
                        onChange={(event) =>
                          setSelectedRisk(event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
                      >
                        <option value="Under Review">
                          Under Review
                        </option>
                        <option value="Low Risk">
                          Low Risk
                        </option>
                        <option value="Medium Risk">
                          Medium Risk
                        </option>
                        <option value="High Risk">
                          High Risk
                        </option>
                        <option value="Critical Risk">
                          Critical Risk
                        </option>
                      </select>
                    </div>
                  </div>

                  {updateMessage && (
                    <div
                      className={`mt-4 rounded-lg border p-3 text-sm ${
                        updateMessage.includes("successfully")
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-red-500/30 bg-red-500/10 text-red-300"
                      }`}
                    >
                      {updateMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleReportUpdate}
                    disabled={updating}
                    className="mt-5 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updating
                      ? "Updating Report..."
                      : "Update Report"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-800 px-6 py-5">
              <button
                type="button"
                onClick={closeReportDetails}
                className="rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <div className="mt-2 min-h-12 break-words rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200">
        {value}
      </div>
    </div>
  );
}