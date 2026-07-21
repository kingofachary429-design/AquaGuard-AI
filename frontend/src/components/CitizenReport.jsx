import { useState } from "react";

export default function CitizenReport() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");

  function getLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      alert(
        `Latitude: ${position.coords.latitude}
Longitude: ${position.coords.longitude}`
      );
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    alert("Pollution Report Submitted Successfully!");
  }

  return (
    <section className="bg-slate-950 py-20 px-6">
      <div className="max-w-3xl mx-auto bg-slate-900 rounded-3xl p-10">

        <h2 className="text-4xl text-white font-bold mb-8">
          Citizen Pollution Reporting
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="file"
            onChange={(e)=>setImage(e.target.files[0])}
            className="text-white"
          />

          <textarea
            placeholder="Describe what you observed..."
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
            className="w-full h-40 bg-slate-800 rounded-xl p-4 text-white"
          />

          <button
            type="button"
            onClick={getLocation}
            className="bg-blue-600 px-6 py-3 rounded-xl text-white"
          >
            Detect Location
          </button>

          <button
            type="submit"
            className="ml-4 bg-cyan-500 px-6 py-3 rounded-xl text-black font-bold"
          >
            Submit Report
          </button>

        </form>

      </div>
    </section>
  );
}