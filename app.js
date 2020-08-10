const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const authenticate = require('./authenticate');
const config = require('./config');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const uploadRouter = require('./routes/uploadRouter');

const mongoose = require('mongoose');

//const Dishes = require('./models/dishes');

//const url = 'mongodb://localhost:27017/conFusion';
const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

const app = express();

// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//--------------------------passport+jwt-------------------------------------------------
app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);
//---------------------------------------------------------------------------------------
//----------------------------passport auth----------------------------------------------
//app.use(cookieParser());
// app.use(session({
//   name: 'session-id',
//   secret: '12345-67890-09876-54321',
//   saveUninitialized: false,
//   resave: false,
//   store: new FileStore()
// }));

// app.use(passport.initialize());
// app.use(passport.session());

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// function auth (req, res, next) {
//   console.log(req.user);

//   if (!req.user) {
//     const err = new Error('You are not authenticated!');
//     err.status = 403;
//     next(err);
//   }
//   else {
//         next();
//   }
// }
//---------------------------------------------------------------------------------------
//----------------------------express session basic auth 2--------------------------------
// app.use(session({
//   name: 'session-id',
//   secret: '12345-67890-09876-54321',
//   saveUninitialized: false,
//   resave: false,
//   store: new FileStore()
// }));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// function auth (req, res, next) {
//   console.log(req.session);

//   if(!req.session.user) {
//     const err = new Error('You are not authenticated!');
//     err.status = 403;
//     return next(err);
//   }
//   else {
//     if (req.session.user === 'authenticated') {
//       next();
//   }
//     else {
//       const err = new Error('You are not authenticated!');
//       err.status = 403;
//       return next(err);
//     }
//   }
// }
//---------------------------------------------------------------------------------------
//---------------------------express session basic auth 1--------------------------------
// app.use(session({
//   name: 'session-id',
//   secret: '12345-67890-09876-54321',
//   saveUninitialized: false,
//   resave: false,
//   store: new FileStore()
// }));

// function auth (req, res, next) {
//     console.log(req.session);

//     if (!req.session.user) {
//         const authHeader = req.headers.authorization;
//         if (!authHeader) {
//             const err = new Error('You are not authenticated!');
//             res.setHeader('WWW-Authenticate', 'Basic');                        
//             err.status = 401;
//             next(err);
//             return;
//         }
//         const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
//         const user = auth[0];
//         const pass = auth[1];
//         if (user == 'admin' && pass == 'password') {
//             req.session.user = 'admin';
//             next(); // authorized
//         } else {
//             const err = new Error('You are not authenticated!');
//             res.setHeader('WWW-Authenticate', 'Basic');
//             err.status = 401;
//             next(err);
//         }
//     }
//     else {
//         if (req.session.user === 'admin') {
//             console.log('req.session: ',req.session);
//             next();
//         }
//         else {
//             const err = new Error('You are not authenticated!');
//             err.status = 401;
//             next(err);
//         }
//     }
// }
//-------------------------------------------------------------------------
//----------------------------cookie parser basic auth---------------------
// app.use(cookieParser('12345-67890-09876-54321'));

// function auth (req, res, next) {

//   if (!req.signedCookies.user) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         const err = new Error('You are not authenticated!');
//         res.setHeader('WWW-Authenticate', 'Basic');              
//         err.status = 401;
//         next(err);
//         return;
//     }
//     const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
//     const user = auth[0];
//     const pass = auth[1];
//     if (user == 'admin' && pass == 'password') {
//         res.cookie('user','admin',{signed: true});
//         next(); // authorized
//     } else {
//         const err = new Error('You are not authenticated!');
//         res.setHeader('WWW-Authenticate', 'Basic');              
//         err.status = 401;
//         next(err);
//     }
//   }
//   else {
//       if (req.signedCookies.user === 'admin') {
//           next();
//       }
//       else {
//           const err = new Error('You are not authenticated!');
//           err.status = 401;
//           next(err);
//       }
//   }
// }
//-----------------------------------------------------------------------------
//--------------------------------------basic auth-----------------------------
// function auth (req, res, next) {
//   console.log(req.headers);
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//       const err = new Error('You are not authenticated!');
//       res.setHeader('WWW-Authenticate', 'Basic');
//       err.status = 401;
//       next(err);
//       return;
//   }

//   const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
//   const user = auth[0];
//   const pass = auth[1];
//   if (user == 'admin' && pass == 'password') {
//       next(); // authorized
//   } else {
//       const err = new Error('You are not authenticated!');
//       res.setHeader('WWW-Authenticate', 'Basic');      
//       err.status = 401;
//       next(err);
//   }
// }
//--------------------------------------------------------------------------------

//app.use(auth); // important for prev auth

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);
app.use('/imageUpload',uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
