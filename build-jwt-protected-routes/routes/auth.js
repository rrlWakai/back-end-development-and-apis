
import express from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import { readUsers, writeUsers, findByEmail } from "../utils/db.js";
import { signToken } from "../utils/jwt.js";
import authenticate from "../middleware/authenticate.js";
import { blacklistToken } from "../utils/token-blacklist.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    if (findByEmail(email)) {
      return res.status(409).json({
        message: "Email already in use"
      });
    }

    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the new user
    const users = readUsers();

    const newUser = {
      id: randomUUID(),
      email,
      passwordHash,
      role: "user"
    };

    // Save user
    users.push(newUser);
    writeUsers(users);

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      message: "User registered successfully",
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = findByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: "Login successful",
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logout
router.post("/logout", authenticate, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  blacklistToken(token);

  res.json({ message: "Logged out successfully" });
});

// Profile
router.get("/profile", authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
