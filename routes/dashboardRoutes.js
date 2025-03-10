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
        console.log('User not authenticated, redirecting to login');
        console.error('Session details (for debugging):', req.session);
        // Instead of redirecting, return JSON for debugging
        return res.status(401).json({
            error: 'Not authenticated',
            sessionExists: !!req.session,
            sessionID: req.sessionID,
            cookies: req.headers.cookie
        });
    }
}

router.get('/dashboard', isAuthenticated, (req, res) => {
    try {
        console.log('Dashboard route - Session:', req.session);
        console.log('Dashboard route - User:', req.session?.user);
        
        if (req.session && req.session.user && req.session.user.email) {
            console.log('Rendering dashboard for user:', req.session.user.email);
            return res.render('dashboard', { 
                user: req.session.user,
                sessionID: req.sessionID 
            });
        } else {
            console.error('Session or user email missing in /dashboard route');
            return res.status(401).json({
                error: 'Authentication failed',
                sessionExists: !!req.session,
                sessionID: req.sessionID,
                cookies: req.headers.cookie
            });
        }
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// ...existing code...