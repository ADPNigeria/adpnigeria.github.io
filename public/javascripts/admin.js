(() => {

	function isEmail(email) {
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	}

	var states = [ "", "ABIA", "ADAMAWA", "AKWA IBOM", "ANAMBRA", "BAUCHI", "BAYELSA", "BENUE", "BORNO", "CROSS RIVER", "DELTA", "EBONYI", "EDO", "EKITI", "ENUGU", "FCT", "GOMBE", "IMO", "JIGAWA", "KADUNA", "KANO", "KATSINA", "KEBBI", "KOGI", "KWARA", "LAGOS", "NASARAWA", "NIGER", "OGUN", "ONDO", "OSUN", "OYO", "PLATEAU", "RIVERS", "SOKOTO", "TARABA", "YOBE", "ZAMFARA"];

	// to log the admin user in
	var admin_email = $('#admin_email'),
		 admin_password = $('#admin_password'),
		 admin_login = $('#admin_login'),
		 admin_btn = $('#admin_btn'),
		 admin_state = $('#admin_state'),
		 admin_register = $('#admin_register');

		 states.forEach((item) => {
		 	admin_state.append('<option value="'+item+'">'+item+'</option>')
		 });

	admin_btn.click(function(event) {
		admin_btn.attr('disabled', '');
		if (isEmail(admin_email.val()) && admin_password.val() !== '') {
			$.post('/loginAdmin', {email: admin_email.val(), password: admin_password.val()}, function(data, textStatus, xhr) {
				if (!data) {
					admin_btn.removeAttr('disabled');
					admin_state.next('p').html('<span class="text-danger">Wrong information or Your admin request has not been granted</span>')
				} else {
					var dataSes = sessionStorage.setItem('admin_user', data._id);
					window.location.replace('/#/dashboard/')
				}
			});
		} else {
			admin_btn.removeAttr('disabled');
			admin_state.next('p').html('<span class="text-danger">Please provide adequate information</span>')
		}
	});

	admin_register.click(function(event) {
		admin_register.attr('disabled', '');
		if (isEmail(admin_email.val()) && admin_password.val() !== '') {
			if (admin_state.val() !== '') {
				$.getJSON('/checkAdmin', {param1: admin_email.val()}, function(json, textStatus) {
					if (json) {
						admin_register.removeAttr('disabled')
						admin_state.next('p').html('<span class="text-danger">Please the email provided already exist in our data if you forgot your password please contact the Office</span>')
					} else {
						$.post('/registerAdmin', {email: admin_email.val(), password: admin_password.val(), state: admin_state.val()}, function(data, textStatus, xhr) {
							if (data) {
								$('#comfirmIt').modal('show')
								$('#adminEmail').html('<strong>'+admin_email.val()+'</strong>')
							}
						});
					}
				});
			} else {
				admin_register.removeAttr('disabled')
				admin_state.next('p').html('<span class="text-danger">Please Select your state above</span>')
			}
		} else {
			admin_register.removeAttr('disabled')
			admin_state.next('p').html('<span class="text-danger">Please provide adequate information</span>')
		}
	});
})();
