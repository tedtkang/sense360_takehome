var secret = require('../../config/secret.js')
var Factual = require('factual-api');
var Location = require('../models/location');
var Restaurant = require('../models/restaurant')
var Q = require("q");
var async = require("async");

var factualService = function() {
  var factual = new Factual(secret.FACTUAL_OAUTH_KEY, secret.FACTUAL_OAUTH_SECRET);


  var testFunction = function() {
    factual.get('/t/places/facets', {q:"starbucks", filters:{"region":"CA"}, select:"locality", "min_count":20, limit:5}, function (error, res) {
      console.log(res.data);
    });  
  }

  var resultHash = {}

  // makes the call to factual with a location and dedups
  var factualCall = function(location, callback) {
    factual.get('/t/restaurants-us', 
      {geo:{"$circle":{"$center":[location.latitude,location.longitude],"$meters":location.accuracy}}}, 
      function (error, res) {
        if (error) {
          callback(error);
        }

        // There's duplicates in the results...
        var dedupArray = [];
        var uniqArray = [];
        for (var i = 0; i < res.data.length; i++) {
          if (!uniqArray[res.data[i].address]) {
            dedupArray.push(res.data[i]);
            uniqArray[res.data[i].address] = true;
          }
        }

        for (var i = 0; i < dedupArray.length; i++) {
          if (resultHash[dedupArray[i].address]) {
            resultHash[dedupArray[i].address].distance.push(dedupArray[i]['$distance']);
          } else {
            resultHash[dedupArray[i].address] = dedupArray[i];
            resultHash[dedupArray[i].address].distance = [dedupArray[i]['$distance']];
          }              
        }

        callback();
      });
  };

  var collectAndProcess = function(locations, postProcess) {
      var deferred = Q.defer();
      async.each(locations, factualCall, function(error) {
          if (error) return console.error(error);
          result = postProcess();
          deferred.resolve(result);
      });
      return deferred.promise;
  }

  var simpleAtRestaurant = function(setId) {
    var deferred = Q.defer();
    Location.find({setId: setId }, function (err, locations) {
      if (err) return console.error(err);
      //for (var i = 0; i < locations.length; i++) {

      var simplePostProcess = function() {
        console.log('post processing!');
        console.log(resultHash);

        var keys = Object.keys(resultHash);
        var restaurants = keys.map(function(k) { return resultHash[k]; });
        //Return restaurant with the most hits
        //If it was hit on each coordinate, return it else say not there.
        var returnIndex = 0;
        restaurants.reduce(function(prev, cur, index) {
          if (cur.distance.count > prev) {
            returnIndex = index;
            return cur.distance.count
          } else {
            return prev;
          }
        }, 0);
        if (restaurants[returnIndex].distance.count == locations.count) {
          return restaurants[returnIndex];  
        } else {
          return null;
        }
        
      };
      collectAndProcess(locations, simplePostProcess).then(function(result) {
        deferred.resolve(result);
      });
    });
    return deferred.promise;    
  }

  var advancedAtRestaurant = function(setId) {
    var deferred = Q.defer();
    Location.find({setId: setId }, function (err, locations) {
      if (err) return console.error(err);
      //for (var i = 0; i < locations.length; i++) {

      var advancedPostProcess = function() {
        console.log('post processing!');
        console.log(resultHash);

        var keys = Object.keys(resultHash);
        var restaurants = keys.map(function(k) { return resultHash[k]; });
        //Return restaurant with the most hits
        var returnIndex = 0;
        restaurants.reduce(function(prev, cur, index) {
          if (cur.distance.count > prev) {
            returnIndex = index;
            return cur.distance.count
          } else {
            return prev;
          }
        }, 0);
        return restaurants[returnIndex];
      };
      collectAndProcess(locations, advancedPostProcess).then(function(result) {
        deferred.resolve(result);
      });
    });
    return deferred.promise;    
  }  

  return {
    testFunction: testFunction,
    simpleAtRestaurant: simpleAtRestaurant,
    advancedAtRestaurant: advancedAtRestaurant
  };
}();

module.exports = factualService;