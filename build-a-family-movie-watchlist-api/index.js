
import express from "express";
import helmet from "helmet";

import authRoutes from "./routes/auth.js";
import watchlistRoutes from "./routes/watchlist.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(helmet());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.send("Family Movie Watchlist API");
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Watchlist routes
app.use("/api/watchlist", watchlistRoutes);

// Error-handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || "Internal server error."
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
