import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(process.cwd(), 'db.json');

// Function to read from the database file
function readDatabase() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { savings: 0 };
  }
}

// Function to write to the database file
function writeDatabase(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
}

app.use(cors());
app.use(express.json());

// Serve static frontend files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// GET savings (used by homepage)
app.get('/api/savings', (req, res) => {
  const db = readDatabase();
  console.log('Returning current savings:', db.savings);
  res.json({ savings: db.savings });
});

// POST savings (used by admin to update)
app.post('/api/savings', (req, res) => {
  const { newSavings } = req.body;
  const savingsAmount = Number(newSavings);

  if (!isNaN(savingsAmount)) {
    const db = readDatabase();
    const oldSavings = db.savings;
    
    // Update the database
    db.savings = savingsAmount;
    const success = writeDatabase(db);
    
    if (success) {
      console.log(`Savings updated from ${oldSavings} to ${savingsAmount}`);
      res.json({ 
        message: 'Savings updated successfully', 
        oldSavings,
        newSavings: savingsAmount 
      });
    } else {
      res.status(500).json({ error: 'Failed to update database' });
    }
  } else {
    console.error('Invalid savings amount received:', newSavings);
    res.status(400).json({ 
      error: 'newSavings must be a valid number',
      received: newSavings
    });
  }
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const db = readDatabase();
  console.log(`Server running on port ${PORT}`);
  console.log(`Current savings: ${db.savings}`);
});
