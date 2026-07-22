import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        role: "citizen",
        createdAt: new Date(),
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Create Account
        </h1>

        <p className="text-slate-400 mb-6">
          Join AquaGuard AI
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-red-400">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="w-full mb-4 p-3 rounded-lg bg-slate-800 text-white outline-none"
        />

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
          minLength={6}
          required
          className="w-full mb-6 p-3 rounded-lg bg-slate-800 text-white outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold py-3 rounded-lg"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-slate-400 text-center mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}