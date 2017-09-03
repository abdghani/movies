var path = require('path');
var esclient = require(path.join(__dirname,'..','..','bin','elasticClient'));
var MongoClient = require('mongodb').MongoClient
var config = require(path.join(__dirname,'..','..','bin','config'));
var utils = require(path.join(__dirname,'utils'));

var getMapping = function(indexName){
    return {
      index:indexName,
      body :{
        "mappings":{
          "genre":{
            "_all":{"enabled":"false"},
            "properties":{
          	"genres":{"type":"string","analyzer": "keyword"},
              "name":{"type":"string","analyzer":"english"},
              "description":{"type":"string","analyzer":"pattern"},
              "language":{"type":"string","analyzer":"english"}
	     }
          }
        }
      }
    }
}

var createMapping = function(indexName){
  return new Promise(function(resolve,reject){
      utils
      .deleteIfExists(indexName)
      .then(function(res){
        esclient
        .getEsClient()
        .indices
        .create(getMapping(indexName))
        .then(function(res){
              resolve(true);
        })
      })
      .catch(function(err){
        reject(err)
      })
    })
}

exports.createMapping = createMapping
createMapping('movies')
.then(function(res){
  console.log(res);
})
.catch(function(err){
  console.log(err);
});
