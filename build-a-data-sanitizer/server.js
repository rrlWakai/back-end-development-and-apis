
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { inputCleaner, inputValidator } from "./middleware.js";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// GET /
app.get("/", (req, res) => {
  res.redirect("/form");
});

// GET /form
app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// POST /submit
app.post(
  "/submit",
  inputCleaner,
  inputValidator,
  (req, res) => {
    res.status(200).json({
      username: req.body.username,
      comment: req.body.comment
    });
  }
);

// Start HTTP server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
