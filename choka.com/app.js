//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require("helmet");
const ejs = require("ejs");
const _= require("lodash");
//const admin = require("firebase-admin");
//const {firebase} = require("firebase");

//con firebase from "firebase"
//const cookieParser = require('cookie-parser')

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const port = process.env.PORT || 3000

app.set('view engine','ejs');

//////////Register user//////////

app.use('/registrationRequest',(req, res, next)=>{
    console.log("A new request received at " + Date.now());
    //console.log(req.query);
    console.log(req.query["FirstName"])
    if(req.query['Password']==req.query['ConfirmPassword']){
        next();
    }
    else{
        let str = "RegisterUser"
        res.send("Passwords do not match");
        //res.send("error")
        
    }
    
 });


 app.use('/registrationRequest',(req, res, next)=>{
    request_object = req.query
    if(request_object["Email"] == ''){
        res.send("Email cannot be empty");
    }
    if(request_object["FirstName"] == ''){
        res.send("First name cannot be empty");
    }

    if(request_object["LastName"] == ''){
        res.send("Last name cannot be empty");
    }
    if(request_object["PhoneNumber"] == ''){
        res.send("Phone number cannot be empty");
    }
    if(request_object["Password"] == ''){
        res.send("Password cannot be empty");
    }

    else{
        res.send("Account Created")
        

    }
    
    
 });
////////////////////rendering login
app.get('/loginRequest',(req,res)=>{
    
    res.render("home");
   
});

app.get("/login",(req,res)=>{
    
    res.render("Login");
   
});

 
///////Rendering home


app.get("/home",(req,res)=>{
    
    res.render("home");
   
});

app.get("/register",(req,res)=>{
    res.render("RegisterUser");
});





app.get("/",(req,res)=>{
    res.render("home");
})


app.listen(port, '0.0.0.0', ()=>{ // '0.0.0.0' is for running via docker only
     console.log("Server has started on port 3000");
});
