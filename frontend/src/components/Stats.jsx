export default function Stats() {
  const stats = [
    { title: "Rivers", value: "120+" },
    { title: "Industries", value: "450+" },
    { title: "AI Predictions", value: "5000+" },
    { title: "Alerts", value: "850+" },
  ];

  return (
    <section className="bg-slate-950 py-20">
      <h2 className="text-center text-5xl font-bold text-white mb-12">
        Live Statistics
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-slate-900 p-8 rounded-2xl border border-cyan-500/20 text-center hover:scale-105 transition"
          >
            <h3 className="text-4xl font-bold text-cyan-400">
              {item.value}
            </h3>
            <p className="text-gray-300 mt-3">{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}