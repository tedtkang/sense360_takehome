var secret = require('../../config/secret.js')
var Factual = require('factual-api');
var Location = require('../models/location');
var Restaurant = require('../models/restaurant')
var Q = require("q");
var async = require("async");

var factualService = function() {
  var factual = new Factual(secret.FACTUAL_OAUTH_KEY, secret.FACTUAL_OAUTH_SECRET);

  var MIN_DISTANCE_HEURISTIC = 10;
  var MIN_HIT_HEURISTIC = .80;

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
          console.log('ERROR:' + JSON.stringify(error));
          callback(error);
        }

        console.log('res: ' + res.data);
        // There's duplicates in the results...
        var dedupArray = [];
        var uniqArray = [];
        for (var i = 0; i < res.data.length; i++) {
          if (!uniqArray[res.data[i].address]) {
            dedupArray.push(res.data[i]);
            uniqArray[res.data[i].address] = true;
          }
        }
        console.log('dedupArray: ' + dedupArray);

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
          if (error) return deferred.reject(error);
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

        // Sort restaurants by average distance to location
        sortedDistanceArray = restaurants.concat();
        restaurants.map(function(ele) {
          var sum = ele.distance.reduce(function(prev, cur) {
            return prev + cur;
          }, 0);
          var average = sum / ele.distance.length;
          ele.average_distance = average;
        });
        sortedDistanceArray.sort(function (a,b) {
          if (a.average_distance > b.average_distance) {
            return 1;
          }else if (a.average_distance < b.average_distance) {
            return -1;
          }else {
            return 0;
          }
        });

        // If the average distance is smaller than our heuristic distance
        // and the number of "hits" is better than our heuristic hit ratio, we return
        // If the distance is too far, we fail.
        for(var i = 0; i < sortedDistanceArray.length; i++) {
          if (sortedDistanceArray[i].average_distance < MIN_DISTANCE_HEURISTIC) {
            var ratio = sortedDistanceArray.distance.count / locations.count;
            if (ratio < MIN_HIT_HEURISTIC) {
              return sortedDistanceArray[i];
            }
          } else {
            return null;
          }
        }
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