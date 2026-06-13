const placeForm = document.getElementById("place-form");
const placeIdInput = document.getElementById("place-id");
const placeAddressInput = document.getElementById("place-address");
const suggestionsBox = document.getElementById("address-suggestions");
const coordsDisplay = document.getElementById("coords-display");
const shareBtn = document.getElementById("share-location-btn");
const myLocationBtn = document.getElementById("my-location-btn");
const toast = document.getElementById("app-toast");

let currentLocation = null;

function showToast(message, isError) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle("toast-error", !!isError);
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function updateCoordsDisplay(loc) {
  if (!coordsDisplay) return;
  if (!loc) {
    coordsDisplay.textContent = "No pin selected — search an address or tap the map";
    return;
  }
  coordsDisplay.textContent = `${loc.address} (${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)})`;
}

function setCurrentLocation(loc) {
  currentLocation = loc;
  placeAddressInput.value = loc.address;
  updateCoordsDisplay(loc);
}

function hideSuggestions() {
  if (suggestionsBox) {
    suggestionsBox.innerHTML = "";
    suggestionsBox.classList.remove("show");
  }
}

function showSuggestions(results) {
  if (!suggestionsBox) return;
  suggestionsBox.innerHTML = "";

  if (!results.length) {
    suggestionsBox.classList.remove("show");
    return;
  }

  results.forEach(result => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "suggestion-item";
    item.textContent = result.address;
    item.addEventListener("click", () => {
      hideSuggestions();
      setCurrentLocation(result);
      if (window.PlaceLocater) {
        PlaceLocater.setSelectedLocation(result);
      }
    });
    suggestionsBox.appendChild(item);
  });

  suggestionsBox.classList.add("show");
}

const runSearch = PlaceGeocoding.debounce(async query => {
  try {
    const results = await PlaceGeocoding.searchAddresses(query);
    showSuggestions(results);
  } catch (err) {
    hideSuggestions();
  }
}, 350);

placeAddressInput.addEventListener("input", e => {
  currentLocation = null;
  updateCoordsDisplay(null);
  runSearch(e.target.value);
});

placeAddressInput.addEventListener("focus", () => {
  if (placeAddressInput.value.trim().length >= 3) {
    runSearch(placeAddressInput.value);
  }
});

document.addEventListener("click", e => {
  if (
    suggestionsBox &&
    !suggestionsBox.contains(e.target) &&
    e.target !== placeAddressInput
  ) {
    hideSuggestions();
  }
});

document.addEventListener("location-selected", e => {
  setCurrentLocation(e.detail);
});

document.addEventListener("shared-location-loaded", e => {
  const { lat, lng, address, placeId } = e.detail;
  setCurrentLocation({ lat, lng, address });
  if (placeId && !placeIdInput.value) {
    placeIdInput.value = placeId;
  }
});

async function addPlace(e) {
  e.preventDefault();

  if (!currentLocation) {
    showToast("Pick a location first — search an address or tap the map.", true);
    return;
  }

  const data = {
    storeId: placeIdInput.value.trim(),
    address: currentLocation.address,
    latitude: currentLocation.lat,
    longitude: currentLocation.lng
  };

  try {
    const res = await fetch("/api/v1/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.status === 400) {
      throw Error("Try with another Place Id!");
    }
    if (!res.ok) {
      throw Error("Server unavailable. Run locally with: npm run demo");
    }

    showToast("Place added!");
    setTimeout(() => window.location.reload(), 900);
  } catch (error) {
    showToast(
      error.message ||
        "Cannot add places in static preview. Run the server with: npm run demo",
      true
    );
  }
}

async function shareLocation() {
  const loc =
    currentLocation ||
    (window.PlaceLocater && PlaceLocater.getSelectedLocation());

  if (!loc) {
    showToast("Select a location on the map before sharing.", true);
    return;
  }

  const placeId = placeIdInput.value.trim();
  const shareUrl = PlaceLocater.buildShareUrl(loc, placeId);
  const shareText = placeId
    ? `📍 ${placeId}\n${loc.address}\n${shareUrl}`
    : `📍 ${loc.address}\n${shareUrl}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: placeId || "Shared location",
        text: shareText,
        url: shareUrl
      });
      showToast("Location shared!");
      return;
    } catch (err) {
      if (err.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    showToast("Link copied — paste in WhatsApp or any chat!");
  } catch (err) {
    prompt("Copy this link to share:", shareUrl);
  }
}

function useMyLocation() {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported in this browser.", true);
    return;
  }

  myLocationBtn.disabled = true;
  myLocationBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Locating...';

  navigator.geolocation.getCurrentPosition(
    async pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const loc = await PlaceGeocoding.reverseGeocode(lat, lng);
      const location = loc || {
        lat,
        lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };

      setCurrentLocation(location);
      PlaceLocater.setSelectedLocation(location);
      showToast("Your current location is pinned on the map.");

      myLocationBtn.disabled = false;
      myLocationBtn.innerHTML =
        '<i class="fas fa-crosshairs"></i> Use my location';
    },
    () => {
      showToast("Could not get your location. Check browser permissions.", true);
      myLocationBtn.disabled = false;
      myLocationBtn.innerHTML =
        '<i class="fas fa-crosshairs"></i> Use my location';
    },
    { enableHighAccuracy: true, timeout: 12000 }
  );
}

placeForm.addEventListener("submit", addPlace);
shareBtn.addEventListener("click", shareLocation);
myLocationBtn.addEventListener("click", useMyLocation);

updateCoordsDisplay(null);
