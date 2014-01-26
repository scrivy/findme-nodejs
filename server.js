var express = require('express')
  , redismod = require('redis');

var app = express();
/*  , redis = redismod.createClient();

redis.on('error', function(err) {
  console.log('redis error - ' + err);
}); */

// express setup
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// get/post requests
app.get('/', function(req, res) {
  res.render('index');
});

// serve static files
app.use(express.static(__dirname + '/public'));

// everyones locations
var locations = {};

// listen!
var port = process.env.findmeport || 5000
  , io = require('socket.io').listen(app.listen(port));
console.log('Listening on port ' + port);

io.sockets.on('connection', function(socket) {
  socket.on('send', function(data) {
    io.sockets.emit('locations', data);
  });

  socket.on('disconnect', function() {
    console.log(updatepeople(-1) + ' people connected');

    delete locations[this.id];
  });

  socket.on('location update', function(position) {
    console.log('received location update from ' + this.id);

    locations[this.id] = position.latlng;
    io.sockets.emit('everyones locations', locations);
  });

  var updatepeople = function(offset) {
    if (!offset)
      offset = 0;

    var people = {};
    people.count = Object.keys(io.connected).length + offset;
    io.sockets.emit('people', people);
    return people.count;
  };

  console.log(updatepeople() + ' people connected');
});