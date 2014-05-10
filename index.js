'use strict';

var express = require('express')
  , Primus = require('primus')
  , http = require('http')
  , findme = require('./lib/findme');

var port = process.env.findmeport || 5000
  , app = express()
  , server = http.createServer(app);

server.listen(port);

var primus = new Primus(server, { transformer: 'engine.io' });
findme.init(primus);

// express setup
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));

// get/post requests
app.get('/', function(req, res) {
  res.render('index');
});

// serve static files
app.use(express.static(__dirname + '/public'));

primus.on('connection', function(spark) {
  console.log('socket opened');

  findme.sendalllocations();

  spark.on('data', function(message) {
    console.log('socket message - ' + message.action);

    if (!message.action || !message.data) {
      console.log('malformed socket message, disregarding');
      return;
    }

    switch(message.action) {
      case 'updatelocation':
        findme.updatelocation(message.data);
        break;

      default:
        console.log('socket message received, did not match an action');
        break;
    }
    
  });
});

primus.on('disconnection', function(spark) {
  console.log('socket closed');
  findme.deletelocation(spark);
});




/*
io.sockets.on('connection', function(socket) {
  io.sockets.emit('everyones locations', locations);
  socket.on('disconnect', function() {
    console.log(updatepeople(-1) + ' people connected');

    delete locations[this.id];
    io.sockets.emit('delete location', this.id);
  });

  socket.on('update my location', function(position) {
    console.log('received location update from ' + this.id);

    locations[this.id] = position.latlng;

    var location = {
      id: this.id,
      position: position.latlng
    };

    io.sockets.emit('location update', location);
  });

});
*/
