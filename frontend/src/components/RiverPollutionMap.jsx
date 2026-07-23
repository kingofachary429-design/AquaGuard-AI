import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase";

const DEFAULT_CENTER = [16.5062, 80.648];

export default function RiverPollutionMap() {
  const [reports, setReports] = useState([]);
  const [selectedRisk, setSelectedRisk] = useState("All");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const reportsQuery = query(
      collection(db, "pollutionReports"),
      orderBy("createdAt", "desc")
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
        console.error("Unable to load map reports:", error);

        setErrorMessage(
          "Unable to load pollution reports on the map."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const mappedReports = useMemo(() => {
    return reports
      .map((report) => {
        const latitude = getLatitude(report);
        const longitude = getLongitude(report);

        return {
          ...report,
          latitude,
          longitude,
        };
      })
      .filter(
        (report) =>
          Number.isFinite(report.latitude) &&
          Number.isFinite(report.longitude) &&
          report.latitude >= -90 &&
          report.latitude <= 90 &&
          report.longitude >= -180 &&
          report.longitude <= 180
      );
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (selectedRisk === "All") {
      return mappedReports;
    }

    return mappedReports.filter(
      (report) =>
        normalizeRiskLevel(report.riskLevel) === selectedRisk
    );
  }, [mappedReports, selectedRisk]);

  const mapCenter =
    filteredReports.length > 0
      ? [
          filteredReports[0].latitude,
          filteredReports[0].longitude,
        ]
      : DEFAULT_CENTER;

  const riskCounts = useMemo(() => {
    return mappedReports.reduce(
      (counts, report) => {
        const riskLevel = normalizeRiskLevel(
          report.riskLevel
        );

        counts[riskLevel] =
          (counts[riskLevel] || 0) + 1;

        return counts;
      },
      {
        "Critical Risk": 0,
        "High Risk": 0,
        "Medium Risk": 0,
        "Low Risk": 0,
      }
    );
  }, [mappedReports]);

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 px-6 py-5 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Geographic Pollution Monitoring
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            Interactive River Pollution Map
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            View citizen pollution reports by geographic location
            and risk level.
          </p>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300">
          {mappedReports.length} mapped reports
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-800 p-6 sm:grid-cols-2 xl:grid-cols-4">
        <RiskSummary
          label="Critical Risk"
          count={riskCounts["Critical Risk"]}
          className="border-red-500/30 bg-red-500/10 text-red-300"
        />

        <RiskSummary
          label="High Risk"
          count={riskCounts["High Risk"]}
          className="border-orange-500/30 bg-orange-500/10 text-orange-300"
        />

        <RiskSummary
          label="Medium Risk"
          count={riskCounts["Medium Risk"]}
          className="border-amber-500/30 bg-amber-500/10 text-amber-300"
        />

        <RiskSummary
          label="Low Risk"
          count={riskCounts["Low Risk"]}
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-800 px-6 py-4">
        {[
          "All",
          "Critical Risk",
          "High Risk",
          "Medium Risk",
          "Low Risk",
        ].map((riskLevel) => (
          <button
            key={riskLevel}
            type="button"
            onClick={() => setSelectedRisk(riskLevel)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              selectedRisk === riskLevel
                ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-white"
            }`}
          >
            {riskLevel}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex min-h-[480px] items-center justify-center gap-3 text-slate-400">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />

          <span>Loading river pollution map...</span>
        </div>
      )}

      {!loading && errorMessage && (
        <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && (
        <>
          <div className="relative h-[520px] w-full">
            <MapContainer
              center={mapCenter}
              zoom={filteredReports.length > 0 ? 9 : 6}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapUpdater
                reports={filteredReports}
                defaultCenter={DEFAULT_CENTER}
              />

              {filteredReports.map((report) => {
                const riskLevel = normalizeRiskLevel(
                  report.riskLevel
                );

                const markerStyle =
                  getMarkerStyle(riskLevel);

                return (
                  <CircleMarker
                    key={report.id}
                    center={[
                      report.latitude,
                      report.longitude,
                    ]}
                    radius={11}
                    pathOptions={{
                      color: markerStyle.border,
                      fillColor: markerStyle.fill,
                      fillOpacity: 0.85,
                      weight: 3,
                    }}
                  >
                    <Popup>
                      <ReportPopup
                        report={report}
                        riskLevel={riskLevel}
                      />
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {mappedReports.length === 0 && (
            <div className="border-t border-slate-800 px-6 py-6 text-center">
              <p className="font-semibold text-amber-300">
                No reports with valid coordinates found.
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Citizen reports must contain latitude and longitude
                values to appear on the map.
              </p>
            </div>
          )}

          {mappedReports.length > 0 &&
            filteredReports.length === 0 && (
              <div className="border-t border-slate-800 px-6 py-6 text-center">
                <p className="text-sm text-slate-400">
                  No reports found under the selected risk level.
                </p>
              </div>
            )}
        </>
      )}

      <div className="flex flex-wrap gap-5 border-t border-slate-800 bg-slate-950/40 px-6 py-4 text-xs">
        <Legend
          label="Critical Risk"
          colorClass="bg-red-500"
        />

        <Legend
          label="High Risk"
          colorClass="bg-orange-500"
        />

        <Legend
          label="Medium Risk"
          colorClass="bg-amber-500"
        />

        <Legend
          label="Low Risk"
          colorClass="bg-emerald-500"
        />
      </div>
    </section>
  );
}

function MapUpdater({ reports, defaultCenter }) {
  const map = useMap();

  useEffect(() => {
    if (reports.length === 0) {
      map.setView(defaultCenter, 6);
      return;
    }

    if (reports.length === 1) {
      map.setView(
        [reports[0].latitude, reports[0].longitude],
        12
      );

      return;
    }

    const bounds = reports.map((report) => [
      report.latitude,
      report.longitude,
    ]);

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 13,
    });
  }, [reports, defaultCenter, map]);

  return null;
}

function ReportPopup({ report, riskLevel }) {
  return (
    <div style={{ minWidth: "220px" }}>
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: "16px",
          fontWeight: "700",
        }}
      >
        {report.riverName ||
          report.locationName ||
          "Pollution Report"}
      </h3>

      <p style={{ margin: "4px 0" }}>
        <strong>Location:</strong>{" "}
        {report.location ||
          report.address ||
          report.locationName ||
          "Not provided"}
      </p>

      <p style={{ margin: "4px 0" }}>
        <strong>Pollution Type:</strong>{" "}
        {report.pollutionType ||
          report.category ||
          report.issueType ||
          "Not specified"}
      </p>

      <p style={{ margin: "4px 0" }}>
        <strong>Risk Level:</strong> {riskLevel}
      </p>

      <p style={{ margin: "4px 0" }}>
        <strong>Status:</strong>{" "}
        {report.status || "Pending"}
      </p>

      {report.description && (
        <p
          style={{
            margin: "8px 0 0",
            lineHeight: "1.5",
          }}
        >
          {report.description}
        </p>
      )}
    </div>
  );
}

function RiskSummary({ label, count, className }) {
  return (
    <div
      className={`rounded-xl border p-4 ${className}`}
    >
      <p className="text-sm font-medium">{label}</p>

      <p className="mt-2 text-3xl font-bold">
        {count}
      </p>
    </div>
  );
}

function Legend({ label, colorClass }) {
  return (
    <div className="flex items-center gap-2 text-slate-400">
      <span
        className={`h-3 w-3 rounded-full ${colorClass}`}
      />

      <span>{label}</span>
    </div>
  );
}

function getLatitude(report) {
  const value =
    report.latitude ??
    report.lat ??
    report.coordinates?.latitude ??
    report.coordinates?.lat ??
    report.location?.latitude ??
    report.location?.lat;

  return Number(value);
}

function getLongitude(report) {
  const value =
    report.longitude ??
    report.lng ??
    report.lon ??
    report.coordinates?.longitude ??
    report.coordinates?.lng ??
    report.coordinates?.lon ??
    report.location?.longitude ??
    report.location?.lng;

  return Number(value);
}

function normalizeRiskLevel(riskLevel) {
  const value = String(riskLevel || "")
    .trim()
    .toLowerCase();

  if (
    value.includes("critical") ||
    value.includes("severe")
  ) {
    return "Critical Risk";
  }

  if (value.includes("high")) {
    return "High Risk";
  }

  if (
    value.includes("medium") ||
    value.includes("moderate")
  ) {
    return "Medium Risk";
  }

  return "Low Risk";
}

function getMarkerStyle(riskLevel) {
  if (riskLevel === "Critical Risk") {
    return {
      fill: "#ef4444",
      border: "#991b1b",
    };
  }

  if (riskLevel === "High Risk") {
    return {
      fill: "#f97316",
      border: "#9a3412",
    };
  }

  if (riskLevel === "Medium Risk") {
    return {
      fill: "#f59e0b",
      border: "#92400e",
    };
  }

  return {
    fill: "#10b981",
    border: "#065f46",
  };
}