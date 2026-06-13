const NOMINATIM = "https://nominatim.openstreetmap.org";

async function nominatimFetch(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) return null;
  return res.json();
}

async function searchAddresses(query) {
  if (!query || query.trim().length < 3) return [];

  const url =
    `${NOMINATIM}/search?format=json&q=${encodeURIComponent(query.trim())}` +
    "&addressdetails=1&limit=6";

  const data = await nominatimFetch(url);
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    address: item.display_name,
    placeId: item.place_id
  }));
}

async function reverseGeocode(lat, lng) {
  const url =
    `${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

  const data = await nominatimFetch(url);
  if (!data) return null;

  return {
    lat,
    lng,
    address:
      data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  };
}

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

window.PlaceGeocoding = { searchAddresses, reverseGeocode, debounce };
