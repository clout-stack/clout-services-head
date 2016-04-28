$doc = $(document);

$doc.ready(function () {
	$('.tlt').textillate({
		selector: '.texts',
	    minDisplayTime: 5000,
	    initialDelay: 0,
	    in: { delay: 50, effect: 'fadeInLeftBig', sync: false }, 
	    out :{ delay: 30, effect: 'fadeOutRightBig', sync: false },
	    loop: false
	});
	$.fn.extend({
	    animateCss: function (animationName) {
	        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
	        $(this).addClass('animated ' + animationName).one(animationEnd, function() {
	            $(this).removeClass('animated ' + animationName);
	        });
	    }
	});
});
