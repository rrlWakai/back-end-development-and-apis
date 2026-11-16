
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const USERS_FILE = path.join(__dirname, "data", "users.json");
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env");
}

// Revoked tokens for the current server process
const revokedTokens = new Set();

// Read users from JSON
function getAllUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
    fs.writeFileSync(USERS_FILE, "[]", "utf8");
  }

  const data = fs.readFileSync(USERS_FILE, "utf8");

  if (!data.trim()) {
    return [];
  }

  const users = JSON.parse(data);

  if (!Array.isArray(users)) {
    throw new Error("users.json must contain a JSON array");
  }

  return users;
}

// Save users to JSON
function saveUsers(users) {
  fs.writeFileSync(
    USERS_FILE,
    JSON.stringify(users, null, 2),
    "utf8"
  );
}

// Remove password hash from user data
function sanitizeUser(user) {
  if (!user) return null;

  const { passwordHash, ...safeUser } = user;

  return safeUser;
}

// Generate JWT
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );
}

// REGISTER USER
function registerUser({ name, email, username, password } = {}) {
  const identifier = String(email || username || "")
    .trim()
    .toLowerCase();

  if (!identifier || !password) {
    const error = new Error("Email/username and password are required");
    error.status = 400;
    throw error;
  }

  const users = getAllUsers();

  const existingUser = users.find(user => {
    return (
      String(user.email || "").toLowerCase() === identifier ||
      String(user.username || "").toLowerCase() === identifier
    );
  });

  if (existingUser) {
    const error = new Error("User already exists");
    error.status = 409;
    throw error;
  }

  if (String(password).length < 6) {
    const error = new Error("Password must be at least 6 characters");
    error.status = 400;
    throw error;
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: name || username || identifier,
    email: email ? email.trim().toLowerCase() : identifier,
    username: username ? username.trim().toLowerCase() : identifier,
    passwordHash: bcrypt.hashSync(password, 10),
    role: "user"
  };

  users.push(newUser);
  saveUsers(users);

  return {
    token: generateToken(newUser),
    user: sanitizeUser(newUser)
  };
}

// LOGIN USER
function loginUser({ email, username, password } = {}) {
  const identifier = String(email || username || "")
    .trim()
    .toLowerCase();

  if (!identifier || !password) {
    const error = new Error("Email/username and password are required");
    error.status = 400;
    throw error;
  }

  const users = getAllUsers();

  const user = users.find(item => {
    return (
      String(item.email || "").toLowerCase() === identifier ||
      String(item.username || "").toLowerCase() === identifier
    );
  });

  let passwordMatches = false;

  if (user && user.passwordHash) {
    try {
      passwordMatches = bcrypt.compareSync(
        password,
        user.passwordHash
      );
    } catch {
      passwordMatches = false;
    }
  }

  if (!user || !passwordMatches) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  return {
    token: generateToken(user),
    user: sanitizeUser(user)
  };
}

// AUTHENTICATION MIDDLEWARE

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. Authentication token required."
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token || revokedTokens.has(token)) {
    return res.status(401).json({
      message: "Invalid or revoked token"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const users = getAllUsers();

    const userId = decoded.id || decoded.userId || decoded.sub;
    const email = decoded.email || decoded.user?.email;

    // Find the user in the database
    let user = users.find(
      item => userId && String(item.id) === String(userId)
    );

    // Fall back to email matching
    if (!user && email) {
      user = users.find(
        item =>
          String(item.email || "").toLowerCase() ===
          String(email).toLowerCase()
      );
    }

    // Use verified JWT claims if no database record exists
    if (!user) {
      user = decoded.user || decoded;
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}


// ADMIN AUTHORIZATION MIDDLEWARE
function authorizeAdmin(req, res, next) {
  if (
    !req.user ||
    String(req.user.role || "").toLowerCase() !== "admin"
  ) {
    return res.status(403).json({
      message: "Forbidden. Admin access required."
    });
  }

  next();
}

// LOGOUT USER
function logoutUser(token) {
  if (token) {
    revokedTokens.add(token);
  }
}

module.exports = {
  registerUser,
  loginUser,
  authenticateToken,
  authorizeAdmin,
  logoutUser,
  getAllUsers,
  sanitizeUser
};
