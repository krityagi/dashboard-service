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

router.get('/dashboard', isAuthenticated, (req, res) => {
    try {
        console.log('Attempting to render dashboard for user:', req.session.user.email);
        
        // Set response headers to prevent caching
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            'Expires': '-1',
            'Pragma': 'no-cache'
        });

        // Render the dashboard template
        res.render('dashboard', { 
            user: req.session.user,
            sessionID: req.sessionID,
            layout: false // Disable layout if you're not using one
        }, (err, html) => {
            if (err) {
                console.error('Template rendering error:', err);
                return res.status(500).send('Error rendering dashboard');
            }
            console.log('Dashboard template rendered successfully');
            res.send(html);
        });
    } catch (error) {
        console.error('Error in dashboard route:', error);
        res.status(500).send('Internal Server Error');
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