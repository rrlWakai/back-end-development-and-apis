
const express = require('express');

const app = express();

const PORT = 3000;

// 1. Homepage route
app.get('/', (req, res) => {
  res.send("Welcome to Camper Bot's homepage!");
});

// 2. Hobbies route
app.get('/hobbies', (req, res) => {
  res.send('I cycle, go boating, and play guitar.');
});

// 3. Skills route
app.get('/skills', (req, res) => {
  res.send('JavaScript, Node.js, and Express.js!');
});

// 4. Profile API route
app.get('/api/profile', (req, res) => {
  res.json({
    name: 'Camper Bot',
    hobbies: ['cycling', 'boating', 'guitar'],
    skills: ['JavaScript', 'Node.js', 'Express.js']
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
