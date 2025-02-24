const express = require('express');
const router = express.Router();

function isAuthenticated(req, res, next) {
    console.log('Session in dashboard middleware:', req.session); // Add logging
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).redirect('/login');
    }
}

router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

// Other routes
router.get('/git-tutorial', isAuthenticated, (req, res) => {
    res.render('git-tutorial', { user: req.session.user });
});

router.get('/jenkins-tutorial', isAuthenticated, (req, res) => {
    res.render('jenkins-tutorial', { user: req.session.user });
});

router.get('/shell-tutorial', isAuthenticated, (req, res) => {
    res.render('shell-tutorial', { user: req.session.user });
});

router.get('/python-tutorial', isAuthenticated, (req, res) => {
    res.render('python-tutorial', { user: req.session.user });
});

module.exports.router = router;

