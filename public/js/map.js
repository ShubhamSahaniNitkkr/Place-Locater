const DEMO_STORES = [
  {
    storeId: "cafe-01",
    location: {
      coordinates: [77.209, 28.6139],
      formattedAddress: "Connaught Place, New Delhi, India"
    }
  },
  {
    storeId: "shop-02",
    location: {
      coordinates: [77.1025, 28.7041],
      formattedAddress: "Karol Bagh, New Delhi, India"
    }
  },
  {
    storeId: "park-03",
    location: {
      coordinates: [77.241, 28.5355],
      formattedAddress: "Nehru Place, New Delhi, India"
    }
  }
];

const map = L.map("map").setView([28.582062, 77.310905], 7);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const markers = L.layerGroup().addTo(map);

function addMarkers(stores) {
  markers.clearLayers();
  stores.forEach(place => {
    const [lng, lat] = place.location.coordinates;
    L.marker([lat, lng])
      .bindPopup(
        `<strong>${place.storeId}</strong><br>${place.location.formattedAddress || ""}`
      )
      .addTo(markers);
  });
}

async function getAllPlaces() {
  try {
    const res = await fetch("/api/v1/stores");
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length) {
        addMarkers(data.data);
        return;
      }
    }
  } catch (err) {
    // Static preview has no backend — fall back to demo pins below.
  }
  addMarkers(DEMO_STORES);
}

getAllPlaces();
