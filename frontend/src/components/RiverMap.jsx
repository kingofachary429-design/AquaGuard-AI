import { useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import rivers from "../data/rivers";
import RiverInfo from "./RiverInfo";

export default function RiverMap() {
  const [selectedRiver, setSelectedRiver] = useState(null);

  return (
    <section className="bg-slate-950 py-20 px-6">
      <h2 className="text-5xl text-white text-center font-bold mb-10">
        AI River Monitoring Dashboard
      </h2>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Map */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: "550px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {rivers.map((river) => (
              <Marker
                key={river.id}
                position={river.position}
                eventHandlers={{
                  click: () => setSelectedRiver(river),
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* AI Panel */}
        <RiverInfo river={selectedRiver} />
      </div>
    </section>
  );
}