'use strict';

var primus
  , locations = {};

var self = module.exports = {
  init: function(primustocache) {
    primus = primustocache;
    return;
  },

  sendalllocations: function() {
    var message = {
      action: 'alllocations',
      data: locations
    };

    primus.write(message);
  },

  updatelocation: function(id, latlng) {
    locations[id] = latlng;
  },

  deletelocation: function(id) {
    delete locations[id];
  }
};

  
