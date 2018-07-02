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
const urlll = "mongodb://localhost:27017/";
//const urlll = 'mongodb://junta:rootjunta123@ds117991-a0.mlab.com:17991/heroku_pv94v0fr';
//const urlll = "mongodb://junta:rootjunta123@ds163850.mlab.com:63850/insurance_db";

const app =express();

// Middlewares
// set morgan to log info about our requests for development use.
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());
 var feilds=['cr','yr','st','mt','pn'];
// Routes
app.get("/",function(req,res){
	  res.sendFile( __dirname+'/index.html');
 });
app.get('/insurance',function(req,res){
  //var searchValue =req.body.search;
   var searchValue =req.query.search;
   if(searchValue){
		 searchValue= searchValue.toLowerCase();
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
		 feilds.forEach(function(feild){
			  var item ={};
			  item[feild]={$regex:rg,$options: 'i'};
			  arrQr.push(item);
		 });
//{$text: { $search: searchValue}}
     MongoClient.connect(urlll, function(rr, db) {
         if (rr) {isfound=false; return;};
           var dbo = db.db("insurance_db");//insurance_db
           //var dbo = db.db("heroku_pv94v0fr");
         /*dbo.createIndex("insur",{ pn:'text', cr:'text',st:'text',yr:'text', pid:'text',mt:'text'},function(err,op) {
           console.log(err);
         });*/

				 var pids=[];

         var query={ $or:arrQr};
				 console.log(arrQr);
         dbo.collection("insur").find(query).toArray(function(errr, reslts) {
             if (errr) {throw errr;return;}
						 var arr0,arr1,arr2;
						 arr0=[];arr1=[];arr2=[];
						 console.log(reslts.length);
						  db.close();
						  reslts.forEach(function(row){
								  var mtched=false;
									feilds.forEach(function(feild){
									     if(isNaN(row[feild])&&row[feild].toLowerCase().startsWith(searchValue)){
										      mtched=true;
									     }
								   });
								   if(mtched && !pids.includes(row['pid'])){
									   arr0.push(row);
										 pids.push(row['pid']);
								   }else {
											feilds.forEach(function(feild){
   									       if(isNaN(row[feild])&&row[feild].toLowerCase().includes(searchValue)){
														    //console.log(feild +' ==== '+row[feild]);
   										          mtched=true;
   									       }
   								     });
									    if(mtched && !pids.includes(row['pid'])){
											     arr1.push(row);
													 pids.push(row['pid']);
									     }else{
												 if( !pids.includes(row['pid'])){
													  arr2.push(row);
														pids.push(row['pid']);
												 }

									     }
								    }
							 });
							 arr0=arr0.concat(arr1);
						   arr0=arr0.concat(arr2);
               console.log(arr0.length);
               res.jsonp(arr0);
           //  res.render('hom',{results :reslts,num:reslts.length});
         });
       })
   }
});
//app.use('/api',require('./routes/routes'));
var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
