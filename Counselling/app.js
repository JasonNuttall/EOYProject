var express = require('express');
var expressValidator = require('express-validator');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var index = require('./routes/index');
var app = express();
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Counselling');
var db = mongoose.connection;
var exphbs = require('express-handlebars');
var ConnectRoles = require('connect-roles');
var helpers = require('handlebars-helpers')();
var port = 8000;
var https = require('https')
var config = require('config');
console.log(config.util.getEnv('NODE_ENV'));
var session_port = config.get('data.port');
var session_host = config.get('data.host');
var session_ssl_key = config.get('data.ssl_key');
var session_ssl_crt = config.get('data.ssl_crt');
var ExpressPeerServer = require('peer').ExpressPeerServer;
const fs = require('fs');

// view engine setup
app.engine('.hbs', exphbs({helpers :helpers,defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());


// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
app.use(flash());
var options = {
    key:  fs.readFileSync('./ssl/' + session_ssl_key),
    cert: fs.readFileSync('./ssl/' + session_ssl_crt),
};

var server = https.createServer(options, app).listen(port, function(){
  console.log("HTTPS server listening on port " + port);
});

var options = {
    debug: true,
    proxied: true
}


app.use('/api', ExpressPeerServer(server, options));

server.on('connection', function(id) {
   // console.log(id)
  //console.log(server)
});

server.on('disconnect', function(id) {
    console.log(id + "deconnected")
});

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});


app.use('/', index);


module.exports = app;
