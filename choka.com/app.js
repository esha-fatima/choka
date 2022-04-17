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


 
let n_assessments = 0;
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
        let sender_email = message_arr[2]
        let rec_id = message_arr[1]
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
                let str_key = sender_email+"_"+ new_id.toString()
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
// const { getDatabase } = require('firebase-admin/database');

// const db1 = firebase.database();
// const ref = db1.ref('server/saving-data/fireblog');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


//go to db and get the last assessment id and then set the global variable here

db.collection('TodoAssessments').get().then((vals)=>{
    n_assessments = vals.size+1
    //console.log("vals length initialized to", n_assessments)

})


app.post('/filter',(req,res)=>{
    console.log("posting filter")
    //let local_user = JSON.parse(req.body.headers)
    console.log("local user after parsing is", req.body)
    //local_user = JSON.stringify(local_user)
    //console.log(local_user)


    res.render("filter")
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
            let tutor_in_chat = doc.data().tutor_email
            let student_in_chat = doc.data().student_email
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


        else{
            db.collection('Chats').doc(chat_identifier).set({
                jason_obj:{},
                tutor_email : tutor_in_chat,
                student_email: student_in_chat
            }).then(()=>{
                console.log("firebase filled");
                //res.redirect("/home");
                res.render("chatTutor", dummy)
            });

        }
    })



})


app.post('/messageMyStudent',(req,res)=>{
    
    
    //now go to chat.ejs
    console.log(req.body.requested)
    //now get the relevant chat
    let obj = JSON.parse(req.body.requested)
    let identifier = obj.student_email + " " + obj.tutor_email
    console.log(identifier)
    db.collection('Chats').doc(identifier).get().then((doc)=>{
        let deets = doc.data()
        console.log("deets are")
        console.log(deets)
        //now send these deets
        deets = JSON.stringify(deets)
        
        console.log("after ", deets)
        let obj = {"chat_header": deets}
        //let to_send = JSON.stringify(obj)
        res.render("chatTutor", obj)

    })

})


