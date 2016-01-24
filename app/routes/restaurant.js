var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Location = require('../models/location');
var moment = require('moment');
var factualService = require('../services/factual');
var Q = require("q");

var jsonParser = bodyParser.json()

var readAndSaveLocation = function(req) {
  var text = req.text.toString();
  var locationArray = text.split('\n');

  var setId = new Date().getTime();

  for (var i = 0; i < locationArray.length; i++) {
    try { 
      parsedData = JSON.parse(locationArray[i]);  
    } catch (e) {
      console.log('not valid json: ' + locationArray[i]);
    }
    parsedData['setId'] = setId;
    loc = new Location(parsedData);
    loc.save(function(err, loc) {
      console.log('SAVED');
      if (err) return console.error(err);
      console.log(loc);
    });
   }
   return setId;
}


/* GET users listing. */
router.post('/simple', function(req, res, next) {
  var setId = readAndSaveLocation(req);
  factualService.simpleAtRestaurant(setId).then(function (result){
    console.log('final result:' + result);

    var returnJson = {};
    if (result == null) {
      returnJson['result'] = 0;
      returnJson['data'] = 'No restaurant was found.';
    } else {
      returnJson['result'] = 1;
      returnJson['data']['name'] = result.name;
      returnJson['data']['address'] = result.address;
      returnJson['data']['postcode'] = result.postcode;
    } 
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(returnJson));
   });
    

});

/* GET users listing. */
router.post('/advanced', function(req, res, next) {
var setId = readAndSaveLocation(req);
  factualService.advancedAtRestaurant(setId).then(function (result){
    console.log('final result:' + result);

    var returnJson = {};  
    if (result == null) {
      returnJson['result'] = 0;
      returnJson['data'] = 'No restaurant was found.';
    } else {
      returnJson['result'] = 1;
      returnJson['data']['name'] = result.name;
      returnJson['data']['address'] = result.address;
      returnJson['data']['postcode'] = result.postcode;
    }
    
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(returnJson));
   })
   .catch(function (error) {
    console.log('error');
    res.end(JSON.stringify(error));
   });
    

});

module.exports = router;