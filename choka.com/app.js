const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");
const helmet = require("helmet");
const ejs = require("ejs");
const _= require("lodash");
const firebase = require("firebase");
const cookieParser = require('cookie-parser')
const socketio = require('socket.io');


 
let n_assessments = 0
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000
let chat_identifier = "";

// allow the app to use cookieparser
// app.use(helmet());

// allow the app to use cookieparser
app.use(cookieParser());

app.set('view engine','ejs');

let global_user = ""

io.on('connection',socket=>{
    console.log("connected");
    socket.emit("chatidentifier",chat_identifier) // this will emit to only that user
    //socket.broadcast.emit("message", "A user has joined the chat");
    //u can know which user it is from global
    socket.on('sendMessage',message=>{
        console.log("i have received a message")

        console.log(message)
        let message_arr = message.split('_')
        let rec_id = message_arr.pop()
        let message_to_be_sent = message_arr[0]
        const docRef = db.collection('Chats').doc(rec_id);
        docRef.get().then((doc)=>{
            if(doc.exists){
                let message_history_object = doc.data().jason_obj
                //console.log("ff", message_history_object)
                let keys = Object.keys(message_history_object);
                let len_keys = keys.length
                //console.log("len keys is ", len_keys)
                let new_id = len_keys+1
                let str_key = global_user.EmailAddress+"_"+ new_id.toString()
                message_history_object[str_key] = message_to_be_sent
                //console.log("new obj is ", message_history_object)

                db.collection('Chats').doc(rec_id).update({
                    jason_obj:message_history_object
                }).then(()=>{
                    //console.log("firebase updated");
                    let message_to_be_emitted = message_to_be_sent + "_" + rec_id
                    //the ur supposed to emit to the user with teh chat id...and see if they can receive and render it
                    io.emit("someMessage", message_to_be_emitted)
                });
                //now set this in firebase

                

            }

        });

        //now update firebase
        //nowwww send to firebase


        
        //when u receive a message
        //u know what is the chat identifier
        
    })
})



var firebaseConfig = {
    apiKey: "AIzaSyB5L-1mBbAzxi-bJwjvhCl_y4RyZ9LoZMk",
    authDomain: "choka-9acb9.firebaseapp.com",
    projectId: "choka-9acb9",
    storageBucket: "choka-9acb9.appspot.com",
    messagingSenderId: "243464704203",
    appId: "1:243464704203:web:c1fb5412fa39410e7b0b4e",
    measurementId: "G-RVRV9WH5CZ"
};
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();
const db = firebase.firestore();
db.settings({timestampsInSnapshots:true});

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//////////Register user//////////

// app.use('/registrationRequest',(req, res, next)=>{
//     console.log("A new request received at " + Date.now());
//     console.log(req.query);
//     console.log(req.query["FirstName"])
//     if(req.query['Password']==req.query['ConfirmPassword']){
//         next();
//     }
//     else{
//         let str = "RegisterUser"
//         res.send("Passwords do not match");
//         //res.send("error")
        
//     }
    
//  });


//  app.post('/registrationRequest',(req, res, next)=>{
//     let request_object = req.body
//     console.log(request_object)
//     if(request_object["Email"] == ''){
//         res.send("Email cannot be empty");
//     }
//     if(request_object["FirstName"] == ''){
//         res.send("First name cannot be empty");
//     }

//     if(request_object["LastName"] == ''){
//         res.send("Last name cannot be empty");
//     }
//     if(request_object["PhoneNumber"] == ''){
//         res.send("Phone number cannot be empty");
//     }
//     if(request_object["Password"] == ''){
//         res.send("Password cannot be empty");
//     }

//     else{
//         console.log(request_object)

//         let new_user = {
//             "Name" : request_object["FirstName"] + " "+ request_object["LastName"],
//             "Email Address":request_object["Email"],
//             "Phone Number": request_object["PhoneNumber"],
//             "Password":request_object["Password"]


//         }
//         //res.send("Account Created")
//         if(request_object["type_account"]== 'student'){
//             let  usersRef = dbRef.child('Students');
//             res.render("home")
//             user_details = request_object
//             //push to db here
//             //set the varibale called document id as per what firebase assigns it

