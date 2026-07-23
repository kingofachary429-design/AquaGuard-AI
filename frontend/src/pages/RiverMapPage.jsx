import RiverPollutionMap from "../components/RiverPollutionMap";

export default function RiverMapPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
          Live Monitoring
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          River Pollution Map
        </h2>
      </div>

      <RiverPollutionMap />
    </div>
  );
}