const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');


dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});



// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false
}));

// Make session user available to views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routes


const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');
const nutritionRoutes = require('./routes/nutrition');

app.use('/workouts', workoutRoutes);
app.use('/nutrition', nutritionRoutes);
app.use('/', mainRoutes);
app.use('/', authRoutes);


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});