//         }
//         else{
//             let usersRef = dbRef.child('Teachers');
//             user_details = request_object
//             res.render("home")
//             //push to db here
//             //set the variable called document id as per what firebase assigns it
//         }
//     }
//  });





 app.post('/filter',(req,res)=>{


     res.render("filter")
 })

 app.post('/filterTutor',(req,res)=>{


    res.render("filterTutor")
})

app.post('/messageRequestTutor',(req,res)=>{
    console.log("here")
    let str_obt = req.body.requested
    let str_array = str_obt.split(" ");
    console.log(str_array)
    let recipientEmailAddress = str_array.pop();
    let exp= str_array.pop();
    let name_str = str_array.join(' ')
    //console.log(name_str)
    //if it is a student, then u need to be redirected to the messaging page with tutor
    chat_identifier =  recipientEmailAddress + " " + global_user.EmailAddress
    console.log("chat identifier is ", chat_identifier)
    const docRef = db.collection('Chats').doc(chat_identifier);
    docRef.get().then((doc)=>{
        if(doc.exists){
            console.log("doc is", doc.data());
            let message_history_object = doc.data().jason_obj
            console.log(message_history_object)
           
            message_history_object = JSON.stringify(message_history_object);
            //get the name of the tutor...
            let obj_to_be_sent = {
                "name" : name_str,
                "messages" : message_history_object,
                "chatidentifier": chat_identifier,
                "my_email": global_user.EmailAddress,
                "recipient_email": recipientEmailAddress
            }
            //let stringified = JSON.stringify(obj_to_be_sent)
            console.log(obj_to_be_sent)
            res.render("chatTutor", obj_to_be_sent)
            //if chat exists then get the chat from json object and render the messages on frontend


            
        }
    })



})


app.post('/messageRequest',(req,res)=>{
    
    //console.log(req.body)
    
    let str_obt = req.body.requested
    let str_array = str_obt.split(" ");
    console.log(str_array)
    let recipientEmailAddress = str_array.pop();
    let exp= str_array.pop();
    let name_str = str_array.join(' ')
    //console.log(name_str)
    //if it is a student, then u need to be redirected to the messaging page with tutor
    chat_identifier = global_user.EmailAddress + " " + recipientEmailAddress
    console.log("chat identifier is ", chat_identifier)
    const docRef = db.collection('Chats').doc(chat_identifier);
    docRef.get().then((doc)=>{
        if(doc.exists){
            console.log("doc is", doc.data());
            let message_history_object = doc.data().jason_obj
            console.log(message_history_object)
           
            message_history_object = JSON.stringify(message_history_object);
            //get the name of the tutor...
            let obj_to_be_sent = {
                "name" : name_str,
                "messages" : message_history_object,
                "chatidentifier": chat_identifier,
                "my_email": global_user.EmailAddress,
                "recipient_email": recipientEmailAddress
            }
            //let stringified = JSON.stringify(obj_to_be_sent)
            console.log(obj_to_be_sent)
            res.render("chat", obj_to_be_sent)
            //if chat exists then get the chat from json object and render the messages on frontend


            
        }
        else{
            db.collection('Chats').doc(chat_identifier).set({
                jason_obj:{}
            }).then(()=>{
                console.log("firebase filled");
                //res.redirect("/home");
            });

        }
    });


   
    // if it is a tutor, then u need to redirect to the messaging page with student
})










