const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const { body, validationResult } = require('express-validator');

let config = require('./config/database')

// Init app

let app = express()

// View Engine setup

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Set public folder
app.use(express.static(path.join(__dirname, 'public')))


// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


// Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

// express validator middleware

app.use(
    '/user',
    // username must be an email
    body('username').isEmail(),
    // password must be at least 5 chars long
    body('password').isLength({ min: 5 }),
    (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        User.create({
            username: req.body.username,
            password: req.body.password,
        }).then(user => res.json(user));
    },
);

// Express messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Setup routes
const pagesRoutes = require('./routes/pages')
const adminRoutes = require('./routes/adminPages')

app.use('/admin/pages', adminRoutes)
app.use('/', pagesRoutes)

// Connect to DB
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })

// Start the server
const port = 3000
app.listen(port, function () {
    console.log('Server started on port', port)
})