var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require("express-session");
var app = express();

// Setup Local Strategy
passport.use(new LocalStrategy(
    function(username, password, done) {
        username.findOne({username: username }, function (err, user) {
            if(err) {return done(err);}
            if(!user) {
                return done(null, false, {message: 'Incorrect Username.'});
            }
            if(!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect Password.'});
            }
            return done(null, user);
        });
    }
));

var env = process.env.NODE_ENV || 'development';
if ('development' == env){
    app.use('/static', express.static('public'));
    //app.use(express.cookieParser());
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(session({secret: "malazan"}));

    // Initialize Passport and Sessions
    app.use(passport.initialize());
    app.use(passport.session());

    //app.use(app.router);
};

// Set up handlebars view engine
var handlebars = require('express-handlebars').create({ defaultLayout:'main'});

// Set Handlebars Engine
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Serialize
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
// Deserialize
passport.deserializeUser(function(id, done) {
    User.findByID(id, function(err, user) {
        done(err, user);
    });
});

// Set Port
app.set('port', process.env.PORT || 3000);
app.set('mysql', mysql);

// Require Pages
app.use('/landing_page', require('./public/landing_page.js'));
app.use('/sign_up', require('./public/sign_up.js'));
app.use('/dashboard', require('./public/dashboard.js'));
app.use('/manageuniverse', require('./public/manageuniverse.js'));
app.use('/logout', require('./public/logout.js'));
app.use('/addCharacter', require('./public/addCharacter.js'));
app.use('/addLocation', require('./public/addLocation.js'));

// Web Pages
//landing page with log-in
app.get('/', function(req, res) {
    res.render('landing_page');
});

//page to create new account
app.get('/sign_up', function(req, res) {
    res.render('sign_up');
});

//commented this out for now while we use a temporary workaround
/*
app.post('/login', 
    passport.authenticate('local', {
        successRedirect: '/dashboard',  // of user?
        failureRedirect: '/login',
        failureFlash: 'Invalid Username or Password',
        successFlash: 'Welcome!'})//, 
    //function(req, res) {
    //res.render('login');
    //}
);
*/

app.post('/sign_up', function(req, res) {
    res.render('sign_up');
});

app.get('/dashboard/:userID', passport.authenticate('local'), function(req, res) {
    // user data in req.user
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('dashboard/' + req.params.userID);
    //res.render('dashboard');
});

app.get('/manageuniverse/:univID', function(req, res) {
    res.redirect('manageuniverse/' + req.params.univID);
});

app.get('/manageuniverse/:univID/addLocation', function(req, res) {
    res.render('manageuniverse/' + req.params.univID +'/addLocation');
});

app.get('/addCharacter', function(req, res) {
    res.render('manageuniverse/' + req.params.univID +'/addCharacter');
});

app.get('/logout', passport.authenticate('local'), function(req, res) {
    req.logout();
    res.redirect('/');
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

// Listen
app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate.' );
});

