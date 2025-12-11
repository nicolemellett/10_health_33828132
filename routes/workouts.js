const express = require('express');
const router = express.Router();
const pool = require('../db');

// List workouts (with optional search)
router.get('/', async (req, res) => {
  const search = req.query.search || '';
  try {
    let query = 'SELECT w.*, u.username FROM workouts w LEFT JOIN users u ON w.user_id = u.id';
    const params = [];
    if (search) {
      query += ' WHERE title LIKE ? OR notes LIKE ? OR username LIKE ?';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    query += ' ORDER BY date DESC LIMIT 100';
    const [rows] = await pool.query(query, params);
    res.render('workouts/list', { workouts: rows, search });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// ----- Personal Workouts ----- REMOVE IF WRONG
// List only workouts for the logged-in user
router.get('/personal', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const search = req.query.search || '';
  try {
    let query = 'SELECT w.*, u.username FROM workouts w LEFT JOIN users u ON w.user_id = u.id WHERE w.user_id = ?';
    const params = [req.session.user.id];

    if (search) {
      query += ' AND (w.title LIKE ? OR w.notes LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like);
    }

    query += ' ORDER BY date DESC LIMIT 100';
    const [rows] = await pool.query(query, params);
    res.render('workouts/personalList', { workouts: rows, search }); // reuse the same list view
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
// REMOVE IF WRONG

// Show form to add
router.get('/add', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('workouts/add', { error: null });
});

// Add workout
router.post('/add', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { title, date, duration, calories, notes } = req.body;
  try {
    await pool.query(
      'INSERT INTO workouts (user_id, title, date, duration_minutes, calories_burned, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.session.user.id, title, date || new Date(), duration || null, calories || null, notes || null]
    );
    res.redirect('/workouts');
  } catch (err) {
    console.error(err);
    res.render('workouts/add', { error: 'Database error' });
  }
});

// View one workout
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT w.*, u.username FROM workouts w LEFT JOIN users u ON w.user_id = u.id WHERE w.id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).send('Not found');
    res.render('workouts/view', { workout: rows[0] });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});


module.exports = router;