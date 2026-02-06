const msgbar = document.querySelector('.msgbar')
const send = document.querySelector('.send')
const userheading = document.querySelector('.username')
const roomdom = document.querySelector('.group')
const inputbox = document.querySelector('.inputbox input')

// thirdparty functions
function JSONlike(type, message){
    let obj = {'type': type, 'message': message}
    return JSON.stringify(obj)
}
// input
function sendmsg(){
    if(!(inputbox.value === '')){
        ws.send(JSONlike('chat', inputbox.value))
        inputbox.value = ''
    }
}
send.addEventListener('click', ()=>{
    sendmsg()
})
document.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
        if(document.activeElement === inputbox){
            sendmsg()
        }
    }
})

// connecting to the websocket
const ws = new WebSocket('ws://localhost:8080')
// room
const room = prompt('What room you wanna be?') || 'Anonymous'
roomdom.textContent = room


ws.onopen = ()=>{
    ws.send(JSONlike('room', room))

    let username;
    ws.onmessage = (event)=>{
        let msg = JSON.parse(event.data)
        if(msg.type === 'username'){
            username = msg.message
            userheading.textContent = username
        }
        if(msg.type === 'chat'){
             let now = new Date();
             
             // Format date as YYYY/MM/DD - HH:MM
             let year = now.getFullYear();
            let month = String(now.getMonth() + 1).padStart(2, '0'); // months start at 0
            let day = String(now.getDate()).padStart(2, '0');
            let hours = String(now.getHours()).padStart(2, '0');
            let minutes = String(now.getMinutes()).padStart(2, '0');
            
            let timestamp = `${year}/${month}/${day} - ${hours}:${minutes}`;
            
            let [chat,OS,usn] = msg.message
            // 1. Create the outer div with class "message self"
            let messageDiv = document.createElement('div');
            messageDiv.className = `message ${OS}`;

            // 2. Create inner div
            let innerDiv = document.createElement('div');
            
            // 3. Create the <p> elements
            let msgP = document.createElement('p');
            msgP.className = 'msg';
            msgP.textContent = chat;
            
            let userP = document.createElement('p');
            userP.className = 'user';
            userP.textContent = usn;
            
            let timeP = document.createElement('p');
            timeP.className = 'time';
            timeP.textContent = timestamp;
            
            // 4. Append <p> elements to inner div
            innerDiv.appendChild(msgP);
            innerDiv.appendChild(userP);
            innerDiv.appendChild(timeP);
            
            // 5. Append inner div to outer div
            messageDiv.appendChild(innerDiv);
            
            // 6. Append the messageDiv to some container in your page
            const chatContainer = document.getElementById('chat'); // your chat wrapper
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
        }
        if(msg.type === 'system'){
            const chatContainer = document.getElementById('chat'); // your chat wrapper
            let system = document.createElement('p')
            system.className = 'system'
            
            let spanSystem = document.createElement('span')
            spanSystem.className = 'span'
            spanSystem.textContent = msg.message
            system.appendChild(spanSystem)
            chatContainer.appendChild(system)
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        // <p class="system"><span class="span">GrumpyCoach Joined in</span></p> 
    }
}