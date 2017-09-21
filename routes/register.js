var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var mongojs = require('mongojs');
var mkdirp = require('mkdirp');
var md5 = require('md5');
var multer = require('multer');
var jsesc = require('jsesc');
var moment = require('moment');
var momenttz = require('moment-timezone');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var countries = require('country-list')();
var hbs = require('nodemailer-express-handlebars');

//random codes for mail verification
random = (howMany, chars) => {
    chars = chars
        || "ABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    let rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (let i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };

    return value.join('');
}


momenttz.tz.setDefault("Nigeria/Abuja")
//mutler for image upload
let storage = multer.diskStorage({
	destination: function(req, file, cb) {
		var foldername = file.originalname.split('.');
			cb(null, './public/membersData/'+foldername[0]+'/media/'); // setting the file location upload
	},
	filename: function(req, file, cb) {
			var thenewfilename = md5(Date.now() + '-' + file.originalname) + '.jpg'
			cb(null, thenewfilename); // setting the file name with concatinating date
	}
});

let upload = multer({
	storage: storage
}).single('picture'); // seting the file size limit


//now starting my mongojs database
var Nigeria = mongojs('mongodb://localhost:27017/Nigeria', ['PollingUnits', 'Senates', 'FederalConstituency'])
var Membership = mongojs('mongodb://0.0.0.0:27017/Membership', ['members', 'authentication']);


/* GET register page. */
router.get('/', function(req, res, next) {
  res.render('register', { title: 'Membership Registration' });

});

//get all the states and polling units
router.get('/getAllData', function (req, res) {
	Nigeria.PollingUnits.find().sort({stName: 1}, function (err, docs) {
		res.send(docs);
	})
});

//nodemailer settings
//This options sends mail
let transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'saniyhassan@gmail.com',
		pass: 'tillirise'
	}
});

//useing engine for mail view
transporter.use('compile', hbs({
	viewPath: 'view/email',
	extName: '.hbs'
}));

//route to register members and create folders
router.post('/createUser', function(req, res){
	//register members on the database
	if (req.body !== '') {
		//function to create folders
		var FoldName = req.body.full_name
		FoldName = FoldName.split(' ')
		var folderName = FoldName[0]+'_'+FoldName[1]+'_'+md5(req.body.full_name + req.body.phone_number + moment())
		mkdirp('./public/membersData/'+folderName);
		mkdirp('./public/membersData/'+folderName+'/media');
		mkdirp('./public/membersData/'+folderName+'/files');

		req.body.folderName = folderName
		let Senatorial, FedConstituency; // to hold the zones
		var regexstring = new RegExp("\\b"+req.body.lgaName+"\\b","ig") // regular expression to check Federal Constituency

		//querying mongodb to get the senate zone
		Nigeria.Senates.find({state_name: req.body.stName}, function (err, docs) {
			docs.forEach((item) => {
				var DBLGAName = item.composition.split(',')
				DBLGAName.forEach((itemSA) => {
					var loCalGovt = itemSA.trim();
					if (req.body.lgaName === loCalGovt) {
						Senatorial = item.senatorial_zone;
					}
				});
			});

			//querying mongodb to get the Federal  Constituency
			if (req.body.lgaName === 'Lagos Island') {
				FedConstituency = 'Lagos Island I/II'
			} else if (req.body.lgaName === 'Mushin') {
				FedConstituency = 'Mushin I/II'
			} else if (req.body.lgaName=== 'Oshodi/Isolo') {
				FedConstituency = 'Oshodi/Isolo I/II'
			} else if (req.body.lgaName === 'Surulere') {
				FedConstituency = 'Surulere I/II'
			} else if (req.body.lgaName === 'Port Harcourt') {
				FedConstituency = 'Port Harcourt I/II'
			} else {
				Nigeria.FederalConstituency.find({name_state: req.body.stName}, function (err, docsFED) {
					docsFED.forEach((itemFED) => {
						var FedName = itemFED.fed_const_name;
						if (FedName.match(regexstring) !== null) {
							FedConstituency = FedName;
						}
					});

					var CardCode = random(6) +''+ random(3); // temporary card code
					var smsCode = (req.body.phone_number === '') ? null : random(3) +'-'+ random(4); // sms verification code
					let VariCode = (req.body.email === '') ? null : md5(docs.lgaName + Date.now() + docs.full_name) // email verification code
					let UserData = req.body; // collecting user data from the frontend in json fomart
					let hashString = (req.body.phone_number === '') ? req.body.email : req.body.phone_number;
					UserData.dateCreated = moment().format() // date of Registration
					UserData.hashUser = md5(moment().format() + hashString) // unique identification for myself
					UserData.resCountry = countries.getName(UserData.countryRes) // to get the full name of a country with an ISO codes
					UserData.EmailVerified = false // for email activation sent to the person
					UserData.MemberAuth = {TempID: CardCode, CardID: '', mobileCode: smsCode, emailCode: VariCode} // storing all the codes here
					UserData.SMSVerified = false // for sms activation code sent to the person
					UserData.MemberVerified = false // for membership cards recieved from the party office
					UserData.adminLevel = 'Member' // this is to select level for party and users levels range from 1 - 7 where 1 is the highest
					UserData.Senatorial = Senatorial // the name of the user senatorial zone
					UserData.FedConstituency = FedConstituency // the name of the user federal constituency
					UserData.StateConstituency = '' // the name of the state constituency of user

					//finally inserting userdata into database
					Membership.members.insert(UserData, function(err,docs){
						if (!err) {
							if (docs.phone_number) {
								Membership.authentication.save({user_id: docs._id, memNumber: docs.phone_number, hashUser: docs.hashUser, VariCode: smsCode, VariType: 'SMS', dateCreated: moment().format(), memberName: docs.full_name})
							}
							if (docs.email) {
								Membership.authentication.save({user_id: docs._id, memEMail: docs.email, hashUser: docs.hashUser, VariCode: VariCode, VariType: 'email', dateCreated: moment().format(), memberName: docs.full_name}, () => {
									transporter.sendMail({
										from: '"ADP Web Verification" <no-reply@adp.ng>', // sender address
										to: docs.email, // list of receivers
										subject: docs.full_name + ' Please Activate Your Membership', // Subject line
										template: 'emailtempl', // email template
										context: {
											urlGet: docs.HostPlace +'verify/'+VariCode+'/'+docs.hashUser+'/email',
											full_name: docs.full_name,
										}
									});
								})
							}

							// creating membership id card verification

							Membership.authentication.save({user_id: docs._id, hashUser: docs.hashUser, VariCode: CardCode, VariType: 'MemCard', dateCreated: moment().format(), memberName: docs.full_name, memNumber: docs.phone_number, memEMail: docs.email})
							// Membership.members.findAndModify({query: {hashUser: docs.hashUser}, update: {$set: {MemberNumber: {TempID: CardCode, CardID: ''}, updatedOn: moment().format(), updateData: {memberCard: moment().format()}}}})
							res.json({UserInsert: docs, status: 'success'});
						}
					});
				})
			}
	   })

	}
});

