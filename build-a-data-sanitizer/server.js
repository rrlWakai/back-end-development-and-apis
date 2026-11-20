
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { inputCleaner, inputValidator } from "./middleware.js";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Application-level middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.redirect("/form");
});

// Form route
app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Submit route
app.post(
  "/submit",
  inputCleaner,
  inputValidator,
  (req, res) => {
    res.json({
      username: req.body.username,
      comment: req.body.comment
    });
  }
);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
