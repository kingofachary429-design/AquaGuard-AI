import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

import DashboardStats from "../components/DashboardStats";
import CitizenReport from "../components/CitizenReport";
import RecentReports from "../components/RecentReports";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              🌊 AquaGuard AI
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Intelligent River Pollution Monitoring Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium text-white">
                Citizen Account
              </p>

              <p className="text-xs text-slate-400">
                {auth.currentUser?.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-5 py-2 font-semibold transition hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Environmental Intelligence Platform
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Welcome to AquaGuard Dashboard
          </h2>

          <p className="mt-3 max-w-3xl text-slate-300">
            Monitor river pollution reports, analyze risk levels and
            contribute to environmental protection through citizen reporting.
          </p>
        </section>

        <DashboardStats />
        <RecentReports />
        <CitizenReport />
      </main>
    </div>
  );
}