// route to update passport picture
router.post('/update', function (req, res) {
	Membership.members.findAndModify({query: {hashUser: req.body.user_id}, update: {$set: {passport: req.body.param, updatedOn: moment().format(), "updateData.memberPic": moment().format()}}}, function (err, data) {
		res.json(data);
	})
});

// route to update information
router.post('/updateAllInfo', function (req, res) {
	var updateable = req.body;
	console.log(updateable);
	Membership.members.findAndModify({
		query: {
			_id: mongojs.ObjectId(updateable._id)
		},
		update: {
			$set: {
				countryRes: updateable.countryRes,
				phone_number: updateable.phone_number,
				raw_number: updateable.raw_number,
				full_name: updateable.full_name,
				email: updateable.email,
				gender: updateable.gender,
				dateofBirth: updateable.dateofBirth,
				pollingUnit: updateable.pollingUnit,
				stName: updateable.stName,
				wardName: updateable.wardName,
				lgaName: updateable.lgaName,
				residenceAdd: updateable.residenceAdd,
				resCountry: countries.getName(updateable.countryRes),
				Senatorial: updateable.Senatorial,
				FedConstituency: updateable.FedConstituency,
				StateConstituency: updateable.StateConstituency,
				updatedOn: moment().format(),
				"updateData.userProfileDate": moment().format()
			}
		}
	}, function (err, docs) {
		if (docs) {
			res.send(docs);
		} else {
			console.log(err);
		}
	})
});

