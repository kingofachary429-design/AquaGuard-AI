import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">

      {/* Circle 1 */}
      <motion.div
        animate={{
          y: [0, -60, 0],
          x: [0, 40, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="absolute w-72 h-72 bg-cyan-500 rounded-full blur-[120px] opacity-20 top-10 left-10"
      />

      {/* Circle 2 */}
      <motion.div
        animate={{
          y: [0, 70, 0],
          x: [0, -50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
        className="absolute w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 bottom-20 right-10"
      />

      {/* Circle 3 */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        className="absolute w-64 h-64 bg-cyan-300 rounded-full blur-[100px] opacity-10 top-1/2 left-1/2"
      />

    </div>
  );
}