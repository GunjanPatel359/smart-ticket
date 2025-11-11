require('dotenv').config();
const express = require('express');
const prisma = require('./prisma/client'); // your prisma client path

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', db: 'Connected' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
