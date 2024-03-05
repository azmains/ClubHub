var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mysql = require('mysql');

// this line creates a database pool dont touch it
var DatabasePool = mysql.createPool({ host: 'localhost',database: 'ClubHub' });

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var session = require('express-session');

var app = express();

// these are defult
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// this is for teh session token
app.use(session({
    secret: 'random',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // make this true if we gonna do https which is more secure
}));

app.use(function(req,res,next){
    req.pool= DatabasePool;
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;