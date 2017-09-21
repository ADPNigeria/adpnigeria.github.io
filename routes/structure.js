var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var mongojs = require('mongojs');

//getting the mongojs
var Membership = mongojs('mongodb://0.0.0.0:27017/Membership', [ 'admins', 'official']);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('structure', { title: 'Party Structure' });
});

// getting the information out from the database for officials
router.get('/bringOut', function (req, res) {
  Membership.official.find().sort({officer_level: 1}, function (err, docs) {
	  console.log(docs);
  	res.send(docs);
  })
});


module.exports = router;
