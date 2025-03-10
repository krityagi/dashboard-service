const express = require('express');
const router = express.Router();

function isAuthenticated(req, res, next) {
    console.log('Session in dashboard middleware:', req.session);
    if (req.session && req.session.user) {
        console.log('User authenticated:', req.session.user.email);
        return next();
    } else {
        console.log('User not authenticated, redirecting to login');
        console.error('Session details (for debugging):', req.session);
        return res.status(401).redirect('/login');
    }
}

router.get('/dashboard', isAuthenticated, (req, res) => {
    try {
        if (req.session && req.session.user && req.session.user.email) {
            console.log('Rendering dashboard for user:', req.session.user.email);
            return res.render('dashboard');
        } else {
            console.error('Session or user email missing in /dashboard route');
            return res.status(401).redirect('/login');
        }
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        return res.status(500).send('Internal Server Error');
    }
});

router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
        message: 'Please log in to continue'
    });
});

module.exports.router = router;