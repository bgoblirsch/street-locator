// Google objects
var map;
var panorama;
var sv;
var marker;

// initialize answer and guess objects
var answer;
var guess;

// var maxlat = 90;
// var minlat = -90;
// var maxlng = 180;
// var minlng = -180;

var maxlat = 90;
var minlat = -90;
var maxlng = 180;
var minlng = -180;


function initialize() {
  sv = new google.maps.StreetViewService();
  panorama = new google.maps.StreetViewPanorama(
      document.getElementById("pano"), {
        showRoadLabels: false,
      });

  sv.getPanorama({
    location: randomLocation(),
    radius: 5000,
    preference: "best"
  }, processSVData);

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 1,
    streetViewControl: false,
    mapTypeControl: false
  });

  map.addListener("click", function(mapsMouseEvent) {
    if (marker != null) {
      marker.setMap(null);
    }
    marker = new google.maps.Marker({
      position: mapsMouseEvent.latLng,
      map: map
    })
  })


  //map.setStreetView(panorama);
}

function randomLocation() {
  // get two random values [-0.5,0.5]
  var rand1 = Math.random() - 0.5;
  var rand2 = Math.random() - 0.5;

  // scale these values to latitude and longitude
  var randlat = rand1 * 180;
  var randlng = rand1 * 360;

  // For US only
  // var latpct = rand1 + 0.5;
  // var lngpct = rand2 + 0.5;
  // var randlat = latpct * (49 - 29) + 29;
  // var randlng = lngpct * (-72 + 124) - 124;


  var location = { lat: randlat, lng: randlng };
  //var location = {lat: 42.345573, lng: -71.098326};
  //console.log(location.lat + ", " + location.lng)
  return location;
}

function processSVData(data, status) {
  if (status === "OK") {
    setTimeout(() => {
      answer = { lat: panorama.location.latLng.lat(), lng: panorama.location.latLng.lng() };
    }, 500);

    panorama.setPano(data.location.pano);
    panorama.setPov({
      heading: 0,
      pitch: 0
    });
  } else {
    sv.getPanorama({
      location: randomLocation(),
      radius: 5000
    }, processSVData);
  }
}

function submitGuess() {
  // capture the user's guess coords
  guess = { lat: marker.position.lat(), lng: marker.position.lng() };

  // create a marker at the answer
  ansMarker = new google.maps.Marker({
    position: answer,
    map: map
  });

  // draw a line between the guess and answer
  var diffLine = new google.maps.Polyline({
    path: [answer, guess],
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2
  });
  diffLine.setMap(map);

  // zoom to the extent of the line
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(guess);
  bounds.extend(answer);
  map.fitBounds(bounds);

  // console.log the distance
  var ganswer = new google.maps.LatLng(answer);
  var gguess = new google.maps.LatLng(guess);
  var dist = google.maps.geometry.spherical.computeDistanceBetween(ganswer, gguess);
  var distkm = (dist / 1000).toFixed(1);
  console.log("You were " + distkm + " km off!");
}