app.post('/messageMyTutor',(req,res)=>{
    console.log("wish to post")
    //now go to chat.ejs
    console.log(req.body.requested)
    //now get the relevant chat
    let obj = JSON.parse(req.body.requested)
    let identifier = obj.student_email + " " + obj.tutor_email
    console.log(identifier)
    db.collection('Chats').doc(identifier).get().then((doc)=>{
        let deets = doc.data()
        console.log("deets are")
        console.log(deets)
        //now send these deets
        deets = JSON.stringify(deets)
        console.log("after ", deets)
        let obj = {"chat_header": deets}
        //let to_send = JSON.stringify(obj)
        res.render("chat", obj)

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
    let dummy = {}
    docRef.get().then((doc)=>{
        if(doc.exists){
            console.log("doc is", doc.data());
            let message_history_object = doc.data().jason_obj
            let tutor_in_chat = doc.data().tutor_email
            let student_in_chat = doc.data().student_email
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
            dummy = obj_to_be_sent;
            //let stringified = JSON.stringify(obj_to_be_sent)
            console.log(obj_to_be_sent)
            res.render("chat", obj_to_be_sent)
            //if chat exists then get the chat from json object and render the messages on frontend


            
        }
        else{
            db.collection('Chats').doc(chat_identifier).set({
                jason_obj:{},
                tutor_email : tutor_in_chat,
                student_email: student_in_chat
            }).then(()=>{
                console.log("firebase filled");
                //res.redirect("/home");
                res.render("chat", dummy)
            });

        }
    });


   
    // if it is a tutor, then u need to redirect to the messaging page with student
})








app.post('/displayChats', (req,res)=>{
    //when u get this get the global user
    let local_user = req.body.headers;
    local_user = JSON.parse(local_user);

    let student_name = local_user.Name
    let student_email = local_user.EmailAddress
    //make a call to databse and get all the chat headers where this is the student name
    const docRef = db.collection('Students').doc(student_email);
    docRef.get().then((doc)=>{
        console.log(doc.data())

        let arr_tutors = doc.data().tutor_accepted
        //get the emails of all the tutors.
        tutor_emails = []
        for(let i = 0; i<arr_tutors.length; i= i +1){
            tutor_emails.push(arr_tutors[i].EmailAddress)

        }
        console.log("array of all emails is", tutor_emails)
        let chat_headers = []
        //now u need to get all the chat headers of the students.
        const docRef_two = db.collection('Chats');
        docRef_two.where('student_email', '==', student_email).get().then((docs)=>{
            docs.forEach((doc)=>{
                var index = tutor_emails.indexOf(doc.data().tutor_email)
                tutor_emails.splice(index,1)
                chat_headers.push(doc.data())

            })
            
           
                
                
            
            console.log("chat headers are", chat_headers)
            console.log("the tutor emails are", tutor_emails)

            //now u have the chat headers...
            let stringified_chat_headers = JSON.stringify(chat_headers)
            // for all the t=other tutos in the tutir_emails array, create chat header
            let promise_array = []
            for(t = 0; t < tutor_emails.length; t = t+1){
                let chat_identifier = student_email + " " + tutor_emails[t]
                promise_array.push(db.collection('Chats').doc(chat_identifier).set({
                    jason_obj:{},
                    tutor_email : tutor_emails[t],
                    student_email: student_email
                }))
                chat_headers.push({
                    jason_obj:{},
                    tutor_email : tutor_emails[t],
                    student_email: student_email
                })

            }

            Promise.all(promise_array).then((values) => {
               
                let stringified_chat_headers = JSON.stringify(chat_headers)
                console.log("i am here and teh stringified chat headers are", stringified_chat_headers)
                let string_header = JSON.stringify(local_user)
                res.render("displayChats", {"chat_headers": stringified_chat_headers, "header":string_header})

                

            });
            //now u have all the promises

           
           


        })


        
    })
   

})


app.post('/displayChatsTutor', (req,res)=>{
    //when u get this get the global user
    let local_user = req.body.headers
    local_user = JSON.parse(local_user)
    console.log("indisplay chats for tutor, local user is ", local_user)
    let tutor_name = local_user.Name
    let tutor_email = local_user.EmailAddress
    //make a call to databse and get all the chat headers where this is the student name
    const docRef = db.collection('Teachers').doc(tutor_email);
    docRef.get().then((doc)=>{
        console.log(doc.data())

        let arr_students = doc.data().student_accepted
        //get the emails of all the tutors.
        student_emails = []
        for(let i = 0; i<arr_students.length; i= i +1){
            student_emails.push(arr_students[i])

        }
        console.log("array of all student emails is", student_emails)
        
        let chat_headers = []
        //now u need to get all the chat headers of the tutors.
        const docRef_two = db.collection('Chats');
        docRef_two.where('tutor_email', '==', tutor_email).get().then((docs)=>{
            docs.forEach((doc)=>{
                var index = student_emails.indexOf(doc.data().student_email)
                student_emails.splice(index,1)
                chat_headers.push(doc.data())

            })
            
           
            //now for every chat store the chat header
            
                //get the tutor email for that particular 
                
                
            
            console.log("chat headers are", chat_headers)
            console.log("the student emails are", student_emails)
            
            //now u have the chat headers...
            let stringified_chat_headers = JSON.stringify(chat_headers)
            // for all the t=other tutos in the tutir_emails array, create chat header
            let promise_array = []
            for(t = 0; t < student_emails.length; t = t+1){
                let chat_identifier = student_emails[t] + " " + tutor_email
                promise_array.push(db.collection('Chats').doc(chat_identifier).set({
                    jason_obj:{},
                    tutor_email : tutor_email,
                    student_email: student_emails[t]
                }))
                chat_headers.push({
                    jason_obj:{},
                    tutor_email : tutor_email,
                    student_email: student_emails[t]
                })

            }

            Promise.all(promise_array).then((values) => {
                //resolve all the promises and then 
                //res.render("tutorAssessments");
                let stringified_chat_headers = JSON.stringify(chat_headers)
                let stringified_header = JSON.stringify(local_user)
                console.log("i am here and teh stringified chat headers are", stringified_chat_headers)
                res.render("displayChatsTutor", {"chat_headers": stringified_chat_headers, "header":stringified_header})

                

            });
            //now u have all the promises

           
           


        })
        


        
    })
    
    
   

})





app.get('/searchRequest',(req,res)=>{

    res.render('/searchRequest')
})


app.post('/searchRequest',(req,res)=>{
    console.log("in search request")
    let local_user = req.body.headers;
    local_user = JSON.parse(local_user)
    console.log("local user after parsing,", local_user)
    local_user = JSON.stringify(local_user)
    console.log("local user after stringifying,", local_user)
    db.collection("subjects").get().then((snapshot) => {
        snapshot.docs.map(doc => {
            let data = doc.data()
            if(doc.id == req.body.Subject)
            {
                console.log(data.tutors)
                let arr_str = JSON.stringify(data.tutors)
                let xx = {"bl":arr_str, "header":local_user};
                res.render("SearchResults",xx)
            }              
        })
    });
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
   res.render("searchResultsTutor",xx)

})





app.post('/filterRequestT',(req,res)=>{

   
    let local_user = JSON.parse(req.body.headers)

    local_user["Rate"]=req.body.Rate,
    local_user["Days"]=req.body.Days,
    local_user["Location"]=req.body.Location,
    local_user["Classes"]=req.body.Class,
    local_user["Subject"]=req.body.Subject,
    local_user["Mode"]=req.body.Mode,
    local_user["Hours"]=req.body.Hours,
    local_user["Experience"]=req.body.Experience
    console.log("/filterRequestT", local_user)
    new_user = JSON.stringify(local_user)
    let header = {
        "header":new_user
    }

    
    db.collection("Teachers").doc(local_user.EmailAddress).update({
        Rate:req.body.Rate,
        Days:req.body.Days,
        Location:req.body.Location,
        Classes:req.body.Class,
        Subject:req.body.Subject,
        Mode:req.body.Mode,
        Hours:req.body.Hours,
        Experience:req.body.Experience
    }).then(()=>{
            db.collection('subjects').doc(req.body.Subject).update({
                tutors: firebase.firestore.FieldValue.arrayUnion(local_user)
            }).then(()=>{
                        res.render("tutorDashboard", header)
            }).catch(()=>{
                db.collection('subjects').doc(req.body.Subject).set({
                    tutors: [local_user]
                }).then(()=>{
                            res.render("tutorDashboard", header)
                });
            })
 
    });

    // db.collection("subjects").doc(req.body.Subject).update({
        
    //     email:(global_user.EmailAddress)
    // }).then(()=>{
    //     res.render("tutorDashboard", global_user)
    // });

})

app.post('/filterRequest',(req,res)=>{
    console.log("/filterRequest")
    let local_user = req.body.headers
    local_user = JSON.parse(local_user);
    local_user["Pay"]=req.body.Pay,
    local_user["Days"]=req.body.Days,
    local_user["Location"]=req.body.Location,
    local_user["Classes"]=req.body.Class,
    local_user["Subject"]=req.body.Subject,
    local_user["Mode"]=req.body.Mode,
    local_user["Hours"]=req.body.Hours,
    console.log("local user is", local_user)
    db.collection("Students").doc(local_user.EmailAddress).update({
        Pay:req.body.Pay,
        Days:req.body.Days,
        Location:req.body.Location,
        Classes:req.body.Class,
        Subject:req.body.Subject,
        Mode:req.body.Mode,
        Hours:req.body.Hours,
        // Experience:req.body.Experience
    }).then(()=>{
        let new_user = JSON.stringify(local_user);
        let header = {"header": new_user}
        res.render("dashboard", header)
    });
})

app.post('/filterTutor',(req,res)=>{
    console.log("/filterTutor", global_user)

    db.collection("subjects").get().then((snapshot) => {
        snapshot.docs.map(doc => {
            let data = doc.data()
            if(doc.id == req.body.Subject)
            {
                let obj = data.tutors
                let tutor_list = []
                for(let i=0;i<obj.length; i++)
                {
                    tutor = data.tutors[i]
                    if(tutor.Mode == req.body.Mode && tutor.Location == req.body.Location && tutor.Rating >= req.body.Rating && tutor.Rate <= req.body.Rate && tutor.Experience >= req.body.Experience && tutor.Class >= req.body.Class && tutor.Days >= req.body.Days && tutor.Hours >= req.body.Hours)
                    {
                        tutor_list.push(data.tutors[i])
                    }
                }
                let arr_str = JSON.stringify(tutor_list)
                let xx = {"bl":arr_str};
                res.render("SearchResults",xx)
            }              
        })
    });
})



app.post('/filterStudent',(req,res)=>{
    let local_user = req.body.headers;
    console.log("inside filter student")
    console.log("local user after parsing is ", JSON.parse(local_user))
    
    

    const docRefTutor = db.collection('Teachers').doc(local_user.EmailAddress);
    docRefTutor.get().then((doc)=>{
        if(doc.exists)
        {
            let obj = doc.data().student_request
            let tutor_list = []
                for(let i=0;i<obj.length; i++)
                {
                    tutor = obj.tutors[i]
                    if(tutor.Mode == req.body.Mode && tutor.Location == req.body.Location && tutor.Rating >= req.body.Rating && tutor.Rate <= req.body.Rate && tutor.Experience >= req.body.Experience && tutor.Class >= req.body.Class && tutor.Days >= req.body.Days && tutor.Hours >= req.body.Hours)
                    {
                        tutor_list.push(data.tutors[i])
                    }
                }
                let arr_str = JSON.stringify(tutor_list)
                local_user = JSON.stringify(local_user)
                console.log("local user after stringifying is ", local_user)
                let xx = {"bl":arr_str, "header":local_user};
                res.render("searchResultsTutor",xx)
        }
        else{
            console.log("NOT FOUND")
            res.render("Login")
        }
    })
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
   res.render("searchResultsTutor",xx)
     

})


app.post("/tuitionRequest",(req,res)=>{
    let local_user = req.body.headers;
    local_user = JSON.parse(local_user)
    console.log("local user after parsing is ", local_user)
    let s = JSON.stringify(local_user)
    // console.log(12, req.body.tutor)
    let xx = {"header":s}

    let tutor = req.body.tutor
    // console.log(typeof tutor, Object.keys(tutor), tutor['4'])
    db.collection("Teachers").doc(tutor).update({
        student_request: firebase.firestore.FieldValue.arrayUnion(local_user)
    }).then(()=>{
        db.collection('Students').doc(local_user.EmailAddress).update({
            tutor_request: firebase.firestore.FieldValue.arrayUnion(tutor)
        }).then(()=>{
                    res.render("dashboard", xx)
        }).catch(()=>{
            db.collection('Students').doc(local_user.EmailAddress).set({
            tutor_request: [tutor]
            }).then(()=>{
                        res.render("dashboard", xx)
            });
        })
    });
})



app.post("/tuitionAccept",(req,res)=>{
    // console.log(12, req.body.tutor)
    let local_user = req.body.headers
    local_user = JSON.parse(local_user)

   

    let student = req.body.student

    db.collection("Teachers").doc(local_user.EmailAddress).update({
        // student_request: firebase.firestore.FieldValue.arrayRemove(student),
        student_accepted: firebase.firestore.FieldValue.arrayUnion(student)

    }).then(()=>{
        db.collection('Students').doc(student).update({
            tutor_request: firebase.firestore.FieldValue.arrayRemove(local_user.EmailAddress),
            tutor_accepted: firebase.firestore.FieldValue.arrayUnion(local_user)

        }).then(()=>{

                let sent = JSON.stringify(local_user)
                let xx = {"header":sent}
                res.render("tutorDashboard", xx)
        }).catch(()=>{

            db.collection('Students').doc(student).set({
                tutor_accepted: [local_user]
                
            }).then(()=>{
                        let sent = JSON.stringify(local_user)
                        let xx = {"header":sent}
                        res.render("tutorDashboard", xx)
            });
        })
    }).catch(()=>{
        db.collection("Teachers").doc(local_user.EmailAddress).set({
            student_accepted: [student]
        }).then(()=>{
                    let sent = JSON.stringify(local_user)
                    let xx = {"header":sent}
                    res.render("tutorDashboard", xx)
        });
    })


})



////////////////////rendering login
app.post('/findTutors', (req,res)=>{
    //now u are supposed to get the top 3 tutors from database.
    //store the top 2 in top_2 variable that I am hardcoding for now
    console.log("inside find tutors")
    let local_user = req.body.headers;
    local_user = JSON.parse(local_user);
    console.log("local user is",local_user)
    local_user = JSON.stringify(local_user)
    db.collection("subjects").get().then((snapshot) => {
        let tutor_list = []
        let count = 0
        snapshot.docs.map(doc => {
            let data = doc.data()
            
            
            try{
                let arr_str = JSON.stringify([data.tutors[0]])
            let xx = {
                        "bl":arr_str,
                        "header":local_user

        
                    };
            res.render("SearchResults",xx)
            }
            catch{
                
            }
                
            // }
        })
        })
        
    
// 
})


app.post('/findStudents', (req,res)=>{
    //do a search from the databse and get the top 2 students liveing in the same city as thus particular tutor
    //store the name, department and the bidding price of the top 2 students living in the sam area as a json object like below
    console.log("inside find students")
    let local_user = req.body.headers
    local_user = JSON.parse(local_user)
    //console.log(local_user)

    //console.log(45, global_user.EmailAddress)

    const docRefTutor = db.collection('Teachers').doc(local_user.EmailAddress);
    docRefTutor.get().then((doc)=>{
        if(doc.exists)
        {
            let user_deets = doc.data().student_request
            console.log(user_deets)

            let arr_str = JSON.stringify(user_deets)
            local_user = JSON.stringify(local_user)
            console.log("header after stringifying is", local_user)
            let xx = {"bl":arr_str,"header":local_user};
            res.render("searchResultsTutor",xx)
        }
        else{
            console.log("NOT FOUND")
            res.render("Login")
        }
    })




    
})



app.post('/loginRequest',(req,res)=>{
    
    
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
            // const myBoolean = comparePassword(password, user_deets.Password);
            // CryptoJS.AES.encrypt(password, key)
            if((password) == user_deets.Password)
            {
                //this means passwords match and
                console.log("Passwords match")
                let n_obj = {

                    "Name" :user_deets.Name,
                    "EmailAddress":user_deets.EmailAddress,
                    "PhoneNumber": user_deets.PhoneNumber,
                    "Password":user_deets.Password,
                    "Image":user_deets.Image,
                    "Address": user_deets.Address,
                    "City" : user_deets.City,

                }
                global_user = n_obj;
                console.log(global_user)
                let new_user = JSON.stringify(n_obj)
                let header = {
                    "header":new_user
                }

                res.render("dashboard", header)

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
                        let  n_obj = {
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
                        global_user = n_obj
                        let new_user = JSON.stringify(n_obj)
                        let header = {
                            "header":new_user
                        }
                        
                        res.render("tutorDashboard", header)
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
    let local_user = req.body.headers;
    local_user = JSON.parse(local_user);
    console.log("after parsing in view ", local_user)
    local_user = JSON.stringify(local_user)

    let xx = {"header": local_user}
    console.log("in vw")
    console.log(local_user)
    res.render("viewProfile",xx)
})

// app.post("/delProfile",(req,res)=>{

//     //get the details of the person who is logged in a json object and then send it to the frontend.
//     //hardcodig it for now

//     const docRef = db.collection('Students').doc(global_user.EmailAddress);
//     docRef.delete().then((doc)=>{
//         res.render("home")
//     });

//     console.log("in vw")
//     console.log(global_user)
//     res.render("home")
// })

app.post('/delProfile',(req,res)=>{
    
    //when received login request, check their password from firebase/
    //if the password is good to go 
    //go to dashboard page 
    //get all the firebase stuff and store it in a json object..the details
    // console.log(req.body)
    // let email = req.body["Email"]
    // let password =  req.body["Password"]
    const docRef = db.collection('Students').doc(global_user.EmailAddress);

    docRef.delete().then((doc)=>{
        res.render("home")
            
        }).catch((doc)=>{
            
            const docRefTutor = db.collection('Teachers').doc(global_user.EmailAddress);
            docRefTutor.delete().then((doc)=>{

                res.render("home")
            })
        })
});

app.post("/populateProfile",(req,res)=>{
    res.render("populateProfile")
})


app.post("/publishProfile",(req,res)=>{
    let local_user = req.body.headers;
    local_user = JSON.parse(local_user)
    let new_user = JSON.stringify(local_user)
                let header = {
                    "header":new_user
                }

    console.log(local_user)
    res.render("publishProfile",header)
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
    db.collection('Students').doc(global_user).update({
        jason_obj:global_user
    }).then(()=>{
        console.log("firebase updated");
        res.render("viewProfile", global_user);
    });

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
    console.log("i m busy editing")
    console.log(req.body)
    let local_user = req.body.headers;
    console.log("local user before parsing is ", local_user)
    local_user = JSON.parse(local_user)
    console.log(local_user)
    
    let old_email = local_user['EmailAddress'];
    if(req.body['email'] != local_user['Email']){
        local_user['EmailAddress'] = req.body['email']

    }
    if(req.body['contact'] != local_user['PhoneNumber']){
        local_user['PhoneNumber'] = req.body['contact']

    }
    if(req.body['address'] != local_user['Address']){
        local_user['Address'] = req.body['address']

    }
    if(req.body['city'] != local_user['City']){
        local_user['City'] = req.body['city']

    }

    //let docRef = db.col lection('Teachers').doc(old_email);
    console.log("local user nowwww is", local_user)
   
    
    let stringg = JSON.stringify(local_user)
    let xx = {"header": stringg}
    console.log("old email is ", old_email)
    // docRef.get().then((doc)=>{
        console.log("length is", Object.keys(local_user).length)
        if(Object.keys(local_user).length==11){

            db.collection('Teachers').doc(old_email).update({
                jason_obj:local_user
            }).then(()=>{
                console.log("firebase updated");
                res.render("viewProfile", xx);
            });

        }
        else{
            db.collection('Students').doc(old_email).update({
                jason_obj:local_user
            }).then(()=>{
                console.log("firebase updated");
                res.render("viewProfile", xx);
            });

        }
        
        //get the doc and then 


});




app.post("/login",(req,res)=>{
    
    res.render("Login");
   
});

app.get("/",(req,res)=>{
    console.log(1)
    
    res.render("home");
})

app.get("/RegisterUser",(req,res)=>{
    console.log(1)
    
    res.render("RegisterUser");
})

app.get("/findTutors",(req,res)=>{
    console.log(1)
    
    res.render("findTutors");
})

app.get("/findStudents",(req,res)=>{
    console.log("findStudents")
    
    res.render("findStudents");
})

app.get("/filterTutor",(req,res)=>{
    console.log("/filterTutor")
    
    res.render("filterTutor");
})

app.get("/filter",(req,res)=>{
    console.log("filter")
    
    res.render("filter");
})

app.get("/home",(req,res)=>{
    console.log(2)
    res.render("home");
   
});

app.get("/filterStudent",(req,res)=>{
    console.log(2)
    res.render("filterStudent", global_user)
   
});

app.get("/dashboard",(req,res)=>{
    console.log(2)
    res.render("dashboard", global_user)
   
});



app.get("/publishProfile",(req,res)=>{
    console.log("publishProfile")
    res.render("publishProfile", global_user)
   
});

app.get("/publishTutorProfile",(req,res)=>{
    console.log("/publishTutorProfile")
    res.render("publishProfile");
   
});

app.get("/reviews",(req,res)=>{
    console.log("/reviews")
    res.render("reviews");
    

    //now go to a page that displays all the names of the tutors
    
   
});


app.post("/tutorReviews",(req,res)=>{
    console.log("inside tutor reviews")
    console.log(req.body)
    let headers = JSON.parse(req.body.headers)
    console.log(headers)
    let local_user = headers;
    //now from these headers go to db and get all the doc data
    const docref2 =  db.collection('Teachers').doc(headers.EmailAddress);
    docref2.get().then((doc)=>{
        console.log("tutor's data is ",doc.data())
        let reviews_parsed = JSON.stringify(doc.data().Reviews)
        let tutor_data = {
            "Name" : doc.data().jason_obj.Name,
            "Email" : doc.data().jason_obj.EmailAddress,
            "Reviews":reviews_parsed,
            "Rating" : doc.data().Rating,
            "PreviousExperience":doc.data().PreviousExperience,
            "Location":doc.data().Location,
            "PhoneNumber":doc.data().PhoneNumber,
            "localCity":local_user.City,
            "localEmailAddress":local_user.EmailAddress,
            "localAddress" : local_user.Address,
            "localName":local_user.Name,
            "localPassword":local_user.Password,
            "localImage":local_user.Image,
            "localPhoneNumber":local_user.PhoneNumber

        }
        
        
        res.render("TutorDetails",tutor_data);




    })

})

app.post("/viewReq",(req,res)=>{
    console.log("in view requests")
    console.log("req is", req.body)
    let parsed =req.body.requested;
    
    console.log(parsed)
    let requested_email = parsed.split(":")[0];
    let my_email = parsed.split(":")[1]
    console.log("my email is ", my_email)
    console.log("requested email is", requested_email)
    let local_user = {}
    const docRef = db.collection('Students').doc(my_email);
    docRef.get().then((doc)=>{
        //console.log("doc data is")
        //console.log(doc.data())
        local_user = doc.data().jason_obj
        console.log("local user is ", local_user)
        const docref2 =  db.collection('Teachers').doc(requested_email);
        docref2.get().then((doc)=>{
            console.log("tutor's data is ",doc.data())
            let reviews_parsed = JSON.stringify(doc.data().Reviews)
            let tutor_data = {
                "Name" : doc.data().jason_obj.Name,
                "Email" : doc.data().jason_obj.EmailAddress,
                "Reviews":reviews_parsed,
                "Rating" : doc.data().Rating,
                "PreviousExperience":doc.data().PreviousExperience,
                "Location":doc.data().Location,
                "PhoneNumber":doc.data().PhoneNumber,
                "localCity":local_user.City,
                "localEmailAddress":local_user.EmailAddress,
                "localAddress" : local_user.Address,
                "localName":local_user.Name,
                "localPassword":local_user.Password,
                "localImage":local_user.Image,
                "localPhoneNumber":local_user.PhoneNumber

            }
            
            
            res.render("TutorDetails",tutor_data);




        })
        
        //nowwwwwwwww get the tutor header and display everything to the student



    });

    //set the local user by fetching from backend



    //now i have parsed...

    
    //res.render("reviews");

    //now go to a page that displays all the names of the tutors
    
   
});





app.post("/myTutors", (req,res)=>{
    console.log("in my tutors list")
    let local_user = JSON.parse(req.body.headers)
    console.log("local user is ", local_user);
    let stringy = JSON.stringify(local_user);
    //get the array of documents which contain the tutors of this bacha
    const docRef = db.collection('Students').doc(local_user.EmailAddress);
    docRef.get().then((doc)=>{
            console.log("doc data is")
            console.log(doc.data())

            let arr_tutors = doc.data().tutor_accepted
            //get the emails of all the tutors.
            tutor_emails = []
            already_reviewd = []
            for(let i = 0; i<arr_tutors.length; i= i +1){
                if(arr_tutors[i].Rating == -1){
                    tutor_emails.push(arr_tutors[i].EmailAddress)
                }
                else{
                    let obj = {
                        "tutorEmail": arr_tutors[i].EmailAddress,
                        "review":arr_tutors[i].Reviews,
                        "rating":arr_tutors[i].Rating
                    }
                    already_reviewd.push(obj)
                    tutor_emails.push(arr_tutors[i].EmailAddress)
                }
                

            }
            console.log("array of all emails  is", tutor_emails)
            console.log("array of all reviews done", already_reviewd)
            //now get the headers of all the tutors
            let tutor_headers = [];


            let promise_array = []
            for(t = 0; t < tutor_emails.length; t = t+1){
                
                promise_array.push(db.collection('Teachers').doc(tutor_emails[t]).get());
                

            }


            Promise.all(promise_array).then((values) => {
               
                let len_val = values.length;
                console.log(len_val)
                for(i = 0 ; i<len_val; i = i+1){
                    tutor_headers.push(values[i].data())
                }
                console.log(tutor_headers)
                let string_tutor_headers = JSON.stringify(tutor_headers);
                console.log("string is", string_tutor_headers)
                

                let already_string = JSON.stringify(already_reviewd);
                console.log("already string", already_string)
                console.log("all tutor headers", string_tutor_headers)
                let xx = {
                    "tutorHeaders":string_tutor_headers,
                    "header": stringy,
                    "existingHeaders":already_string
                }
            
            
                res.render("listTutors", xx)


                

            });
            //now u created a promise array


            

    });
    //now create the header obj 
    
})

app.post("/publishTutorProfile",(req,res)=>{
    console.log("/publishTutorProfile")
    let local_user = req.body.headers;
    local_user = JSON.parse(local_user)
    console.log(local_user)
    let new_user = JSON.stringify(local_user)
    let header = {
        "header":new_user
    }
    res.render("populateProfile",header);
   
});

app.get("/populateProfile",(req,res)=>{
    console.log("/populateProfile")
    res.render("populateProfile");
   
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

app.post("/submitReview",(req,res)=>{

    console.log("request for sumitting a review")
    console.log(req.body)
    let review_to_be_added = req.body.review;
    let rating_to_be_added = req.body.rating;
    let my_email = req.body.requested.split(":")[1];
    let tutor_email = req.body.requested.split(":")[0];
    console.log(review_to_be_added)
    console.log(rating_to_be_added)
    console.log(my_email)
    console.log(tutor_email)
    let local_user = {}
    const docRef = db.collection('Students').doc(my_email);
    docRef.get().then((doc)=>{
        //console.log("doc data is")
        //console.log(doc.data())

        //go and set this review in the student's and the teacher's database
        
        const docref2 = db.collection('Teachers').doc(tutor_email)
        docref2.get().then((doc)=>{
            let old_rating = parseInt(doc.data().Rating);
            let old_reviews = doc.data().Reviews;
            console.log("old rating is ", old_rating);
            console.log("old review is ", old_reviews)
            old_rating = parseInt(old_rating);

            let new_rating = (old_rating*(old_reviews.length));
            console.log("rating to be added is",  rating_to_be_added)
            rating_to_be_added = parseInt(rating_to_be_added);
            new_rating = new_rating + rating_to_be_added;
            new_rating = new_rating/(old_reviews.length+1)
            
            old_reviews.push(review_to_be_added);
            let new_reviews = old_reviews;
            //////nwowwwwww update this doc

            db.collection('Teachers').doc(tutor_email).update({
                Reviews:new_reviews,
                Rating:new_rating
        
            }).then(()=>{

                //nowwwww u ave to update the student's records

                db.collection('Students').doc(my_email).get().then((doc)=>{

                    let tutors_accepted = doc.data().tutor_accepted; 
                    console.log("showing u the tutors accepted", tutors_accepted)
                    //go thru the length of this array
                    for(let i = 0; i < tutors_accepted.length; i = i+1){
                        if(tutors_accepted[i].EmailAddress == tutor_email){
                            tutors_accepted[i].Rating =  rating_to_be_added;
                            tutors_accepted[i].Reviews = review_to_be_added;
                            break;
                        }
                    }
                    console.log("tutor accepted after updating is", tutors_accepted)

                    db.collection('Students').doc(my_email).update({
                        tutor_accepted:tutors_accepted,

                        
                
                    }).then(()=>{

                        local_user = doc.data().jason_obj
                        console.log("local user is ", local_user)
                        let new_user = JSON.stringify(local_user)
                        let header = {
                            "header":new_user
                        }
                    
                        res.render("dashboard", header)

                    })






                   

                })

                

            })



            
                //get the doc and the
        })

        
        

});
    //get the 
    
});






app.post('/studentregistration',(req, res, next)=>{
    console.log(4)
    let request_object = req.body
    let email = request_object["Email"]

    let new_user = {
        "Name" : request_object["FirstName"] + " "+ request_object["LastName"],
        "EmailAddress":request_object["Email"],
        "PhoneNumber": request_object["PhoneNumber"],
        "Password": request_object["Password"],
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
                jason_obj:new_user,
                Name: request_object["FirstName"] + " "+ request_object["LastName"],
                EmailAddress: request_object["Email"],
                PhoneNumber: request_object["PhoneNumber"],
                Password: request_object["Password"],
                Image: request_object["Image"],
                Address: "None Added",
                City: "None Added",
                tutor_accepted:[],
                tutor_request: []

                // student_request:[]
            }).then(()=>{
                
                console.log("firebase filled");
                new_user = JSON.stringify(new_user)
                let header = {
                    "header":new_user
                }
                // res.redirect("/home");
                //now the student has registered...
                //make a global user and 
                res.render("dashboard", header)
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
        "Password": request_object["Password"],
        "HighestQualification":request_object["HighestQualification"],
        "BirthDay":request_object["BirthDay"],
        "PreviousExperience":request_object["PreviousExperience"],
        "Transcript":request_object["Transcript"],
        "Image" : request_object["Image"],
        "Address": "None Added",
        "City": "None Added",
        "Rating": 0
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
                jason_obj:new_user,
                Name: request_object["FirstName"] + " "+ request_object["LastName"],
                EmailAddress: request_object["Email"],
                PhoneNumber: request_object["PhoneNumber"],
                Password: request_object["Password"],
                HighestQualification: request_object["HighestQualification"],
                BirthDay: request_object["BirthDay"],
                PreviousExperience: request_object["PreviousExperience"],
                Transcript: request_object["Transcript"],
                Image: request_object["Image"],
                Address: "None Added",
                City: "None Added",
                student_request:[],
                student_accepted:[],
                Rating:0,
                Reviews: []
            }).then(()=>{
                new_user = JSON.stringify(new_user)
                let header = {
                    "header":new_user
                }
                console.log("firebase filled");
                res.render("populateProfile",header);
            });

        }
    });
});



//ASSESSMENTS MODULE
app.post('/studentsAssessments',(req, res, next)=>{
    console.log("in students assessments")
    let obj = {
        "header": req.body.headers
    }
    
    res.render("studentAssessments",obj)

})
app.post('/tutorAssessments',(req, res, next)=>{
    console.log("in tutors assessments")
    console.log(req.body.headers)
    let local_user = JSON.parse(req.body.headers)
    console.log("local user is", local_user)
    let obj = {"header": req.body.headers}

    res.render("tutorAssessments",obj)

})
app.post('/create',(req, res, next)=>{
    console.log("in create assessments")
    console.log(req.body.headers)
    let local_user = JSON.parse(req.body.headers)
    console.log("local user is", local_user)
    //get the bachas of this tutor
    db.collection('Teachers').doc(local_user.EmailAddress).get().then((doc)=>{
        let recipient_ids = doc.data().student_accepted//['eshafatima2001@gmail.com', '123@gmail.com']
        let rec_str = JSON.stringify(recipient_ids)
        console.log("the ids are")
        console.log(rec_str)
        res.render("createAssessments",{"bachey":rec_str, "header":req.body.headers})
    })
    //let recipient_ids = ['eshafatima2001@gmail.com', '123@gmail.com']
    


})

app.post('/todoAssessments',(req, res, next)=>{
    console.log("in to do assessments")
    //now at backend we need to see which are the assessments for this particular student who sent us the request
    //we are going to iterate over all possible emails
    //now at backend iterate through to do assessments to do and get docs via ur emaillll 
    //then 
    let local_user = JSON.parse(req.body.headers)
    console.log("local user is", local_user)
    let assessment_headers = []
    const docRef = db.collection('TodoAssessments');
    console.log("email is ", local_user.EmailAddress)
    docRef.where('id', '==', local_user.EmailAddress).get().then((value)=>{
        
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

        let obj_to_be_sent = {"headers":str_array, "header":req.body.headers}
        res.render("todoAssessments", obj_to_be_sent)



    });
    
    //return;
  

})

app.post('/startAssessment',(req, res, next)=>{

    console.log("in start assessments")
    console.log("body is", req.body)
    console.log(req.body.assessment_details)
    let assessment_header = JSON.parse(req.body.assessment_details);
    console.log("assessment to start is ", assessment_header)
    assessment_header["my_email"] = JSON.parse(req.body.headers).EmailAddress 
    let stringified = JSON.stringify(assessment_header)
    console.log("final assignment content is ", stringified)
    res.render("startAssessment",{"assessment_content":stringified})


})
app.post('/gradeRequest',(req,res,next)=>{
    console.log("in grade request")
    console.log(req.body)
    let assessment_content = JSON.parse(req.body.assessment_details)
    console.log("assessment content after parsing is ", assessment_content)
    //now that u have all this data render it to the screen
    res.render("grader", {"assessment_content":req.body.assessment_details})
})

app.post('/gradingDone',(req,res,next)=>{
    console.log("in grading done")
    console.log(req.body)
    let points_arr = req.body.student_points
    let total_points = 0
    let points_string = ""
    for(let i = 0; i<points_arr.length; i = i+1){
        points_string = points_string +"-"+points_arr[i].toString()
        total_points = total_points + parseInt(points_arr[i])

    }
    points_string = points_string + "-" + total_points
    console.log("points string is ", points_string)
    points_string = points_string.substring(1)
    console.log(points_string)

    let parsed = JSON.parse(req.body.submit_button)
    console.log("parsed is", parsed)
    let student_id = parsed.student_id;
    let key = student_id + " " + parsed.assessment_details.creator_email
    //now find the one with this key and change the score and grade status only
    const docRef = db.collection('PastAssessments');
    db.collection('PastAssessments').doc(key).update({
        score:points_string,
        grade_status:"Graded"

    }).then(()=>{
        
        db.collection('Teachers').doc(parsed.assessment_details.creator_email).get().then((doc)=>{
            let local_user = doc.data().jason_obj;
            local_user = JSON.stringify(local_user)
            console.log("local user in grading done", local_user)
            res.render("tutorAssessments", {"header":local_user});


        })
        
    })

    
    
    
})





app.post('/pastAssessments',(req,res,next)=>{
    console.log("in past assessments")
    let assessment_headers = []
    let local_user = JSON.parse(req.body.headers);
    console.log(local_user)
    const docRef = db.collection('PastAssessments');
    console.log("email is ", local_user.EmailAddress)
    docRef.where('student_id', '==', local_user.EmailAddress).get().then((value)=>{

            value.forEach(doc=>{
                console.log(doc.id, '=>', doc.data());
                let doc_obj = {
                    "assessment_details" : doc.data().assessment_details,
                    "grade_status": doc.data().grade_status,
                    "score": doc.data().score,
                    "student_id": doc.data().student_id,
                    "submission_time": doc.data().submission_time
                }
                //let stringified_obj = JSON.stringify(doc_obj);
                assessment_headers.push(doc_obj);

           
            


        })
        //now stringify the assessment headers array
        let stringified_arr = JSON.stringify(assessment_headers)
        console.log(stringified_arr)
        
        res.render("pastAssessments", {"headers":stringified_arr, "header":req.body.headers})


    })
    //make a call to database where the student id is mineeee
    //get all of those docsss

    //now in past assessments we need to 
})

app.post('/submitAssessmentRequest',(req, res, next)=>{
    console.log("in submit assessments")
    console.log(req.body)
    
    let submission_time = new Date().toDateString()
    console.log("submission time is ", submission_time)
    console.log(req.body)
    
    let assessment_header = JSON.parse(req.body.submit_button)
    let user_email = assessment_header.my_email;
    console.log("my email is", user_email)
    
   
    let p_key = user_email + " " + assessment_header.creator_email
    console.log("pkey is", p_key)
    //save in past_assessments
    const docRef = db.collection('PastAssessments').doc(p_key);
    docRef.get(p_key).then((doc)=>{
        if(doc.exists){
            console.log("already doneee exists");

            db.collection('Students').doc(user_email).get().then((doc)=>{
                let local_user = doc.data().jason_obj;
                local_user = JSON.stringify(local_user)
                res.render("studentAssessments", {"header":local_user});


            })

            

        }
        else{
            //process the answers to the questionsssss
            let answers_arr = []
            console.log("reqq body text is ",req.body.question_text)
            for(let x = 0; x< req.body.question_text.length; x = x+1){
                let ans = req.body.question_text[x];
                let ans_arr = ans.split(' ')
                let dashed_ans = ans_arr.join('-')
                answers_arr.push(dashed_ans)
            }
            
            console.log("answers array is ", answers_arr)
            db.collection('PastAssessments').doc(p_key).set({
                assessment_details:assessment_header,
                student_id :user_email,
                submission_time: submission_time, 
                answers: answers_arr,
                grade_status: "Pending",
                score : "Pending",  
            }).then(()=>{
                console.log("added to past assessments")
                //now redirect the user to the pageeee
                db.collection('Students').doc(user_email).get().then((doc)=>{
                    let local_user = doc.data().jason_obj;
                    local_user = JSON.stringify(local_user)
                    res.render("studentAssessments", {"header":local_user});
    
    
                })
    

                

            })
            
            


        }
    })
    //there will be creator email
    //there will be bacha's email
    //there will be answers to the questions.
    //there will be full assignment content
    //there will be submission date also
    //make sure it is visible in past assessments, pending status and redirect to students assessment


})


app.post('/grade',(req, res, next)=>{
    
    console.log("in grade assessments")
    console.log(req.body)
    let local_user = req.body.headers
    // u can pull the email of the person who sent this request
    
    let email_tutor = JSON.parse(req.body.headers).EmailAddress
    console.log(email_tutor)
    // now make a caa
    
    const docRef = db.collection('PastAssessments');
    let assessment_headers = []
    docRef.get().then((val)=>{
        console.log("found all docs")
        val.forEach((doc)=>{
           // console.log(doc.data())
            let email_extracted = doc.data().assessment_details.creator_email
            if(email_extracted == email_tutor){
                //this means it is my assessment so push it into assessment headers array
                assessment_headers.push(doc.data())
                

            }
        })
        console.log("assessment headers array is ")
        //now u have the assessment headers which will store all assessments that are created by the oerson submitting request for grading
        console.log(assessment_headers)
        //now u have to stringify this array and send it as an object
        let stringified_arr = JSON.stringify(assessment_headers)
        res.render("gradeAssessments", {"headers":stringified_arr, "header":req.body.headers})
        

        

    })

})







app.post('/createAssessmentRequest',(req, res, next)=>{
    console.log("in create assessments request")
    console.log(req.body)
    let n_req_params = Object.keys(req.body).length
    let recipients_list = []
    console.log("nparams is", n_req_params)

    for(let x = 6; x<n_req_params-4; x=x+1){
        recipients_list.push(Object.keys(req.body)[x])
        console.log("added")
    }
    //get the intended recipients of the assessments
    //generate a random assessmentid
    console.log(recipients_list)
    let local_user = JSON.parse(req.body.headers)
    /////CHANGE THIS AND USE FIREBASE TOO GENERATE THE ASSESSMENT ID COZ SERVER MAY START AGAINNNN
    let assessmentid = n_assessments + 1;
    n_assessments = n_assessments + 1;
    //add dashes to each question text entry
    let len = req.body.question_text.length
    console.log("len is ", len)
    let arr_qt = []
    for(let ff = 0;  ff<req.body.question_text.length; ff = ff+1){
        let txt = req.body.question_text[ff];
        console.log("txt is ", txt)
        txt = txt.split(" ");
        txt = txt.join('-')
        arr_qt.push(txt)
    }

    //we need to convert the creator name to dash separated form also
    let creator_name_arr = local_user.Name.split(" ")
    let creator_name = creator_name_arr.join('-')
    console.log("arrqt is", arr_qt)
    
    console.log("generated id is ", assessmentid)
    let assessment_obj = {  "id" : assessmentid.toString(),
                            "creator_email": local_user.EmailAddress,
                            "creator_name" : creator_name,
                            "Subject":req.body.Subject,
                            "Syllabus":req.body.Syllabus,
                            "TotalPoints": req.body.total_points,
                            "PublishDate":req.body.publishDate,
                            "PublishTime":req.body.publishTime,
                            "Minutes":req.body.minutes,
                            "QuestionPoints":req.body.question_points,
                            "QuestionMinutes":req.body.question_minutes,
                            "QuestionText":arr_qt,
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
                    let key = recipients_list[j] +" "+local_user.EmailAddress;
                    
                    promise_list.push(db.collection('TodoAssessments').doc(key).set({

                        assessment_details:assessment_obj,
                        id:recipients_list[j]
                    }))
                   

                }
                console.log("promise list",promise_list);
                //now when ur doneee only then redirect
                Promise.all(promise_list).then((values) => {
                    let obj = {"header": req.body.headers}
                    res.render("tutorAssessments",obj);

                });
                



                
            });

        }
    });



})









server.listen(port, '0.0.0.0', ()=>{ // '0.0.0.0' is for running via docker only
     console.log("Server has started on port 3000");
});