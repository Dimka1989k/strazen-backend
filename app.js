const express = require('express');
const http = require('http');
const Server = require('socket.io').Server;
const Connection = require('./db.js'); 
const mongoose = require("mongoose");
const Chat = require('./models/Chat.js'); 

require('dotenv').config(); 

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

const app = express();
app.use(express.json());

Connection(); 


const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"] 
    }
});

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    const loadMessages = async () => {
        try {
            const messages = await Chat.find().sort({timeStamp : 1}).exec();
            socket.emit('chat', messages); 
        } catch(err) {
            console.error("Error loading messages:", err);
        }
    };
    loadMessages(); 


    socket.on('saveBotMessage', async (msg) => {
        try {
            const botMessage = new Chat(msg);
            await botMessage.save();
            io.emit('message', msg); 
        } catch (err) {
            console.error("Error saving bot message:", err);
        }
    });


    socket.on('newMessage', async (msg) => {
        try {
            const newMessage = new Chat(msg);
            await newMessage.save();
            io.emit('message', msg); 
        }catch(err) {
            console.error("Error saving new message:", err);
        }
    });


    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});




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


const PORT = process.env.PORT || 4242;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});