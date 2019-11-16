var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/runoob";

var utils = require('../utils');

/* GET users listing. */
router.get('/:date', function(req, res, next) {
  MongoClient.connect(url, { useUnifiedTopology: true })
    .then(function (db) {
      var dbo = db.db("test");
      var queries = [
        // List all people
        dbo.collection("persons").find({}).toArray(),
        // List inventory
        dbo.collection("inventory").find({}).toArray(),
        // List all orders in certain date
        dbo.collection("persons").aggregate([
          {$lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "person",
            as: "orders"
          }},
          {$match: {
            'orders.date': req.params.date
          }}
        ]).toArray()
      ]

      Promise.all(queries)
        .then(function(ress) {
          let [persons, inventory, p_with_o] = ress;

          let persons_orders = persons.map((p) => {
            let poids = p_with_o.map((po) => {return po._id.toString();});
            let poid = poids.indexOf(p._id.toString());
            if (poid >= 0) {
              return p_with_o[poid];
            } else {
              return p;
            }
          });

          let pers = persons_orders.map((p) => {
            p.writable = p.writeIpList.includes(utils.getIp(req));
            delete p._id;
            delete p.ipList;
            delete p.writeIpList;
            if ('orders' in p) {
              let os = p.orders[0].orders;
              let iids = inventory.map((i) => {return i._id.toString();});
              p.orders = os.map((oid) => {return inventory[iids.indexOf(oid.toString())].item;});
              return p;
            } else {
              p.orders = [];
              return p;
            }
          });

          res.json(pers);
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
