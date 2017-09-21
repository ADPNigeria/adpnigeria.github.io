var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var mongojs = require('mongojs');
var multer = require('multer');


var Membership = mongojs('mongodb://0.0.0.0:27017/Membership', ['members', 'authentication']);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('members', { title: 'Member Page'});
});

//route to check for verification
router.post('/checkVeri', function (req, res) {
	Membership.authentication.find({
		$and:[{
			$or:[
				{
					hashUser: req.body.param
				},
				{
					memNumber: req.body.param
				},
				{
					memEMail: req.body.param
				}
			]
		},
		{
			VariType: req.body.type
		}
		]
	}, function (err, data) {
		res.send(data);
	})
})

module.exports = router;
