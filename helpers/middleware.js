module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Sorry, you must be signed in do that!')
        return res.redirect('/login')
    }
    next();
}