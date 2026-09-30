const express = require('express');
const cors = require('cors');
require('dotenv').config();

const opportunityRoutes = require('./routes/opportunities');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Research Opportunity Portal API is running' });
});

app.use('/api/opportunities', opportunityRoutes);

// Jo route exist nahi karta
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Ghalat JSON ya koi aur unexpected error
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});