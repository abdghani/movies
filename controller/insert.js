var path = require('path');
var async = require("async");
var esclient = require(path.join(__dirname,'..','bin','elasticClient'));
var MongoClient = require('mongodb').MongoClient
var config = require(path.join(__dirname,'..','bin','config'));
var sampleData = require(path.join(__dirname,'..','specs','sample'))
var languageCheck = require(path.join(__dirname,'..','specs','language'))
var mapping = require(path.join(__dirname ,'elastic','mapping'))
var _ = require('lodash');

var getParsedData = function(data){
    // console.log(data.original_language,data.original_title)
    if(languageCheck[data.original_language] == undefined){
        lang = "None";
    }
    else if(data.original_language == ''){
      lang = "None"
    }
    else{
      lang = languageCheck[data.original_language].name;
      if(lang.indexOf(",")>=0){
        lang = lang.split(",")[0]
      }
    }
    if(data.release_date == ''){
      rdate = "2020-12-30" ;
    }
    else{
      rdate = data.release_date;
    }


    var res =  {
      name: data.name || '',
      budget : data.budget,
      genres : data.genres,
      description:data.description,
      popularity : data.popularity,
      production_companies : data.production_companies,
      vote_average:data.vote_average,
    	vote_count : data.vote_count,
      release_date: rdate,
    	revenue : data.revenue,
    	runtime : data.runtime,
      imdb_id:data.imdb_id,
      adult:data.adult,
      language:data.language,
      _id:data._id
    }
    return res;
}

var insertData = function(data){
  return new Promise(function(resolve,reject){
    cnt = 0;
      moviesArray = []
      data.forEach(item => {
        console.log(cnt);
        cnt++;
        var parsed = getParsedData(item);
        moviesArray.push({
          index: {
            _index: config.index,
            _type: parsed.language,
            _id: parsed._id
          }
        })
        delete parsed._id;
        moviesArray.push(parsed);
      })
console.log(moviesArray[1]);
      esclient
      .getEsClient()
      .bulk({ body: moviesArray })
      .then(response => {
        let errorCount = 0;
        response.items.forEach(item => {
          if (item.index && item.index.error) {
            console.log(++errorCount, item.index.error);
          }
        });
        resolve({
          status:"success",
          msg : `Successfully indexed ${data.length - errorCount} out of ${data.length} items`,
        })
      })
      .catch(function(err){

        reject(err)
      });
  })
}

var indexData = function(data,isnew){
  console.log("inserting now");
  if(isnew){

      return new Promise(function(resolve,reject){
        mapping
        .createMapping(config.index)
        .then(function(res){
          console.log("insertig data ....");
          return insertData(data);
        })
        .then(function(response){
          resolve(response)
        })
        .catch(function(err){
          reject(err);
        })
      })
  }
  else{
    return new Promise(function(resolve,reject){
      insertData(data)
      .then(function(response){
        resolve(response)
      })
      .catch(function(err){
        reject(err);
      })
    })
  }
}

var skip = 0;
var limit = 100000;

var getFromDatabase = function(skip,limit,cb){
  MongoClient.connect(config.mongourl, function(err, db) {
    console.log("Connected correctly to server");
    var movies = db.collection('movies');
    movies
    .find()
    .skip(skip)
    .limit(limit)
    .toArray(function(err,data){
        if(err){
          cb(err,null);
        }
        console.log("got all data . length:-",data.length);
        cb(null,data)
    })
  })
}

var putDataFromDatabase = function(done){

    getFromDatabase(0,60000,function(err,data1){
        indexData(data1,false)
        .then(function (res) {
          console.log("done for 60000");
          getFromDatabase(60000,60000,function(err,data2){
              indexData(data2,false)
              .then(function (res) {
                console.log("done for 60000");
                getFromDatabase(120000,60000,function(err,data3){
                    indexData(data3,false)
                    .then(function (res) {
                      console.log("done for 120000");
                        getFromDatabase(180000,60000,function(err,data3){
                            indexData(data3,false)
                            .then(function (res) {
                              console.log("done for 180000");
                                getFromDatabase(240000,60000,function(err,data3){
                                    indexData(data3,false)
                                    .then(function (res) {
                                      console.log("done for 240000");
                                        getFromDatabase(300000,60000,function(err,data3){
                                            indexData(data3,false)
                                            .then(function (res) {
                                              console.log("done for 300000");
                                              
                                            })
                                            .catch(function(err){
                                              console.log(err);
                                            })
                                        })
                                    })
                                    .catch(function(err){
                                      console.log(err);
                                    })
                                })
                            })
                            .catch(function(err){
                              console.log(err);
                            })
                        })
                    })
                    .catch(function(err){
                      console.log(err);
                    })
                })
              })
              .catch(function(err){
                console.log(err);
              })
          })
        })
        .catch(function(err){
          console.log(err);
        })
    })

     // MongoClient.connect(config.mongourl, function(err, db) {
     //    console.log("Connected correctly to server");
     //    var movies = db.collection('moviesnew');
     //    var moviesfinal = db.collection('moviesnewfinal');
     //    var cnt = 0;
     //    movies.find().toArray(function(err,data){
     //        console.log("got all data",data.length);
     //        async.eachLimit(data,10000,function(item,cb){
     //              // moviesfinal.insert(getParsedData(item),function(err,insertRes){
     //              //   console.log("inserted",cnt);
     //              //   cnt++;
     //              //   cb()
     //              // })
     //              // console.log([item],item.length);
     //              indexData([item],false)
     //              .then(function(res){
     //                console.log("done");
     //                 console.log("inserted",cnt);
     //                cnt++;
     //                cb();
     //              })

     //            },function(){
     //              console.log("all done");
     //              done();
     //              delete item;
     //            })
     //        })
     //    })

}

// var insert = function(req,res,next){
//   MongoClient.connect(config.mongourl, function(err, db) {
//     console.log("Connected correctly to server");
//
//
//
//
//     db.close();
//     res.send();
//     next();
//   });
// }

exports.insertData = insertData;


// indexData([sampleData])
// .then(function (res) {
//     console.log(res);
// });

putDataFromDatabase(function (res) {
    console.log(res);
});
