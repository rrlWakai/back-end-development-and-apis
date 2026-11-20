
import express from "express";
import { getAccounts, saveAccounts } from "./db.js";

const app = express();
const PORT = 9000;

// Middleware
app.use(express.json());
app.set("json spaces", 2);

app.get("/", (req, res) => {
  res.send("Tiny Bank API running with Express 5...");
});
// Lesson 8 and 29: Get all accounts
// Express 5 automatically forwards async errors.
app.get("/accounts", async (req, res) => {
  const accounts = await getAccounts();
  res.json(accounts);
});

// Lesson 30: Get account by ID (Express 5)
app.get("/accounts/:id", async (req, res) => {
  const accounts = await getAccounts();

  const account = accounts.find(
    (a) => a.id === parseInt(req.params.id)
  );

  if (!account) {
    const err = new Error("Account not found");
    err.status = 404;
    throw err;
  }

  res.json(account);
});

// Lessons 10-16: Transfer money

 // Lesson 31: Transfer money (Express 5)
app.post("/transfer", async (req, res) => {
  const { fromId, toId, amount } = req.body;

  // Validate required fields
  if (!fromId || !toId || !amount) {
    const err = new Error(
      "Missing required fields: fromId, toId, amount"
    );
    err.status = 400;
    throw err;
  }

  // Validate positive amount
  if (amount <= 0) {
    const err = new Error("Transfer amount must be positive");
    err.status = 400;
    throw err;
  }

  // Find sender and recipient
  const accounts = await getAccounts();

  const sender = accounts.find((a) => a.id === fromId);

  if (!sender) {
    const err = new Error("Sender account not found");
    err.status = 404;
    throw err;
  }

  const recipient = accounts.find((a) => a.id === toId);

  if (!recipient) {
    const err = new Error("Recipient account not found");
    err.status = 404;
    throw err;
  }

  // Validate sufficient balance
  if (sender.balance < amount) {
    const err = new Error("Insufficient funds");
    err.status = 409;
    throw err;
  }

  // Perform transfer
  sender.balance -= amount;
  recipient.balance += amount;

  await saveAccounts(accounts);

  // Return transfer summary
  res.json({
    message: "Transfer successful",
    senderName: sender.owner,
    recipientName: recipient.owner,
    amountTransferred: amount,
    senderNewBalance: sender.balance,
    recipientNewBalance: recipient.balance
  });
});


// Lessons 24-25: Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage()
  });
});

// Lesson 21: Temporary testing route
// Lesson 22: Keep commented out after testing
/*
app.get("/broken", (req, res, next) => {
  const err = new Error(
    "Whoops! Something went wrong on the server"
  );
  next(err);
});
*/

// Lessons 18-20: Error-handling middleware
// IMPORTANT: Keep this after all routes.
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500
    }
  });
});

// Lesson 26: Start server and store instance
const server = app.listen(PORT, () => {
  console.log(`Tiny Bank API running on port ${PORT}`);
});

// Lesson 27: Handle SIGTERM
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server...");

  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

// Lesson 28: Handle SIGINT
process.on("SIGINT", () => {
  console.log("SIGINT received. Closing server...");

  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
