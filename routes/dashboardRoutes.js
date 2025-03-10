const express = require('express');
const router = express.Router();

function isAuthenticated(req, res, next) {
    console.log('Session check:', {
        hasCookie: !!req.headers.cookie,
        cookie: req.headers.cookie,
        sessionID: req.sessionID,
        session: req.session
    });
    
    if (req.session && req.session.user) {
        console.log('User authenticated:', req.session.user);
        return next();
    }
    
    console.log('Authentication failed');
    if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
        return res.status(401).json({ 
            error: 'Not authenticated',
            redirectUrl: '/login'
        });
    }
    return res.redirect('/login');
}

router.get('/dashboard', isAuthenticated, (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            console.error('No session or user found');
            return res.redirect('/login');
        }

        console.log('Rendering dashboard for:', req.session.user);
        
        res.set({
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        });

        return res.render('dashboard', { 
            user: req.session.user,
            layout: false
        });
    } catch (error) {
        console.error('Dashboard render error:', error);
        return res.status(500).send('Internal Server Error');
    }
});

router.get('/login', (req, res) => {
    // If user is already authenticated, redirect to dashboard
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    
    return res.render('login', { 
        message: 'Please log in to continue',
        layout: false
    });
});

module.exports = router;