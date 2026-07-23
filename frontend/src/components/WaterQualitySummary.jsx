import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../firebase";

export default function WaterQualitySummary() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "pollutionReports"),
      (snapshot) => {
        const reportData = snapshot.docs.map((reportDocument) => ({
          id: reportDocument.id,
          ...reportDocument.data(),
        }));

        setReports(reportData);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error(
          "Water quality summary loading failed:",
          snapshotError
        );

        setError("Water quality information load avvaledu.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const summary = useMemo(() => {
    const phValues = getValidNumbers(reports, "ph");
    const turbidityValues = getValidNumbers(
      reports,
      "turbidity"
    );
    const dissolvedOxygenValues = getValidNumbers(
      reports,
      "dissolvedOxygen"
    );
    const rainfallValues = getValidNumbers(
      reports,
      "rainfall"
    );

    return {
      averagePh: calculateAverage(phValues),
      averageTurbidity: calculateAverage(
        turbidityValues
      ),
      averageDissolvedOxygen: calculateAverage(
        dissolvedOxygenValues
      ),
      averageRainfall: calculateAverage(
        rainfallValues
      ),
      phCount: phValues.length,
      turbidityCount: turbidityValues.length,
      dissolvedOxygenCount:
        dissolvedOxygenValues.length,
      rainfallCount: rainfallValues.length,
    };
  }, [reports]);

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

          <p className="text-sm text-slate-400">
            Calculating water quality parameters...
          </p>
        </div>
      </section>
    );
  }

  const hasData =
    summary.phCount > 0 ||
    summary.turbidityCount > 0 ||
    summary.dissolvedOxygenCount > 0 ||
    summary.rainfallCount > 0;

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Water Quality Analysis
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Environmental Parameter Summary
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Pollution reports nundi pH, turbidity, dissolved
          oxygen and rainfall average values calculate chestundi.
        </p>
      </div>

      {error && (
        <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && !hasData && (
        <div className="p-10 text-center">
          <div className="text-4xl">🧪</div>

          <h3 className="mt-4 text-lg font-bold text-white">
            No Environmental Data
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Environmental values tho citizen report submit
            chesina tarvata summary display avutundi.
          </p>
        </div>
      )}

      {!error && hasData && (
        <div className="grid gap-5 p-6 sm:grid-cols-2 xl:grid-cols-4">
          <ParameterCard
            title="Average pH"
            value={summary.averagePh}
            unit="pH"
            icon="🧪"
            status={getPhStatus(summary.averagePh)}
            sampleCount={summary.phCount}
          />

          <ParameterCard
            title="Average Turbidity"
            value={summary.averageTurbidity}
            unit="NTU"
            icon="🌫️"
            status={getTurbidityStatus(
              summary.averageTurbidity
            )}
            sampleCount={summary.turbidityCount}
          />

          <ParameterCard
            title="Dissolved Oxygen"
            value={summary.averageDissolvedOxygen}
            unit="mg/L"
            icon="💨"
            status={getDissolvedOxygenStatus(
              summary.averageDissolvedOxygen
            )}
            sampleCount={
              summary.dissolvedOxygenCount
            }
          />

          <ParameterCard
            title="Average Rainfall"
            value={summary.averageRainfall}
            unit="mm"
            icon="🌧️"
            status={getRainfallStatus(
              summary.averageRainfall
            )}
            sampleCount={summary.rainfallCount}
          />
        </div>
      )}
    </section>
  );
}

function ParameterCard({
  title,
  value,
  unit,
  icon,
  status,
  sampleCount,
}) {
  const hasValue = value !== null;

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${status.background}`}
        >
          {icon}
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.badge}`}
        >
          {hasValue ? status.label : "No Data"}
        </span>
      </div>

      <p className="mt-5 text-sm text-slate-400">
        {title}
      </p>

      <div className="mt-2 flex items-end gap-2">
        <p className={`text-3xl font-bold ${status.text}`}>
          {hasValue ? value : "--"}
        </p>

        <p className="pb-1 text-sm text-slate-500">
          {unit}
        </p>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <p className="text-xs text-slate-500">
          Based on{" "}
          <span className="font-semibold text-slate-300">
            {sampleCount}
          </span>{" "}
          valid sample{sampleCount === 1 ? "" : "s"}
        </p>
      </div>
    </article>
  );
}

function getValidNumbers(reports, fieldName) {
  return reports
    .map((report) => Number(report[fieldName]))
    .filter(
      (value) =>
        Number.isFinite(value) && value >= 0
    );
}

function calculateAverage(values) {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  return Number((total / values.length).toFixed(2));
}

function getPhStatus(value) {
  if (value === null) {
    return getNoDataStyle();
  }

  if (value >= 6.5 && value <= 8.5) {
    return getHealthyStyle("Safe");
  }

  if (
    (value >= 6 && value < 6.5) ||
    (value > 8.5 && value <= 9)
  ) {
    return getWarningStyle("Moderate");
  }

  return getCriticalStyle("Unsafe");
}

function getTurbidityStatus(value) {
  if (value === null) {
    return getNoDataStyle();
  }

  if (value <= 5) {
    return getHealthyStyle("Clear");
  }

  if (value <= 20) {
    return getWarningStyle("Moderate");
  }

  return getCriticalStyle("Polluted");
}

function getDissolvedOxygenStatus(value) {
  if (value === null) {
    return getNoDataStyle();
  }

  if (value >= 6) {
    return getHealthyStyle("Healthy");
  }

  if (value >= 4) {
    return getWarningStyle("Moderate");
  }

  return getCriticalStyle("Low Oxygen");
}

function getRainfallStatus(value) {
  if (value === null) {
    return getNoDataStyle();
  }

  if (value <= 20) {
    return getHealthyStyle("Normal");
  }

  if (value <= 50) {
    return getWarningStyle("Heavy");
  }

  return getCriticalStyle("Very Heavy");
}

function getHealthyStyle(label) {
  return {
    label,
    text: "text-emerald-300",
    background: "bg-emerald-500/10",
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  };
}

function getWarningStyle(label) {
  return {
    label,
    text: "text-amber-300",
    background: "bg-amber-500/10",
    badge:
      "border-amber-500/30 bg-amber-500/10 text-amber-300",
  };
}

function getCriticalStyle(label) {
  return {
    label,
    text: "text-red-300",
    background: "bg-red-500/10",
    badge:
      "border-red-500/30 bg-red-500/10 text-red-300",
  };
}

function getNoDataStyle() {
  return {
    label: "No Data",
    text: "text-slate-300",
    background: "bg-slate-800",
    badge:
      "border-slate-700 bg-slate-800 text-slate-300",
  };
}