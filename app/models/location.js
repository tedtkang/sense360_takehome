var mongoose = require('mongoose');

var locationSchema = mongoose.Schema({
  longitude: Number,
  latitude: Number,
  accuracy: Number,
  timestamp: Date
});

var locationModel = mongoose.model('Location', locationSchema);

module.exports = locationModel;