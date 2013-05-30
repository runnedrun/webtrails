$(function() {
  var portion = .5; // where mouse is horizontally on div
  var currentScrollInterval = null;

  $('.sites-display-container').mousemove(function(e){
    portion = (e.pageX - this.offsetLeft)/$(this).width();
  }).mouseleave(function() { 
    clearInterval(currentScrollInterval);
  }).mouseenter(function(e) {
    var $this = $(this);
    portion = (e.pageX - this.offsetLeft)/$(this).width();
    var $sitesDisplay = $(".sites-display", this);
    var containerWidth = $(this).width();

    currentScrollInterval = setInterval(function() {
      var scrollProp = .15; //proportion across the div that is scroll in each direction
      var scrollAmount = 50
      if (portion < scrollProp) {
        var scale = (1 - portion/scrollProp) * 2;
        var destLeft = $this.scrollLeft() - scrollAmount * scale;

        // $sitesDisplay.stop().animate({left: destLeft }, 110);
        $this.scrollLeft(destLeft);

      } else if (portion > 1 - scrollProp) {
        var scale = (1 - (1 - portion)/scrollProp) * 2;
        var destLeft = $this.scrollLeft() + scrollAmount * scale;
        console.log(destLeft, -($sitesDisplay.width() - containerWidth), $sitesDisplay.width(), containerWidth)
        // if (destLeft < -($sitesDisplay.width() - containerWidth) ) {
        //   destLeft = -($sitesDisplay.width() - containerWidth);
        // }
        // $sitesDisplay.stop().animate({left:  destLeft}, 110);
        $this.scrollLeft(destLeft);
      }
    }, 100);
  }); 
});
