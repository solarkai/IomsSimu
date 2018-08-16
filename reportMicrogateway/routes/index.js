var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("get request:/");
  res.render('index', { title: 'zhangkai' });
});

module.exports = router;
