
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import weatherRouter from "./weather.js";

const app = express();

const PORT = 3000;

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lesson 17: Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Lesson 3: API information

app.get("/api/info", (req, res) => {
  res.json({
    name: "Weather Service API",
    version: "1.0.0",
    endpoints: [
      "/api/weather/:city",
      "/api/greet/:name",
      "/api/data"
    ]
  });
});


// Lesson 4: Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Lesson 5: Status
app.get("/api/status", (req, res) => {
  res.status(200).json({
    status: "OK"
  });
});

// Lesson 6: Documentation redirect
app.get("/docs", (req, res) => {
  res.redirect("/api/info");
});

// Lesson 7: Greeting
app.get("/api/greet/:name", (req, res) => {
  res.json({
    name: req.params.name
  });
});

// Lessons 8 and 9: Data routes
app.route("/api/data")
  .get((req, res) => {
    res.status(200).json({
      message: "Weather data retrieved successfully"
    });
  })
  .post((req, res) => {
    res.status(201).json({
      message: "Weather data created successfully"
    });
  });

// Lesson 11 onward: Weather router
app.use("/api/weather", weatherRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Weather Service API running at http://localhost:${PORT}`);
});
