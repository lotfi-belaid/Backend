var createError = require('http-errors');           // Import module to create HTTP errors
var express = require('express');                   // Import Express framework
var path = require('path');                         // Import path utilities for file paths
var cookieParser = require('cookie-parser');        // Import middleware to parse cookies
var logger = require('morgan');                     // Import HTTP request logger

const http = require('http');                       // Import Node.js HTTP module
require('dotenv').config();                         // Load environment variables from .env file

var indexRouter = require('./routes/index');        // Import routes for the home page
var usersRouter = require('./routes/users');        // Import routes for /users

var app = express();                                // Create an Express application

//Hkilqwop123&:
//mongodb+srv://lotfi_belaid:Hkilqwop123&:@cluster0.yrdne1w.mongodb.net/
// (These are just comments, not code)

app.use(logger('dev'));                             // Use morgan to log requests in 'dev' format
app.use(express.json());                            // Parse incoming JSON requests
app.use(express.urlencoded({ extended: false }));   // Parse URL-encoded data
app.use(cookieParser());                            // Parse cookies in requests
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder

app.use('/', indexRouter);                          // Use indexRouter for root path
app.use('/users', usersRouter);                     // Use usersRouter for /users path

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));                           // If no route matches, create a 404 error
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;                 // Set error message
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // Show error details only in development

  // render the error page
  res.status(err.status || 500);                    // Set response status
  res.json('error');                                // Send 'error' as JSON response
});

const server = http.createServer(app);   
           // Create HTTP server with Express app
server.listen(process.env.Port, () => {                         // Start server on port 5000
  console.log("server is running on port 5000");
});