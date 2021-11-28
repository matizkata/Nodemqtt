const passport = require('passport');
const express = require('express');
var router = express.Router();

/*router.get('/', function (req, res) {
  res.render('pages/index.ejs'); // load the index.ejs file
});*/

router.get('/', isNotLoggedIn, function (req, res) {
  res.render('pages/index.ejs'); // load the index.ejs file
}
);

router.get('/profile', isLoggedIn, function (req, res) {
  res.render('pages/profile.ejs', {
    user: req.user, // get the user out of session and pass to template
    states: 1
  });
  console.log("Profile endpoint called");
});

router.get('/error', isLoggedIn, function (req, res) {
  res.render('pages/error.ejs');
  console.log("Error endpoint called");
});

router.get('/auth/facebook', passport.authenticate('facebook'), function(req, res){
  console.log("cos sie wykonalo");
});

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/error'
  }));

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

function isNotLoggedIn(req, res, next) {
  if (req.isAuthenticated())
  res.redirect('/profile');
  return next();
}

module.exports = router;
