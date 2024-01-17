const mongoose = require('../connect')
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    userId: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      unique: true,
    },
  });

module.exports = userSchema;