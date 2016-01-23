var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Location = require('../models/location');
var moment = require('moment');
var factualService = require('../services/factual');

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

 var text = req.text.toString();
 var locationArray = text.split('\n');

 var setId = new Date().getTime() % 100000000

 for (var i = 0; i < locationArray.length; i++) {
    try { 
      parsedData = JSON.parse(locationArray[i]);
    } catch (e) {
      console.log('not valid json: ' + locationArray[i]);
    }
    parsedData['setId'] = setId;
    loc = new Location(parsedData);
    loc.save(function(err, loc) {
      if (err) return console.error(err);
      console.log(loc);
    });
 }

 factualService.testFunction();


});

module.exports = router;