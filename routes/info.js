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
        dbo.collection("persons").find({ipList: ip}).toArray()
      ]
      Promise.all(queries)
        .then(function(ress) {
          if (ress[0].length == 0) {
            var user = null;
          } else {
            var user = ress[0][0].name;
          }
          res.json({"ip": ip, "user": user, "deposit": 0});
          db.close();
        })
        .catch(function (err) {
          console.log("Error when querying");
          console.log(err);
          db.close();
        });
    })
    .catch(function (err) {
      console.log("Error when connecting to DB");
      db.close();
    });
});

module.exports = router;
