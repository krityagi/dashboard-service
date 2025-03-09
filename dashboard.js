const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

dotenv.config();

const dashboardRoutes = require('./routes/dashboardRoutes').router;

const app = express();
const port = process.env.PORT || 3000;

const MONGO_URI = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mongo:27017/dashboardService?authSource=admin`;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected for Dashboard Service'))
    .catch(err => console.log('MongoDB connection error:', err));

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'redis-service',
    port: process.env.REDIS_PORT || 6379
});

redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('error', (err) => {
    console.log('Redis client error:');
    process.exit(1);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false,
        httpOnly: true,
        sameSite: 'Lax',
        domain: 'devopsduniya.in'
    },
    logErrors: true
}));

// Middleware to make user data available in all templates
app.use((req, res, next) => {
    
    if (req.session.user) {
        console.log('Session user:', req.session.user);
    } else {
        console.error('User not found in session.');
    }
    console.log('Incomming cookies in dashboard-service:', req.headers.cookie);
    if (!req.headers.cookie || !req.headers.cookie.includes('connect.sid')) {
        console.error('connect.sid cookie missing in request.');
    }
    console.log('Session in dashboard-service:', req.session);
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        console.log('Session user exists:', req.session.user);
    } else {
        console.error('User not found in session.');
    }
    //res.locals.user = req.session.user; // Make user available in templates
    next();
});

app.use((req, res, next) => {
    if (!req.session) {
        console.log('No session found for this request!');
    } else {
        console.log('Session loaded:', req.session);
    }
    next();
});

// Health check endpoint
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// Readiness check endpoint
app.get('/readiness', (req, res) => {
    res.status(200).send('Ready');
});

// Add a route to handle GET requests to the root URL
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// Routes
app.use(dashboardRoutes);

app.listen(port, () => {
    console.log(`Dashboard Service is running on http://localhost:${port}/dashboard`);
});
