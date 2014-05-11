'use strict';

var primus
  , locations = {};

var self = module.exports = {
  init: function(primustocache) {
    primus = primustocache;
  },

  sendalllocations: function(id) {
    var message = {
      action: 'alllocations',
      data: { locations: locations }
    };

    primus.connections[id].write(message);
  },

  updatelocation: function(id, latlng) {
    locations[id] = latlng;

    var message = {
      action: 'updatelocation',
      data: {
        id: id,
        latlng: latlng
      }
    };

//    primus.write(message);
    primus.forEach(function(spark) {
      if (spark.id !== id) {
        spark.write(message);
      }
    });
  },

  deletelocation: function(id) {
    delete locations[id];

    var message = {
      action: 'deletelocation',
      data: { id: id }
    };

    primus.write(message);
  }
};

  
