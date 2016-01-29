
init();
var total;
var monthArr = [];
var prev = 0;

$(document).ready(function() {
   	$('a').click(function(e){
   		// e.preventDefault();

   		$('#sidebar_nav').localScroll({
	   		hash:false,
	   		duration:800,
	   		target:'.main_content'
	   	});
   	});

   	$("#button").click(function(e){
   		e.preventDefault();
    	$("body").animate({scrollTop: 1400},"slow");
	});

	$.each($(".sidebar").children(),function(index,sidebar){
		prev = prev + $(sidebar).data("height");
		monthArr.push(prev);
	});


	$(".main_content").scroll(function(){
		
	    var scrollPos = $(this).scrollTop()
	    var totalPos = $(this).prop('scrollHeight') - $(this).height() - 250;
	    var perc = (Math.round((scrollPos / totalPos) * 100)/ 100) - 0.12;
	    
	    var dotPosition = map_range((scrollPos / totalPos), 0, 1, 30, ($(window).height()-49))
	    // var dotPosition = (($(window).height()-73) * (scrollPos / totalPos)) + 30;
	    
	    // console.log(dotPosition + ":" + (scrollPos / totalPos));

	    // $('.scroll_dot').css("top",dotPosition);

		$.each($(".sidebar").children(),function(index,sidebar){
			var item = Math.round((monthArr[index]/total) * 100) / 100;
			var prevItem;
			
			if(index == 0){
				prevItem = 0;
			}
			else{
				prevItem = Math.round((monthArr[index-1]/total) * 100) / 100;
			}

			if (prevItem <= perc){// && perc >= prevItem) {
				// $(sidebar).css("background-color","#937BF3");
				$(sidebar).addClass('backgroundDark');
				$(sidebar).removeClass('backgroundLight');
			}
			else{
				// $(sidebar).css("background-color","#fff");
				$(sidebar).removeClass('backgroundDark');
				$(sidebar).addClass('backgroundLight');
			}
		});

	});

	$( ".month_link" ).mouseover(function() {
		//$(this).css('background-color','#937BF3');
		$(this).addClass('backgroundDark');
		$(this).removeClass('backgroundLight');

		//$(this).prevAll().css('background-color','#937BF3');
		$(this).prevAll().addClass('backgroundDark');
		$(this).prevAll().removeClass('backgroundLight');

		// $(this).nextAll('background-color','#fff');
		$(this).nextAll().removeClass('backgroundDark');
		$(this).nextAll().addClass('backgroundLight');
	});

	$(".month_link").click(function(){
		var scrollPos = $(".main_content").scrollTop() - 250;
	    var totalPos = $(".main_content").prop('scrollHeight') - $(this).height() - 250;
	    var perc = Math.round((scrollPos / totalPos) * 100)/ 100;
	    var index = $(".month_link").index($(this));
	});
});

function init() {
  // Add a resize event listener
    window.addEventListener('resize', onWindowResize, false );
  	onWindowResize();
}

function onWindowResize() {
    var windowHeight = window.innerHeight;
    total = 0;
	$.each($(".sidebar").children(),function(index,sidebar){
		total += $(sidebar).data("height");
	});

    //loop through sidebar elements.
     $.each($(".sidebar").children(),function(index,sidebar){
    	var height = $(sidebar).data("height");
	    var itemHeight = (height/total) * (windowHeight - 100);
	    if(itemHeight < 10){
	    	itemHeight = 10;
	    }

    	$(sidebar).css("height",itemHeight);
    	// $(sidebar).children("a").css("line-height",itemHeight + "px");
    });
}

$(".month_link").click(function() {
  window.location = $(this).find("a").attr("href"); 
  return false;
});

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
