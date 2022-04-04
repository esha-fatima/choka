//let text = '["{"Name":"Rose Dunhill","Subject":"Physics","Experience":"3","Rating":"4.0","Image":"xx"}","{"Name":"William Jonas","Subject":"Sociology","Experience":"2","Rating":"1.0","Image":"xx"}","{"Name":"Sherry","Subject":"English","Experience":"6","Rating":"4.0","Image":"xx"}"]';
let obj1 = JSON.stringify( {"Name": "Rose Dunhill", "Subject": "Physics", "Experience": "3", "Rating":"4.0", "Image": "xx"})
     let obj2 = JSON.stringify( {"Name": "William Jonas", "Subject": "Sociology", "Experience": "2", "Rating":"1.0", "Image": "xx"})
     let obj3 = JSON.stringify({"Name": "Sherry", "Subject": "English", "Experience": "6", "Rating":"4.0", "Image": "xx"})
     let results_array = [
        obj1, obj2, obj3
        ]
    let ff = JSON.stringify(results_array)

const myArr = JSON.parse(ff);
const xx = JSON.parse(myArr[0]);
console.log(xx.Name)