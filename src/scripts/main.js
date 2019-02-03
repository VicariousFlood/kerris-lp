$(".slide-down").click(function() {
    $('html, body').animate({
        scrollTop: $(".how-it-works").offset().top
    }, 1000);
});