app.post('/searchRequest',(req,res)=>{
     //when u get request to search for an object
     console.log("here")
     //u will have the search parameters stored in the body of the request
     ////search
     //3 results
     //then get all the relevnat details from firebase and get the search results in the form of an array
     let obj1 =  {'Name': 'Rose Dunhill', 'Subject': 'Physics', 'Experience': '3', 'Rating':'4.0', 'Image': 'xx','EmailAddress':'rose@icloud'}
     let obj2 =  {'Name': 'William Jonas', 'Subject': 'Sociology', 'Experience': '2', 'Rating':'1.0', 'Image': 'xx','EmailAddress':'rose@icloud'}
     let obj3 = {'Name': 'Sherry', 'Subject': 'English', 'Experience': '6', 'Rating':'4.0', 'Image': 'xx','EmailAddress':'rose@icloud'}
     let results_array = [
        obj1, obj2, obj3
        ]
    let ff = JSON.stringify(results_array)
    console.log(ff)
    let xx = {"bl":ff};
    //console.log(res)
    res.render("SearchResults",xx)

 })


 app.post('/searchRequestFromTutor',(req,res)=>{
    //when u get request to search for THE STUDENT IN THE STUDENTS' DB
    console.log("here")
    //u will have the search parameters stored in the body of the request
    ////search
    //3 results
    //then get all the relevnat details from firebase and get the search results in the form of an array
    let obj1 =  {'Name': 'Student1', 'Subject': 'Physics', 'Experience': '3', 'Rating':'4.0', 'Image': 'xx','EmailAddress':'eshafatima2001@gmail.com'}
    let obj2 =  {'Name': 'Student2', 'Subject': 'Sociology', 'Experience': '2', 'Rating':'1.0', 'Image': 'xx','EmailAddress':'eshafatima2001@gmail.com'}
    let obj3 = {'Name': 'Student3', 'Subject': 'English', 'Experience': '6', 'Rating':'4.0', 'Image': 'xx','EmailAddress':'eshafatima2001@gmail.com'}
    let results_array = [
       obj1, obj2, obj3
       ]
   let ff = JSON.stringify(results_array)
   console.log(ff)
   let xx = {"bl":ff};
   //console.log(res)
   res.render("SearchResultsTutor",xx)

})





 app.post('/filterRequest',(req,res)=>{
     console.log(req.body)
    let obj1 =  {'Name': 'Rose Dunhill', 'Subject': 'Physics', 'Experience': '3', 'Rating':'4.0', 'Image': 'xx', 'EmailAddress':'rose@icloud'}
    let obj2 =  {'Name': 'William Jonas', 'Subject': 'Sociology', 'Experience': '2', 'Rating':'1.0', 'Image': 'xx','EmailAddress':'rose@icloud'}
    let obj3 = {'Name': 'Sherry', 'Subject': 'English', 'Experience': '6', 'Rating':'4.0', 'Image': 'xx','EmailAddress':'rose@icloud'}
    let results_array = [
       obj1, obj2, obj3
       ]
   let ff = JSON.stringify(results_array)
   console.log(ff)
   let xx = {"bl":ff};
   //console.log(res)
   res.render("SearchResults",xx)
     

 })

app.post('/filterFromTutor',(req,res)=>{
    let obj1 =  {'Name': 'Student1', 'Subject': 'Physics', 'Experience': '3', 'Rating':'4.0', 'Image': 'xx','EmailAddress':'eshafatima2001@gmail.com'}
    let obj2 =  {'Name': 'Student2', 'Subject': 'Sociology', 'Experience': '2', 'Rating':'1.0', 'Image': 'xx','EmailAddress':'eshafatima2001@gmail.com'}
    let obj3 = {'Name': 'Student3', 'Subject': 'English', 'Experience': '6', 'Rating':'4.0', 'Image': 'xx','EmailAddress':'eshafatima2001@gmail.com'}
    let results_array = [
       obj1, obj2, obj3
       ]
   let ff = JSON.stringify(results_array)
   console.log(ff)
   let xx = {"bl":ff};
   //console.log(res)
   res.render("SearchResultsTutor",xx)
     

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
            
    
        }

    res.render("findTutors", top_2)


})


app.post('/findStudents', (req,res)=>{
    //do a search from the databse and get the top 2 students liveing in the same city as thus particular tutor
    //store the name, department and the bidding price of the top 2 students living in the sam area as a json object like below
    let top_2_students = 
        {
            "Name_one": "Bastian",
            "Department_one": "Computer Science",
            "Bid_one" : "1000",
            "Name_two" : "Baqar",
            "Department_two" : "Islamic Studies",
            "Bid_two": "5000"
            
    
        }
        res.render("findStudents", top_2_students)

})