//route to get search of pulling units
router.route('/getMySearch').get(function(req, res) {
	var recValue = req.query.statesMe;
	let splitValue = recValue.split(',');
	let filtred = splitValue.map((item) => {
		return item.trim();
	})

	let finalfil = filtred.filter((item) => {
		return item.length > 1;
	})
	var fillMe = finalfil[0];
	if (finalfil.length === 1) {
		Nigeria.PollingUnits.find({
			$or: [
				{
					stName: { $regex: fillMe }
				},
				{
					lgaName: { $regex: fillMe }
				},
				{
					wardName: { $regex: fillMe }
				},
				{
					psName: { $regex: fillMe }
				}
			 ]
		},
			{
				psName:1,
				wardName:1,
				lgaName: 1,
				stName: 1
			}, function (err, docs) {
				res.send(docs);
			})
	} else {
		Nigeria.PollingUnits.find({
			$or: [
				{
					wardName: {$regex: finalfil[0]},
					lgaName: {$regex: finalfil[1]}
				},
				{
					wardName: {$regex: finalfil[0]},
					stName: {$regex: finalfil[1]}
				},
				{
					psName: {$regex: finalfil[0]},
					wardName: {$regex: finalfil[1]}
				},
				{
					psName:{$regex: finalfil[0]},
					lgaName: {$regex: finalfil[1]}
				},
				{
					psName: {$regex: finalfil[0]},
					stName: {$regex: finalfil[1]}
				},
				{
					lgaName: {$regex: finalfil[0]},
					stName: {$regex: finalfil[1]}
				}
			]
		},
			{
				psName:1,
				wardName:1,
				lgaName: 1,
				stName: 1
			}, function (err, docs) {
				res.send(docs);
			})
	}
});

//route to get the wards
router.get('/getWARD', function (req, res) {
	Nigeria.PollingUnits.find({
			 stName: req.query.stateReg,
			 lgaName: req.query.lgaReg
		},
		{
			wardName: 1,
	}).sort({lgaName: 1}, function (err, docs) {
		res.send(docs);
	})
});

//get the polling units
router.get('/getPolling', function (req, res) {
	Nigeria.PollingUnits.find({
			 stName: req.query.stateName,
			 lgaName: req.query.localgovtName,
			 wardName: req.query.wardName
		},
		{
			psName: 1,
	}).sort({lgaName: 1}, function (err, docs) {
		res.send(docs);
	})
});

//getting the lga for confirmation display
router.get('/getLGA', function (req, res) {
	Nigeria.PollingUnits.find({
			 stName: req.query.statePlace
		},
		{
			lgaName: 1,
	}).sort({lgaName: 1}, function (err, docs) {
		res.send(docs);
	})
});

//check for duplicate user data phone and email
router.route('/checkExist').get(function (req, res) {
	Membership.members.find({
		$or: [{
				email: req.query.param
			},
			{
				phone_number: req.query.param
			},
			{
				raw_number: req.query.param
			},
			{
				hashUser: req.query.param
			}]
	}, function (err, docs) {
		if (!err) {
			res.json(docs);
		}
	})
});

// route to log user in
router.get('/logUserIn', function (req, res) {
  Membership.members.findOne({
	  $and: [
		  {
			  full_name: req.query.username
		  },
		  {
			  $or: [
				  {
					  phone_number: req.query.password
				  },
				  {
					  email: req.query.password
				  },
				  {
					  "MemberAuth.TempID": req.query.password
				  },
				  {
					  "MemberAuth.Card": req.query.password
				  },
				  {
					  raw_number: req.query.password
				  }
			  ]
		  }
	  ]
  }, function (err, docs) {
	  res.send(docs);
  })
});

//route to get the senate list
router.get('/senateList', function (req, res) {
	var senatesG, fedCon;
	//querying mongodb to get the senate zone
	Nigeria.Senates.find({state_name: req.query.state}, function (err, docs) {

		docs.forEach((item) => {
			var DBLGAName = item.composition.split(',')
			DBLGAName.forEach((itemSA) => {
				var loCalGovt = itemSA.trim();
				if (req.query.lgaName === loCalGovt) {
					 senatesG = item.senatorial_zone
				}
			});
		});

		Nigeria.FederalConstituency.find({name_state: req.query.state}, function (err, docsFED) {
			docsFED.forEach((itemFED) => {
				var regexstrig = new RegExp("\\b"+req.query.lgaName+"\\b","ig") // regular expression to check Federal Constituency
				var FedName = itemFED.fed_const_name;
				if (FedName.match(regexstrig) !== null) {
					fedCon = FedName;
					res.json({fedCon: fedCon, senatesG: senatesG});
				}
			});
		})
	});
});

// Picture uploading route for passport
router.route('/uploadPic').post(function(req, res) {
	upload(req, res, (err) => {
		if (err) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				res.json({success: false, messagePic: 'File excced the limit E72.4'}) // limit of picture size
			} else if (err.code === 'filetype') {
				res.json({success: false, messagePic: 'File type is not accepted E72.3'}) // checking the file type
			} else {
				res.json({success: false, messagePic: "File coould not upload E72.2"}) // other errors that may occur
			}
		} else {
			if (!req.file) {
				res.json({success: false, messagePic: "No file was posted E72.1"}) // checking for an empty input
			} else {
				res.json({success: true, messagePic: 'Thank You uploaded', filenamed: req.file.filename}) // succcessfully uploaded
			}
		}
		// Everything went fine
	})
})

module.exports = router;
