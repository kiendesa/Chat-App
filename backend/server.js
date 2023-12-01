const express = require("express");
const dotenv = require("dotenv");
const { chats } = require('./data/data')
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const connectDB = require('./config/db')
const generateToken = require('./config/generateToken')
const { notFound, errorHandler } = require('./middleware/errorMiddlware')

const app = express();
dotenv.config();
connectDB;
generateToken;

console.log("aa11", process.env.JWT_SECRET);

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running')
})

app.use('/api/user', userRoutes)
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(
    PORT,
    console.log(`Server running on PORT ${PORT}...`)
);

const io = require("socket.io")(server, {
    pingTimeout: 10000,
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection", (socket) => {
    console.log('connected to socket.io');

    socket.on("setup", (userData) => {
        // ...
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        // ...
        socket.join(room);
        console.log("User joined Room" + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
        // ...
        var chat = newMessageReceived.chat;
        if (!chat.users) return console.log("not defined");

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        })
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
})