import { motion } from "framer-motion";
import AnimatedBackground from "./AnimatedBackground";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-950">
        <AnimatedBackground />
      {/* Glowing Background */}
      <div className="absolute w-96 h-96 bg-cyan-500 rounded-full blur-[140px] opacity-20 top-10 left-20 animate-pulse"></div>

      <div className="absolute w-96 h-96 bg-blue-600 rounded-full blur-[140px] opacity-20 bottom-10 right-20 animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center z-10 px-5"
      >
        <h1 className="text-6xl md:text-7xl font-extrabold text-white leading-tight">
          Protect Rivers
          <br />
          <span className="text-cyan-400">
            Before Pollution Happens
          </span>
        </h1>

        <p className="text-gray-300 mt-6 text-xl max-w-2xl mx-auto">
          AI Powered River Pollution Prediction,
          Smart Monitoring,
          Real-Time Alerts &
          Environmental Protection.
        </p>

        <div className="mt-10 flex justify-center gap-5 flex-wrap">

         <motion.button
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.95 }}
className="px-8 py-4 rounded-xl bg-cyan-500 text-black font-bold"
>
Explore Dashboard
</motion.button>

       <motion.button
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.95 }}
className="px-8 py-4 rounded-xl border border-cyan-500 text-white"
>
Live Demo
</motion.button>

        </div>
      </motion.div>

    </section>
  );
}