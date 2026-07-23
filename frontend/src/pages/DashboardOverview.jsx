import EmergencyAlert from "../components/EmergencyAlert";
import DashboardStats from "../components/DashboardStats";
import WaterQualitySummary from "../components/WaterQualitySummary";
import PollutionSourceBreakdown from "../components/PollutionSourceBreakdown";
import RiverHealthScore from "../components/RiverHealthScore";
import AIRecommendationsPanel from "../components/AIRecommendationsPanel";

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          AquaGuard Overview
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          River Pollution Dashboard
        </h2>

        <p className="mt-2 text-slate-400">
          Current river health, pollution risks and recommendations.
        </p>
      </section>

      <EmergencyAlert />

      <DashboardStats />

      <WaterQualitySummary />

      <PollutionSourceBreakdown />

      <RiverHealthScore />

      <AIRecommendationsPanel />
    </div>
  );
}