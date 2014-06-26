'use strict';

var fs = require('fs');

var primus
  , locations = {};

var self = module.exports = {
  init: function(primustocache) {
    primus = primustocache;
  },

  sendAllLocations: function(id) {
    var message = {
      action: 'alllocations',
      data: { locations: locations }
    };

    primus.connections[id].write(message);
  },

  updateLocation: function(id, data) {
    locations[id] = data;

    var message = {
      action: 'updatelocation',
      data: data
    };
    message.data.id = id;

    primus.forEach(function(spark, next) {
      if (spark.id !== id) {
        spark.write(message);
        next();
      } else {
        next();
      }
    }, function(err) {
      if (err) console.error('Primus error - ' + err);
    });
  },

  deleteLocation: function(id) {
    delete locations[id];

    var message = {
      action: 'deletelocation',
      data: { id: id }
    };

    primus.write(message);
  },

  getTile: function(req, res) {
    var tilefile = __dirname + '/../public/tiles/' + req.params.z + '/' + req.params.x + '/' + req.params.y; 
    fs.exists(tilefile, function(exists) {
      if (exists) {
        var readstream = fs.createReadStream(tilefile);
        readstream.pipe(res);
      } else {
        res.end('not on fs');



      }
    });
  }
};

  
