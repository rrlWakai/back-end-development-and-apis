
import express from "express";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { findByUsername } from "./utils/db.js";
import { authenticate } from "./middleware/authenticate.js";
import watchlistRoutes from "./routes/watchlist.js";

const PORT = process.env.PORT || 3000;

const JWT_SECRET =
  process.env.JWT_SECRET || "family_movie_watchlist_dev_secret_2026";

const app = express();

app.use(helmet());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.status(200).send("Family Movie Watchlist API");
});

// Login route
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};

  // Validate required fields
  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required."
    });
  }

  // Find user
  const user = findByUsername(username);

  if (!user) {
    return res.status(401).json({
      error: "Invalid username or password."
    });
  }

  // Verify password against stored bcrypt hash
  const passwordIsValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordIsValid) {
    return res.status(401).json({
      error: "Invalid username or password."
    });
  }

  // Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );

  return res.status(200).json({
    token
  });
});

// Protected watchlist routes
app.use(
  "/api/watchlist",
  authenticate,
  watchlistRoutes
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});

export default app;
