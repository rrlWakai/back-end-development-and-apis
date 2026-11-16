
import http from "http";
import fs from "fs";
import { WebSocketServer } from "ws";

const PORT = 3001;

// 1. Create HTTP server and serve index.html
const server = http.createServer((req, res) => {
  fs.readFile("./public/index.html", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});

// 2. Create WebSocket server
const wss = new WebSocketServer({ server });

// Helper function to broadcast messages to all connected clients
function broadcast(message) {
  const data = JSON.stringify(message);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
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

  // Broadcast join notification
  broadcast({
    type: "system",
    text: `${username} joined`
  });

  // 5. Listen for incoming messages
  socket.on("message", (message) => {
    const { username, text } = JSON.parse(message.toString());

    // Broadcast chat message to all connected clients
    broadcast({
      type: "chat",
      username,
      text
    });
  });

  // 6. Listen for client disconnection
  socket.on("close", () => {
    broadcast({
      type: "system",
      text: `${username} left`
    });
  });
});

// 7. Start HTTP and WebSocket server
server.listen(PORT, () => {
  console.log("Chat server running at http://localhost:3001");
});
