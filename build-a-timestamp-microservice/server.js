
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.sendFile(import.meta.dirname + "/views/index.html");
});

// Do not change code above this line

// Timestamp API handler
function timestampHandler(req, res) {
  const input = req.params.date;

  let date;

  // If no date is provided, use the current date and time
  if (input === undefined) {
    date = new Date();
  }
  // If the input is a numeric timestamp, parse it as milliseconds
  else if (/^-?\d+$/.test(input)) {
    date = new Date(Number(input));
  }
  // Otherwise, parse it as a date string
  else {
    date = new Date(input);
  }

  // Return an error for invalid dates
  if (Number.isNaN(date.getTime())) {
    return res.json({ error: "Invalid Date" });
  }

  // Return the Unix timestamp and UTC date
  return res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
}

// Express 5: use separate routes for optional date handling
app.get("/api", timestampHandler);
app.get("/api/:date", timestampHandler);

// Do not change code below this line

const PORT = 8000;

const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
