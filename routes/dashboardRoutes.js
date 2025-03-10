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
        console.log('User not authenticated');
        return res.redirect('/login');
    }
}

router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        console.log('Attempting to render dashboard for user:', req.session.user.email);
        
        // Set response headers
        res.set({
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            'Expires': '-1',
            'Pragma': 'no-cache',
            'X-Content-Type-Options': 'nosniff',
            'Connection': 'keep-alive'
        });

        // Direct render approach
        res.render('dashboard', { 
            user: req.session.user,
            sessionID: req.sessionID,
            layout: false
        }, (err, html) => {
            if (err) {
                console.error('Template rendering error:', err);
                return res.status(500).send('Error rendering dashboard');
            }
            
            console.log('Dashboard template rendered successfully');
            console.log('Response headers:', res.getHeaders());
            
            // Send the response
            res.status(200).end(html);
        });

    } catch (error) {
        console.error('Error in dashboard route:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

// Add a route for handling login redirects
router.get('/login', (req, res) => {
    res.render('login', { 
        message: 'Please log in to continue',
        layout: false
    });
});

module.exports = router;