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

const previewIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const sharedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (err) {
    return value;
  }
}

const PlaceLocater = {
  markers: null,
  previewMarker: null,
  sharedMarker: null,
  selectedLocation: null,

  init() {
    this.map = L.map("map").setView([28.582062, 77.310905], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.markers = L.layerGroup().addTo(this.map);

    this.map.on("click", e => this.onMapClick(e));

    this.loadSharedLocationFromUrl();
    this.getAllPlaces();
  },

  onMapClick(e) {
    const { lat, lng } = e.latlng;

    if (window.PlaceGeocoding) {
      PlaceGeocoding.reverseGeocode(lat, lng).then(loc => {
        this.setSelectedLocation(
          loc || {
            lat,
            lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          }
        );
      });
      return;
    }

    this.setSelectedLocation({
      lat,
      lng,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    });
  },

  setSelectedLocation(loc) {
    this.selectedLocation = loc;
    this.placePreviewMarker(loc.lat, loc.lng, loc.address);
    this.map.setView([loc.lat, loc.lng], Math.max(this.map.getZoom(), 15));

    document.dispatchEvent(
      new CustomEvent("location-selected", { detail: loc })
    );
  },

  placePreviewMarker(lat, lng, address) {
    if (this.previewMarker) {
      this.map.removeLayer(this.previewMarker);
    }

    this.previewMarker = L.marker([lat, lng], {
      icon: previewIcon,
      draggable: true
    })
      .bindPopup(`<strong>Selected pin</strong><br>${address}`)
      .addTo(this.map)
      .openPopup();

    this.previewMarker.on("dragend", e => {
      const pos = e.target.getLatLng();
      PlaceGeocoding.reverseGeocode(pos.lat, pos.lng).then(loc => {
        this.setSelectedLocation(
          loc || {
            lat: pos.lat,
            lng: pos.lng,
            address: `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`
          }
        );
      });
    });
  },

  addMarkers(stores) {
    this.markers.clearLayers();
    stores.forEach(place => {
      const [lng, lat] = place.location.coordinates;
      L.marker([lat, lng])
        .bindPopup(
          `<strong>${place.storeId}</strong><br>${place.location.formattedAddress || ""}`
        )
        .addTo(this.markers);
    });
  },

  async getAllPlaces() {
    try {
      const res = await fetch("/api/v1/stores");
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length) {
          this.addMarkers(data.data);
          return;
        }
      }
    } catch (err) {
      // Static preview has no backend — fall back to demo pins below.
    }
    this.addMarkers(DEMO_STORES);
  },

  loadSharedLocationFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get("lat"));
    const lng = parseFloat(params.get("lng"));

    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    const address =
      params.get("address") ||
      params.get("label") ||
      "Shared location";
    const placeId = params.get("place") || params.get("id") || "";
    const decodedAddress = safeDecode(address);

    this.map.setView([lat, lng], 16);

    if (this.sharedMarker) {
      this.map.removeLayer(this.sharedMarker);
    }

    const title = placeId || "Shared location";
    this.sharedMarker = L.marker([lat, lng], { icon: sharedIcon })
      .bindPopup(
        `<strong>${title}</strong><br>${decodedAddress}` +
          `<br><a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" rel="noopener">Open in Google Maps</a>`
      )
      .addTo(this.map)
      .openPopup();

    this.showSharedBanner(decodedAddress, placeId, lat, lng);

    document.dispatchEvent(
      new CustomEvent("shared-location-loaded", {
        detail: { lat, lng, address: decodedAddress, placeId }
      })
    );
  },

  showSharedBanner(address, placeId, lat, lng) {
    const banner = document.getElementById("shared-location-banner");
    const text = document.getElementById("shared-banner-text");
    const mapsLink = document.getElementById("open-maps-link");

    if (!banner || !text) return;

    const label = placeId ? `${placeId} — ${address}` : address;
    text.textContent = `Shared location: ${label}`;
    banner.classList.remove("d-none");

    if (mapsLink) {
      mapsLink.href = `https://www.google.com/maps?q=${lat},${lng}`;
    }

    document.title = placeId
      ? `${placeId} | Place Locater`
      : "Shared Location | Place Locater";
  },

  buildShareUrl(loc, placeId) {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("lat", loc.lat.toFixed(6));
    url.searchParams.set("lng", loc.lng.toFixed(6));
    if (placeId) url.searchParams.set("place", placeId);
    if (loc.address) url.searchParams.set("address", loc.address);
    return url.toString();
  },

  getSelectedLocation() {
    return this.selectedLocation;
  }
};

window.PlaceLocater = PlaceLocater;
PlaceLocater.init();
