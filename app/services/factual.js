var secret = require('../../config/secret.js')
var Factual = require('factual-api');

var factualService = function() {
  var factual = new Factual(secret.FACTUAL_OAUTH_KEY, secret.FACTUAL_OAUTH_SECRET);


  var testFunction = function() {
    factual.get('/t/places/facets', {q:"starbucks", filters:{"region":"CA"}, select:"locality", "min_count":20, limit:5}, function (error, res) {
      console.log(res.data);
    });  
  }
  
  return {
    testFunction: testFunction
  };
}();

module.exports = factualService;