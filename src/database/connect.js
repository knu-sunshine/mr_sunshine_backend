const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoURI = process.env.DB_URI;
// Mongoose 연결
mongoose.connect(mongoURI)
    .then(() => {
        console.log('connect database!');
    })  
    .catch(err => {
        console.log(err);
    } )

module.exports = mongoose;

