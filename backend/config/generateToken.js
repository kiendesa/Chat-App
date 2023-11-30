const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    console.log("fdfd", process.env.JWT_SECRET);
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
}

module.exports = generateToken;