app.post('/loginRequest',(req,res)=>{
    
    //when received login request, check their password from firebase/
    //if the password is good to go 
    //go to dashboard page 
    //get all the firebase stuff and store it in a json object..the details
    console.log(req.body)
    let email = req.body["Email"]
    let password =  req.body["Password"]
    const docRef = db.collection('Students').doc(email);

    docRef.get().then((doc)=>{
        if(doc.exists){
            //then check the password from database
            console.log("User found");
            //console.log(doc.data());
            let user_deets = doc.data().jason_obj
            console.log(user_deets)
            if(user_deets.Password == password){
                //this means passwords match and
                console.log("Passwords match")
                let n_obj = {

                    "Name" :user_deets.Name,
                    "EmailAddress":user_deets.EmailAddress,
                    "PhoneNumber": user_deets.PhoneNumber,
                    "Password":user_deets.Password,
                    "Image":user_deets.Image,
                    "Address": user_deets.Address,
                    "City" : user_deets.City

                }
                global_user = n_obj;
                console.log(global_user)
                res.render("dashboard", global_user)

            }
            else{
                res.render("Login")
                console.log("Passwords do not match")
            }
            
        }
        else{
            
            const docRefTutor = db.collection('Teachers').doc(email);
            docRefTutor.get().then((doc)=>{
                if(doc.exists){
                    let user_deets = doc.data().jason_obj
                    console.log(user_deets)
                    //if it is tutor.
                    console.log("Tutor found")
                    if(user_deets.Password == password){
                         global_user = {
                            "Name" : user_deets.Name,
                            "EmailAddress":user_deets.EmailAddress,
                            "PhoneNumber": user_deets.PhoneNumber,
                            "Password":user_deets.Password,
                            "HighestQualification":user_deets.HighestQualification,
                            "BirthDay":user_deets.BirthDay,
                            "PreviousExperience":user_deets.PreviousExperience,
                            "Transcript":user_deets.Transcript,
                            "Image" : user_deets.Image,
                            "Address": user_deets.Address,
                            "City": user_deets.City

                        }
                        
                        res.render("tutorDashboard", global_user)
                    }
                    else{
                        console.log("Passwords do not match")
                        res.render("Login")
                    }

                    


                }
                else{
                    console.log("NOT FOUND")
                    res.render("Login")
                }
            })



        }
    });



    

    
   
});

app.post("/viewprofile",(req,res)=>{

    //get the details of the person who is logged in a json object and then send it to the frontend.
    //hardcodig it for now
    console.log("in vw")
    console.log(global_user)
    res.render("viewProfile",global_user)
})


app.post("/populateProfile",(req,res)=>{
    res.render("populateProfile")
})


app.post("/publishTutorProfile",(req,res)=>{
    res.render("publishProfile")
})



app.post("/populateProfileRequest",(req,res)=>{

    //in req.body get all details and store those
    //get the name of the banda who is logged in and create its json obj and store it in obj_extracted_from_db
    //like below
    //and then pass this and u will be redirected to dashboard
    let obj_extracted_from_db = {
        "name": "Esha Fatima",
        "image" : "xx",
        "documentID": "123"
    }
    

    res.render("dashboard", obj_extracted_from_db)
    //
    
})

app.post("/publishProfileRequest",(req,res)=>{

    //in req.body get all details and store those
    //get the name of the banda who is logged in and create its json obj and store it in obj_extracted_from_db
    //like below
    //and then pass this and u will be redirected to dashboard
    let obj_extracted_from_db = {
        "name": "Esha Fatima",
        "image" : "xx",
        "documentID": "123"
    }
    

    res.render("tutorDashboard", obj_extracted_from_db)
    //
    
})








app.post("/editProfile",(req,res)=>{
    //u will get the new attributes in req.body
    //do console.log(req.body)
    //these are the values from frontend
    //check each of these fields with THE ALREADY EXISTING VALUES and then update the values in db accordingly
    //then MAKE A NEW OBJECT WITH NEW VALUES OR ANY CHANGES AND STORE IT AS A JSON OBJ IN NEW OBJ
    // I am hardcoding new_obj for now
    //and then send new obj to frontend in the same format as i have hardcoded with any new or changed values
    console.log(req.body)
    let old_email = global_user['EmailAddress'];
    if(req.body['email'] != global_user['Email']){
        global_user['EmailAddress'] = req.body['email']

    }
    if(req.body['contact'] != global_user['PhoneNumber']){
        global_user['PhoneNumber'] = req.body['contact']

    }
    if(req.body['address'] != global_user['Address']){
        global_user['Address'] = req.body['address']

    }
    if(req.body['city'] != global_user['City']){
        global_user['City'] = req.body['city']

    }

    //let docRef = db.col lection('Teachers').doc(old_email);
    console.log("global user is", global_user)
    /*
    if(Object.keys(global_user).length==11){  
        //this means tutor hai
        console.log("issss ")
        docRef = db.collection('Teachers').doc(old_email);
        
    }
    */
    
    console.log("old email is ", old_email)
    // docRef.get().then((doc)=>{
        console.log("length is", Object.keys(global_user).length)
        if(Object.keys(global_user).length==12){

            db.collection('Teachers').doc(old_email).update({
                jason_obj:global_user
            }).then(()=>{
                console.log("firebase updated");
                res.render("viewProfile", global_user);
            });

        }
        else{
            db.collection('Students').doc(old_email).update({
                jason_obj:global_user
            }).then(()=>{
                console.log("firebase updated");
                res.render("viewProfile", global_user);
            });

        }
        
        //get the doc and then 
    // });





});




