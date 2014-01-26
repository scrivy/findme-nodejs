var map = L.map('map').setView([38.55, -121.74], 13);

//L.tileLayer('http://{s}.tile.cloudmade.com/e1d37bab0aaf4f67b0af332838f24a73/997/256/{z}/{x}/{y}.png', {
//  attribution: 'Map data',
//  maxZoom: 18
//}).addTo(map);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: 'Find Me!',
}).addTo(map);

map.locate({setView: true, maxZoom: 18});

var mymarker = L.marker([0, 0], {
  icon: L.icon({
    iconUrl: 'js/lib/images/mymarker.png'
  }),
  alt: "Me!"
}).addTo(map);

var everyone = [];

var socket = io.connect('');

socket.on('everyones locations', function(locations) {
  delete locations[this.socket.sessionid];

  var i
    , ids = Object.keys(locations);

  for (i=0; i<ids.length; i++) {
    if (!everyone[i]) {
      everyone[i] = L.marker(locations[ids[i]]).addTo(map);
    } else {
      everyone[i].setLatLng(locations[ids[i]]);
    }
  }

  console.log(locations);
});

if (navigator.geolocation) {
  var geo_options = {
    enableHighAccuracy: true
  };

  function geo_success(position) {
    console.log('got a fix');

    var latlng = [position.coords.latitude, position.coords.longitude];

    mymarker.setLatLng(latlng);
    socket.emit('location update', { latlng: latlng });
  }

  function geo_error() {
    console.log('geolocation error');
  }

  navigator.geolocation.watchPosition(geo_success, geo_error, geo_options);
}