const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

dotenv.config();

const dashboardRoutes = require('./routes/dashboardRoutes').router;

const app = express();
const port = process.env.PORT || 3000;

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'redis-service',
    port: process.env.REDIS_PORT || 6379
});

redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('error', (err) => {
    console.log('Redis client error:', err);
    process.exit(1);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        httpOnly: true,
        sameSite: 'Lax',
        domain: 'devopsduniya.in'
    }
}));

// Middleware to make user data available in all templates
app.use((req, res, next) => {
    console.log('Session middleware:', req.session);
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        console.log('Session user exists:', req.session.user);
    } else {
        console.error('User not found in session.');
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