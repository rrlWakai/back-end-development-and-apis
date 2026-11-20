import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.sendFile(import.meta.dirname + "/views/index.html");
});

// Do not change code above this line
function processDate(dateInput) {
  let date;

  if (dateInput === undefined) {
    date = new Date();
  } else if (/^-?\d+$/.test(dateInput)) {
    date = new Date(Number(dateInput));
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) {
    return { error: "Invalid Date" };
  }

  return {
    unix: date.getTime(),
    utc: date.toUTCString()
  };
}

// Route for current timestamp
app.get("/api", (req, res) => {
  res.json(processDate(undefined));
});

// Route for specified date
app.get("/api/:date", (req, res) => {
  res.json(processDate(req.params.date));
});


// Do not change code below this line

const PORT = 8000;
const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
