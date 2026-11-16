
import express from "express";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
const PORT = 3000;

// Application-level middleware
app.use(express.json());

// Router-level middleware
const apiRouter = express.Router();

// API available route
apiRouter.get("/", (req, res) => {
  res.status(200).send("API is available!");
});

// Crash route
apiRouter.get("/crash", (req, res, next) => {
  next(new Error("Internal Server Error"));
});

// Bad request route
apiRouter.get("/bad-request", (req, res, next) => {
  const error = new Error("Client-side data is missing.");
  error.status = 400;
  next(error);
});

// Mount API router
app.use("/api", apiRouter);

// 404 handler
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Custom error-handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
