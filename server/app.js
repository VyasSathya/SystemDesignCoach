const express = require('express');
const cors = require('cors');
const aiRouter = require('./routes/ai');

const app = express();

app.use(cors());
app.use(express.json());

// Mount the AI routes
app.use('/api/ai', aiRouter);

module.exports = app;
