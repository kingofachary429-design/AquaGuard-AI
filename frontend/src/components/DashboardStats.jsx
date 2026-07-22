import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    highRisk: 0,
    resolved: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reportsRef = collection(db, "pollutionReports");

    const unsubscribeTotal = onSnapshot(reportsRef, (snapshot) => {
      setStats((previousStats) => ({
        ...previousStats,
        total: snapshot.size,
      }));

      setLoading(false);
    });

    const pendingQuery = query(
      reportsRef,
      where("status", "==", "Pending")
    );

    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      setStats((previousStats) => ({
        ...previousStats,
        pending: snapshot.size,
      }));
    });

    const highRiskQuery = query(
      reportsRef,
      where("riskLevel", "==", "High Risk")
    );

    const unsubscribeHighRisk = onSnapshot(
      highRiskQuery,
      (snapshot) => {
        setStats((previousStats) => ({
          ...previousStats,
          highRisk: snapshot.size,
        }));
      }
    );

    const resolvedQuery = query(
      reportsRef,
      where("status", "==", "Resolved")
    );

    const unsubscribeResolved = onSnapshot(
      resolvedQuery,
      (snapshot) => {
        setStats((previousStats) => ({
          ...previousStats,
          resolved: snapshot.size,
        }));
      }
    );

    return () => {
      unsubscribeTotal();
      unsubscribePending();
      unsubscribeHighRisk();
      unsubscribeResolved();
    };
  }, []);

  const cards = [
    {
      title: "Total Reports",
      value: stats.total,
      icon: "📋",
      description: "All pollution reports",
    },
    {
      title: "Pending Reports",
      value: stats.pending,
      icon: "⏳",
      description: "Waiting for review",
    },
    {
      title: "High Risk",
      value: stats.highRisk,
      icon: "🚨",
      description: "Critical incidents",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: "✅",
      description: "Completed reports",
    },
  ];

  return (
    <section className="mt-8">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Live Monitoring
        </p>

        <h2 className="mt-1 text-2xl font-bold text-white">
          Pollution Report Statistics
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-500/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  {card.title}
                </p>

                <h3 className="mt-3 text-4xl font-bold text-white">
                  {loading ? "..." : card.value}
                </h3>
              </div>

              <div className="rounded-xl bg-slate-800 p-3 text-2xl">
                {card.icon}
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}