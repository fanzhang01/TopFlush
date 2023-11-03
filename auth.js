const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('./models/users');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.getUserByUsername(username);

    if (user && bcrypt.compareSync(password, user.hashedPassword)) {
      req.session.user = user;
      res.redirect('/home');
    } else {
      res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error during login.');
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.getUserByUsername(username);

    if (existingUser) {
      // username already taken
      res.redirect('/register');
    } else {
      await User.createUser(username, email, password);
      const newUser = await User.getUserByUsername(username);

      req.session.user = newUser;
      res.redirect('/home');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error during registration.');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
