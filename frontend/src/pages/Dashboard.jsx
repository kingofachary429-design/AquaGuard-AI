import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../firebase";
import useUserRole from "../hooks/useUserRole";

import EmergencyAlert from "../components/EmergencyAlert";
import DashboardStats from "../components/DashboardStats";
import WaterQualitySummary from "../components/WaterQualitySummary";
import PollutionSourceBreakdown from "../components/PollutionSourceBreakdown";
import RiverHealthScore from "../components/RiverHealthScore";
import AIRecommendationsPanel from "../components/AIRecommendationsPanel";

import CitizenReport from "../components/CitizenReport";
import AIPollutionPredictor from "../components/AIPollutionPredictor";
import PredictionHistory from "../components/PredictionHistory";
import PredictionAnalytics from "../components/PredictionAnalytics";
import PollutionTrendChart from "../components/PollutionTrendChart";

import RiverPollutionMap from "../components/RiverPollutionMap";
import RecentReports from "../components/RecentReports";
import RealtimeNotificationCenter from "../components/RealtimeNotificationCenter";

import RiverHealthComparison from "../components/RiverHealthComparison";
import RiverPollutionRanking from "../components/RiverPollutionRanking";

import CriticalReportsPanel from "../components/CriticalReportsPanel";
import AuthorityActionCenter from "../components/AuthorityActionCenter";
import AdminReportManagement from "../components/AdminReportManagement";

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    user,
    role,
    isAuthority,
    isAdmin,
    loadingRole,
  } = useUserRole();

  const [activePage, setActivePage] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = useMemo(() => {
    const items = [
      {
        id: "overview",
        label: "Dashboard",
        icon: "🏠",
      },
      {
        id: "report",
        label: "Report Pollution",
        icon: "📝",
      },
      {
        id: "prediction",
        label: "AI Prediction",
        icon: "🤖",
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: "📊",
      },
      {
        id: "map",
        label: "River Map",
        icon: "🗺️",
      },
      {
        id: "reports",
        label: "Reports",
        icon: "📋",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: "🔔",
      },
    ];

    if (isAuthority) {
      items.push({
        id: "authority",
        label: "Authority Panel",
        icon: "🛡️",
      });
    }

    return items;
  }, [isAuthority]);

  const handleNavigation = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loadingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading AquaGuard AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 md:px-6">
          <button
            type="button"
            onClick={() => handleNavigation("overview")}
            className="text-left"
          >
            <h1 className="text-xl font-bold text-cyan-400 md:text-2xl">
              AquaGuard AI
            </h1>

            <p className="text-xs text-slate-400">
              River Pollution Monitoring System
            </p>
          </button>

          <div className="hidden items-center gap-4 md:flex">
            <div className="text-right">
              <p className="max-w-52 truncate text-sm font-semibold text-white">
                {user?.email || "AquaGuard User"}
              </p>

              <p className="mt-1 text-xs capitalize text-cyan-400">
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
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xl text-white md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-800 bg-slate-900 px-4 py-4 md:hidden">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <NavigationButton
                  key={item.id}
                  item={item}
                  activePage={activePage}
                  onClick={() => handleNavigation(item.id)}
                  mobile
                />
              ))}
            </div>

            <div className="mt-4 border-t border-slate-800 pt-4">
              <p className="truncate text-sm text-slate-300">
                {user?.email}
              </p>

              <p className="mt-1 text-xs capitalize text-cyan-400">
                {role || "citizen"}
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-[81px] hidden h-[calc(100vh-81px)] w-64 shrink-0 border-r border-slate-800 bg-slate-900/70 p-4 md:block">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <NavigationButton
                key={item.id}
                item={item}
                activePage={activePage}
                onClick={() => handleNavigation(item.id)}
              />
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Current Access
            </p>

            <p className="mt-2 text-sm font-semibold capitalize text-white">
              {role || "citizen"}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              {isAuthority
                ? "You can monitor and manage pollution reports."
                : "You can report incidents and view river health data."}
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          {activePage === "overview" && <DashboardOverview />}

          {activePage === "report" && <ReportPollutionPage />}

          {activePage === "prediction" && <PredictionPage />}

          {activePage === "analytics" && <AnalyticsPage />}

          {activePage === "map" && <RiverMapPage />}

          {activePage === "reports" && <ReportsPage />}

          {activePage === "notifications" && <NotificationsPage />}

          {activePage === "authority" && (
            <AuthorityPage
              isAuthority={isAuthority}
              isAdmin={isAdmin}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function NavigationButton({
  item,
  activePage,
  onClick,
  mobile = false,
}) {
  const isActive = activePage === item.id;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
        isActive
          ? "border border-cyan-500/30 bg-cyan-500/15 text-cyan-300"
          : "border border-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
      } ${mobile ? "justify-start" : ""}`}
    >
      <span className="text-lg">
        {item.icon}
      </span>

      <span>{item.label}</span>
    </button>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <section className="mb-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-bold text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          {description}
        </p>
      )}
    </section>
  );
}

function DashboardOverview() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="System Overview"
        title="River Pollution Dashboard"
        description="View important river health statistics, environmental risks and AI recommendations."
      />

      <EmergencyAlert />

      <DashboardStats />

      <WaterQualitySummary />

      <PollutionSourceBreakdown />

      <RiverHealthScore />

      <AIRecommendationsPanel />
    </div>
  );
}

function ReportPollutionPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Citizen Reporting"
        title="Report River Pollution"
        description="Submit a pollution incident with location and water-quality information."
      />

      <CitizenReport />
    </div>
  );
}

function PredictionPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Artificial Intelligence"
        title="Pollution Risk Prediction"
        description="Enter environmental values to predict river pollution risk using AquaGuard AI."
      />

      <AIPollutionPredictor />

      <PredictionHistory />
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Data Analytics"
        title="Pollution Analytics"
        description="Analyze prediction trends, river health comparisons and high-risk river rankings."
      />

      <PredictionAnalytics />

      <PollutionTrendChart />

      <RiverHealthComparison />

      <RiverPollutionRanking />
    </div>
  );
}

function RiverMapPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Live Monitoring"
        title="River Pollution Map"
        description="View reported pollution locations and river risk levels on the interactive map."
      />

      <RiverPollutionMap />
    </div>
  );
}

function ReportsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Pollution Reports"
        title="Recent Pollution Reports"
        description="Review recently submitted river pollution incidents and their current status."
      />

      <RecentReports />
    </div>
  );
}

function NotificationsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Realtime Alerts"
        title="Notification Center"
        description="View unresolved High and Critical pollution alerts."
      />

      <RealtimeNotificationCenter />
    </div>
  );
}

function AuthorityPage({
  isAuthority,
  isAdmin,
}) {
  if (!isAuthority) {
    return (
      <section className="rounded-2xl border border-red-500/30 bg-red-500/10 p-10 text-center">
        <div className="text-5xl">🔒</div>

        <h2 className="mt-4 text-2xl font-bold text-red-300">
          Access Denied
        </h2>

        <p className="mt-2 text-sm text-slate-300">
          Ee page Authority and Admin users kosam matrame.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Protected Management Area"
        title="Authority Control Panel"
        description="Monitor critical incidents, update investigation status and manage pollution reports."
      />

      <CriticalReportsPanel />

      <AuthorityActionCenter />

      {isAdmin && <AdminReportManagement />}
    </div>
  );
}