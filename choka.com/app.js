//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require("helmet");
const ejs = require("ejs");
const _= require("lodash");
const firebase = require("firebase");
const cookieParser = require('cookie-parser');
const { exec } = require("child_process");
const { execPath } = require("process");
// const bcrypt = require('bcrypt')
// const CryptoJS = require("crypto-js")
// import { FacebookAuthProvider } from "firebase/auth";
// require("firebase/firestore");
// import fire from "./fire";
const key = "choka.com"
const app = express();

const port = process.env.PORT || 3000

// allow the app to use cookieparser
// app.use(helmet());

// allow the app to use cookieparser
app.use(cookieParser());

app.set('view engine','ejs');

let global_user = ""

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



app.post('/filter',(req,res)=>{

     res.render("filter")
})

app.get('/searchRequest',(req,res)=>{

    res.render('/searchRequest')
})


app.post('/searchRequest',(req,res)=>{
    db.collection("subjects").get().then((snapshot) => {
        snapshot.docs.map(doc => {
            let data = doc.data()
            if(doc.id == req.body.Subject)
            {
                console.log(data.tutors)
                let arr_str = JSON.stringify(data.tutors)
                let xx = {"bl":arr_str};
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
    let obj1 =  {'Name': 'Student1', 'Subject': 'Physics', 'Experience': '3', 'Rating':'4.0', 'Image': 'xx'}
    let obj2 =  {'Name': 'Student2', 'Subject': 'Sociology', 'Experience': '2', 'Rating':'1.0', 'Image': 'xx'}
    let obj3 = {'Name': 'Student3', 'Subject': 'English', 'Experience': '6', 'Rating':'4.0', 'Image': 'xx'}
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
    console.log("/filterRequestT", global_user)
    global_user["Rate"]=req.body.Rate,
    global_user["Days"]=req.body.Days,
    global_user["Location"]=req.body.Location,
    global_user["Classes"]=req.body.Class,
    global_user["Subject"]=req.body.Subject,
    global_user["Mode"]=req.body.Mode,
    global_user["Hours"]=req.body.Hours,
    global_user["Experience"]=req.body.Experience
    
    db.collection("Teachers").doc(global_user.EmailAddress).update({
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
                tutors: firebase.firestore.FieldValue.arrayUnion(global_user)
            }).then(()=>{
                        res.render("tutorDashboard", global_user)
            }).catch(()=>{
                db.collection('subjects').doc(req.body.Subject).set({
                    tutors: [global_user]
                }).then(()=>{
                            res.render("tutorDashboard", global_user)
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
    console.log("/filterRequest", global_user)
    global_user["Pay"]=req.body.Pay,
    global_user["Days"]=req.body.Days,
    global_user["Location"]=req.body.Location,
    global_user["Classes"]=req.body.Class,
    global_user["Subject"]=req.body.Subject,
    global_user["Mode"]=req.body.Mode,
    global_user["Hours"]=req.body.Hours,

    db.collection("Students").doc(global_user.EmailAddress).update({
        Pay:req.body.Pay,
        Days:req.body.Days,
        Location:req.body.Location,
        Classes:req.body.Class,
        Subject:req.body.Subject,
        Mode:req.body.Mode,
        Hours:req.body.Hours,
        // Experience:req.body.Experience
    }).then(()=>{
        res.render("dashboard", global_user)
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
    console.log("/filterStudent", global_user)

    const docRefTutor = db.collection('Teachers').doc(global_user.EmailAddress);
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
                let xx = {"bl":arr_str};
                res.render("searchResultsTutor",xx)
        }
        else{
            console.log("NOT FOUND")
            res.render("Login")
        }
    })
})


app.post('/filterFromTutor',(req,res)=>{
    let obj1 =  {'Name': 'Student1', 'Subject': 'Physics', 'Experience': '3', 'Rating':'4.0', 'Image': 'xx'}
    let obj2 =  {'Name': 'Student2', 'Subject': 'Sociology', 'Experience': '2', 'Rating':'1.0', 'Image': 'xx'}
    let obj3 = {'Name': 'Student3', 'Subject': 'English', 'Experience': '6', 'Rating':'4.0', 'Image': 'xx'}
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
    // console.log(12, req.body.tutor)
    console.log("/tuitionRequest", global_user)

    let tutor = req.body.tutor
    // console.log(typeof tutor, Object.keys(tutor), tutor['4'])
    db.collection("Teachers").doc(tutor).update({
        student_request: firebase.firestore.FieldValue.arrayUnion(global_user)
    }).then(()=>{
        db.collection('Students').doc(global_user.EmailAddress).update({
            tutor_request: firebase.firestore.FieldValue.arrayUnion(tutor)
        }).then(()=>{
                    res.render("dashboard", global_user)
        }).catch(()=>{
            db.collection('Students').doc(global_user.EmailAddress).set({
            tutor_request: [tutor]
            }).then(()=>{
                        res.render("dashboard", global_user)
            });
        })
    });
})

// app.get("/tuitionRequest",(req,res)=>{
//     console.log(12, req.body.tutor)
//     res.render("dashboard",global_user)
// })

app.post("/tuitionAccept",(req,res)=>{
    // console.log(12, req.body.tutor)
    console.log("/tuitionAccept", global_user)

    let student = req.body.student

    db.collection("Teachers").doc(global_user.EmailAddress).update({
        // student_request: firebase.firestore.FieldValue.arrayRemove(student),
        student_accepted: firebase.firestore.FieldValue.arrayUnion(student)

    }).then(()=>{
        db.collection('Students').doc(student).update({
            tutor_request: firebase.firestore.FieldValue.arrayRemove(global_user.EmailAddress),
            tutor_accepted: firebase.firestore.FieldValue.arrayUnion(global_user)

        }).then(()=>{


                res.render("tutorDashboard", global_user)
        }).catch(()=>{
            db.collection('Students').doc(student).set({
                tutor_accepted: [global_user]
                
            }).then(()=>{
                        res.render("tutorDashboard", global_user)
            });
        })
    }).catch(()=>{
        db.collection("Teachers").doc(global_user.EmailAddress).set({
            student_accepted: [student]
        }).then(()=>{
                    res.render("tutorDashboard", global_user)
        });
    })

// app.get("/tuitionAccept",(req,res)=>{
//     console.log(12, req.body.tutor)
//     res.render("tutorDashboard",global_user)
})



////////////////////rendering login
app.post('/findTutors', (req,res)=>{
    //now u are supposed to get the top 3 tutors from database.
    //store the top 2 in top_2 variable that I am hardcoding for now
    
    db.collection("subjects").get().then((snapshot) => {
        let tutor_list = []
        let count = 0
        snapshot.docs.map(doc => {
            let data = doc.data()
            
            // if(doc.id == "Mathematics D")
            // {
                // count +=1
                // tutor_list.push(data.tutors[0])
            // }    
            // else if(doc.id == "English Language")
            // {
            //     count +=1
            //     tutor_list.push(data.tutors[0])
            // }      
            
            // if (count==2)
            // {
            try{
                let arr_str = JSON.stringify([data.tutors[0]])
            let xx = {"bl":arr_str};
            res.render("SearchResults",xx)
            }
            catch{
                
            }
                
            // }
        })
        })
        
    // db.collection("subjects").get().then((snapshot) => {
    //     let Name_one = ""
    //     let Department_one = ""
    //     let Email_one = ""
    //     let Img_one = ""
    //     let Name_two = ""
    //     let Department_two = ""
    //     let Email_two = ""
    //     let Img_two = ""
    //     let count  = 0
    //     snapshot.docs.map(doc => {
    //         let data = doc.data()
    //         // console.log(doc.id, Object.keys(data))
    //         // console.log(doc.id, typeof doc.id)
    //         if(doc.id == "Mathematics D")
    //         {
    //             // console.log(doc.id, typeof doc.id)
    //             count +=1
    //             // console.log(123, data.tutors[0].Name)
    //             Name_one = data.tutors[0].Name
    //             Department_one = data.tutors[0].Subject
    //             Email_one = data.tutors[0].EmailAddress
            //     Img_one = data.tutors[0].Image
            // }
            // if(doc.id == "English Language")
            // {
            //     console.log(doc.id, typeof doc.id)
            //     count +=1
            //     // console.log(11, data[ 'tutors' ])
            //     Name_two = data.tutors[0].Name
            //     Department_two = data.tutors[0].Subject
            //     Email_two = data.tutors[0].EmailAddress
            //     Img_two = data.tutors[0].Image
            // }



            // if (count==2)
            // {
            //     console.log(22, Name_one)
            //     let top_2_students = 
            //     {
            //         "Name_one": Name_one,
            //         "Department_one": Department_one,
            //         "Email_one" : Email_one,
    //                 "Img_one": Img_one,
    //                 "Name_two" : Name_two,
    //                 "Department_two" :  Department_two,
    //                 "Email_two": Email_two,
    //                 "Img_two": Img_two,

    //             }
    //             res.render("findTutors", top_2_students)
    //         }            
    //     })
    
    // });
// 
})


app.post('/findStudents', (req,res)=>{
    //do a search from the databse and get the top 2 students liveing in the same city as thus particular tutor
    //store the name, department and the bidding price of the top 2 students living in the sam area as a json object like below
    console.log(45, global_user.EmailAddress)

    const docRefTutor = db.collection('Teachers').doc(global_user.EmailAddress);
    docRefTutor.get().then((doc)=>{
        if(doc.exists)
        {
            let user_deets = doc.data().student_request
            console.log(user_deets)

            let arr_str = JSON.stringify(user_deets)
            let xx = {"bl":arr_str};
            res.render("searchResultsTutor",xx)
        }
        else{
            console.log("NOT FOUND")
            res.render("Login")
        }
    })




    // db.collection("Teacher").doc(global_user.EmailAddress).get().then((snapshot) => {
    //     console.log(45, Object.keys(snapshot.data()))
    //     let students = snapshot.data().student_request;
    //     if (students.length >= 2)
    //     {
    //         let top_2_students = 
    //         {
    //             "Name_one": students[0].name,
    //             "Department_one": students[0].subject,
    //             "Bid_one" : students[0].bid,
    //             "Name_two" : students[1].name,
    //             "Department_two" : students[1].subject,
    //             "Bid_two": students[1].bid
                
        
    //         }
    //         res.render("findStudents", top_2_students)

    //     }
    //     else if (students.length == 1)
    //     {
    //         let top_2_students = 
    //         {
    //             "Name_one": students[0].name,
    //             "Department_one": students[0].subject,
        //         "Bid_one" : students[0].bid,
        //         "Name_two" : undefined,
        //         "Department_two" : undefined,
        //         "Bid_two": undefined
                
        
        //     }
        //     res.render("findStudents", top_2_students)

        // }
        // else
        // {
        //     let top_2_students = 
        //     {
        //         "Name_one": undefined,
        //         "Department_one": undefined,
        //         "Bid_one" : undefined,
        //         "Name_two" : undefined,
        //         "Department_two" : undefined,
//                 "Bid_two": undefined
                
        
//             }
//             res.render("findStudents", top_2_students)
//         }
//     });
})

// async function comparePassword(p1, p2)
// {
//     try
//     {
//         const bool = await bcrypt.Encrypt.comparePassword(p1, p2)
//         return bool
//     }
//     catch
//     {
//         return null
//     }

// }

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
   
});

app.post("/publishTutorProfile",(req,res)=>{
    console.log("/publishTutorProfile")
    res.render("publishProfile");
   
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
                // res.redirect("/home");
                res.render("dashboard", global_user)
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
                Rating:0
            }).then(()=>{
                console.log("firebase filled");
                res.redirect("/populateProfile");
            });

        }
    });
});

// Save encryoted password
// Sing up
// Find Tutor

app.listen(port, '0.0.0.0', ()=>{ // '0.0.0.0' is for running via docker only
     console.log("Server has started on port 3000");
});
