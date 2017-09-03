var path = require('path');
var esclient = require(path.join(__dirname,'..','..','bin','elasticClient'));
var MongoClient = require('mongodb').MongoClient
var config = require(path.join(__dirname,'..','..','bin','config'));

var deleteIndex = function(indexName) {
    return new Promise(function(resolve,reject){
      esclient.getEsClient().indices.delete({
          index: indexName
      },function(err,existsData){
        console.log(err,existsData);
          if(err != undefined){
            reject(err);
          }
          else{
            console.log("---------------------------\n","delete index with name ",indexName,"\n---------------------------\n",existsData);
            resolve(true)
          }
      });
    })
}

var initIndex = function(indexName) {
  return new Promise(function(resolve,reject){
    esclient.getEsClient().indices.create({
        index: indexName
    },function(err,info){
        if(err != undefined){
          reject(err);
        }
        else{
          console.log("created index ",indexName);
          resolve(true)
        }
    });
  })
}

var indexExists = function(indexName)  {
  return new Promise(function(resolve,reject){
    esclient.getEsClient().indices.exists({
        index: indexName
    },function(err,exists){
        if(err != undefined){
          reject(err);
        }
        else{
          resolve(exists)
        }
    });
  })
}

var deleteIfExists = function(indexName){
    return new Promise(function(resolve,reject){
        indexExists(indexName)
        .then(function(exists){
          if(exists){
            console.log("---------------------------\n","Found Index ",indexName,"\n---------------------------\n");
            return deleteIndex(indexName);
          }
          else{
            resolve("true")
          }
        })
        .then(function(deleteRes){
          resolve(true)
        })
        .catch(function(err){
          reject(err);
        })
    })
}

exports.indexExists = indexExists;
exports.deleteIndex = deleteIndex;
exports.initIndex = initIndex;
exports.deleteIfExists = deleteIfExists


// initIndex('movies')
// .then(function(data){
//     console.log(data);
// })
// .catch(function(err){
//   console.log(err);
// })

// deleteIfExists('movies')
// .then(function(data){
//     console.log(data);
// })
// .catch(function(err){
//   console.log(err);
// })
