const express = require('express');
const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

function isAuthenticated(req, res, next) {
    // Detailed session logging
    console.log('Authentication Check:', {
        hasCookie: !!req.headers.cookie,
        cookie: req.headers.cookie,
        sessionID: req.sessionID,
        hasSession: !!req.session,
        hasUser: !!(req.session && req.session.user)
    });
    
    if (req.session && req.session.user) {
        console.log('User authenticated:', req.session.user.email);
        // Set local variables for use in templates
        res.locals.user = req.session.user;
        return next();
    }
    
    console.log('Authentication failed');
    // Instead of redirecting, send status code
    return res.status(401).json({ 
        error: 'Not authenticated',
        redirectUrl: '/login'
    });
}

router.get('/dashboard', isAuthenticated, (req, res) => {
    try {
        console.log('Dashboard route accessed:', {
            sessionID: req.sessionID,
            user: req.session.user
        });

        // Set security headers
        res.set({
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block'
        });

        // Render dashboard with error handling
        res.render('dashboard', { 
            user: req.session.user,
            layout: false
        }, (err, html) => {
            if (err) {
                console.error('Template render error:', err);
                return res.status(500).send('Error rendering dashboard');
            }
            res.send(html);
        });

    } catch (error) {
        console.error('Dashboard route error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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