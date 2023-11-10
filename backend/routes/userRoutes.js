const express = require('express');
const { registerUser, authUser, allUsers, allUserAndGroup } = require("../controller/userControllers")
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/group").get(protect, allUserAndGroup);
router.route('/').post(registerUser)
router.route('/login').post(authUser)

module.exports = router;