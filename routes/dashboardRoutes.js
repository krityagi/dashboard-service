const express = require('express');
const router = express.Router();

function isAuthenticated(req, res, next) {
    console.log('Incoming request cookies:', req.headers.cookie);
    console.log('Session ID:', req.sessionID);
    console.log('Session in dashboard middleware:', req.session);
    
    if (req.session && req.session.user) {
        console.log('User authenticated:', req.session.user.email);
        return next();
    } else {
        console.log('User not authenticated, sending 401');
        // Instead of redirecting, send a 401 status
        return res.status(401).json({ 
            error: 'Not authenticated',
            redirectUrl: '/login'
        });
    }
}

router.get('/dashboard', isAuthenticated, (req, res) => {
    try {
        console.log('Attempting to render dashboard for user:', req.session.user.email);
        
        // Simplified headers
        res.set({
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        });

        // Simple render without callback
        return res.render('dashboard', { 
            user: req.session.user,
            layout: false
        });

    } catch (error) {
        console.error('Error in dashboard route:', error);
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