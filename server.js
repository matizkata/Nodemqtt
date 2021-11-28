const express = require('express');
const fs= require('fs');
const https = require('https');
const session = require('express-session');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const routes = require('./routes.js');
const config = require('./config.js');
const mqtt = require('./mqtt/mqtt_client.js');
const { sendESPstate } = require('./mqtt/mqtt_client');
var key_file = './certs/mosquittokey_nopass.pem';
var cert_file = './certs/mosquittocert.pem';

const app = express();
app.set('view engine', 'ejs');
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET'
}));
var tlsConfig = {
  key: fs.readFileSync(key_file),
  cert: fs.readFileSync(cert_file)
};


app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: config.facebookAuth.clientID,
    clientSecret: config.facebookAuth.clientSecret,
    callbackURL: config.facebookAuth.callbackURL
  }, function (accessToken, refreshToken, profile, done) {
    console.log(profile);
    console.log(accessToken);
    console.log(refreshToken);
    return done(null, profile);
  }
));


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/*router.get('/', function (req, res) {
  res.render('pages/index.ejs'); // load the index.ejs file
});*/

app.get('/', function (req, res) {
  res.render('pages/index.ejs'); // load the index.ejs file
});

app.get('/profile', isLoggedIn, function (req, res) {
  res.render('pages/profile.ejs', {
    user: req.user, // get the user out of session and pass to template
    states: globalStates['gpio1esp3']
  });
  console.log("Profile endpoint called");
});

app.get('/esp3/gpio1', isLoggedIn, function (req, res) {
  console.log("esp3gpio1 called");
  sendESPstate('esp3','gpio1',1);
  res.render('pages/profile.ejs', {
    user: req.user, // get the user out of session and pass to template
    states: globalStates
  });
} )

app.get('/error', isLoggedIn, function (req, res) {
  res.render('pages/error.ejs');
  console.log("Error endpoint called");
});

app.get('/auth/facebook', passport.authenticate('facebook'), function(req, res){
  console.log("cos sie wykonalo");
});

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/error'
  }));

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

function isNotLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    res.redirect('/profile');
  }
  return next();
}












///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



















//app.use('/', routes);

const port = 3000;
/*app.listen(port, () => {
  console.log('App listening on port ' + port);
});*/

var httpServer = https.createServer(tlsConfig, app);
httpServer.listen(port, function () {
  console.log('WoT Social Authentication Proxy started on port: %d', port);
  //sendESPstate('esp3','gpio4',1);
  //console.log(globalStates);
});
