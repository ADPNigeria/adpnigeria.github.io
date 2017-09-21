(() => {
	// $('#newsLoading').modal({show: true, backdrop: 'static', keyboard: false})
	$.getJSON('/blogPost', function(json, textStatus) {
			console.log(json);
	});
})();
