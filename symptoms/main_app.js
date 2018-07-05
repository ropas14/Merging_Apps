const express =require('express');
const morgan =require('morgan');
const bodyParser =require('body-parser');
const cookieParser= require('cookie-parser');
const session= require('express-session');
const levenshtein = require('fast-levenshtein');

const MongoClient = require('mongodb').MongoClient;
//const mongourl = "mongodb://localhost:27017/";
const mongourl = "mongodb://ropafadzo1993:pass1234@ds231360.mlab.com:31360/scrapesites";


const app =express();
// Middlewares
app.set('port', process.env.PORT || 3000);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: false
}));
// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content type, Authorization, Accept');
    next();
});

app.get("/",function(req,res){
  res.sendFile(__dirname + '/index.html');
 
});

app.get('/api/symptoms',function(req,res){
 var sympt = req.query.search.toLowerCase().trim();
 console.log(sympt);
 var query= {sy : {$regex : ".*"+sympt+".*"}};
 var initarr=[];
 var incdsarr=[];

  MongoClient.connect(mongourl, function(err, db) {
      if (err) {isfound=false; return;};
      var dbo = db.db("scrapesites"); // local db= webmd
      dbo.collection("modSymptoms").find(query).collation( { locale: 'en', strength: 2 } ).toArray(function(error, reslts) {
          if (error) {throw error;return;}
            console.log(reslts.length);
            reslts.forEach(function(item){
            	var symptoms=[];
            	var item1=item.sy;
             if(item1.startsWith(sympt)){
             	var startsobj={};
              startsobj.rl=item.rl;
             	startsobj.sy=item.sy;
              startsobj.url=item.ur;
              symptoms.push(item.sy);
              initarr.push(startsobj);
             }
             else if(item1.includes(sympt)){
             	var includesobj = {};
             	var num=0;
             	for(var i=0 ; i<symptoms.length ; i++){
                 if(item.sy==symptoms[i]){
                      num++;
                   }
             	}
             if(num==0){
                includesobj.rl=item.rl;
                includesobj.sy=item.sy
                includesobj.url=item.ur
                incdsarr.push(includesobj);

             }	
           }
            else{}
            });       
           res.jsonp(initarr.concat(incdsarr));
          
      });
    })
});


app.listen(app.get('port'));
console.log("server listening on port " + app.get('port'));

module.exports=app;