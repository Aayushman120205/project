import { useState } from "react";
import LeafletMap from "./LeafletMap";

const MapWrapper = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-row justify-center items-center gap-2 p-6 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      {/* Card for input form */}
      <div className="w-full max-w-lg bg-[#1e293b] rounded-2xl shadow-lg p-6 border border-blue-900/40">
        <h2 className="text-xl font-semibold mb-4 text-blue-200">
          🚗 Plan Your Route
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter start location"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
            className="w-full px-4 py-2 bg-[#0f172a] border border-blue-800/60 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Enter end location"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
            className="w-full px-4 py-2 bg-[#0f172a] border border-blue-800/60 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Show Route
          </button>
        </form>
      </div>

      {/* Map container */}
      {submitted && (
        <div className="w-full max-w-5xl rounded-xl overflow-hidden border border-blue-900/40 shadow-lg">
          <LeafletMap start={start} end={end} />
        </div>
      )}
    </div>
  );
};

export default MapWrapper;