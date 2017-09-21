$(document).ready(function() {
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
		var bb = new Blob([ab], {type: type});
		return bb;
	}

	function PreviewImage() {

		var ImageSize = 13000000 //file limit size
		var ImageType = ['image/jpg', 'image/jpeg', 'image/png'] //file acceptable type

		var FileSize = document.getElementById('ImgUpl').files[0].size // user file size sent
		var FileType = document.getElementById('ImgUpl').files[0].type // user file type sent

		if (FileSize > ImageSize) {
			$('#ShwImage').append('<strong>The Image is too large make sure it below <code>1.3MB</code></strong>')
		} else if ($.inArray(FileType, ImageType) === -1) {
			$('#ShwImage').append('<strong>The Image type must be in the format of <code>JPEG, PNG or JPG</code></strong>')
		} else {
			// load a url and file object
			const upload = document.getElementById('ImgUpl').files[0];
			watermark([upload, '/images/watermark.jpg']).image(watermark.image.upperLeft(0.4)).then((img) => {
				$('#ImgPass').prop('src', img.src);
			});
		}
	}



	//getting the session set for the
	var dataSession = sessionStorage.getItem('user_id')
	var dataHash = sessionStorage.getItem('hashUser')
	var hashUser = $('#hashUser')
	if (dataSession) {
		console.log(dataSession);
		$('#logOutBTN').click(function(event) {
			sessionStorage.clear();
			window.location.replace('/register/')
		});
		$('#overpage').modal({show: true, backdrop: 'static', keyboard: false})
		$.ajax({
			url: '/register/checkExist',
			type: 'GET',
			dataType: 'JSON',
			data: {
				param: dataHash
			}
		}).done(function(data) {
			let loopData = data[0];
			for (let key in loopData) {
				if (loopData[key] === '' || loopData[key] === null) {
					loopData[key] = 'Not Provided'
				}
			}

			// checking if the user has activated phone number
			if (loopData.SMSVerified === false) {
				$('#phone_veri').modal('show')
			}
		// populating the profile details
		$('#pro_fullname').next('p').html(data[0].full_name)
		$('#dis_phone').html(data[0].raw_number)
		$('#pro_email').next('p').html(data[0].email)
		$('#pro_gender').next('p').html(data[0].gender)
		$('#pro_dateofBirth').next('p').html(data[0].dateofBirth)
		$('#pro_state').next('p').html(data[0].stName)
		$('#pro_senate').next('p').html(data[0].Senatorial)
		$('#pro_fedCon').next('p').html(data[0].FedConstituency)
		$('#pro_stateCon').next('p').html(data[0].StateConstituency)
		$('#pro_lgaName').next('p').html(data[0].lgaName)
		$('#pro_wardName').next('p').html(data[0].wardName)
		$('#pro_puName').next('p').html(data[0].pollingUnit)
		$('#pro_countryRes').next('p').html(data[0].countryRes)
		var formgroups = $('#theProfile .form-group');

		// list of datas may update
		let updateable = data[0]
		updateable.emailChange = false
		updateable.phoneChange = false
		var states = ["ABIA", "ADAMAWA", "AKWA IBOM", "ANAMBRA", "BAUCHI", "BAYELSA", "BENUE", "BORNO", "CROSS RIVER", "DELTA", "EBONYI", "EDO", "EKITI", "ENUGU", "FCT", "GOMBE", "IMO", "JIGAWA", "KADUNA", "KANO", "KATSINA", "KEBBI", "KOGI", "KWARA", "LAGOS", "NASARAWA", "NIGER", "OGUN", "ONDO", "OSUN", "OYO", "PLATEAU", "RIVERS", "SOKOTO", "TARABA", "YOBE", "ZAMFARA"];


		$.ajax({url: '/register/getAllData', type: 'GET', dataType: 'JSON'}).done(function(data) {
			var emptyData = ['Select One'],
				 emptyLGA = ['Select One'],
				 emptyWard = ['Select One'],
				 emptyPUnit = ['Select One'];


			data.forEach(elem => {
				states.forEach(elemSta => {
					if (updateable.stName === elem.stName) {

						// this is getting the local govt
						if ($.inArray(elem.lgaName, emptyLGA) === -1) {
							emptyLGA.push(elem.lgaName)
						}

						// this is getting the list for wards
						if (updateable.lgaName === elem.lgaName) {
							if ($.inArray(elem.wardName, emptyWard) === -1) {
								emptyWard.push(elem.wardName)
							}

							//getting the polling units
							if (updateable.wardName === elem.wardName) {
								if ($.inArray(elem.psName, emptyPUnit) === -1) {
									emptyPUnit.push(elem.psName)
								}
								$('#overpage').modal('hide')
							}
						}
					}
					if ($.inArray(elem.stName, emptyData) === -1) {
						emptyData.push(elem.stName)
					}
				});
			});

			// for state options
			emptyData.forEach(elem => {
				$('#pro_state').append("<option value='"+elem+"'>"+elem+"</option>")
			});

			// for local government options
			emptyLGA.forEach(elem => {
				$('#pro_lgaName').append("<option value='"+elem+"'>"+elem+"</option>")
			});

			// for ward options options
			emptyWard.forEach(elem => {
				$('#pro_wardName').append("<option value='"+elem+"'>"+elem+"</option>")
			});

			// for Polling Unit options options
			emptyPUnit.forEach(elem => {
				$('#pro_puName').append("<option value='"+elem+"'>"+elem+"</option>")
			});

		});

		$('#pro_state').change(function(event) {
			if ($('#pro_state').val() !== '' || $('#pro_state').val() !== 'Select One') {
				$('#updateinfo').attr('disabled', '');
				updateable.stName = $('#pro_state').val()
				var emptyLGA = ['Select Your Local Govt'];
				$('#pro_state').next('p').html($('#pro_state').val())
				$('#pro_senate').html('Changed of ').css('display', 'block');
				$('#pro_senate').next('p').html('');
				$('#pro_fedCon').html('Changed of ').css('display', 'block');
				$('#pro_fedCon').next('p').html('');
				$('#pro_stateCon').html('Changed of ').css('display', 'block');
				$('#pro_stateCon').next('p').html('');
				$('#pro_lgaName').html('Changed of ').css('display', 'block');
				$('#pro_lgaName').next('p').html('');
				$('#pro_wardName').html('Changed of ').css('display', 'block');
				$('#pro_wardName').next('p').html('');
				$('#pro_puName').html('Changed of ').css('display', 'block');
				$('#pro_puName').next('p').html('');

				// api to registeration to get local government
				$.ajax({
					url: '/register/getLGA',
					type: 'GET',
					dataType: 'JSON',
					data: {statePlace: updateable.stName}
				})
				.done(function(data) {
					data.forEach(elemST => {
						if ($.inArray(elemST.lgaName, emptyLGA) === -1) {
							emptyLGA.push(elemST.lgaName)
						}
					});

					emptyLGA.forEach(elemLGA => {
						$('#pro_lgaName').append("<option value='"+elemLGA+"'>"+elemLGA+"</option>")
					});
				})
				.fail(function() {
					console.log("error");
				});
			}

			// TODO: More to check validation
		});


		$('#pro_lgaName').change(function(event) {
			if($('#pro_lgaName').val() !== '' || $('#pro_state').val() !== 'Select One'){
				$('#updateinfo').attr('disabled', '');
				updateable.lgaName = $('#pro_lgaName').val()
				var emptyWHere = ['Select One'];
				$('#pro_lgaName').next('p').html($('#pro_lgaName').val());
				$('#pro_wardName').html('Changed of ').css('display', 'block');
				$('#pro_wardName').next('p').html('');
				$('#pro_puName').html('Changed of ').css('display', 'block');
				$('#pro_puName').next('p').html('');

				// api to members to get senate lists and house of rep
				$.getJSON('/register/senateList', {state: updateable.stName, lgaName: updateable.lgaName}, function(json, textStatus) {
					if (json) {
						$('#pro_senate').val(json.senatesG)
						$('#pro_senate').next('p').html(json.senatesG)
						updateable.Senatorial = json.senatesG
						$('#pro_fedCon').val(json.fedCon)
						$('#pro_fedCon').next('p').html(json.fedCon)
						updateable.FedConstituency = json.fedCon
					}
				});

				$.ajax({
					url: '/register/getWARD',
					type: 'GET',
					dataType: 'JSON',
					data: {stateReg: updateable.stName, lgaReg: updateable.lgaName}
				})
				.done(function(data) {
					data.forEach(elemDT => {
						if ($.inArray(elemDT.wardName, emptyWHere) === -1) {
							emptyWHere.push(elemDT.wardName)
						}
					});
					emptyWHere.forEach(elemWard => {
						$('#pro_wardName').append("<option value='"+elemWard+"'>"+elemWard+"</option>")
					});
				});
			}
		});

		// $('#pro_senate').change(function(event) {
		// 	updateable.Senatorial = $('#pro_senate').val()
		// });
		//
		// $('#pro_fedCon').change(function(event) {
		// 	updateable.FedConstituency = $('#pro_fedCon').val()
		// });
		//
		// $('#pro_stateCon').change(function(event) {
		// 	updateable.StateConstituency = $('#pro_stateCon').val()
		// });

		$('#pro_wardName').change(function(event) {
			updateable.wardName = $('#pro_wardName').val()
			$('#pro_wardName').next('p').html($('#pro_wardName').val());
			$('#updateinfo').attr('disabled', '');
			$('#pro_puName').html('Changed of ').css('display', 'block');
			$('#pro_puName').next('p').html('');
			$.ajax({
				url: '/register/getPolling',
				type: 'GET',
				dataType: 'JSON',
				data: {stateName: updateable.stName, localgovtName: updateable.lgaName, wardName: updateable.wardName}
			})
			.done(function(data) {

				data.forEach(elemPU => {
					$('#pro_puName').append("<option value='"+elemPU.psName+"'>"+elemPU.psName+"</option>")
				});
			});
		});

		$('#pro_puName').change(function(event) {
			if ($('#pro_puName').val() !== '' || $('#pro_puName').val() !== ' ') {
				updateable.pollingUnit = $('#pro_puName').val()
				$('#updateinfo').removeAttr('disabled')
			} else {
				$('#pro_puName').next('p').removeClass('lead').addClass('text-denger').html('Please select one Polling Unit')
			}
		});

		function isEmail(email) {
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return regex.test(email);
		}

		$('#pro_email').change(function(event) {
			if (isEmail($('#pro_email').val())) {
				$.getJSON('/register/checkExist', {param: $('#pro_email').val()}, function(json, textStatus) {
					if (json) {
						if (json._id !== data[0]._id) {
							$('#pro_email').next('p').removeClass('lead').addClass('text-denger').html('Sorry that email already exist')
						}
					} else {
						updateable.emailChange = true
						updateable.email = $('#pro_email').val()
					}
				});
			} else {
				$('#pro_email').next('p').removeClass('lead').addClass('text-denger').html('Sorry that is not email format')
			}
		});
		$('#pro_gender').change(function(event) {
			if ($('#pro_gender').val() !== '' || $('#pro_gender').val() !== ' ') {
				updateable.gender = $('#pro_gender').val()
			} else {
				$('#pro_gender').next('p').removeClass('lead').addClass('denger').html('Please select your gender')
			}
		});


		$('#pro_dateofBirth').change(function(event) {
			let receivedDate = moment($('#pro_dateofBirth').val(), "DD MM YYYY");
			if (receivedDate.isAfter()) {
				$('#pro_dateofBirth').next('p').removeClass('lead').addClass('text-danger').html('Selected value is a future time')
			} else if (moment().diff(receivedDate, 'years', false) <= 15) {
				$('#pro_dateofBirth').next('p').removeClass('lead').addClass('text-danger').html('Registered Member must be eligible to vote')
			} else {
				updateable.dateofBirth = receivedDate._i;
			}
		});


		$("#pro_phone").intlTelInput({
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

		var telInput = $("#pro_phone"),
		errorMsg = $("#error-msg"),
		validMsg = $("#valid-msg");

		// initialise plugin
		telInput.intlTelInput({utilsScript: "/components/intl-tel-input/build/js/utils.js"});

		var reset = function() {
			telInput.removeClass("error");
			errorMsg.addClass("hide");
			validMsg.addClass("hide");
		};

		// on blur: validate
		telInput.change(function() {
			reset();
			if (telInput.val() !== '' || telInput.val() !== ' ') {
				if ($.trim(telInput.val())) {
					if (telInput.intlTelInput("isValidNumber")) {

						validMsg.removeClass("hide");

						var rawnumber = $('#pro_phone').val();
						var rawed = rawnumber.replace(/\s+/g, '');
						if (rawed !== data[0].raw_number) {
							//checking if user phone number already exist
							$.getJSON('/register/checkExist', {param: $('#pro_phone').intlTelInput("getNumber")}, function(json, textStatus) {
								if (json.length >= 1) {
									if (json._id !== data[0]._id) {
										$('#dis_phone').removeClass('lead').addClass('text-warning').html('Sorry that number already exist')
									}
								} else {
									updateable.phoneChange = true
									updateable.phone_number = $('#pro_phone').intlTelInput("getNumber");
									var rawNumber = $('#pro_phone').val();
									updateable.raw_number = rawNumber.replace(/\s+/g, '');
								}
							});
						}
					} else {
						telInput.addClass("error");
						errorMsg.removeClass("hide");
						$('#pro_phone').addClass('has-warning')
					}
				}
			}
		});

		// on keyup / change flag: reset
		telInput.on("keyup change", reset);


		// for profile manipulation
		formgroups.each(function() {
			$(this).click(function(event) {
				if ($(this).hasClass('selectFeild')) {
					var collected = $(this).children('select');
					collected.css('display', 'block');
					collected.val($(this).children('p').html())
					collected.change(function(event) {
						$(this).next('p').html(collected.val())
					});
				} else {
					$('#updateinfo').removeAttr('disabled')
					var collected = $(this).children('input');
					collected.val($(this).children('p').html())
					collected.attr('type', 'text');
					collected.keyup(function(event) {
						$(this).next('p').html(collected.val())
					});
				}
			});
		});


		$('#pro_fullname').change(function(event) {
			if ($('#pro_fullname').val() !== '') {
				var Full_name = $('#pro_fullname').val();
				var ArrName = Full_name.split(' ')

				if (ArrName.length > 1) {
					if (ArrName.length == 2) {
						if (ArrName[1] !== '') {
							updateable.full_name = $('#pro_fullname').val()
						} else {
							$('#pro_fullname').next('p').removeClass('lead').addClass('text-danger').html('Your Full Name must be more than one name please')
						}
					} else {
						$('#pro_fullname').next('p').removeClass('lead').addClass('text-danger').html('Your Full Name must be more than one name please')
					}
				}  else {
					$('#pro_fullname').next('p').removeClass('lead').addClass('text-danger').html('Your Full Name must be more than one name please')
				}
			}
		});

			// function to generate QR codes
			var qrcode = new QRCode(document.getElementById("qrcode"), {
				text: "http://www.apd.ng/membership/" + data[0].hashUser + '',
				width: 80,
				height: 80,
				colorDark: "#000000",
				colorLight: "#ffffff",
				correctLevel: QRCode.CorrectLevel.H
			});

			//changing the title page
			document.title = 'ADP | ' + data[0].full_name

			var contactDet = (data[0].phone_number !== undefined)
			? 'Tel: ' + data[0].phone_number
			: 'Email: ' + data[0].email;

			//now setting user data
			$('#UserName').html(data[0].full_name)
			$('#UserPosition strong').html(data[0].adminLevel)
			$('#PollUnit').html(data[0].pollingUnit)
			$('#WardID').html(data[0].wardName)
			$('#lgaID').html(data[0].lgaName)
			$('#stateID').html(data[0].stName)
			// $('#stateCons strong').html(data[0].StateConstituency)
			$('#fedCons').html(data[0].FedConstituency)
			$('#senID').html(data[0].Senatorial)
			$.post('checkVeri', {
				param: data[0].hashUser,
				type: 'MemCard'
			}, function(dataVar, textStatus, xhr) {
				$('#phoneShow').html(contactDet + '<br>TID: ' + dataVar[0].VariCode)
			});

			$('#DisInfo').html('Your Image is Loading')

			//converting the image
			setTimeout(function() {
				var canvas = document.getElementById("ProfileV"),
				html_container = document.getElementById("ProfileCard"),
				html = html_container.innerHTML;

				rasterizeHTML.drawHTML(html, canvas);
				$('#DisInfo').html('Please Save Your TMC')

			}, 5000);

			//checking if user already upload picture
			$('#ImgPass').click(function(event) {
				$('#ImgUpl').trigger('click');
			});
			if (data[0].passport !== undefined) {
				$('#ImgPass').prop('src', '/membersData/' + data[0].folderName + '/media/' + data[0].passport)
				$('#DTPass').prop('src', '/membersData/' + data[0].folderName + '/media/' + data[0].passport)
			}

			//uploading changed picture
			$('#ImgUpl').change(function(event) {
				PreviewImage()
				var uploadFile = document.getElementById('ImgUpl').files[0].name
				setTimeout(function() {
					var getImage = dataURItoBlob($('#ImgPass').prop('src'), 'image/jpeg')
					var fd = new FormData();
					fd.append('picture', getImage, data[0].folderName + '.jpg');
					$.ajax({
						type: 'POST',
						url: '/register/uploadPic',
						data: fd,
						processData: false,
						cache: false,
						contentType: false
					}).done(function(dataPi) {
						$.post('/register/update', {
							param: dataPi.filenamed,
							user_id: data[0].hashUser
						});
					})
				}, 3000);
			});
			$('#updateinfo').click(function(event) {
				$('#updateinfo').attr('disabled', '');
				console.log(encodeURIComponent(updateable));
				$('#updating').modal({show: true, backdrop: 'static', keyboard: false})
				$.post('/register/updateAllInfo', updateable, function(data, textStatus, xhr) {
					$('#updating').modal('hide')
					window.location.replace('/members/')
				});
			});
		});

	} else {
		window.location.replace('/register/')
	}
	// sessionStorage.clear();

});
