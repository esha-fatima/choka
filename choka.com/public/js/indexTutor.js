console.log("hereeeeeeee")
let chat_identifier = document.getElementById("cc").value;
let send_button = document.getElementById("send");
let message_typed = document.getElementById("text");
console.log("in index tutor chat id is", chat_identifier)



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
    console.log("in index tutor chat id is", chat_identifier)

    if(rec_id == chat_identifier){
        //check if the receiving email address is mine
        //to get the receiving email address..split on space and get the zeroth index waala element
        
        let arr = chat_identifier.split(' ')
        let my_email = arr[1]
        
        let rec_id_arr = rec_id.split(" ")
        console.log("recid array for tutor issss", rec_id_arr)
        let intended_recipient = rec_id_arr[1]
        console.log("my email is ", my_email)
        console.log("intended recipient is", intended_recipient)
        if(sender != my_email){
            document.getElementById("add").innerHTML   = document.getElementById("add").innerHTML + '<div class="container darker"><p>'+mesg_actual+'</p></div>'

        }
        

        
        
        
    }
    

    
    
})




function sender(){
    let val = message_typed.value;
    message_typed.value = "";
    let chat_identifier2 = send_button.value;
    console.log("message typed is", val);
    console.log(chat_identifier2)
    let arr = chat_identifier2.split('/')
    console.log("arr is", arr)
    let my_email = arr[1]
    //chat_identifier = arr.join(' ')
    let xx = arr[0]+ " "+my_email
    document.getElementById("add").innerHTML   = document.getElementById("add").innerHTML + '<div class="container"><p>'+val+'</p></div>'
    //adj.innerHTML = adj.innerHTML + '<input id = "text" name = "typed_text" class="v44_227_chat" placeholder="Type message"/> <button id = "send">Send</button>'
    val = val+ "_" +xx+ "_" + my_email
    console.log("val is", val)
    socket.emit("sendMessage",val)
}
