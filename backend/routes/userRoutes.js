const express = require("express");
const {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);

module.exports = router;
