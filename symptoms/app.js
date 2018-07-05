const express =require('express');
const morgan =require('morgan');
const bodyParser =require('body-parser');
const cookieParser= require('cookie-parser');
const session= require('express-session');
const levenshtein = require('fast-levenshtein');
const symptData = require("./data/webmdSymptoms.json");

const app =express();
// Middlewares
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
 var initarr=[];
 var incdsarr=[];
  var reslts= symptData[0].symtoms;
            reslts.forEach(function(item){
            	var symptoms=[];
            	var item1=item;
             if(item1.startsWith(sympt)){
             	var startsobj={};
             	startsobj.sy=item;
              symptoms.push(item);      
              initarr.push(startsobj);
             }
             else if(item1.includes(sympt)){
             	var includesobj = {};
             	var num=0;
             	for(var i=0 ; i<symptoms.length ; i++){
                 if(item==symptoms[i]){
                      num++;
                   }
             	}
             if(num==0){
              includesobj.sy=item;
              incdsarr.push(includesobj);
             }	
           }
            else{}
            });       
           res.jsonp(initarr.concat(incdsarr));
          
      });

module.exports=app;