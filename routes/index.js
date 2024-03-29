var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/runoob";

var utils = require('../utils');

/* GET home page. */
router.get('/', function(req, res, next) {
  var ip = utils.getIp(req);
  MongoClient.connect(url, { useUnifiedTopology: true })
    .then(function (db) {
      var dbo = db.db("test");
      var queries = [
        dbo.collection("persons").find({}).toArray(),
        dbo.collection("inventory").find({}).toArray(),
        dbo.collection("orders").find({}).toArray()
      ]
      Promise.all(queries)
        .then(function(ress) {
          res.json({"ip": ip, "db": ress});
          db.close();
        })
        .catch(function (err) {
          console.log("Error when querying");
          db.close();
        });
    })
    .catch(function (err) {
      console.log("Error when connecting to DB");
      db.close();
    });
});

module.exports = router;
