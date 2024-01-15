const mongoose = require('mongoose');

const messageModel = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        content: {
            type: String,
            trim: true
        },
        images: [{
            type: String,  // Assuming the image paths or URLs will be stored as strings
            trim: true
        }],
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }
);

const Message = mongoose.model("Message", messageModel);

module.exports = Message;
