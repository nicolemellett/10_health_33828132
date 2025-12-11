const express = require('express');
const router = express.Router();
const pool = require('../db');

// Show nutrition page (today's meals)
router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  try {
    const userId = req.session.user.id;
    const [meals] = await pool.query(
      'SELECT * FROM meals WHERE user_id = ? AND date = CURDATE() ORDER BY meal_type',
      [userId]
    );

    // calculate totals
    const totals = meals.reduce((acc, meal) => {
      acc.calories += meal.calories || 0;
      acc.protein += meal.protein || 0;
      acc.carbs += meal.carbs || 0;
      acc.fats += meal.fats || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    res.render('nutrition', { meals, totals });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Add a meal
router.post('/add-meal', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { description, calories, protein, carbs, fats, mealType } = req.body;

  try {
    const userId = req.session.user.id;
    await pool.query(
      `INSERT INTO meals (user_id, date, description, calories, protein, carbs, fats, meal_type)
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?)`,
      [userId, description, calories, protein, carbs, fats, mealType]
    );
    res.redirect('/nutrition');
  } catch (err) {
    console.error(err);
    res.send('Error adding meal');
  }
});



module.exports = router;