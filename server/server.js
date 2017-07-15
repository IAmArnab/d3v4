var express = require('express');
var csv=require('csvtojson');
var path =require('path');
// console.log(path.join(__dirname , '../client'));
var csvString = __dirname + '\\res\\dh11_nodes.csv';
var server = express();
// console.log(__dirname + '/../client');
server.use('/', express.static(path.join(__dirname , '../client')));

server.get('/get_columns', function(req, res){
  var resArray = [];
  var isSend = false;
  csv()
  .fromFile(csvString)
  .on('json',(jsonObj)=>{
    for(key in jsonObj){
      resArray.push(key);
    }
    if(!isSend){
      res.end(JSON.stringify(resArray));
      isSend = true;
    }
  })
  .on('done',(error)=>{
      //parsing finished
      var message = error===undefined?' Successful':error;
      console.log("done : "+ message);
  })
});

server.get('/get_datas', function(req, res){
  var required_fields = req.headers.required_fields;
  console.log("Requested fields :"+required_fields);
  required_fields = JSON.parse(required_fields);
  for(field in required_fields){
    console.log(required_fields[field]);
  }
  var jsonArray = [];
  csv()
  .fromFile(csvString)
  .on('json',(jsonObj)=>{ // this func will be called 3 times
      //console.log("doing");
      var newRow = {};
      for(field in required_fields){
        var fieldName = required_fields[field];
        newRow[fieldName] = jsonObj[fieldName];
      }
      //console.log(jsonObj.Modularity);
      jsonArray.push(newRow);
      //console.log(jsonObj) // => [1,2,3] , [4,5,6]  , [7,8,9]
  })
  .on('done',(error)=>{
      //parsing finished
      var message = error===undefined?' Successful':error;
      console.log("done : "+ message);
      res.send(jsonArray);
  })
});

server.get('/get_data', function(req, res){
  var required_field = req.headers.required_field;
  console.log("Requested field :"+required_field);
  console.log(required_field);
  var jsonArray = [];
  csv()
  .fromFile(csvString)
  .on('json',(jsonObj)=>{
    jsonArray.push(jsonObj[required_field]);
  })
  .on('done',(error)=>{
      //parsing finished
      var message = error===undefined?' Successful':error;
      console.log("done : "+ message);
      res.send(jsonArray);
  })
});

server.listen(8080, function(){
  console.log("Server is running")
});
