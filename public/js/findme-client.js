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
    iconUrl: 'img/mymarker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 40]
  }),
  alt: "Me!"
}).addTo(map)
  , mycircle = L.circle([0, 0], 50, {
    fillOpacity: 0.5
  }).addTo(map);

var everyone = {};

function fadeoutoldmarkers(everyone) {
  var ids = Object.keys(everyone);

  ids.forEach(function(id) {
    var person = everyone[id]
      , opacity = person.circle.options.opacity

    if (opacity > 0) {
      person.circle.setStyle({ opacity: opacity - 0.05});
      person.marker.setOpacity(person.marker.options.opacity - 0.1)
    } else {
      map.removeLayer(person.circle);
      map.removeLayer(person.marker);
      delete everyone[id];
    }
  })
}

setInterval(fadeoutoldmarkers, 15000, everyone);

var primus = new Primus();

primus.on('data', function(message) {
  console.log(message);

  switch(message.action) {
    case 'alllocations':
      var locations = message.data.locations;
      delete locations[this.socket.id];

      var ids = Object.keys(locations);

      for (var i=0; i<ids.length; i++) {
        if (!everyone.hasOwnProperty(ids[i])) {
          everyone[ids[i]] = {
            marker: L.marker(locations[ids[i]].latlng).addTo(map),
            circle: L.circle(locations[ids[i]].latlng, locations[ids[i]].accuracy).addTo(map)
           };
        } else {
          everyone[ids[i]].marker.setLatLng(locations[ids[i]].latlng);
          everyone[ids[i]].circle
            .setLatLng(locations[ids[i]].latlng)
            .setRadius(locations[ids[i]].accuracy)
          ;
        }
      }

      for (var j=i; j<everyone.length; j++) {
        map.removeLayer(everyone[i]);
        everyone.splice(i,1);
      } 

      break;
    case 'updatelocation':
      var location = message.data;
      if (location.id !== this.socket.id) {
        if (everyone[location.id]) {
          everyone[location.id].marker
            .setLatLng(location.latlng)
            .setOpacity(1)
          everyone[location.id].circle
            .setLatLng(location.latlng)
            .setRadius(location.accuracy)
            .setStyle({opacity: 0.5})
          ;
        } else {
          everyone[location.id] = {
            marker: L.marker(location.latlng).addTo(map),
            circle: L.circle(location.latlng, location.accuracy).addTo(map)
          };
        }
      }

      break;
    case 'deletelocation':
      var locationid = message.data.id;
//      map.removeLayer(everyone[locationid].marker);
//      map.removeLayer(everyone[locationid].circle);
//      delete everyone[locationid];
      break;
  }


});

if (navigator.geolocation) {
  var geo_options = {
    enableHighAccuracy: true
  };

  function geo_success(position) {
    console.log('got a fix');

    var data = {
      latlng: [position.coords.latitude, position.coords.longitude],
      accuracy: Math.ceil(position.coords.accuracy)
    };

    mymarker.setLatLng(data.latlng);
    mycircle
      .setLatLng(data.latlng)
      .setRadius(position.coords.accuracy)
    ;
    primus.write({ action: 'updatelocation', data: data});
  }

  function geo_error() {
    console.log('geolocation error');
  }

  navigator.geolocation.watchPosition(geo_success, geo_error, geo_options);
}
