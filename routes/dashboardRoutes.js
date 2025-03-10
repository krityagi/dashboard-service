const express = require('express');
const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

function isAuthenticated(req, res, next) {
    console.log('Auth Check:', {
        sessionID: req.sessionID,
        hasCookie: !!req.headers.cookie,
        cookieContent: req.headers.cookie,
        hasSession: !!req.session,
        sessionUser: req.session ? req.session.user : null
    });

    if (!req.session) {
        console.error('No session found');
        return res.redirect('/login');
    }

    if (!req.session.user) {
        console.error('No user in session');
        return res.redirect('/login');
    }

    console.log('User authenticated:', req.session.user);
    res.locals.user = req.session.user;
    next();
}

router.get('/dashboard', isAuthenticated, (req, res) => {
    try {
        console.log('Dashboard access:', {
            sessionID: req.sessionID,
            user: req.session.user
        });

        if (!req.session.user) {
            console.error('No user in session at dashboard');
            return res.redirect('/login');
        }

        return res.render('dashboard', { 
            user: req.session.user,
            layout: false
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        return res.status(500).send('Internal Server Error');
    }
});

router.get('/login', (req, res) => {
    // Check if already authenticated
    if (req.session && req.session.user) {
        console.log('User already authenticated, redirecting to dashboard');
        return res.redirect('/dashboard');
    }
    
    // Set cache headers for login page
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
    });

    return res.render('login', { 
        message: 'Please log in to continue',
        layout: false
    });
});

// Add error handling middleware
router.use((err, req, res, next) => {
    console.error('Route error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = router;