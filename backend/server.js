const express = require("express");
const dotenv = require("dotenv");
const { chats } = require('./data/data')
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require("./routes/chatRoutes");
const connectDB = require('./config/db')
const { notFound, errorHandler } = require('./middleware/errorMiddlware')


const app = express();
dotenv.config();
connectDB;

console.log("aa", process.env.JWT_SECRET);

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running')
})

app.use('/api/user', userRoutes)
app.use("/api/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`server start on Port ${PORT}`));