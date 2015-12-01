// Setting up mongoDB database using mongoose.
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/datakom');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB connection error:'));
db.once('open', function (callback) {
    console.log("DB connection OK");
});

// Schema used by mongoose to define items stored in db.
var playerSchema = new mongoose.Schema({
  name:  { type: String },
  x: Number,
  y: Number,
  healthPoints: Number,
  inventory: {
      item1: Number, 
      item2: Number, 
      item3: Number, 
      item4: Number, 
      item5: Number 
  } // ID numbers of items.
});

var dbPlayers = mongoose.model('players', playerSchema);

module.exports = dbPlayers;