app.post("/login",(req,res)=>{
    
    res.render("Login");
   
});

 
///////Rendering home

app.get("/",(req,res)=>{
    console.log(1)
    
    res.render("home");
})

app.get("/home",(req,res)=>{
    console.log(2)
    res.render("home");
   
});

app.post("/home",(req,res)=>{

    console.log(3)
    if (req.body.home == "signin")
    {
        res.render("Login");
    }
    else
    {
        res.render("RegisterUser");
    }
    
});


app.post('/studentregistration',(req, res, next)=>{
    console.log(4)
    let request_object = req.body
    let email = request_object["Email"]

    let new_user = {
        "Name" : request_object["FirstName"] + " "+ request_object["LastName"],
        "EmailAddress":request_object["Email"],
        "PhoneNumber": request_object["PhoneNumber"],
        "Password":request_object["Password"],
        "Image":request_object["Image"],
        "Address": "None Added",
        "City" : "None Added"


    }

    global_user = new_user;

    const docRef = db.collection('Students').doc(email);
    docRef.get().then((doc)=>{
        if(doc.exists){
            console.log("User exists");
            res.redirect("/RegisterUser");
        }
        else{
            db.collection('Students').doc(email).set({
                jason_obj:new_user
            }).then(()=>{
                console.log("firebase filled");
                res.redirect("/home");
            });

        }
    });
});

app.post('/parentregistration',(req, res, next)=>{
    console.log(5)
    let request_object = req.body
    let email = request_object["Email"]

    let new_user = {
        "Name" : request_object["FirstName"] + " "+ request_object["LastName"],
        "EmailAddress":request_object["Email"],
        "PhoneNumber": request_object["PhoneNumber"],
        "Password":request_object["Password"],
        "HighestQualification":request_object["HighestQualification"],
        "BirthDay":request_object["BirthdayDay"]+"/"+request_object["BirthdayMonth"]+"/"+request_object["BirthdayYear"],
        "PreviousExperience":request_object["PreviousExperience"],
        "Transcript":request_object["Transcript"],
        "Image" : request_object["Image"],
        "Address": "None Added",
        "City": "None Added"
    }

    global_user = new_user

    const docRef = db.collection('Teachers').doc(email);
    docRef.get().then((doc)=>{
        if(doc.exists){
            console.log("User exists");
            res.redirect("/RegisterUser");
        }
        else{
            db.collection('Teachers').doc(email).set({
                jason_obj:new_user
            }).then(()=>{
                console.log("firebase filled");
                res.redirect("/home");
            });

        }
    });
});



//ASSESSMENTS MODUule
app.post('/studentsAssessments',(req, res, next)=>{
    console.log("in students assessments")
    res.render("studentAssessments")

})
app.post('/tutorAssessments',(req, res, next)=>{
    console.log("in tutors assessments")
    res.render("tutorAssessments")

})
app.post('/create',(req, res, next)=>{
    console.log("in create assessments")
    
    let recipient_ids = ['eshafatima2001@gmail.com', '123@gmail.com']
    let rec_str = JSON.stringify(recipient_ids)
    res.render("createAssessments",{"bachey":rec_str})


})

