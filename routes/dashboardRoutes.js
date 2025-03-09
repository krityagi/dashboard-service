const express = require('express');
const router = express.Router();

function isAuthenticated(req, res, next) {
    //console.log('Request Headers:', req.headers);
    console.log('Session in dashboard middleware:', req.session);
    //console.log('Session in dashboard middleware:', req.session.user.email);
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
            return res.render('dashboard', { user: req.session.user });
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


// Add logging for other routes as well
router.get('/git-tutorial', isAuthenticated, (req, res) => {
    console.log('Rendering git tutorial for user:', req.session.user.email);
    res.render('git-tutorial', { user: req.session.user });
});

router.get('/jenkins-tutorial', isAuthenticated, (req, res) => {
    console.log('Rendering jenkins tutorial for user:', req.session.user.email);
    res.render('jenkins-tutorial', { user: req.session.user });
});

router.get('/shell-tutorial', isAuthenticated, (req, res) => {
    console.log('Rendering shell tutorial for user:', req.session.user.email);
    res.render('shell-tutorial', { user: req.session.user });
});

router.get('/python-tutorial', isAuthenticated, (req, res) => {
    console.log('Rendering python tutorial for user:', req.session.user.email);
    res.render('python-tutorial', { user: req.session.user });
});

module.exports.router = router;