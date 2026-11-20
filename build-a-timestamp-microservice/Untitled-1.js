
const express = require("express");

const app = express();
const port = 3000;

// Process date input
function processDate(dateInput) {
  let date;

  if (dateInput === undefined) {
    date = new Date();
  } else if (/^-?\d+$/.test(dateInput)) {
    // Handle Unix timestamp in milliseconds
    date = new Date(Number(dateInput));
  } else {
    // Handle regular date strings
    date = new Date(dateInput);
  }

  // Check for invalid dates
  if (isNaN(date.getTime())) {
    return { error: "Invalid Date" };
  }

  return {
    unix: date.getTime(),
    utc: date.toUTCString()
  };
}

// Empty date parameter
app.get("/api", (req, res) => {
  res.json(processDate(undefined));
});

// Date parameter
app.get("/api/:date", (req, res) => {
  res.json(processDate(req.params.date));
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
