const asyncHandler = require("express-async-handler")
const User = require('../models/userModel')
const generateToken = require('../config/generateToken')
const Chat = require("../models/chatModel")

const registerUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, pic } = req.body

        if (!name || !email || !password) {
            res.status(400);
            throw new Error("Please end all");
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error("user exists");
        }

        const user = await User.create({
            name, email, password, pic
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                email: user.email,
                name: user.name,
                pic: user.pic,
                token: generateToken(user._id)
            });
        } else {
            res.status(400);
            throw new Error("Failed")
        }
    } catch (err) {
        return res.status(500).json({
            status: true,
            message: `Unable to create wallet. Please try again. \n Error: ${err}`
        })
    }

})

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (email && (await user.matchPassword(password))) {
        res.status(201).json({
            _id: user._id,
            email: user.email,
            name: user.name,
            pic: user.pic,
            token: generateToken(user._id)
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password")
    }
})

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
});


//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUserAndGroup = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    let groups = await Chat.find(keyword).find({ _id: { $ne: req.user._id } });
    const mergeResult = [...users, ...groups];

    console.log("aaaaa", mergeResult);
    res.send(groups);
});


module.exports = { registerUser, authUser, allUsers, allUserAndGroup };