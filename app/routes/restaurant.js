var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Location = require('../models/location');
var moment = require('moment');

var jsonParser = bodyParser.json()

/* GET users listing. */
router.post('/', function(req, res, next) {
  /*
  test = new Transaction();
  test.amount = 53.43
  test.date = new Date();
  test.category = 'test category';
  test.description = 'test description';
  test.location = 'test location';
  test.save();
  console.log(test);
  res.json(test);
  */
 console.log("text=" + req.text);

  Location.find(function(err, location) {
    if (err) return res.send(err);
    res.json(location);
  });
});

module.exports = router;