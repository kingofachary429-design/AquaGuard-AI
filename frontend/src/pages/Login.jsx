import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome Back
        </h1>

        <p className="text-slate-400 mb-6">
          Login to AquaGuard AI
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-red-400">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full mb-4 p-3 rounded-lg bg-slate-800 text-white outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="w-full mb-6 p-3 rounded-lg bg-slate-800 text-white outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold py-3 rounded-lg"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-slate-400 text-center mt-5">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-cyan-400">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}