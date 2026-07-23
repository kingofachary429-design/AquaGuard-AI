import AIPollutionPredictor from "../components/AIPollutionPredictor";
import PredictionHistory from "../components/PredictionHistory";

export default function PredictionPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">
          Artificial Intelligence
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Pollution Risk Prediction
        </h2>
      </div>

      <AIPollutionPredictor />

      <PredictionHistory />
    </div>
  );
}