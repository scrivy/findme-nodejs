'use strict';

var fs = require('fs')
  , http = require('http');

var davis = {
  NW: {
    lat: 38.579189,
    lng: -121.798210
  },
  SE: {
    lat: 38.516627,
    lng: -121.674957
  }
}
var dlurl = 'http://a.tile.thunderforest.com/outdoors/';

var place = davis;

// make arrays of all the tiles to grab
var tilestograb = {}
for (var i=0; i<=18; i++) { // zoom levels
  var thiszoom = {
    NW: {
      lat: lat2tile(place.NW.lat,i),
      lng: long2tile(place.NW.lng,i)
    },
    SE: {
      lat: lat2tile(place.SE.lat,i),
      lng: long2tile(place.SE.lng,i)
    }
  }

  tilestograb[i] = []
  
  do {
    var lng = thiszoom.NW.lng;
    do {
      tilestograb[i].push(lng + '/' + thiszoom.NW.lat);
      lng++;
    } while (lng < thiszoom.SE.lng);
    thiszoom.NW.lat++
  } while (thiszoom.NW.lat < thiszoom.SE.lat);
}

// download and save tiles
var dldir = './public/tiles/';
for (var zoom in tilestograb) {
  fs.exists(dldir + zoom, function(exists) {
    if (!exists) fs.mkdirSync(dldir + zoom);
    downloadtile(tilestograb[zoom],dldir,zoom);
  })
}

function downloadtile(tiles,dldir,zoom) {
  var tile = tiles.pop()
    , xy   = tile.split('/')
  
  fs.exists(dldir + zoom + '/' + xy[0], function(exists) {
    if (!exists) fs.mkdirSync(dldir + zoom + '/' + xy[0])

    var writestream = fs.createWriteStream(dldir + zoom + '/' + xy[0] + '/' + xy[1] + '.png');

    http.get(dlurl + zoom + '/' + xy[0] + '/' + xy[1] + '.png', function(res) {
      res.on('error', console.error);
      console.log('wrote something at ' + Date.now())
      res.pipe(writestream);
    });

    if (tiles.length)
      setTimeout(downloadtile, 1500, tiles, dldir, zoom)
  })
}

function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
