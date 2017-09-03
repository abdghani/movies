var express = require('express');
var router = express.Router();
var path = require('path');
var index = require(path.join(__dirname,'..','controller','insert'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/insert', index.insert);

module.exports = router;
