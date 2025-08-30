import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";

interface Props {
  start: string; // e.g. "Delhi"
  end: string;   // e.g. "Mumbai"
}

const LeafletMap: React.FC<Props> = ({ start, end }) => {
  useEffect(() => {
    const map = L.map("leaflet-map").setView([20.5937, 78.9629], 5); // India center

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Function to geocode an address
    const geocode = async (place: string): Promise<L.LatLng> => {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        place
      )}&key=9c9aa136b5cd4ec783d6591e73591a8e`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        return L.latLng(lat, lng);
      }
      throw new Error("Location not found: " + place);
    };

    Promise.all([geocode(start), geocode(end)])
      .then(([startCoords, endCoords]) => {
        const routingControl = L.Routing.control({
          waypoints: [startCoords, endCoords],
          routeWhileDragging: true,

          // ✅ Custom line color
          lineOptions: {
            styles: [{ color: "red", weight: 5 }],
            extendToWaypoints: false,
            missingRouteTolerance: 0,
          } ,

          createMarker: () => null,
        }).addTo(map);

        map.setView(startCoords, 7);

        // ✅ Apply styles on every new route
        routingControl.on("routesfound", () => {
          const boxes = document.querySelectorAll(
            ".leaflet-routing-container"
          ) as NodeListOf<HTMLElement>;

          boxes.forEach((box) => {
            box.style.background = "rgba(0,0,0,0.8)";
            box.style.color = "white";
            box.style.borderRadius = "8px";
            box.style.padding = "6px 10px";
          });
        });
      })
      .catch((err) => {
        console.error("Geocoding error:", err);
      });

    return () => {
      map.remove();
    };
  }, [start, end]);

  return (
    <div className="w-full">
      <div
        id="leaflet-map"
        className="w-full rounded-lg shadow-lg"
        style={{ height: "400px" }}
      />
    </div>
  );
};

export default LeafletMap;
