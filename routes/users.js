var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/hello', function (req, res, next) {
  res.json('hello with a resource');
});

module.exports = router;