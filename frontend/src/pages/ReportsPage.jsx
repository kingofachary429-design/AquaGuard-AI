import RecentReports from "../components/RecentReports";

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
          Pollution Reports
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Recent Reports
        </h2>
      </div>

      <RecentReports />
    </div>
  );
}