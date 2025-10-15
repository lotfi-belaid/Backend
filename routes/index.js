var express = require('express');        // Import Express framework
var router = express.Router();           // Create a new router object

/* GET home page. */
router.get('/', function(req, res, next) {   // Define route for GET /
  res.json('index', { title: 'Express' });   // Send JSON response
});

module.exports = router;                  // Export the router for use in app.js