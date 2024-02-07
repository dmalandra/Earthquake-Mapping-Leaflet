// Set initial baselayer for map
let base = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });

// Set map object
let myMap = L.map("map", {
    center: [
      40.7, -94.5
    ],
    zoom: 2.5
  });

// Add baselayer to map
  base.addTo(myMap);


// Retrieve earthquake data (geoJSON)
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // Create function to match styles for radius and color based on earthquake magnitudes.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: depthColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: quakeRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

   // Match color based on earthquake magnitude (depth).
   function depthColor(depth) {
    return depth > 90 ?
         "#2c0bb0":
      depth > 70 ?
        "#710bb0":
      depth > 50 ?
         "#b00bad":
      depth > 30 ?
         "#b00b68":
      depth > 10 ?
         "#b00b29":
      
        "#0bb09d";
    }
  

  // Match radius with the earthquake magnitude.
  // Correct for earthquakes with magnitude of 0.

  function quakeRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // Add GeoJSON layer to map

  L.geoJson(data, {
    // Create circleMarker

    pointToLayer: function (_feature, coord) {
      return L.circleMarker(coord);
    },
    
    style: styleInfo,

    // Create popups
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "Magnitude: "
        + feature.properties.mag
        + "<br>Depth: "
        + feature.geometry.coordinates[2]
        + "<br>Location: "
        + feature.properties.place
      );
    }
  }).addTo(myMap);

  // Create legend
  let legend = L.control({
    position: "topright"
  });

  // Add to legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    quakeMag = [-10, 10, 30, 50, 70, 90],
    labels =[];

    // Looping through intervals
    for (let i = 0; i < quakeMag.length; i++) {
      div.innerHTML += "<i style='background: " + depthColor(quakeMag[i]) + "'></i> "
        + quakeMag[i] + (quakeMag[i + 1] ? "&ndash;" + quakeMag[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add legend to map
  legend.addTo(myMap);
});
