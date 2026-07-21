export default function RiverInfo({ river }) {
  if (!river) {
    return (
      <div className="bg-slate-900 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-cyan-400">
          AI River Analysis
        </h2>

        <p className="text-gray-400 mt-4">
          Click a river marker on the map to view AI analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-cyan-500/20">
      <h2 className="text-3xl font-bold text-cyan-400">
        {river.name}
      </h2>

      <div className="mt-6 space-y-3">
        <p><strong>Status:</strong> {river.status}</p>
        <p><strong>Water Quality:</strong> {river.score}/100</p>
        <p><strong>AI Pollution Risk:</strong> {river.prediction}%</p>
        <p><strong>Temperature:</strong> {river.temperature}</p>
        <p><strong>Rainfall:</strong> {river.rainfall}</p>
        <p><strong>Nearby Industries:</strong> {river.industries}</p>

        <div className="mt-5 p-4 bg-cyan-500/10 rounded-xl">
          <h3 className="font-bold text-cyan-300">
            AI Recommendation
          </h3>

          <p className="text-gray-300 mt-2">
            {river.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}