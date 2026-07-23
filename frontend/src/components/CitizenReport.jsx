import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import { predictPollutionRisk } from "../utils/predictPollutionRisk";

function getIndustrialActivityScore(activity) {
  if (activity === "High") {
    return 9;
  }

  if (activity === "Medium") {
    return 5;
  }

  return 2;
}

export default function CitizenReport() {
  const [riverName, setRiverName] = useState("");
  const [pollutionType, setPollutionType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);

  const [ph, setPh] = useState("");
  const [turbidity, setTurbidity] = useState("");
  const [dissolvedOxygen, setDissolvedOxygen] =
    useState("");
  const [rainfall, setRainfall] = useState("");
  const [industrialActivity, setIndustrialActivity] =
    useState("Low");

  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] =
    useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const detectLocation = () => {
    setError("");
    setDetectingLocation(true);

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      );
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

        setLocation(
          `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        );

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
      setError(
        "Report submit cheyyadaniki login avvali."
      );
      return;
    }

    if (
      !riverName.trim() ||
      !pollutionType ||
      !description.trim()
    ) {
      setError(
        "River name, pollution type and description fill cheyyandi."
      );
      return;
    }

    if (
      ph === "" ||
      turbidity === "" ||
      dissolvedOxygen === "" ||
      rainfall === ""
    ) {
      setError(
        "Environmental parameters anni enter cheyyandi."
      );
      return;
    }

    const phValue = Number(ph);
    const turbidityValue = Number(turbidity);
    const dissolvedOxygenValue = Number(
      dissolvedOxygen
    );
    const rainfallValue = Number(rainfall);

    if (
      Number.isNaN(phValue) ||
      Number.isNaN(turbidityValue) ||
      Number.isNaN(dissolvedOxygenValue) ||
      Number.isNaN(rainfallValue)
    ) {
      setError(
        "Environmental values valid numbers ga enter cheyyandi."
      );
      return;
    }

    if (phValue < 0 || phValue > 14) {
      setError(
        "pH value 0 nundi 14 madhyalo undali."
      );
      return;
    }

    if (
      turbidityValue < 0 ||
      dissolvedOxygenValue < 0 ||
      rainfallValue < 0
    ) {
      setError(
        "Turbidity, dissolved oxygen and rainfall negative values undakudadhu."
      );
      return;
    }

    const industrialActivityScore =
      getIndustrialActivityScore(industrialActivity);

    const aiResult = predictPollutionRisk({
      ph: phValue,
      turbidity: turbidityValue,
      dissolvedOxygen: dissolvedOxygenValue,
      rainfall: rainfallValue,
      industrialActivity,
    });

    const alertGenerated =
      aiResult.riskScore >= 60 ||
      aiResult.riskLevel === "High" ||
      aiResult.riskLevel === "Critical";

    setLoading(true);

    try {
      await addDoc(
        collection(db, "pollutionReports"),
        {
          riverName: riverName.trim(),
          pollutionType,
          description: description.trim(),
          location: location.trim(),

          latitude:
            coordinates?.latitude ?? null,

          longitude:
            coordinates?.longitude ?? null,

          ph: phValue,
          turbidity: turbidityValue,
          dissolvedOxygen:
            dissolvedOxygenValue,
          rainfall: rainfallValue,

          industrialActivity,
          industrialActivityScore,

          riskScore: aiResult.riskScore,
          riskLevel: aiResult.riskLevel,
          riskMessage: aiResult.riskMessage,

          detectedIssues:
            aiResult.detectedIssues || [],

          recommendations:
            aiResult.recommendations || [],

          reportedBy: auth.currentUser.uid,
          reporterId: auth.currentUser.uid,

          reporterEmail:
            auth.currentUser.email || "",

          status: "Pending",
          notificationStatus: "Unread",
          alertGenerated,

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      setMessage(
        `Pollution report successfully submitted! AI Risk Level: ${aiResult.riskLevel}, Risk Score: ${aiResult.riskScore}/100`
      );

      setRiverName("");
      setPollutionType("");
      setDescription("");
      setLocation("");
      setCoordinates(null);

      setPh("");
      setTurbidity("");
      setDissolvedOxygen("");
      setRainfall("");
      setIndustrialActivity("Low");
    } catch (submitError) {
      console.error(
        "Report submission failed:",
        submitError
      );

      if (
        submitError.code ===
        "permission-denied"
      ) {
        setError(
          "Permission denied. Firestore Rules check cheyyandi."
        );
      } else {
        setError(
          "Report submit avvaledu. Firestore settings check cheyyandi."
        );
      }
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
          Pollution incident details and environmental
          values submit cheyyandi. AquaGuard AI automatic
          ga pollution risk calculate chestundi.
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

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 md:grid-cols-2"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            River Name
          </label>

          <input
            type="text"
            value={riverName}
            onChange={(event) =>
              setRiverName(event.target.value)
            }
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
            onChange={(event) =>
              setPollutionType(event.target.value)
            }
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-500"
          >
            <option value="">
              Select pollution type
            </option>

            <option value="Plastic Waste">
              Plastic Waste
            </option>

            <option value="Chemical Waste">
              Chemical Waste
            </option>

            <option value="Sewage">
              Sewage
            </option>

            <option value="Oil Spill">
              Oil Spill
            </option>

            <option value="Dead Fish">
              Dead Fish
            </option>

            <option value="Industrial Discharge">
              Industrial Discharge
            </option>

            <option value="Other">
              Other
            </option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
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
              onChange={(event) =>
                setLocation(event.target.value)
              }
              placeholder="Enter area or detect current location"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-500"
            />

            <button
              type="button"
              onClick={detectLocation}
              disabled={detectingLocation}
              className="rounded-lg border border-cyan-500 px-5 py-3 font-semibold text-cyan-400 transition hover:bg-cyan-500 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {detectingLocation
                ? "Detecting..."
                : "Detect Location"}
            </button>
          </div>

          {coordinates && (
            <p className="mt-2 text-xs text-green-400">
              Location detected:{" "}
              {coordinates.latitude.toFixed(6)},{" "}
              {coordinates.longitude.toFixed(6)}
            </p>
          )}
        </div>

        <div className="md:col-span-2 mt-4 border-t border-slate-800 pt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">
            AI Water Analysis
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            Environmental Parameters
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Ee values automatic pollution risk
            calculation kosam use avutayi.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            pH Level
          </label>

          <input
            type="number"
            value={ph}
            onChange={(event) =>
              setPh(event.target.value)
            }
            placeholder="Example: 7.2"
            min="0"
            max="14"
            step="0.1"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Turbidity (NTU)
          </label>

          <input
            type="number"
            value={turbidity}
            onChange={(event) =>
              setTurbidity(event.target.value)
            }
            placeholder="Example: 25"
            min="0"
            step="0.1"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Dissolved Oxygen (mg/L)
          </label>

          <input
            type="number"
            value={dissolvedOxygen}
            onChange={(event) =>
              setDissolvedOxygen(
                event.target.value
              )
            }
            placeholder="Example: 6.5"
            min="0"
            step="0.1"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Rainfall (mm)
          </label>

          <input
            type="number"
            value={rainfall}
            onChange={(event) =>
              setRainfall(event.target.value)
            }
            placeholder="Example: 80"
            min="0"
            step="0.1"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Nearby Industrial Activity
          </label>

          <select
            value={industrialActivity}
            onChange={(event) =>
              setIndustrialActivity(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-500"
          >
            <option value="Low">
              Low
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="High">
              High
            </option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Analyzing and Submitting..."
              : "Analyze and Submit Pollution Report"}
          </button>
        </div>
      </form>
    </section>
  );
}