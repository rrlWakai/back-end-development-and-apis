
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Home route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Random Joke Server is running!"
    });
});

// Random joke collection
const jokes = [
    {
        id: 1,
        joke: "Why don't programmers like nature? It has too many bugs."
    },
    {
        id: 2,
        joke: "Why do Java developers wear glasses? Because they don't C#."
    },
    {
        id: 3,
        joke: "Why was the JavaScript developer sad? Because he didn't Node how to Express himself."
    },
    {
        id: 4,
        joke: "What is a programmer's favorite place? The Foo Bar."
    },
    {
        id: 5,
        joke: "Why did the programmer quit his job? Because he didn't get arrays."
    }
];

// Random joke route
app.get("/joke", (req, res) => {
    const randomIndex = Math.floor(Math.random() * jokes.length);

    res.status(200).json(jokes[randomIndex]);
});

// About route
app.get("/about", (req, res) => {
    res.status(200).send(
        "This Random Joke Server was built with Express.js"
    );
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Random Joke Server is running on port ${PORT}`);
});
