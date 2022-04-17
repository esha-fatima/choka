console.log("hereeeeeeee")
let chat_identifier = document.getElementById("cc").value;
console.log("i am in index and chat id is", chat_identifier)
let send_button = document.getElementById("send");
let message_typed = document.getElementById("text");



send_button.addEventListener("click", sender);
const socket = io();
socket.on('chatidentifier',message=>{
    console.log(message)
    chat_identifier = message
    //u know what is the chat identifier
    
})

socket.on('someMessage',message=>{
    console.log("message_rec", message)
    let msg_split = message.split('_')
    let rec_id = msg_split[1]
    let mesg_actual = msg_split[0]
    let sender = msg_split[2]
    
    
    console.log(rec_id)
    console.log(chat_identifier)
    if(rec_id == chat_identifier){
        //check if the receiving email address is mine
        //to get the receiving email address..split on space and get the zeroth index waala element
        //let chat_identifier = send_button.value;
        let arr = chat_identifier.split(' ')
        let my_email = arr[0]
        
        
        
        if(sender != my_email){
           
            
            document.getElementById("add").innerHTML   = document.getElementById("add").innerHTML + '<div class="container darker"><p>'+mesg_actual+'</p></div>'

        }
        

        
        
        
    }
    

    
    
})




function sender(){
    let val = message_typed.value;
    let chat_identifier2 = send_button.value;
    console.log("message typed is", val);
    console.log(chat_identifier2)
    let arr = chat_identifier2.split('/')
    console.log("arr is", arr)
    let my_email = arr[0]
    //chat_identifier2 = arr.join(' ')
    let xx = my_email+ " "+ arr[1]
    document.getElementById("add").innerHTML   = document.getElementById("add").innerHTML + '<div class="container"><p>'+val+'</p></div>'
    //adj.innerHTML = adj.innerHTML + '<input id = "text" name = "typed_text" class="v44_227_chat" placeholder="Type message"/> <button id = "send">Send</button>'
    val = val+ "_" + xx + "_" + my_email
    console.log("val in stu is", val)
    socket.emit("sendMessage",val)
}
