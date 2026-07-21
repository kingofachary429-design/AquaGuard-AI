export default function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-cyan-500 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">

        <h1 className="text-2xl font-bold text-cyan-400">
          🌊 AquaGuard AI
        </h1>

        <ul className="flex gap-8 text-white">
          <li className="cursor-pointer hover:text-cyan-400">Home</li>
          <li className="cursor-pointer hover:text-cyan-400">Features</li>
          <li className="cursor-pointer hover:text-cyan-400">Dashboard</li>
          <li className="cursor-pointer hover:text-cyan-400">Contact</li>
        </ul>

        <button className="bg-cyan-500 px-5 py-2 rounded-lg text-black font-semibold hover:bg-cyan-400">
          Get Started
        </button>

      </div>
    </nav>
  );
}