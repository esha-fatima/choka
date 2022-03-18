//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require("helmet");
const ejs = require("ejs");
const _= require("lodash");
const firebase = require("firebase");
const cookieParser = require('cookie-parser')

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const port = process.env.PORT || 3000

app.set('view engine','ejs');

app.get("/home",(req,res)=>{
    res.render("home");
});

app.get("/register",(req,res)=>{
    res.render("RegisterUser");
});

app.get("/handleRegister",(req,res)=>{
    console.log("here")
    res.render("home");
   
});



app.get("/",(req,res)=>{
    res.render("home");
})


app.listen(port, '0.0.0.0', ()=>{ // '0.0.0.0' is for running via docker only
     console.log("Server has started on port 3000");
});
