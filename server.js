const Websocket = require('ws')
const PORT = process.env.PORT || 8080
const wss = new Websocket.Server({port:PORT})

const usednames = []
const rooms = new Map()
function generateNames(){
    const names = [
    "Adam", "Lincoln", "Noah", "Ethan", "Lucas", "Oliver", "Henry", "Samuel",
    "Jack", "Leo", "Caleb", "Owen", "Nathan", "Isaac", "Daniel", "Matthew",
    "Aaron", "Elijah", "Theodore", "Benjamin", "Miles", "Julian", "Alexander",
    "William", "Thomas", "Joseph", "Andrew", "Christopher", "Nicholas", "Ryan",
    "Dylan", "Logan", "Carter", "Evan", "Wesley", "Jonathan", "Marcus", "Charles",
    "Arthur", "Patrick", "George", "Victor", "Edward", "Paul", "Simon", "Peter",
    "Stephen", "Michael", "Robert", "Kevin", "Brandon", "Jason", "Scott",
    "Trevor", "Colin", "Jeremy", "Ian", "Keith", "Russell", "Brian", "Philip",
    "Raymond", "Sean", "Eric", "Dennis", "Frank", "Howard", "Bruce", "Alan",
    "Martin"
    ];

    let username;
    do{
        username = names[Math.floor(Math.random() * names.length)] +
        names[Math.floor(Math.random() * names.length)] +
        String(Math.floor(Math.random() * 10000))
    }while(usednames.includes(username))

    usednames.push(username)
    return username

}
function sendmessage(ws, type, othermessage, selfmessage, rooms){
    const roomwithoutsender = new Set([...rooms.get(ws.room)].filter(client => client !== ws))
    if(othermessage){
        for (let client of roomwithoutsender){
            client.send(JSONlike(type, othermessage/*[message.message, 'other', ws.username]*/))
        }
    }
    if(selfmessage){
        ws.send(JSONlike(type, selfmessage/*[message.message, 'self', ws.username]*/))
    }
    console.log('msg sent')
}
function JSONlike(type, message){
    let obj = {'type': type, 'message': message}
    return JSON.stringify(obj)
}
wss.on('connection', (ws)=>{
    ws.username = generateNames()
    console.log(`A client connected: ${ws.username}`)
    ws.send(JSONlike('username', ws.username))
    
    ws.on('message', (message)=>{
        message = JSON.parse(message.toString())
        console.log(message)
        if(message.type == 'room'){
            ws.room = message.message
            if(rooms.has(ws.room)){
                rooms.get(ws.room).add(ws)
                sendmessage(ws, 'system', `${ws.username} joined the chat`, `You joined the room, ${ws.room}`,rooms)
            }else{
                rooms.set(ws.room, new Set())
                console.log('Room Created')
                sendmessage(ws, 'system', '', `You created the room, ${ws.room}`,rooms)
                rooms.get(ws.room).add(ws)
            }
        }
        if(message.type == 'chat'){
            if(ws.room && rooms.has(ws.room)){
                sendmessage(ws, 'chat', [message.message, 'other', ws.username], [message.message, 'self', ws.username],rooms)
            }
        }
    })
    
    ws.on('close', ()=>{
        console.log(`client disconnected: ${ws.username}`)
        sendmessage(ws, 'system', `${ws.username} exited from the chat`, '',rooms)
        if(ws.room &&  rooms.has(ws.room)){
            rooms.get(ws.room).delete(ws)
            console.log('Client exited from the group ' + ws.room)
            if(rooms.get(ws.room).size === 0){
                rooms.delete(ws.room)
                console.log(ws.room + ' has deleted')
            }
        }
    })
})