
const express = require("express");

const {
  registerUser,
  loginUser,
  authenticateToken,
  authorizeAdmin,
  logoutUser,
  getAllUsers,
  sanitizeUser
} = require("./script");

const app = express();

app.use(express.json());

// HEALTH CHECK
app.get("/", (req, res) => {
  res.status(200).json({
    message: "JWT Authentication API is running."
  });
});

// REGISTER
app.post("/api/auth/register", (req, res) => {
  try {
    const result = registerUser(req.body);

    return res.status(201).json({
      message: "Registration successful",
      token: result.token,
      user: result.user
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Registration failed"
    });
  }
});

// LOGIN
app.post("/api/auth/login", (req, res) => {
  try {
    const result = loginUser(req.body);

    return res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Login failed"
    });
  }
});

// PROFILE - AUTHENTICATED USERS ONLY
app.get(
  "/api/auth/profile",
  authenticateToken,
  (req, res) => {
    return res.status(200).json({
      message: "Profile retrieved successfully",
      user: sanitizeUser(req.user)
    });
  }
);

// LOGOUT - INVALIDATE CURRENT TOKEN
app.post(
  "/api/auth/logout",
  authenticateToken,
  (req, res) => {
    logoutUser(req.token);

    return res.status(200).json({
      message: "Logout successful"
    });
  }
);

// ADMIN - ADMINISTRATORS ONLY
app.get(
  "/api/admin/users",
  authenticateToken,
  authorizeAdmin,
  (req, res) => {
    try {
      const users = getAllUsers().map(user => sanitizeUser(user));

      return res.status(200).json({
        message: "Users retrieved successfully",
        users
      });
    } catch (error) {
      return res.status(500).json({
        message: "Unable to retrieve users"
      });
    }
  }
);

// HANDLE INVALID JSON
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      message: "Invalid JSON request body"
    });
  }

  next(error);
});

// 404 - ROUTE NOT FOUND
app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found"
  });
});

module.exports = app;
