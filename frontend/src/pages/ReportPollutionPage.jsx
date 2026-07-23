import CitizenReport from "../components/CitizenReport";

export default function ReportPollutionPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Citizen Reporting
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Report River Pollution
        </h2>
      </div>

      <CitizenReport />
    </div>
  );
}