const mongoose = require("mongoose");
require('dotenv').config();

const URL = process.env.URL;
console.log("url1111", URL);
const connectDB = async () => {
    try {
        await mongoose.connect(
            URL,
            { useNewUrlParser: true, useUnifiedTopology: true }
        )
        console.log('Connected to mongoDB')
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

connectDB()

module.exports = connectDB;

