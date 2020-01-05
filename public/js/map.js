mapboxgl.accessToken =
  "pk.eyJ1Ijoic2h1YmhhbXN1bm55IiwiYSI6ImNrNHoxemhnMTA2NnUzZHF1Ymk5YTV3MmoifQ.qXwiLgUIfrjvum6IsTWx3g";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  zoom: 7,
  center: [77.310905, 28.582062]
});

async function getAllPlaces() {
  const res = await fetch("/api/v1/stores");
  const data = await res.json();
  // console.log(data.data);
  const allPlaces = data.data.map(place => {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [
          place.location.coordinates[0],
          place.location.coordinates[1]
        ]
      },
      properties: {
        // storeId: place.location.formattedAddress,
        storeId: place.storeId,
        icon: "town-hall"
      }
    };
  });
  loadMap(allPlaces);
}

function loadMap(allPlaces) {
  map.on("load", function() {
    map.addLayer({
      id: "points",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: allPlaces
        }
      },
      layout: {
        "icon-image": "{icon}-15",
        "icon-size": 1.5,
        "text-field": "[ {storeId} ]",
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-anchor": "top"
      }
    });
  });
}

getAllPlaces();
