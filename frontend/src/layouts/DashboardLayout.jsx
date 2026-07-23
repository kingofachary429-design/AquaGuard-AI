import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../firebase";
import useUserRole from "../hooks/useUserRole";

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const {
    user,
    role,
    isAuthority,
    loadingRole,
  } = useUserRole();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  if (loadingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-300">
          Loading AquaGuard AI...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-left"
          >
            <h1 className="text-xl font-bold text-cyan-400">
              AquaGuard AI
            </h1>

            <p className="text-xs text-slate-400">
              River Pollution Monitoring
            </p>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            <NavigationLinks
              isAuthority={isAuthority}
              onNavigate={closeMobileMenu}
            />
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="max-w-40 truncate text-sm font-semibold text-white">
                {user?.email || "User"}
              </p>

              <p className="text-xs capitalize text-cyan-400">
                {role || "citizen"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
            >
              Logout
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((currentValue) => !currentValue)
            }
            className="rounded-lg border border-slate-700 p-2 text-slate-200 lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-800 bg-slate-900 px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-2">
              <NavigationLinks
                isAuthority={isAuthority}
                onNavigate={closeMobileMenu}
              />
            </nav>

            <div className="mt-4 border-t border-slate-800 pt-4">
              <p className="text-sm text-slate-300">
                {user?.email}
              </p>

              <p className="mt-1 text-xs capitalize text-cyan-400">
                {role || "citizen"}
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavigationLinks({
  isAuthority,
  onNavigate,
}) {
  const commonLinkClass =
    "rounded-xl px-3 py-2 text-sm font-semibold transition";

  const getLinkClass = ({ isActive }) =>
    `${commonLinkClass} ${
      isActive
        ? "bg-cyan-500/15 text-cyan-300"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <>
      <NavLink
        to="/dashboard"
        end
        onClick={onNavigate}
        className={getLinkClass}
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/dashboard/report"
        onClick={onNavigate}
        className={getLinkClass}
      >
        Report Pollution
      </NavLink>

      <NavLink
        to="/dashboard/prediction"
        onClick={onNavigate}
        className={getLinkClass}
      >
        AI Prediction
      </NavLink>

      <NavLink
        to="/dashboard/analytics"
        onClick={onNavigate}
        className={getLinkClass}
      >
        Analytics
      </NavLink>

      <NavLink
        to="/dashboard/map"
        onClick={onNavigate}
        className={getLinkClass}
      >
        River Map
      </NavLink>

      <NavLink
        to="/dashboard/reports"
        onClick={onNavigate}
        className={getLinkClass}
      >
        Reports
      </NavLink>

      <NavLink
        to="/dashboard/notifications"
        onClick={onNavigate}
        className={getLinkClass}
      >
        Notifications
      </NavLink>

      {isAuthority && (
        <NavLink
          to="/dashboard/authority"
          onClick={onNavigate}
          className={getLinkClass}
        >
          Authority Panel
        </NavLink>
      )}
    </>
  );
}