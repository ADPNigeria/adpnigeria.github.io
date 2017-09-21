
function dataURItoBlob(dataURI, type) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var bb = new Blob([ab], { type: type });
    return bb ;
}

// function for checking preview
function PreviewIcon() {
	var ImageSize = 13000000 //file limit size
	var ImageType = ['image/jpg', 'image/jpeg', 'image/png'] //file acceptable type

	var FileSize = document.getElementById('passport').files[0].size // user file size sent
	var FileType = document.getElementById('passport').files[0].type // user file type sent


	if (FileSize > ImageSize) {
		$('#ShowImage').append('<strong>The Image is too large make sure it below <code>1.3MB</code></strong>')
	} else if ($.inArray(FileType, ImageType) === -1) {
		$('#ShowImage').append('<strong>The Image type must be in the format of <code>JPEG, PNG or JPG</code></strong>')
	} else {
	// load a url and file object
	const upload = document.getElementById('passport').files[0];
	watermark([upload, '/images/watermark.jpg'])
	  .image(watermark.image.upperLeft(0.4))
	  .then((img) => {
		  $('#preview').prop('src', img.src);
	  });
	}


};


$(document).ready(function() {
	$('input[type=file]').bootstrapFileInput();
	setTimeout(function () {

		var states = ["ABIA", "ADAMAWA", "AKWA IBOM", "ANAMBRA", "BAUCHI", "BAYELSA", "BENUE", "BORNO", "CROSS RIVER", "DELTA", "EBONYI", "EDO", "EKITI", "ENUGU", "FCT", "GOMBE", "IMO", "JIGAWA", "KADUNA", "KANO", "KATSINA", "KEBBI", "KOGI", "KWARA", "LAGOS", "NASARAWA", "NIGER", "OGUN", "ONDO", "OSUN", "OYO", "PLATEAU", "RIVERS", "SOKOTO", "TARABA", "YOBE", "ZAMFARA"];



		$.ajax({url: 'getAllData', type: 'GET', dataType: 'JSON'}).done(function(data) {
			var emptyData = [' '];

			data.forEach(elem => {
				states.forEach(elemSta => {
					if ($.inArray(elem.stName, emptyData) === -1) {
						emptyData.push(elem.stName)
					}
				});
			});

			emptyData.forEach(elem => {
				$('#stateReg').append("<option value='"+elem+"'>"+elem+"</option>")
			});

		}).fail(function(error) {
			console.log('the error ');
		});

	}, 10000);

	// function to check email format

	function isEmail(email) {
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	}

	(() => {
		let full_name = $('#full_name');
		let phone_number = $('#phone_number');
		let email = $('#email');
		let gender = $('#gender');
		let dateofBirth = $('#dateofBirth');
		let NextBtn = $('#NextBtn');
		let preview = $('#preview');
		let picture = $('#picture');
		let stateReg = $('#stateReg');
		let localgovt = $('#localgovt');
		let wardCT = $('#wardCT');
		let pollingUnit = $('#pollingUnit');
		let Resadd = $('#Resadd');
		let countryRes = $('#countryRes');
		let theData = {};
		let theError = [];

		let loginForm = $('#getLogin input[type=text]');
		let loginName = $('#loginName');
		let loginPass = $('#loginPassword');
		let loginBTN = $('#loginBTN');

		theData.countryRes = 'NG'

		//function to log user data in
		loginBTN.click(function(event) {
			loginBTN.attr('disabled', '');
			event.preventDefault()
			loginForm.each(function() {
				if ($(this).val() === '') {
					$(this).parent('div').addClass('has-error')
				} else {
					var logPass = loginPass.val();
					$.getJSON('logUserIn', {username: loginName.val(), password: logPass.replace(/\s+/g, '')}, function(json, textStatus) {
						if (json) {
							var dataSes = sessionStorage.setItem('user_id', json._id);
							var dataHash = sessionStorage.setItem('hashUser', json.hashUser);
							window.location.replace('/members/')
						} else {
							$('#logErr').addClass('text-danger').html('<span class="text-danger">Please check your Details one may not be correct</span>')
							loginBTN.removeAttr('disabled');
						}
					});
				}
			});
		});

		full_name.change(function(event) {
			$('#namealert').fadeOut('slow');
			if (full_name.val() !== '') {
				let getNames = full_name.val().split(' ')
				if (getNames.length <= 1) {
					full_name.parent().addClass('has-warning')
					$('#namealert').fadeIn('slow');
					if ($.inArray('full_name', theError) === -1) {
						theError.push('full_name');
					}
				} else if (getNames[1] === '') {
					full_name.parent().addClass('has-warning')
					$('#namealert').fadeIn('slow');
					if ($.inArray('full_name', theError) === -1) {
						theError.push('full_name');
					}
				} else {
					if (theError.length >= '1') {
						var indexFN = theError.indexOf('full_name');
						if ($.inArray('full_name', theError) > -1) {
							 theError.splice(indexFN, 1);
						}
					}
					theData.full_name = full_name.val()
					full_name.parent().removeClass('has-warning')
				}
			}
		});
		var cleave = new Cleave('#dateofBirth', {
			date: true,
			//  delimiter: '-',
			datePattern: ['d', 'm', 'Y']
		});

		var phone = new Cleave('#phone_number', {
			phone: true,
			phoneRegionCode: 'ng'
		});

		$("#phone_number").intlTelInput({
			initialCountry: "auto",
			geoIpLookup: function(callback) {
				$.get('http://ipinfo.io', function() {}, "jsonp").always(function(resp) {
					var countryCode = (resp && resp.country)
						? resp.country
						: "";
					callback(countryCode);
				});
			},
			utilsScript: "/components/intl-tel-input/build/js/utils.js" // just for formatting/placeholders etc
		});

		var telInput = $("#phone_number"),
			errorMsg = $("#error-msg"),
			validMsg = $("#valid-msg");

		// initialise plugin
		telInput.intlTelInput({utilsScript: "components/intl-tel-input/build/js/utils.js"});

		var reset = function() {
			telInput.removeClass("error");
			errorMsg.addClass("hide");
			validMsg.addClass("hide");
		};

		// on blur: validate
		telInput.blur(function() {
			reset();
			if (theError.length >= '1') {
				var indexPhone = theError.indexOf('phone_number');
				if ($.inArray('phone_number', theError) > -1) {
					theError.splice(indexPhone, 1);
				}
			}
			if ($.trim(telInput.val())) {
				if (telInput.intlTelInput("isValidNumber")) {
					validMsg.removeClass("hide");
					$('#phone_number').removeClass('has-warning')
					$('#phonealert').hide('slow');
					$('#phone_number').parent().removeClass('has-warning')

					//checking if user phone number already exist
					$.getJSON('checkExist', {param: $('#phone_number').intlTelInput("getNumber")}, function(json, textStatus) {
						if (json.length >= 1) {
							$('#phonealert').fadeIn('slow');
							$('#phoneError').html('already exist. <code>E66.3</code>')
							$('#phone_number').parent().addClass('has-warning')
							theData.phone_number = ''
							if ($.inArray('phone_number', theError) === -1) {
								theError.push('phone_number');
							}
						} else {
							if (theError.length >= '1') {
								var indexPhone = theError.indexOf('phone_number');
								if ($.inArray('phone_number', theError) > -1) {
									theError.splice(indexPhone, 1);
								}
							}
							theData.phone_number = $('#phone_number').intlTelInput("getNumber");
							var rawNumber = $('#phone_number').val();
							theData.raw_number = rawNumber.replace(/\s+/g, '');
						}
					});
				} else {
					telInput.addClass("error");
					errorMsg.removeClass("hide");
					$('#phone_number').addClass('has-warning')
					if ($.inArray('phone_number', theError) === -1) {
						theError.push('phone_number')
					}
				}
			}
		});

		// on keyup / change flag: reset
		telInput.on("keyup change", reset);

		email.change(function(event) {
			$('#emailalert').fadeOut('fast');
			if (isEmail(email.val())) {
				email.parent().removeClass('has-warning')
				email.parent().removeClass('has-error')
				$('#phonealert').fadeOut('fast');
				phone_number.parent().removeClass('has-error')

				//checking if user email already exist
				$.getJSON('checkExist', {param: email.val()}, function(json, textStatus) {
					if (json.length >= 1) {
						$('#emailalert').fadeIn('slow');
						$('#emailError').html('already exist. <code>E56.3</code>')
						email.parent().addClass('has-warning')
						theData.email = ''
						if ($.inArray('email', theError) === -1) {
							theError.push('email');
						}
					} else {
						email.parent().removeClass('has-warning')
						email.parent().removeClass('has-error')
						if (theError.length >= '1') {
							var indexEmail = theError.indexOf('email');
							if ($.inArray('email', theError) > -1) {
								theError.splice(indexEmail, 1);
							}
						}
						theData.email = email.val()
					}
				});
			} else {
				$('#emailalert').fadeIn('slow');
				$('#emailError').html('Invalid Email Format. <code>E56.1</code>')
				email.parent().addClass('has-warning')
				theData.email = ''
				if ($.inArray('email', theError) === -1) {
					theError.push('email');
				}
			}
		});

		gender.change(function(event) {
			if (gender.val() === 'male' || gender.val() === 'female') {
				theData.gender = gender.val()
				if (theError.length >= '1') {
					var indexGender = theError.indexOf('gender');
					if ($.inArray('gender', theError) > -1) {
						 theError.splice(indexGender, 1);
					}
				}
			} else {
				if ($.inArray('gender', theError) === -1) {
					theError.push('gender')
				}
			}
		});

		stateReg.change(function(event) {
			var emptyLGA = ['Select Your Local Govt'];
			$('#localgovt').html('')

			if (stateReg.val() !== '') {
				theData.stName = stateReg.val()
				theError.stName = false
				$.ajax({
					url: 'getLGA',
					type: 'GET',
					dataType: 'JSON',
					data: {statePlace: stateReg.val()}
				})
				.done(function(data) {
					data.forEach(elemST => {
						if ($.inArray(elemST.lgaName, emptyLGA) === -1) {
							emptyLGA.push(elemST.lgaName)
						}
					});

					emptyLGA.forEach(elemLGA => {
						$('#localgovt').append("<option value='"+elemLGA+"'>"+elemLGA+"</option>")
					});
				})
				.fail(function() {
					console.log("error");
				});
			}
		});


		var PSName, WARDName, LGAName, STName;

		//search input for the PollingUnits

		$('#goSearch').click(function(event) {
			var theValue = $("#searchUnit").val();
			$("#HoldCard").html(' ')
			$("#searchQuery").html(theValue)

			if ($("#searchUnit").val() !== '') {
				$('#pollModal').modal('show');
			}
			$("#colState span").html(0)
			$("#colLga span").html(0)
			$("#colWard span").html(0)
			$("#colPU span").html('Loading...')

			/* Act on the event */
			let colState = [];
			let colLga = [];
			let colWard = [];
			let colPU = [];

			setTimeout(function () {
			var dataReady =	$.ajax({
					url: 'getMySearch',
					type: 'GET',
					dataType: 'JSON',
					data: {statesMe: theValue.toUpperCase()}
				})
				.done(function(data) {
					return data;
				})
				.fail(function(data) {
					console.log("error", data);
				});

				dataReady.then((value) => {
					value.forEach(elem => {
						if ($.inArray(elem.stName, colState) === -1) {
							colState.push(elem.stName)
						}
					});

					value.forEach((item) => {
						if ($.inArray(item.lgaName, colLga) === -1) {
							colLga.push(item.lgaName)
						}
					});

					value.forEach((item) => {
						if ($.inArray(item.wardName, colWard) === -1) {
							colWard.push(item.wardName)
						}
					});

					value.forEach((item) => {
						colPU.push(item);

					});
				});
			}, 3000);


			// the process of displaying search results
			setTimeout(function () {
					$("#colPU span").html(colPU.length)
					var theHoldCard = []
				colPU.forEach((item) => {
					let stateSt = (item.stName !== 'FCT') ? ' State.' : '.';
					theHoldCard.push('<div class="well well-sm shadowed HoldCard"><small>Polling/Voting Unit</small><p><strong>'+item.psName+'</strong> <br>of <strong>'+item.wardName+'</strong> Ward,<br> <strong>'+item.lgaName+'</strong> LGA, <br> <strong>'+item.stName+ '</strong>'+stateSt+'</p></div>')
				});

				//spliting arrays for proper pagination display
				var i,j,temparray,chunk = 10;
				var theArray = []
				for (i=0,j=theHoldCard.length; i<j; i+=chunk) {
				    temparray = theHoldCard.slice(i,i+chunk);
				    // do whatever
					theArray.push(temparray)
				}

				//paginating results
					$("#HoldCard").html(theArray[0]) // first result to display on the paginate
		          // init bootpag
		          $('#page-selection').bootpag({
		              total: theArray.length,
						  page: 1,
						  maxVisible: 5,
		          }).on("page", function(event, /* page number here */ num){
		               $("#HoldCard").html(theArray[num - 1]); // some ajax content loading...
		          });

					 //the process of selecting data to use
					 var HoldDivs = $("#HoldCard div");
					 HoldDivs.click(function(event) {
						 $("#HoldCard div").removeClass('activated')
						 var params = $(this).children('p').children('strong');
						 $(this).addClass('activated')
						 PSName = params[0].innerHTML;
						 WARDName = params[1].innerHTML;
						 LGAName = params[2].innerHTML;
						 STName = params[3].innerHTML;

						 $("#register #pollingUnit").css('display', 'none');
						 $("#register #grabPU").attr('type', 'text').attr('value', PSName);
						 theData.pollingUnit = PSName
						 $("#register #stateReg").css('display', 'none');
						 $("#register #grabST").attr('type', 'text').attr('value', STName);
						 theData.stName = STName
						 $("#register #wardCT").css('display', 'none');
						 $("#register #grabWARD").attr('type', 'text').attr('value', WARDName);
						 theData.wardName = WARDName
						 $("#register #localgovt").css('display', 'none');
						 $("#register #grabLGA").attr('type', 'text').attr('value', LGAName);
						 theData.lgaName = LGAName
						 $('#clearRe').html('Edit Fields')
						 setTimeout(function () {
						 	$('#pollModal').modal('hide')
						}, 3000);
					 });


					 $('#clearRe').click(function(event) {
						 $("#register #pollingUnit").css('display', 'block');
						 $("#register #grabPU").attr('type', 'hidden').attr('value', '');
						 theData.pollingUnit = ''
						 $("#register #stateReg").css('display', 'block');
						 $("#register #grabST").attr('type', 'hidden').attr('value', '');
						 theData.stName = ''
						 $("#register #wardCT").css('display', 'block');
						 $("#register #grabWARD").attr('type', 'hidden').attr('value', '');
						 theData.wardName = ''
						 $("#register #localgovt").css('display', 'block');
						 $("#register #grabLGA").attr('type', 'hidden').attr('value', '');
						 theData.lgaName = ''
						 $('#clearRe').html('')
					 });


					 $("#page-selection ul li").each(function() {
						 $(this).click(function(event) {
							 HoldDivs = $("#HoldCard div")
							 HoldDivs.click(function(event) {
								 $("#HoldCard div").removeClass('activated')
	   						 var params = $(this).children('p').children('strong');
	   						 $(this).addClass('activated')
	   						 PSName = params[0].innerHTML;
	   						 WARDName = params[1].innerHTML;
	   						 LGAName = params[2].innerHTML;
	   						 STName = params[3].innerHTML;

	   						 $("#register #pollingUnit").css('display', 'none');
	   						 $("#register #grabPU").attr('type', 'text').attr('value', PSName);
	   						 theData.pollingUnit = PSName
	   						 $("#register #stateReg").css('display', 'none');
	   						 $("#register #grabST").attr('type', 'text').attr('value', STName);
	   						 theData.stName = STName
	   						 $("#register #wardCT").css('display', 'none');
	   						 $("#register #grabWARD").attr('type', 'text').attr('value', WARDName);
	   						 theData.wardName = WARDName
	   						 $("#register #localgovt").css('display', 'none');
	   						 $("#register #grabLGA").attr('type', 'text').attr('value', LGAName);
	   						 theData.lgaName = LGAName
	   						 $('#clearRe').html('Edit Fields')
	   						 console.log(theData);
							 });
						 });
					 });
			}, 4030);
		});


		localgovt.change(function(event) {
			var emptyWard = ['Select Your Ward'];
			wardCT.html(' ')
			$.ajax({
				url: 'getWARD',
				type: 'GET',
				dataType: 'JSON',
				data: {stateReg: stateReg.val(), lgaReg: localgovt.val()}
			})
			.done(function(data) {
				data.forEach(elemDT => {
					if ($.inArray(elemDT.wardName, emptyWard) === -1) {
						emptyWard.push(elemDT.wardName)
					}
				});
				emptyWard.forEach(elemWard => {
					// body...
					wardCT.append("<option value='"+elemWard+"'>"+elemWard+"</option>")
				});
			})
			.fail(function() {
				console.log("error");
			});
			theData.lgaName = localgovt.val()
		});

		wardCT.change(function(event) {
			var emptyPU = ['Select Your Unit'];
			pollingUnit.html(' ')
			$.ajax({
				url: 'getPolling',
				type: 'GET',
				dataType: 'JSON',
				data: {stateName: stateReg.val(), localgovtName: localgovt.val(), wardName: wardCT.val()}
			})
			.done(function(data) {
				pollingUnit.html('<option value="">Please select your polling unit</option>')
				data.forEach(elemPU => {
					pollingUnit.append("<option value='"+elemPU.psName+"'>"+elemPU.psName+"</option>")
				});
			})
			.fail(function() {
				console.log("error");
			});

			theData.wardName = wardCT.val()
		});

		pollingUnit.change(function(event) {
			if (pollingUnit.val() !== '') {
				theData.pollingUnit = pollingUnit.val()
			} else {
				theData.pollingUnit = ''
			}
		});


		Resadd.change(function(event) {
			theData.residenceAdd = Resadd.val()
		});

		countryRes.change(function(event) {
			if (countryRes.val() !== '') {
				theData.countryRes = countryRes.val()
				if (theError.length >= '1') {
					var indexCR = theError.indexOf('countryRes');
					if ($.inArray('countryRes', theError) > -1) {
						theError.splice(indexCR, 1);
					}
				}
			} else {
				theData.countryRes = ''
				if ($.inArray('countryRes', theError) === -1) {
					theError.push('countryRes')
				}
			}
		});

		dateofBirth.change(function(event) {
			let receivedDate = moment(dateofBirth.val(), "DD MM YYYY");
			if (receivedDate.isAfter()) {
				dateofBirth.parent().addClass('has-error')
				$('#DOBMsg').show('slow')
				$('#DOBMsg').addClass('alert-danger')
				$('#DOBAlert').html('Selected value is a future time')
				theData.dateofBirth = '';
				if ($.inArray('dateofBirth', theError) === -1) {
					theError.push('dateofBirth')
				}
			} else if (moment().diff(receivedDate, 'years', false) <= 15) {
				dateofBirth.parent().addClass('has-warning')
				$('#DOBMsg').addClass('alert-warning')
				$('#DOBAlert').html('Voter age limit is 18')
				theData.dateofBirth = '';
				if ($.inArray('dateofBirth', theError) === -1) {
					theError.push('dateofBirth')
				}
			} else {
				dateofBirth.parent().removeClass('has-error');
				$('#DOBMsg').removeClass('alert-danger');
				theData.dateofBirth = receivedDate._i;
				if (theError.length >= '1') {
					var indexDOB = theError.indexOf('dateofBirth');
					if ($.inArray('dateofBirth', theError) > -1) {
						theError.splice(indexDOB, 1);
					}
				}
			}

		});


		NextBtn.click(function(event) {
			NextBtn.attr('disabled', '');
			$('#GError').hide('slow')
			var lpfiles = $('.form-control')
			var dontGo = [];

			lpfiles.each(function() {
				if ($(this).prop('required') && $(this).val() === '') {
					$(this).parent().addClass('has-warning')
					dontGo.push($(this))
				} else {
					dontGo = []
				}
			});

			if (phone_number.val() === '' && email.val() === '') {
				NextBtn.removeAttr('disabled')
					$('#GError').fadeIn('slow').html('Phone Number or Email Must be provided. <code>E55.4</code>')
					phone_number.parent().addClass('has-error')
					email.parent().addClass('has-error')

				} else if (theError.length >= 1) {
					NextBtn.removeAttr('disabled')
					$('#GError').fadeIn('slow').html('Please correct the errors above. <code>E57.2</code>')

				} else if (dontGo.length >= 1) {
					NextBtn.removeAttr('disabled')
					$('#GError').fadeIn('slow').html('Please correct the errors above. <code>E57.2</code>')
				} else {
				  $('#GError').hide('slow');
				  phone_number.parent().removeClass('has-error')
				  email.parent().removeClass('has-error')

				  theData.HostPlace = window.location.hostname

				  // insert into database
	  			$.ajax({
	  				url: 'createUser',
	  				type: 'POST',
	  				dataType: 'JSON',
	  				data: theData
	  			})
	  			.done(function(data) {

					// sending sms for confirmation
				  if (phone_number.val() !== '') {
					  var owneremail = 'saniyhassan@gmail.com';
					  var subacct = 'THEBRIDGE';
					  var subacctpwd = 'thebridges';
					  var senderNum = 'ADP Office';
						var SMSmes = 'Hello '+data.UserInsert.full_name+' Please insert this '+data.UserInsert.MemberAuth.mobileCode +' to verify your account \nThank You \nOne Destiny';
						$.post('http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+owneremail+'&subacct='+subacct+'&subacctpwd='+subacctpwd+'&message='+SMSmes+'&sender='+senderNum+'&sendto='+data.UserInsert.phone_number+'&msgtype=0');
				  }


					if ($('#passport').val() !== '') {
						var uploadFile = document.getElementById('passport').files[0].name
						var getImage = dataURItoBlob($('#preview').prop('src'), 'image/jpeg')
						var fd = new FormData();
						fd.append('picture', getImage, data.UserInsert.folderName+'.jpg');
						$.ajax({
							type: 'POST',
							url: 'uploadPic',
							data: fd,
							processData: false,
							cache: false,
							contentType: false
						}).done(function(dataPIC) {
							$.post('update', {param: dataPIC.filenamed, user_id: data.UserInsert.hashUser}, function(dataUP, textStatus, xhr) {
								var dataSes = sessionStorage.setItem('user_id', data.UserInsert._id);
								var dataHash = sessionStorage.setItem('hashUser', data.UserInsert.hashUser);
								window.location.replace('/members/')
							});
						});
					} else {
						var dataSes = sessionStorage.setItem('user_id', data.UserInsert._id);
						var dataHash = sessionStorage.setItem('hashUser', data.UserInsert.hashUser);
						window.location.replace('/members/')
					}
	  			})
	  			.fail(function(dataPIC) {
	  				console.log("error", dataPIC);
	  			})
			  }
		});

	})();

});
