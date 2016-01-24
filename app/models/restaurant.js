var mongoose = require('mongoose');

var restaurantSchema = mongoose.Schema({
  name: String,
  address: String,
  longitude: Number,
  latitude: Number,
  postcode: String
});

var restaurantModel = mongoose.model('Restaurant', restaurantSchema);

module.exports = restaurantModel;