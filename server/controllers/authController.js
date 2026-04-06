import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper: generate token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Helper: send token as cookie (dev only — not secure/sameSite strict)
const sendTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: false,      // dev: HTTP is fine
    sameSite: "lax",    // dev: lax is enough
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ─────────────────────────────────────
// SIGN UP
// ─────────────────────────────────────
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Password hashed automatically via pre-save hook in User model
    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({
      message: "Account created successfully.",
      token, // send in body too for dev (easy to test in Postman)
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    // res.status(500).json({ message: "Server error.", error: error.message });
    console.error("🔥 FULL ERROR:", error);   // 👈 ADD THIS
    console.error("🔥 STACK:", error.stack);  // 👈 ADD THIS

    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────
// SIGN IN  (login)
// ─────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Explicitly include password (select: false in schema)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    res.status(200).json({
      message: "Logged in successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    // res.status(500).json({ message: "Server error.", error: error.message });
      console.error("🔥 FULL ERROR:", error);   // 👈 ADD THIS
    console.error("🔥 STACK:", error.stack);  // 👈 ADD THIS

    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────
export const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 }); // clear cookie
  res.status(200).json({ message: "Logged out successfully." });
};

// ─────────────────────────────────────
// GET CURRENT USER  (protected)
// ─────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,  
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error("🔥 FULL ERROR:", error);   // 👈 ADD THIS
    console.error("🔥 STACK:", error.stack);  // 👈 ADD THIS

    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  } 
};