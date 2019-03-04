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

// Set up handlebars view engine
var handlebars = require('express-handlebars').create({ defaultLayout:'main' });

// Set Handlebars Engine
app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');

// Sessions
app.use(session({secret: "malazan"}));

// Initialize Passport and Sessions
app.use(passport.initialize());
app.use(passport.session());

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
app.set('port', process.env.PORT || 6663);
app.set('mysql', mysql);

// Require Pages
app.use('/landing_page', require('./public/landing_page.js'));
app.use('/login', require('./public/login.js'));
app.use('/sign_up', require('./public/sign_up.js'));
app.use('/dashboard', require('./public/dashboard.js'));
app.use('/logout', require('./public/logout.js'));

// Web Pages
app.get('/landing_page', function(req, res) {
    res.render('landing_page');
})

app.post('/login', 
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: 'Invalid Username or Password',
        successFlash: 'Welcome!'}), 
    function(req, res) {
    res.render('login');
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.post('/sign_up', function(req, res) {
    res.render('sign_up');
});

app.get('/dashboard', function(req, res) {
    res.render('dashboard');
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
  console.log( 'Express started on http://flip#.engr.oregonstate.edu:' + 
    app.get('port') + '; press Ctrl-C to terminate.' );
});
