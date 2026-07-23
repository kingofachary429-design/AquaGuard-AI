import PredictionAnalytics from "../components/PredictionAnalytics";
import PollutionTrendChart from "../components/PollutionTrendChart";
import RiverHealthComparison from "../components/RiverHealthComparison";
import RiverPollutionRanking from "../components/RiverPollutionRanking";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
          Data Analysis
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Pollution Analytics
        </h2>
      </div>

      <PredictionAnalytics />

      <PollutionTrendChart />

      <RiverHealthComparison />

      <RiverPollutionRanking />
    </div>
  );
}