app.post('/todoAssessments',(req, res, next)=>{
    console.log("in to do assessments")
    //now at backend we need to see which are the assessments for this particular student who sent us the request
    //we are going to iterate over all possible emails
    //now at backend iterate through to do assessments to do and get docs via ur emaillll 
    //then 
    let assessment_headers = []
    const docRef = db.collection('TodoAssessments');
    console.log("email is ", global_user.EmailAddress)
    docRef.where('id', '==', global_user.EmailAddress).get().then((value)=>{
        
        console.log("retreived isss")
        value.forEach(doc=>{
            console.log(doc.id, '=>', doc.data());
            //let stringified_version = JSON.stringify(doc.data().assessment_details)
            //console.log("stringified version is ", stringified_version)
            let proposed_start_date = doc.data().assessment_details.PublishDate
            let proposed_start_time = doc.data().assessment_details.PublishTime
            console.log(proposed_start_date)
            console.log(proposed_start_time)
            let merge = proposed_start_date.toString() + "T" + proposed_start_time.toString()
            console.log(merge)
            let that_date = new Date(merge);
            let now = new Date()
            if(now>=that_date){
                assessment_headers.push(doc.data().assessment_details)

            }
            


        })
        let str_array = JSON.stringify(assessment_headers);
        let obj_to_be_sent = {"headers":str_array}
        res.render("todoAssessments", obj_to_be_sent)



    });
    
    //return;
  

})

app.post('/startAssessment',(req, res, next)=>{
    console.log("in start assessments")
    let assessment_header = JSON.parse(req.body.assessment_details);
    console.log("assessment to start is ", assessment_header)
    let stringified = JSON.stringify(assessment_header)
    res.render("startAssessment",{"assessment_content":stringified})


})





app.post('/createAssessmentRequest',(req, res, next)=>{
    console.log("in create assessments request")
    console.log(req.body)
    let n_req_params = Object.keys(req.body).length
    let recipients_list = []
    console.log("nparams is", n_req_params)

    for(let x = 6; x<n_req_params-3; x=x+1){
        recipients_list.push(Object.keys(req.body)[x])
        console.log("added")
    }
    //get the intended recipients of the assessments
    //generate a random assessmentid
    console.log(recipients_list)
    /////CHANGE THIS AND USE FIREBASE TOO GENERATE THE ASSESSMENT ID COZ SERVER MAY START AGAINNNN
    let assessmentid = n_assessments + 1;
    n_assessments = n_assessments + 1;
    console.log("generated id is ", assessmentid)
    let assessment_obj = {  "id" : assessmentid.toString(),
                            "Subject":req.body.Subject,
                            "Syllabus":req.body.Syllabus,
                            "TotalPoints": req.body.total_points,
                            "PublishDate":req.body.publishDate,
                            "PublishTime":req.body.publishTime,
                            "Minutes":req.body.minutes,
                            "QuestionPoints":req.body.question_points,
                            "QuestionMinutes":req.body.question_minutes,
                            "QuestionText":req.body.question_text,
                            "IntendedRecipients": recipients_list
                        }

    //now store this in firebase
    //create a firebase record
    const docRef = db.collection('Quiz').doc(assessmentid.toString());
    docRef.get(assessmentid.toString()).then((doc)=>{
        if(doc.exists){
            console.log("Assessment exists");

            res.render("tutorAssessments");

        }
        else{
            db.collection('Quiz').doc(assessmentid.toString()).set({
                jason_obj:assessment_obj
            }).then(()=>{
                console.log("assessment added");
                //u have the list of recipients and the assessment object
                //for every recipient add an entry into the To do waala table 
                let promise_list = []
                for(let j = 0; j<recipients_list.length; j = j+1){
                    let key = recipients_list[j] + assessmentid.toString();
                    //let obj = {"assessment_details" : assessment_obj, "id": recipients_list[j]}
                    promise_list.push(db.collection('TodoAssessments').doc(key).set({

                        assessment_details:assessment_obj,
                        id:recipients_list[j]
                    }))
                   

                }
                console.log("promise list",promise_list);
                //now when ur doneee only then redirect
                Promise.all(promise_list).then((values) => {
                    res.render("tutorAssessments");

                });
                



                
            });

        }
    });



})







// Save encryoted password
// Sing up
// Find Tutor

server.listen(port, '0.0.0.0', ()=>{ // '0.0.0.0' is for running via docker only
     console.log("Server has started on port 3000");
});