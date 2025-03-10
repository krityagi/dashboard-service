const express = require('express');
const router = express.Router();

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).redirect('/login');
    }
}

router.get('/dashboard', isAuthenticated, (req, res) => {
    try {
        if (req.session && req.session.user && req.session.user.email) {
            return res.render('dashboard', { user: req.session.user });
        } else {
            return res.status(401).redirect('/login');
        }
    } catch (error) {
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