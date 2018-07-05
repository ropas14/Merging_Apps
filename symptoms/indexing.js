const MongoClient = require('mongodb').MongoClient;
//const url = "mongodb://localhost:27017/";
const url = "mongodb://ropafadzo1993:pass1234@ds231360.mlab.com:31360/scrapesites";

MongoClient.connect(url, function(err, db) {
      if (err) {isfound=false; return;};
      var dbo = db.db("scrapesites"); // local db= webmd
      dbo.collection("modSymptoms").createIndex( { sy: 1}, { collation: { locale: 'en', strength: 2 } } );
     });
   