
import express from 'express';
import getWeather from './weather.js';

const app = express();
const PORT = 3000;

// API information endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Weather Service API',
    version: '1.0.0',
    endpoints: [
      '/api/weather/:city',
      '/api/greet/:name',
      '/api/data'
    ]
  });
});

// Weather endpoint
app.get('/api/weather/:city', (req, res) => {
  const { city } = req.params;
  const weather = getWeather(city);

  res.json(weather);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
