const fs = require('fs');
var symdata = require("./WebMd.json");
var symptomValues=[];
var arrSympt =[];

function getSymptomOnly(item, index) {
 var symptom = item.sy;
 return symptom;
}
   
var storeSymp =symdata.map(getSymptomOnly);
storeSymp.forEach(function(item){
if(symptomValues.indexOf(item)<0){
//console.log(item);
    symptomValues.push(item);
  }
});


var allsymptoms={symtoms : symptomValues};
arrSympt.push(allsymptoms);
console.log(symptomValues.length  + "  number of Symptoms");

var jsonContent = JSON.stringify(arrSympt);
fs.writeFile("webmdSymptoms.json", jsonContent, 'utf8', function(err) {
   if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
   }
   console.log("JSON file has been saved.");
});


