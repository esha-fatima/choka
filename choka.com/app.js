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
var user_details;
var document_id = "1aed"


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


const dbRef = firebase.database().ref();



db.settings({timestampsInSnapshots:true, merge:true});

app.set('view engine','ejs');

//////////Register user//////////

app.use('/registrationRequest',(req, res, next)=>{
    console.log("A new request received at " + Date.now());
    console.log(req.query);
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
    let request_object = req.query
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
        console.log(request_object)

        let new_user = {
            "Name" : request_object["FirstName"] + " "+ request_object["LastName"],
            "Email Address":request_object["Email"],
            "Phone Number": request_object["PhoneNumber"],
            "Password":request_object["Password"]


        }
        //res.send("Account Created")
        if(request_object["type_account"]== 'student'){
            let  usersRef = dbRef.child('Students');
            res.render("home")
            user_details = request_object
            //push to db here
            //set the varibale called document id as per what firebase assigns it

        }
        else{
            let usersRef = dbRef.child('Teachers');
            user_details = request_object
            res.render("home")
            //push to db here
            //set the variable called document id as per what firebase assigns it
        }
        

        
       
        
       
        

    }
    
    
 });


 app.post('/searchRequest',(req,res)=>{
     //when u get request to search for an object
     //console.log(req.body)
     //u will have the search parameters stored in the body of the request
     //then get all the relevnat details from firebase and get the search results in the form of an array
     let obj1 = JSON.stringify( {"Name": "Rose Dunhill", "Subject": "Physics", "Experience": "3", "Rating":"4.0", "Image": "xx"})
     let obj2 = JSON.stringify( {"Name": "William Jonas", "Subject": "Sociology", "Experience": "2", "Rating":"1.0", "Image": "xx"})
     let obj3 = JSON.stringify({"Name": "Sherry", "Subject": "English", "Experience": "6", "Rating":"4.0", "Image": "xx"})
     let results_array = [
        obj1, obj2, obj3
        ]
    let ff = JSON.stringify(results_array)
    //console.log(ff)
    let xx = {"mine":ff};
    //console.log(res)
     res.render("searchResults",xx)

 })


////////////////////rendering login
app.post('/findTutors', (req,res)=>{
    //now u are supposed to get the top 3 tutors from database.
    //store the top 2 in top_2 variable that I am hardcoding for now

    let top_2 = 
        {
            "Name_one": "Esha Fatima",
            "Department_one": "Computer Science",
            "Name_two" : "Baqar",
            "Department_two" : "Islamic Studies",
            "test": [1,2]
    
        }

    res.render("findTutors", top_2)


})


app.post('/loginRequest',(req,res)=>{
    
    //when received login request, check their password from firebase/
    //if the password is good to go 
    //go to dashboard page 
    //get all the firebase stuff and store it in a json object..the details
    //console.log(req)
    let obj_extracted_from_db = {
        "name": "Esha Fatima",
        "image" : "xx",
        "documentID": "123"
    }
    

    res.render("dashboard", obj_extracted_from_db)

    
   
});




app.post("/login",(req,res)=>{
    
    res.render("Login");
   
});

 
///////Rendering home


app.get("/home",(req,res)=>{
    
    res.render("home");
   
});

app.post("/register",(req,res)=>{
    res.render("RegisterUser");
});


app.get("/",(req,res)=>{
    
    res.render("home");
})


app.listen(port, '0.0.0.0', ()=>{ // '0.0.0.0' is for running via docker only
     console.log("Server has started on port 3000");
});
