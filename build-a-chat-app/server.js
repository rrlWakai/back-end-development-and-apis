
import http from "http";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";

const PORT = 3001;

// 1. Create HTTP server
const server = http.createServer((req, res) => {
  fs.readFile("./public/index.html", (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading page");
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(data);
  });
});

// 2. Create WebSocket server
const wss = new WebSocketServer({ server });

// Helper function: Broadcast messages to all connected clients
function broadcast(message) {
  const data = JSON.stringify(message);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// 3. Register connection listener
wss.on("connection", (socket, req) => {

  // 4. Get username from URL query string
  const username = new URL(
    req.url,
    "http://localhost"
  ).searchParams.get("username");

  // Broadcast joined message
  broadcast({
    type: "system",
    text: `${username} joined`,
  });

  // 5. Listen for incoming messages
  socket.on("message", (data) => {
    const { username, text } = JSON.parse(data.toString());

    broadcast({
      type: "chat",
      username,
      text,
    });
  });

  // 6. Handle client disconnection
  socket.on("close", () => {
    broadcast({
      type: "system",
      text: `${username} left`,
    });
  });
});

// 7. Start HTTP server
server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
