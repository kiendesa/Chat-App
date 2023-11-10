const mongoose = require("mongoose");
const colors = require("colors");

const URL = 'mongodb+srv://congkiennk1708:Gj4eEpMy6vKWG6DE@cluster0.dx5i8ba.mongodb.net/app-chat?retryWrites=true&w=majority'

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

