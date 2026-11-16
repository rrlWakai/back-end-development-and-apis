
import express from "express";
import { getAccounts, saveAccounts } from "./db.js";

const app = express();
const PORT = 9000;

app.use(express.json());
app.set("json spaces", 2);

// Root route
app.get("/", (req, res) => {
  res.send("Tiny Bank API (Express 5) running...");
});

// Get all accounts
app.get("/accounts", async (req, res) => {
  const accounts = await getAccounts();
  res.json(accounts);
});

// Get account by ID
app.get("/accounts/:id", async (req, res) => {
  const accounts = await getAccounts();
  const account = accounts.find((a) => a.id === parseInt(req.params.id));

  if (!account) {
    const err = new Error("Account not found");
    err.status = 404;
    throw err;
  }

  res.json(account);
});

// Transfer money
app.post("/transfer", async (req, res) => {
  const { fromId, toId, amount } = req.body;

  // Validate required fields
  if (!fromId || !toId || !amount) {
    const err = new Error("Missing required fields: fromId, toId, amount");
    err.status = 400;
    throw err;
  }

  // Validate transfer amount
  if (amount <= 0) {
    const err = new Error("Transfer amount must be positive");
    err.status = 400;
    throw err;
  }

  // Fetch all accounts
  const accounts = await getAccounts();

  // Find sender account
  const sender = accounts.find((a) => a.id === fromId);

  if (!sender) {
    const err = new Error("Sender account not found");
    err.status = 404;
    throw err;
  }

  // Find recipient account
  const recipient = accounts.find((a) => a.id === toId);

  if (!recipient) {
    const err = new Error("Recipient account not found");
    err.status = 404;
    throw err;
  }

  // Check sender balance
  if (sender.balance < amount) {
    const err = new Error("Insufficient funds");
    err.status = 409;
    throw err;
  }

  // Update balances
  sender.balance -= amount;
  recipient.balance += amount;

  await saveAccounts(accounts);

  res.json({
    message: "Transfer successful",
    senderName: sender.owner,
    recipientName: recipient.owner,
    amountTransferred: amount,
    senderNewBalance: sender.balance,
    recipientNewBalance: recipient.balance,
  });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    },
  });
});

// Temporary test route - kept commented out
// app.get("/broken", (req, res, next) => {
//   const err = new Error("Whoops! Something went wrong on the server");
//   next(err);
// });

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage(),
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log("Tiny Bank API (Express 5) running...");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Closing server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
