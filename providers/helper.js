const levenshtein = require('fast-levenshtein');
const fields=['fn','ln'];

function sortMyArrays(a,b) {
     var dist=parseInt(a.distance) - parseInt(b.distance);
     if(dist===0 && a.dist){
        return parseInt(a.dist) - parseInt(b.dist);
     }
     return dist;
}
function cleanResults(results,searchValue){
  var wrds =searchValue.split(' '); /* junk array */
  searchValue='';
  /* removing spaces between words*/
  wrds.forEach(function(wrd){
    searchValue+=' '+wrd.trim();/*ensure only single space between words*/
  });
  searchValue=searchValue.trim();/*removing leading spaces*/
  wrds =searchValue.split(' '); /*cleaned array*/
  var arr0=[]   /* to hold start startsWith*/
  var arr1=[];  /* to holds start with part*/
  var arr2=[];  /* to hold contains but not start with*/

 var pids=[];
  results.forEach(function(row){
    var drts=['dr','d.r','d.r.'];

    if(row['pc'] && isNaN(row['pc'])&&drts.includes(row['pc'].toLowerCase())){
         row['pc']= "M.D.";
    }
    /* search phrase is made of two or more words */
    if(wrds.length>=2){
       //console.log('====================two or more=============');
        /* exact matches if user supplied both fn and ln*/
        for(var k=0;k<2;k++){
           var fullname;
           var mtch;
           if(k===0){    /* test full name starting firstname surname */
             //console.log('========='+row['fn']);
             if(isNaN(row['fn'] )&& isNaN(row['ln'])){
                fullname =row['fn'].trim()+' '+row['ln'].trim();
             }else{
               fullname =row['fn']+' '+row['ln'];
             }
               mtch='  (fn ln)';
           }else {      /* test full name starting with last name */
              if(isNaN(row['fn'])&& isNaN(row['ln'])){
                 fullname =row['ln'].trim()+' '+row['fn'].trim();
              }else{
                fullname =row['ln']+' '+row['fn'];
              }
              mtch='  (ln fn)';
           }
           if(fullname && fullname.toLowerCase().startsWith(searchValue)){
              var distance = levenshtein.get(searchValue, fullname, { useCollator: true});
              if(row.distance){
                  if(row.distance>distance){
                      row.needed=fullname+mtch;
                      row.distance=distance;
                   }
               }else{
                  row.needed=fullname+mtch;
                  row.distance=distance;
               }
             }
          }
     }
     if(row.needed && !pids.includes(row['pid'])){        /*find near match of the full name*/
         arr0.push(row);
         pids.push(row.pid);
     }else{                 /* trying to match the parts since there is no match of full name */
      for(var k=0;k<2;k++){
        fields.forEach(function(field){
          wrds.forEach(function(wrd){
          var tstCond ;
          if(k===0){
             tstCond=row[field] && row[field].toLowerCase().startsWith(wrd); /* start startsWith part of the word*/
          }else{
            tstCond=row[field]; /*this nid further regx to group words that contains */
          }
          if(tstCond){
              var distance = levenshtein.get(wrd, row[field], { useCollator: true});
              var dist = levenshtein.get(wrds[0], row[field], { useCollator: true});
              if(row.distance){
                  if(row.distance>distance){
                      row.needed=row[field]+'  ('+field+')';
                      row.distance=distance;
                      row.dist=dist;
                  }
              }else{
                row.needed=row[field]+'  ('+field+')';
                row.distance=distance;
                row.dist=dist;
              }
           }
         });
       });
       if(k===0 && row.needed && !pids.includes(row['pid'])){ /*it start with the search word */
          arr1.push(row);
          pids.push(row.pid);
           break;
       }
       if(k===1 && row.needed && !pids.includes(row['pid'])){ /*contains some parts of search word */
          arr2.push(row);
          pids.push(row.pid);
       }
     }
   }
  });
  for(var k=0;k<2;k++){ /* call sort atleast twice due to the nuture of sortMyArrays */
    arr0=arr0.sort(sortMyArrays);
    arr1=arr1.sort(sortMyArrays);
    arr2=arr2.sort(sortMyArrays);
  }

  arr0=arr0.concat(arr1);
  return arr0.concat(arr2);
}
module.exports = cleanResults;
