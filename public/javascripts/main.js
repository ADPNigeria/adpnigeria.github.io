$(document).ready(function() {
	$.ajaxSetup({ cache: true})

	var mobileImg = $('#menu'); // menu hamburg
	let viewwidth = $(window).width(); // width of the windows to determin mobile
	let navitems = $('#navigation ul'); // navigation list
	let logo = $('#logo'); // adp logo
	let navThings = $('#navigation ul li'); // navigation list li
	let hash = document.location.hash; // get address of current document
	let sideDa = $('#sideDa'); // side element of Donate and register


	sideDa.click(function(event) {
		if (sideDa.hasClass('drawBack')) {
			sideDa.removeClass('drawBack')
			sideDa.addClass('sideDa')
		} else {
			sideDa.addClass('drawBack')
			sideDa.removeClass('sideDa')
		}
	});


	if (viewwidth <= 900) {
		// toggle mobile menu
		var thisguy = true;
		mobileImg.css('display', 'block');

		navThings.click(function(event) {
			/* Act on the event */
			if (!$(event.target).is('#menu')) {
				navitems.slideUp(2000)
				$('#logo').delay(1200).animate({width: '120px', height: '76px'}, 'slow')
				$('#slogan').delay(1200).animate({left: '140px'}, 'slow')
				$('#slogan var').delay(1200).animate({fontSize: '15px'}, 'slow')
				thisguy = true
			}
		});
		mobileImg.click(function(event) {
			/* Act on the event */
			navitems.delay(700).slideToggle('100').delay(0)
			if (thisguy === true) {
				$('#logo').animate({width: '75px', height: '45px'}, 'slow')
				$('#slogan').animate({left: '80px', top: '2px'}, 'slow')
				$('#slogan var').animate({fontSize: '11px'}, 'slow')
				thisguy = false
				$(window).click(function(event) {
					if (!$(event.target).is('#menu')) {
						navitems.slideUp('slow')
						$('#logo').delay(1200).animate({width: '100px', height: '70px'}, 'slow')
						$('#slogan').delay(1200).animate({left: '105px', top: '5px'}, 'slow')
						$('#slogan var').delay(1200).animate({fontSize: '12px'}, 'slow')
						thisguy = true
					}
				});
			} else {
				$('#logo').delay(1200).animate({width: '100px', height: '70px'}, 'slow')
				$('#slogan').delay(1200).animate({left: '105px', top: '5px'}, 'slow')
				$('#slogan var').delay(1200).animate({fontSize: '12px'}, 'slow')
				thisguy = true
			}
		});
	} else {

		let iScrol = 0;
		$(window).scroll(function() {

			/* Act on the event */
			let theScroll = $(this).scrollTop();

			if (theScroll > iScrol) {
				$('header').addClass('header');
			} else {
				$('header').removeClass('header');
			}
		});
	}
});
