
import http from "http";
import fs from "fs";
import { WebSocketServer } from "ws";
import os from "os";

const PORT = 3000;

const server = http.createServer((req, res) => {
  const files = {
    "/": { path: "./public/index.html", contentType: "text/html" },
    "/index.html": { path: "./public/index.html", contentType: "text/html" },
    "/script.js": {
      path: "./public/script.js",
      contentType: "text/javascript",
    },
  };

  const file = files[req.url];

  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  fs.readFile(file.path, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading page");
      return;
    }

    res.writeHead(200, { "Content-Type": file.contentType });
    res.end(data);
  });
});

function getMetrics() {
  return {
    loadAvg: os.loadavg(),
    freeMemMB: (os.freemem() / 1024 / 1024).toFixed(0),
    totalMemMB: (os.totalmem() / 1024 / 1024).toFixed(0),
    memUsagePct: (
      ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
    ).toFixed(1),
  };
}

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  console.log("Client connected");

  const interval = setInterval(() => {
    socket.send(JSON.stringify(getMetrics()));
  }, 1000);

  // Lesson 9: Listen for incoming messages
  socket.on("message", (data) => {
    console.log("Received:", data.toString());
  });

  // Lesson 10: Handle client disconnection
  socket.on("close", () => {
    clearInterval(interval);
    console.log("Client disconnected");
  });

  // Lesson 19: Handle WebSocket errors
  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
    clearInterval(interval);
  };
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
