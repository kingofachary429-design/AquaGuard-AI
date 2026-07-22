import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

export default function CitizenReport() {
  const [riverName, setRiverName] = useState("");
  const [pollutionType, setPollutionType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);

  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const detectLocation = () => {
    setError("");
    setDetectingLocation(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoordinates({
          latitude,
          longitude,
        });

        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setDetectingLocation(false);
      },
      () => {
        setError(
          "Location detect avvaledu. Browser location permission allow cheyyandi."
        );
        setDetectingLocation(false);
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!auth.currentUser) {
      setError("Report submit cheyyadaniki login avvali.");
      return;
    }

    if (!riverName.trim() || !pollutionType || !description.trim()) {
      setError("Required fields anni fill cheyyandi.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "pollutionReports"), {
        riverName: riverName.trim(),
        pollutionType,
        description: description.trim(),
        location: location.trim(),
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,

        reportedBy: auth.currentUser.uid,
        reporterEmail: auth.currentUser.email,

        status: "Pending",
        riskLevel: "Under Review",
        createdAt: serverTimestamp(),
      });

      setMessage("Pollution report successfully submitted!");

      setRiverName("");
      setPollutionType("");
      setDescription("");
      setLocation("");
      setCoordinates(null);
    } catch (submitError) {
      console.error("Report submission failed:", submitError);
      setError("Report submit avvaledu. Firestore settings check cheyyandi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
          Citizen Monitoring
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Report River Pollution
        </h2>

        <p className="mt-2 text-slate-400">
          Pollution incident details submit cheyyandi. Report Firestore database
          lo save avutundi.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            River Name
          </label>

          <input
            type="text"
            value={riverName}
            onChange={(event) => setRiverName(event.target.value)}
            placeholder="Example: Krishna River"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Pollution Type
          </label>

          <select
            value={pollutionType}
            onChange={(event) => setPollutionType(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-500"
          >
            <option value="">Select pollution type</option>
            <option value="Plastic Waste">Plastic Waste</option>
            <option value="Chemical Waste">Chemical Waste</option>
            <option value="Sewage">Sewage</option>
            <option value="Oil Spill">Oil Spill</option>
            <option value="Dead Fish">Dead Fish</option>
            <option value="Industrial Discharge">
              Industrial Discharge
            </option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Pollution situation gurinchi clear details rayandi..."
            rows={5}
            required
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Location
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Enter area or detect current location"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-500"
            />

            <button
              type="button"
              onClick={detectLocation}
              disabled={detectingLocation}
              className="rounded-lg border border-cyan-500 px-5 py-3 font-semibold text-cyan-400 transition hover:bg-cyan-500 hover:text-slate-950 disabled:opacity-60"
            >
              {detectingLocation ? "Detecting..." : "Detect Location"}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting Report..." : "Submit Pollution Report"}
          </button>
        </div>
      </form>
    </section>
  );
}