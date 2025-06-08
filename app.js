const express = require('express')
const http = require('http')
const Server = require('socket.io').Server
const Connection = require('./db.js')
const mongoose = require("mongoose")
const Chat = require('./models/Chat.js')
const { timeStamp } = require('console')

require('dotenv').config();

const app = express()
app.use(express.json())
Connection()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

io.on("connection", (socket) => {
    console.log("connected");

    const loadMessages = async () => {
        try {
            const messages = await Chat.find().sort({timeStamp : 1}).exec();
            socket.emit('chat', messages)
        } catch(err) {
            console.log(err)
        }
    }
    loadMessages();

    socket.on('saveBotMessage', async (msg) => {
    try {
        const botMessage = new Chat(msg);
        await botMessage.save();
        io.emit('message', msg); 
    } catch (err) {
        console.log(err);
    }
});

    socket.on('newMessage', async (msg) => {
        try {
            const newMessage = new Chat(msg)
            await newMessage.save()
            io.emit('message', msg)
        }catch(err) {
            console.log(err)
        }
    })

    socket.on("disconnect", () => {
        console.log("disconnect")
    })
})




server.listen("3002", () => {
    console.log("running on 3002 port")
})




const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


app.use(express.static('public'));

const YOUR_DOMAIN = 'http://localhost:4242';

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
       
        price: 'price_1RWhZBPGe2zcReUSK8sTHneX',
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });

  res.redirect(303, session.url);
});

app.listen(4242, () => console.log('Running on port 4242'));