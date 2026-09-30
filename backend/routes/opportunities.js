const express = require('express');
const pool = require('../db');

const router = express.Router();

const TEXT_FIELDS = [
  'title',
  'description',
  'research_area',
  'faculty_name',
  'department',
  'required_skills',
];

const ALL_FIELDS = [...TEXT_FIELDS, 'positions', 'deadline', 'status'];

// Data check karta hai, errors ki list wapas deta hai (khaali list = sab theek)
function validate(data) {
  const errors = [];

  for (const field of TEXT_FIELDS) {
    if (typeof data[field] !== 'string' || data[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  }

  const positions = Number(data.positions);
  if (
    data.positions === undefined ||
    data.positions === null ||
    data.positions === '' ||
    !Number.isInteger(positions) ||
    positions < 1
  ) {
    errors.push('positions must be a whole number of at least 1');
  }

  if (
    typeof data.deadline !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.deadline) ||
    isNaN(new Date(data.deadline).getTime())
  ) {
    errors.push('deadline must be a valid date in YYYY-MM-DD format');
  }

  if (data.status !== 'Open' && data.status !== 'Closed') {
    errors.push("status must be either 'Open' or 'Closed'");
  }

  return errors;
}

// Sirf wahi fields lo jo hamein chahiye (faltu cheezein ignore)
function pickFields(body) {
  const result = {};
  for (const field of ALL_FIELDS) {
    if (body[field] !== undefined) {
      result[field] =
        typeof body[field] === 'string' ? body[field].trim() : body[field];
    }
  }
  return result;
}

function isValidId(id) {
  return /^\d+$/.test(id) && Number(id) > 0;
}

// 1. CREATE
router.post('/', async (req, res) => {
  try {
    const data = pickFields(req.body || {});
    if (data.status === undefined) data.status = 'Open';

    const errors = validate(data);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const [result] = await pool.query(
      `INSERT INTO opportunities
        (title, description, research_area, faculty_name, department,
         required_skills, positions, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description,
        data.research_area,
        data.faculty_name,
        data.department,
        data.required_skills,
        Number(data.positions),
        data.deadline,
        data.status,
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM opportunities WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. READ ALL
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM opportunities ORDER BY id DESC'
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. READ ONE
router.get('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'ID must be a positive number' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM opportunities WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. UPDATE (sirf wahi fields bhejein jo badalni hain)
router.put('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'ID must be a positive number' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM opportunities WHERE id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Purana data + naya data mila kar check karte hain
    const merged = { ...existing[0], ...pickFields(req.body || {}) };

    const errors = validate(merged);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    await pool.query(
      `UPDATE opportunities SET
        title = ?, description = ?, research_area = ?, faculty_name = ?,
        department = ?, required_skills = ?, positions = ?, deadline = ?,
        status = ?
       WHERE id = ?`,
      [
        merged.title,
        merged.description,
        merged.research_area,
        merged.faculty_name,
        merged.department,
        merged.required_skills,
        Number(merged.positions),
        merged.deadline,
        merged.status,
        req.params.id,
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM opportunities WHERE id = ?',
      [req.params.id]
    );
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. DELETE
router.delete('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ error: 'ID must be a positive number' });
    }

    const [result] = await pool.query(
      'DELETE FROM opportunities WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.status(200).json({ message: 'Opportunity deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;