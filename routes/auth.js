const express = require('express');
const router = express.Router();
const pool = require('../db');

// Simple login — used by marker. Passwords are stored in DB in plain text for the assignment convenience. In a real app, always hash passwords.
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length && rows[0].password === password) {
      req.session.user = { id: rows[0].id, username: rows[0].username };
      return res.redirect('/');
    }
    res.render('login', { error: 'Invalid credentials' });
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Database error' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// Simple registration (optional)
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  // password validation per spec: min 8, one lowercase, one uppercase, one number, one special
  const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!pwRegex.test(password)) return res.render('register', { error: 'Password does not meet requirements' });

  try {
    await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Error creating user (maybe username taken)' });
  }
});

module.exports = router;