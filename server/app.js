const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    path: req.path,
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

// Mount workbook routes
app.use('/api/workbook', require('./routes/api/workbook'));

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', {
    method: req.method,
    url: req.url,
    path: req.path
  });
  res.status(404).json({ error: 'Not Found' });
});

module.exports = app;


