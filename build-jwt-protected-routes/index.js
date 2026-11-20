
import express from "express";
import helmet from "helmet";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

const PORT = process.env.PORT || 8800;
const app = express();

app.use(helmet());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Auth API is running" });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Lesson 34: Error-handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
