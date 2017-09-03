var elasticsearch = require("elasticsearch");
var path = require("path");
var config = require(path.join( __dirname ,'config.js'))

var getEsClient = function(){
  return new elasticsearch.Client({
    host : config.host,
    log: 'info'
  });
}

exports.getEsClient = getEsClient;
