const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://aditya:aditya@cluster0.tucbay8.mongodb.net/porfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
  console.error('Error connecting to MongoDB Atlas:', err.message);
});

// Import the User model (adjust the path as needed)
const User = require('./models/user');

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            password: hashedPassword
        });
        await user.save();
        res.redirect('/');
    } catch (error) {
        res.redirect('/register');
    }
});

app.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.redirect('/');

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (passwordMatch) {
        req.session.user = user;
        res.redirect('/index');
    } else {
        res.redirect('/');
    }
});

app.get('/index', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('index', { user: req.session.user });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
