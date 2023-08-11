//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async function(req, res){
    // res.render("Hello World!!!");
    res.json({"first": "Hello World"});
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server started on port 3000");
});