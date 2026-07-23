import { useEffect } from "react";

export default function ReportDetailsModal({
  report,
  isOpen,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !report) {
    return null;
  }

  const riskScore = getRiskScore(report);
  const riskLevel =
    report.riskLevel || getRiskLevel(riskScore);

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

  const recommendations =
    Array.isArray(report.recommendations)
      ? report.recommendations
      : [];

  const detectedIssues =
    Array.isArray(report.detectedIssues)
      ? report.detectedIssues
      : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-details-title"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-slate-800 bg-slate-900 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Pollution Report Details
            </p>

            <h2
              id="report-details-title"
              className="mt-2 text-2xl font-bold text-white"
            >
              {riverName}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {location}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xl text-slate-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
            aria-label="Close report details"
          >
            ×
          </button>
        </div>

        <div className="space-y-8 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${riskStyle.badge}`}
            >
              {riskLevel} Risk
            </span>

            <span className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300">
              Status: {report.status || "Pending"}
            </span>

            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300">
              Risk Score: {riskScore}/100
            </span>
          </div>

          <section>
            <h3 className="text-lg font-bold text-white">
              Incident Information
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DetailCard
                label="Pollution Type"
                value={
                  report.pollutionType ||
                  "Not provided"
                }
                icon="🧪"
              />

              <DetailCard
                label="Reported Date"
                value={formatDate(
                  report.createdAt ||
                    report.timestamp ||
                    report.date
                )}
                icon="📅"
              />

              <DetailCard
                label="Reporter Email"
                value={
                  report.reporterEmail ||
                  "Not available"
                }
                icon="👤"
              />

              <DetailCard
                label="Coordinates"
                value={formatCoordinates(report)}
                icon="📍"
              />
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white">
              Description
            </h3>

            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {report.description ||
                  "No description provided."}
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white">
                Water Quality Parameters
              </h3>

              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                AI Analysis Inputs
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <ParameterCard
                label="pH"
                value={formatNumber(report.ph)}
                unit=""
                status={getPhStatus(report.ph)}
              />

              <ParameterCard
                label="Turbidity"
                value={formatNumber(
                  report.turbidity
                )}
                unit="NTU"
                status={getTurbidityStatus(
                  report.turbidity
                )}
              />

              <ParameterCard
                label="Dissolved Oxygen"
                value={formatNumber(
                  report.dissolvedOxygen
                )}
                unit="mg/L"
                status={getOxygenStatus(
                  report.dissolvedOxygen
                )}
              />

              <ParameterCard
                label="Rainfall"
                value={formatNumber(
                  report.rainfall
                )}
                unit="mm"
                status="Recorded"
              />

              <ParameterCard
                label="Industry Activity"
                value={
                  report.industrialActivity ||
                  "Not provided"
                }
                unit=""
                status={
                  report.industrialActivity ===
                  "High"
                    ? "High Impact"
                    : "Recorded"
                }
              />
            </div>
          </section>

          {detectedIssues.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-white">
                Detected Environmental Issues
              </h3>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {detectedIssues.map(
                  (issue, index) => (
                    <div
                      key={`${issue}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
                    >
                      <span className="mt-0.5">
                        ⚠️
                      </span>

                      <p className="text-sm leading-6 text-red-200">
                        {formatListItem(issue)}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-lg font-bold text-white">
              AI Risk Message
            </h3>

            <div
              className={`mt-4 rounded-2xl border p-5 ${riskStyle.container}`}
            >
              <p className="text-sm leading-7 text-slate-200">
                {report.riskMessage ||
                  getDefaultRiskMessage(
                    riskLevel
                  )}
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white">
              AI Recommendations
            </h3>

            {recommendations.length > 0 ? (
              <div className="mt-4 space-y-3">
                {recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={`${formatListItem(
                        recommendation
                      )}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4"
                    >
                      <span className="mt-0.5">
                        🤖
                      </span>

                      <p className="text-sm leading-6 text-cyan-100">
                        {formatListItem(
                          recommendation
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-5 text-sm text-slate-400">
                AI recommendations not available.
              </div>
            )}
          </section>

          {(report.authorityAction ||
            report.actionUpdatedByEmail) && (
            <section>
              <h3 className="text-lg font-bold text-white">
                Authority Response
              </h3>

              <div className="mt-4 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
                <p className="text-sm text-slate-300">
                  Current Action:{" "}
                  <strong className="text-violet-200">
                    {report.authorityAction ||
                      report.status ||
                      "Pending"}
                  </strong>
                </p>

                {report.actionUpdatedByEmail && (
                  <p className="mt-2 text-sm text-slate-400">
                    Updated by:{" "}
                    {
                      report.actionUpdatedByEmail
                    }
                  </p>
                )}

                {report.actionUpdatedAt && (
                  <p className="mt-2 text-sm text-slate-400">
                    Updated on:{" "}
                    {formatDate(
                      report.actionUpdatedAt
                    )}
                  </p>
                )}
              </div>
            </section>
          )}

          <div className="flex justify-end border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-2 break-words text-sm font-medium text-slate-200">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ParameterCard({
  label,
  value,
  unit,
  status,
}) {
  const statusStyle = getParameterStatusStyle(
    status
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}

        {unit && (
          <span className="ml-1 text-xs font-medium text-slate-400">
            {unit}
          </span>
        )}
      </p>

      <span
        className={`mt-3 inline-block rounded-full border px-2 py-1 text-[11px] font-semibold ${statusStyle}`}
      >
        {status}
      </span>
    </div>
  );
}

function formatNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "N/A";
  }

  return Number.isInteger(numericValue)
    ? numericValue
    : numericValue.toFixed(1);
}

function formatCoordinates(report) {
  const latitude = Number(report.latitude);
  const longitude = Number(report.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return "Not available";
  }

  return `${latitude.toFixed(
    6
  )}, ${longitude.toFixed(6)}`;
}

function formatDate(value) {
  if (!value) {
    return "Not available";
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
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRiskScore(report) {
  const riskScore = Number(report.riskScore);

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
      badge:
        "border-red-500/30 bg-red-500/10 text-red-300",
      container:
        "border-red-500/30 bg-red-500/10",
    };
  }

  if (score >= 60) {
    return {
      badge:
        "border-orange-500/30 bg-orange-500/10 text-orange-300",
      container:
        "border-orange-500/30 bg-orange-500/10",
    };
  }

  if (score >= 40) {
    return {
      badge:
        "border-amber-500/30 bg-amber-500/10 text-amber-300",
      container:
        "border-amber-500/30 bg-amber-500/10",
    };
  }

  return {
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    container:
      "border-emerald-500/30 bg-emerald-500/10",
  };
}

function getPhStatus(value) {
  const ph = Number(value);

  if (!Number.isFinite(ph)) {
    return "Not Available";
  }

  if (ph >= 6.5 && ph <= 8.5) {
    return "Normal";
  }

  return "Unsafe";
}

function getTurbidityStatus(value) {
  const turbidity = Number(value);

  if (!Number.isFinite(turbidity)) {
    return "Not Available";
  }

  if (turbidity <= 5) {
    return "Good";
  }

  if (turbidity <= 20) {
    return "Moderate";
  }

  return "High";
}

function getOxygenStatus(value) {
  const oxygen = Number(value);

  if (!Number.isFinite(oxygen)) {
    return "Not Available";
  }

  if (oxygen >= 6) {
    return "Good";
  }

  if (oxygen >= 4) {
    return "Moderate";
  }

  return "Low";
}

function getParameterStatusStyle(status) {
  const normalizedStatus = String(
    status || ""
  ).toLowerCase();

  if (
    normalizedStatus.includes("unsafe") ||
    normalizedStatus.includes("high impact") ||
    normalizedStatus === "low"
  ) {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  if (
    normalizedStatus.includes("moderate") ||
    normalizedStatus === "high"
  ) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  if (
    normalizedStatus === "normal" ||
    normalizedStatus === "good"
  ) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  return "border-slate-700 bg-slate-800 text-slate-300";
}

function formatListItem(item) {
  if (typeof item === "string") {
    return item;
  }

  if (
    item &&
    typeof item === "object"
  ) {
    return (
      item.message ||
      item.recommendation ||
      item.title ||
      item.issue ||
      JSON.stringify(item)
    );
  }

  return String(item || "");
}

function getDefaultRiskMessage(riskLevel) {
  if (riskLevel === "Critical") {
    return "Critical pollution conditions detected. Immediate environmental authority action is required.";
  }

  if (riskLevel === "High") {
    return "High pollution risk detected. Urgent monitoring and field inspection are recommended.";
  }

  if (riskLevel === "Moderate") {
    return "Moderate pollution risk detected. Continued monitoring and preventive action are recommended.";
  }

  return "Current parameters indicate low pollution risk. Routine monitoring should continue.";
}