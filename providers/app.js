const express =require('express');
const morgan =require('morgan');
const bodyParser =require('body-parser');
const cookieParser= require('cookie-parser');
const session= require('express-session');
var path =require('path');
var SpellChecker = require('simple-spellchecker');
var dictionary = SpellChecker.getDictionarySync("en-US");
//var exhbs=require('express-handlebars');
const MongoClient = require('mongodb').MongoClient;
//const urlll = "mongodb://localhost:27017/";
const urlll ="mongodb://junta:rootjunta123@ds117431.mlab.com:17431/doc_db";
const cleanResults=require('./helper');
const app =express();

// Middlewares
// set morgan to log info about our requests for development use.
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());

/*app.set('views',path.join(__dirname,'views'));
app.engine('handlebars',exhbs({defaultLayout:'main'}));
app.set('view engine','handlebars');*/

// Routes
app.get("/",function(req,res){
	  res.sendFile( __dirname+'/index.html');
 });

app.get('/providers',function(req,res){
   var searchValue =req.query.name;
   if(searchValue){
       searchValue=searchValue.toLowerCase();
   }
  /*var str =searchValue;
   var regxz;
  for (var i = 0; i < str.length; i++) {
    var rr='^'+str.substring(0, i+1)+'.'+str.substring(i+1, str.length)+'$';
    if(regxz){
      regxz+=' '+rr;
    }else{
        regxz=rr;
    }
  }
  //console.log(regxz);
   console.log(searchValue);
  var query=  {$text: { $search: regxz }};*/
	var arrWords=searchValue.split(' ');
	searchValue='';
	arrWords.forEach(function(wrd){
		searchValue+=' '+wrd.trim();/*ensure only single space between words*/
	});
	searchValue=searchValue.trim();/*removing leading spaces*/
	arrWords=searchValue.split(' ');
	var rg=searchValue;
	var rgTxt=searchValue;
	arrWords.forEach(function(wrd){
		var sgtns = dictionary.getSuggestions(wrd,5,7);// array size , edit distance 7
		rg+='|'+wrd
		rgTxt+=' [a z]*'+wrd+'[a z]*'
		sgtns.forEach(function(sgtn){
			if(rg){
				 rg+='|'+sgtn
				 rgTxt+=' [a z]*'+sgtn+'[a z]*'
			}else{
				rg=sgtn;
				rgTxt=' [a z]*'+sgtn+'[a z]*'
			}
		});
	});
	var arrQr=[];
	var 	feilds=['fn','ln'];
	feilds.forEach(function(feild){
		 var item ={};
		 item[feild]={$regex:rg,$options: 'i'};
		 arrQr.push(item);
	});
	var query={ $or:arrQr};
	console.log(arrQr);
  //var query=  { $regex :{'Provider First Name': new RegExp(regxz) }};
  MongoClient.connect(urlll, function(rr, db) {
      if (rr) {isfound=false; return;};
      var dbo = db.db("doc_db");
      //dbo.collection("drs").createIndex({ 'fn': "text",'ln':"text" });
      dbo.collection("drs").find(query).toArray(function(errr, reslts) {
          if (errr) {throw errr;return;}
            console.log(reslts.length);
            var arr =cleanResults(reslts,searchValue);
            console.log(arr.length);
           res.jsonp(arr);
          //res.render('hom',{results :arr,num:arr.length});
      });
    })
});
var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
