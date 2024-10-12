import express from 'express';
import cors from 'cors';
import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5
});

// Create table if not exists
async function initializeDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS fruit_trees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        note TEXT,
        start_date DATE,
        end_date DATE
      )
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    if (conn) conn.release();
  }
}

initializeDatabase();

// Get all pins
app.get('/api/pins', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM fruit_trees');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Add a new pin
app.post('/api/pins', async (req, res) => {
  let conn;
  try {
    const { latitude, longitude, note, startDate, endDate } = req.body;
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO fruit_trees (latitude, longitude, note, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [latitude, longitude, note, startDate, endDate]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Delete a pin
app.delete('/api/pins/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM fruit_trees WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});