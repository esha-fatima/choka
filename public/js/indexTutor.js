console.log("hereeeeeeee")
let chat_identifier = ""
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
    let rec_id = msg_split.pop()
    let mesg_actual = msg_split[0]
    if(rec_id == chat_identifier){
        //check if the receiving email address is mine
        //to get the receiving email address..split on space and get the zeroth index waala element
        let chat_identifier = send_button.value;
        let arr = chat_identifier.split('/')
        let my_email = arr[1]
        let rec_id_arr = rec_id.split(" ")
        let intended_recipient = rec_id_arr[1]
        console.log("my email is ", my_email)
        //console.log("intended recipient is", intended_recipient)
        if(intended_recipient == my_email){
            document.getElementById("add").innerHTML   = document.getElementById("add").innerHTML + '<div class="container darker"><p>'+mesg_actual+'</p></div>'

        }
        

        
        
        
    }
    

    
    
})




function sender(){
    let val = message_typed.value;
    let chat_identifier = send_button.value;
    console.log("message typed is", val);
    console.log(chat_identifier)
    let arr = chat_identifier.split('/')
    let my_email = arr[1]
    chat_identifier = arr.join(' ')
    document.getElementById("add").innerHTML   = document.getElementById("add").innerHTML + '<div class="container"><p>'+val+'</p></div>'
    //adj.innerHTML = adj.innerHTML + '<input id = "text" name = "typed_text" class="v44_227_chat" placeholder="Type message"/> <button id = "send">Send</button>'
    val = val+ "_" + chat_identifier + "_" + my_email
    socket.emit("sendMessage",val)
}
