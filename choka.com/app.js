//jshint esversion:6
//const express = require("express");
import express from "express";
//const bodyParser = require("body-parser");
import bodyParser from "body-parser";
//const path = require("path");
import path from "path";
//const helmet = require("helmet");
import helmet from "helmet";
//const ejs = require("ejs");
import ejs from "ejs";
//const _= require("lodash");
//const firebase = require("firebase");
import firebase from "firebase"
// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app/dist/index.cjs.js";
import pkg_1 from 'firebase/app/dist/index.cjs.js';
const { initializeApp } = pkg_1;

import pkg from 'firebase/analytics/dist/index.cjs.js'
const { getAnalytics } = pkg;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional



//npm install firebase
//const admin = require("firebase-admin");



//con firebase from "firebase"
//const cookieParser = require('cookie-parser')
import cookieParser from "cookie-parser";
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const port = process.env.PORT || 3000

const firebaseConfig = {
    apiKey: "AIzaSyB5L-1mBbAzxi-bJwjvhCl_y4RyZ9LoZMk",
    authDomain: "choka-9acb9.firebaseapp.com",
    projectId: "choka-9acb9",
    storageBucket: "choka-9acb9.appspot.com",
    messagingSenderId: "243464704203",
    appId: "1:243464704203:web:c1fb5412fa39410e7b0b4e",
    measurementId: "G-RVRV9WH5CZ"
  };
  
// Initialize Firebase
initializeApp(firebaseConfig);
// const analytics = getAnalytics(db);

const db = firebase.firestore();

db.settings({timestampsInSnapshots:true});

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
    console.log(request_object)
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


app.post('/loginRequest',(req,res)=>{
    
    //when received login request, check their password from firebase/
    //if the password is good to go 
    //go to dashboard page 
    //get all the firebase stuff and store it in a json object..the details
    console.log(req.body)
    let obj_extracted_from_db = {
        "name": "Esha Fatima",
        "image" : "xx"
    }
    res.render("dashboard", obj_extracted_from_db)

    
   
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
