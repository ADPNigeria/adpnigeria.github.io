'use strict';
$(document).ready(function() {
	(() => {
		var desCon = ['Foundation Council', 'Board of Trustees', 'National Executive Council', 'National Working Committee', 'State Chairmen', 'Other Standing Committee'];
		var mobCon = ['FC', 'BoT', 'NEC', 'NWC', 'SC', 'Others'];
		var viewNow = $(window).width();
		var strCon = $('#strCon');
		var tabs = 0;
		if (viewNow <= 900) {
			mobCon.forEach(elemSC => {
				tabs++
				strCon.append("<li id='tab"+ tabs +"'>" + elemSC + "</li>")
			});
		} else {
			desCon.forEach(elemMB => {
				tabs++
				strCon.append("<li id='tab"+ tabs +"'>" + elemMB + "</li>")
			});
		}

		let theTabs = $("#strCon li");

		let listTab = [1, 2, 3, 4, 5, 6];
		$.getJSON('bringOut', function(json, textStatus) {
			json.forEach((item) => {
				if (item.officer_level === 'Foundation Council') {
					$("#foundCon").append('<div class="card" data-toggle="modal" data-target="#modal-' + item._id + '"><img src="' + item.profileImage + '" class="img-rounded" alt="'+item.officer_full+'" style="width:100%; height: 170px;"><div class="container"><h5><b>' + item.officer_full + '</b></h5><p>' + item.officer_position + '</p><p>Read More</p></div></div>')
				} else if (item.officer_level === 'Board of Trustees') {
					$("#boardTru").append('<div class="card" data-toggle="modal" data-target="#modal-' + item._id + '"><img src="' + item.profileImage + '" class="img-rounded" alt="'+item.officer_full+'" style="width:100%; height: 170px;"><div class="container"><h5><b>' + item.officer_full + '</b></h5><p>' + item.officer_position + '</p><p>Read More</p></div></div>')
				} else if (item.officer_level === 'National Executive Council') {
					$("#NatExc").append('<div class="card" data-toggle="modal" data-target="#modal-' + item._id + '"><img src="' + item.profileImage + '" class="img-rounded" alt="'+item.officer_full+'" style="width:100%; height: 170px;"><div class="container"><h5><b>' + item.officer_full + '</b></h5><p>' + item.officer_position + '</p><p>Read More</p></div></div>')
				} else if (item.officer_level === 'National Working Commmittee') {
					$("#NatWok").append('<div class="card" data-toggle="modal" data-target="#modal-' + item._id + '"><img src="' + item.profileImage + '" class="img-rounded" alt="'+item.officer_full+'" style="width:100%; height: 170px;"><div class="container"><h5><b>' + item.officer_full + '</b></h5><p>' + item.officer_position + '</p><p>Read More</p></div></div>')
				} else if (item.officer_level === 'State Chairman') {
					$("#StateChairman").append('<div class="card" data-toggle="modal" data-target="#modal-' + item._id + '"><img src="' + item.profileImage + '" class="img-rounded" alt="'+item.officer_full+'" style="width:100%; height: 170px;"><div class="container"><h5><b>' + item.officer_full + '</b></h5><p>' + item.officer_position + '</p><p>Read More</p></div></div>')
				}
			});
		});
		theTabs.click(function(event) {
			var thisTab = $(this).attr('id').split("")
			listTab.forEach(elem => {
				$("#tabsCon"+elem).removeClass('tabsConIn').addClass('tabsConOut')
				$("#tabsCon"+thisTab[3]).addClass('tabsConIn').removeClass('tabsConOut')
				$("#headed"+elem).removeClass('headIn').addClass('headOut')
				$("#headed"+thisTab[3]).addClass('headIn').removeClass('headOut')
			});
		});


	})();

});
