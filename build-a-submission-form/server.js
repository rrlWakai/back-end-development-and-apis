
import express from "express";

const app = express();
const apiRouter = express.Router();

// Application-level middleware
app.use(express.json());

// API root route
apiRouter.get("/", (req, res) => {
  res.status(200).send("API is available!");
});

// Route that triggers a server error (500)
apiRouter.get("/crash", (req, res, next) => {
  next(new Error("Internal Server Error"));
});

// Route that triggers a client error (400)
apiRouter.get("/bad-request", (req, res, next) => {
  const error = new Error("Client-side data is missing.");
  error.status = 400;
  next(error);
});

// Mount API router
app.use("/api", apiRouter);

// 404 middleware
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

// Custom error-handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    error: true,
    message: err.message
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
