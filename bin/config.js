var local = {
    port : 9200,
    index : "movies",
    host: "localhost:9200",
    mongourl: "mongodb://localhost:27017/moviz"
}
var global = {
  port : 8505,
  index : "movies",
  host : "search.elastico.xyz",
  mongourl: "mongodb://localhost:27017/moviz"
}

module.exports = local;
