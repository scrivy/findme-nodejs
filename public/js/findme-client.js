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
    iconUrl: 'js/lib/images/mymarker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 40]
  }),
  alt: "Me!"
}).addTo(map);

var everyone = {};

var primus = new Primus();

primus.on('data', function(message) {
  console.log(message);

  switch(message.action) {
    case 'alllocations':
      var locations = message.data;
      delete locations[this.socket.id];

      var i
        , ids = Object.keys(locations);

      for (i=0; i<ids.length; i++) {
        if (!everyone.hasOwnProperty(ids[i])) {
          everyone[ids[i]] = L.marker(locations[ids[i]]).addTo(map);
        } else {
          everyone[ids[i]].setLatLng(locations[ids[i]]);
        }
      }

      var j;
      for (j=i; j<everyone.length; j++) {
        map.removeLayer(everyone[i]);
        everyone.splice(i,1);
      } 

      break;

  }


});

/*
socket.on('everyones locations', function(locations) {
  delete locations[this.socket.sessionid];

});

socket.on('location update', function(location) {
  if (location.id != this.socket.sessionid) {
    if (everyone[location.id]) {
      everyone[location.id].setLatLng(location.position);
    } else {
      everyone[location.id] = L.marker(location.position).addTo(map);
    }
  }
});

socket.on('delete location', function(locationid) {
  map.removeLayer(everyone[locationid]);
  delete everyone[locationid];
});
*/

if (navigator.geolocation) {
  var geo_options = {
    enableHighAccuracy: true
  };

  function geo_success(position) {
    console.log('got a fix');

    var latlng = [position.coords.latitude, position.coords.longitude];

    mymarker.setLatLng(latlng);
//    socket.emit('update my location', { latlng: latlng });
  }

  function geo_error() {
    console.log('geolocation error');
  }

  navigator.geolocation.watchPosition(geo_success, geo_error, geo_options);
}
