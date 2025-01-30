const mongoose = require('mongoose');
require("dotenv").config()

const connectDB = async () => {
  try {
    mongoose.connect('mongodb://localhost:27017/wallet');
    console.log("Mongo connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  } finally {
    console.log('finally');
  }
}

module.exports = connectDB;
