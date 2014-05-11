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

  findme.sendalllocations(spark.id);

  spark.on('data', function(message) {
    console.log('socket message - ' + message.action);

    if (!message.action || !message.data) {
      console.log('malformed socket message, disregarding');
      return;
    }

    switch(message.action) {
      case 'updatelocation':
        findme.updatelocation(this.id, message.data);
        break;

      default:
        console.log('socket message received, did not match an action');
        break;
    }
    
  });
});

primus.on('disconnection', function(spark) {
  console.log('socket closed');
  findme.deletelocation(spark.id);
});
