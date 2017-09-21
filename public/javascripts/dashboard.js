(() => {
	sessionStorage.clear();
	var states = ["", "ABIA", "ADAMAWA", "AKWA IBOM", "ANAMBRA", "BAUCHI", "BAYELSA", "BENUE", "BORNO", "CROSS RIVER", "DELTA", "EBONYI", "EDO", "EKITI", "ENUGU", "FCT", "GOMBE", "IMO", "JIGAWA", "KADUNA", "KANO", "KATSINA", "KEBBI", "KOGI", "KWARA", "LAGOS", "NASARAWA", "NIGER", "OGUN", "ONDO", "OSUN", "OYO", "PLATEAU", "RIVERS", "SOKOTO", "TARABA", "YOBE", "ZAMFARA"];
	states.forEach((item) => {
		$('#official_state').append('<option value="'+item+'">'+item+'</>')
	});

	let Official = {
		officer_full: $('#officer_full').val(),
		officer_position: $('#officer_position').val(),
		officer_contact: $('#officer_contact').val(),
		officer_email: $('#officer_email').val(),
		officer_level: $('#officer_level').val(),
		official_state: $('#official_state').val(),
		officer_gender: $('#officer_gender').val()
	}
		$('#officer_full').change(function(event) {
			Official.officer_full = $('#officer_full').val()
		});

		$('#officer_position').change(function(event) {
			Official.officer_position = $('#officer_position').val()
		});

		$('#officer_contact').change(function(event) {
			Official.officer_contact = $('#officer_contact').val()
		});

		$('#officer_email').change(function(event) {
			Official.officer_email = $('#officer_email').val()
		});

		$('#officer_level').change(function(event) {
			Official.officer_level = $('#officer_level').val()
		});

		$('#official_state').change(function(event) {
			Official.official_state = $('#official_state').val()
		});

		$('#officer_gender').change(function(event) {
			Official.officer_gender = $('#officer_gender').val()
		});



	$('#official_reg').submit(function(event) {
  		event.preventDefault();
		console.log(Official);
		if (Official.officer_full !== '' && Official.officer_position !== '') {
			$.post('/officialReg', {param: Official}, function(data, textStatus, xhr) {
				if (data.success === true) {
					$('#DataAdded').addClass('text-success').html('Data was added succcessfully')
				}
			});
		} else {
			$('#DataAdded').addClass('text-danger').html('Please you must provide a name and position')
		}
	});
})();
