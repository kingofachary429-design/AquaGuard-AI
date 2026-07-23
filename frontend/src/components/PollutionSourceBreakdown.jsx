import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "../firebase";

export default function PollutionSourceBreakdown() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "pollutionReports"),
      (snapshot) => {
        const reportData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setReports(reportData);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error(
          "Pollution source breakdown loading failed:",
          snapshotError
        );

        setError("Pollution source information load avvaledu.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const sourceData = useMemo(() => {
    const sourceCounts = {};

    reports.forEach((report) => {
      const source = detectPollutionSource(report);

      if (!sourceCounts[source]) {
        sourceCounts[source] = 0;
      }

      sourceCounts[source] += 1;
    });

    return Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage:
          reports.length > 0
            ? Math.round((count / reports.length) * 100)
            : 0,
        style: getSourceStyle(source),
      }))
      .sort(
        (firstSource, secondSource) =>
          secondSource.count - firstSource.count
      );
  }, [reports]);

  const dominantSource = sourceData[0];

  if (loading) {
    return (
      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

          <p className="text-sm text-slate-400">
            Analyzing pollution sources...
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
              Pollution Intelligence
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Pollution Source Breakdown
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Citizen reports nundi common river pollution sources-ni
              identify chesi category-wise summary display chestundi.
            </p>
          </div>

          {dominantSource && (
            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">
                Dominant Source
              </p>

              <p className="mt-1 text-lg font-bold text-white">
                {dominantSource.source}
              </p>

              <p className="mt-1 text-sm text-orange-300">
                {dominantSource.percentage}% of reports
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && sourceData.length === 0 && (
        <div className="p-10 text-center">
          <div className="text-4xl">🏭</div>

          <h3 className="mt-4 text-lg font-bold text-white">
            No Pollution Source Data
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Pollution reports submit chesina tarvata source
            breakdown automatic ga display avutundi.
          </p>
        </div>
      )}

      {!error && sourceData.length > 0 && (
        <>
          <div className="grid gap-5 p-6 sm:grid-cols-2 xl:grid-cols-3">
            {sourceData.map((item) => (
              <SourceCard
                key={item.source}
                item={item}
              />
            ))}
          </div>

          <div className="border-t border-slate-800 bg-slate-950/30 px-6 py-4 text-sm text-slate-400">
            Analysis based on{" "}
            <span className="font-semibold text-white">
              {reports.length}
            </span>{" "}
            pollution report
            {reports.length === 1 ? "" : "s"}.
          </div>
        </>
      )}
    </section>
  );
}

function SourceCard({ item }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${item.style.background}`}
        >
          {item.style.icon}
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${item.style.badge}`}
        >
          {item.percentage}%
        </span>
      </div>

      <h3 className="mt-5 text-lg font-bold text-white">
        {item.source}
      </h3>

      <p className="mt-1 text-sm text-slate-400">
        {item.count} report
        {item.count === 1 ? "" : "s"}
      </p>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${item.style.progress}`}
          style={{
            width: `${item.percentage}%`,
          }}
        />
      </div>
    </article>
  );
}

function detectPollutionSource(report) {
  const combinedText = [
    report.pollutionType,
    report.source,
    report.category,
    report.description,
    report.issueDescription,
    report.industryType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const industrialActivity = Number(
    report.industrialActivity
  );

  if (
    combinedText.includes("industrial") ||
    combinedText.includes("factory") ||
    combinedText.includes("industry") ||
    industrialActivity >= 7
  ) {
    return "Industrial Waste";
  }

  if (
    combinedText.includes("sewage") ||
    combinedText.includes("drainage") ||
    combinedText.includes("wastewater") ||
    combinedText.includes("domestic waste")
  ) {
    return "Sewage Pollution";
  }

  if (
    combinedText.includes("plastic") ||
    combinedText.includes("garbage") ||
    combinedText.includes("solid waste")
  ) {
    return "Plastic and Solid Waste";
  }

  if (
    combinedText.includes("chemical") ||
    combinedText.includes("toxic") ||
    combinedText.includes("acid") ||
    combinedText.includes("pesticide")
  ) {
    return "Chemical Pollution";
  }

  if (
    combinedText.includes("agriculture") ||
    combinedText.includes("fertilizer") ||
    combinedText.includes("farm") ||
    combinedText.includes("runoff")
  ) {
    return "Agricultural Runoff";
  }

  if (
    combinedText.includes("oil") ||
    combinedText.includes("fuel") ||
    combinedText.includes("petroleum")
  ) {
    return "Oil Pollution";
  }

  return "Other Sources";
}

function getSourceStyle(source) {
  if (source === "Industrial Waste") {
    return {
      icon: "🏭",
      background: "bg-red-500/10",
      progress: "bg-red-500",
      badge:
        "border-red-500/30 bg-red-500/10 text-red-300",
    };
  }

  if (source === "Sewage Pollution") {
    return {
      icon: "🚰",
      background: "bg-orange-500/10",
      progress: "bg-orange-500",
      badge:
        "border-orange-500/30 bg-orange-500/10 text-orange-300",
    };
  }

  if (source === "Plastic and Solid Waste") {
    return {
      icon: "🗑️",
      background: "bg-amber-500/10",
      progress: "bg-amber-500",
      badge:
        "border-amber-500/30 bg-amber-500/10 text-amber-300",
    };
  }

  if (source === "Chemical Pollution") {
    return {
      icon: "☣️",
      background: "bg-violet-500/10",
      progress: "bg-violet-500",
      badge:
        "border-violet-500/30 bg-violet-500/10 text-violet-300",
    };
  }

  if (source === "Agricultural Runoff") {
    return {
      icon: "🌾",
      background: "bg-emerald-500/10",
      progress: "bg-emerald-500",
      badge:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    };
  }

  if (source === "Oil Pollution") {
    return {
      icon: "🛢️",
      background: "bg-slate-700",
      progress: "bg-slate-500",
      badge:
        "border-slate-600 bg-slate-800 text-slate-300",
    };
  }

  return {
    icon: "🌊",
    background: "bg-cyan-500/10",
    progress: "bg-cyan-500",
    badge:
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  };
}