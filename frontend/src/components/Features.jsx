export default function Features() {
  const features = [
    {
      title: "AI Prediction",
      desc: "Predict pollution before it happens.",
    },
    {
      title: "Water Quality",
      desc: "Real-time water quality monitoring.",
    },
    {
      title: "Smart Alerts",
      desc: "Instant alerts for pollution events.",
    },
  ];

  return (
    <section className="bg-slate-950 py-24 px-6">
      <h2 className="text-5xl font-bold text-center text-white mb-16">
        Why AquaGuard AI?
      </h2>

      <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-slate-900 border border-cyan-500/20 rounded-3xl p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-3">
              {feature.title}
            </h3>

            <p className="text-gray-400">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}