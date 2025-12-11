const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Fitness Tracker' });
});

router.get('/about', (req, res) => {
  res.render('about');
});


// Timer route
router.get('/timer', (req, res) => {
  // Retrieve saved timers for current user
  const savedTimers = req.session.savedTimers || [];
  res.render('timer', { 
    currentUser: req.session.user,
    savedTimers });
});

// Save a timer (POST)
router.post('/timer/save', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const { minutes, seconds } = req.body;
  const newTimer = { minutes, seconds, date: new Date().toISOString() };

  // Initialize array if doesn't exist
  if (!req.session.savedTimers) {
    req.session.savedTimers = [];
  }

  
  req.session.savedTimers.push({
    minutes,
    seconds,
    date: new Date().toISOString()
  });
  res.redirect('/timer');
});


module.exports = router;