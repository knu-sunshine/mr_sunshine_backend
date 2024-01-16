const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoURI = process.env.DB_URI;
console.log(mongoURI);
// Mongoose 연결
mongoose.connect(mongoURI)
    .then(() => {
        console.log('연결완료');
    })  
    .catch(err => {
        console.log(err);
    } )

module.exports = mongoose;

