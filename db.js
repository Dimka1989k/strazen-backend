

const mongoose = require('mongoose')
require('dotenv').config()

function Connection() {
     const mongoURI = process.env.MONGO_URI;
    mongoose.connect(mongoURI)
    .then(() => console.log("connected"))
    .catch(err => console.log(err))
}

module.exports = Connection