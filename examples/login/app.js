var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , YandexStrategy = require('passport-yandex-no-pkginfo').Strategy;

var YANDEX_CLIENT_ID = "--insert-yandex-client-id-here--"
var YANDEX_CLIENT_SECRET = "--insert-yandex-client-secret-here--";


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Yandex profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the YandexStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Yandex
//   profile), and invoke a callback with a user object.
passport.use(new YandexStrategy({
    clientID: YANDEX_CLIENT_ID,
    clientSecret: YANDEX_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/yandex/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Yandex profile is returned
      // to represent the logged-in user.  In a typical application, you would
      // want to associate the Yandex account with a user record in your
      // database, and return that user instead.
      return done(null, profile);
    });
  }
));




var app = express.createServer();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/yandex
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Yandex authentication will involve
//   redirecting the user to yandex,ru.  After authorization, Yandex
//   will redirect the user back to this application at /auth/yandex/callback
app.get('/auth/yandex',
  passport.authenticate('yandex'),
  function(req, res){
    // The request will be redirected to Yandex for authentication, so this
    // function will not be called.
  });

// GET /auth/yandex/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/yandex/callback',
  passport.authenticate('yandex', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
