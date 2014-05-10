Comment = function(noteComment, clientSideId) {
    var commentOverlay;
    var commentOverlayShown;
    var elementsToHighlight;

    var C = {
        commentOverlay: {
            "font-size":"12px",
            "color": "#333",
            "z-index": "2147483647",
            "padding": "5px",
            "background-color": "white",
            "position": "absolute",
            "display": "none",
            "border": "1px solid",
            "border-radius": "5px",
            "max-width" : "200px",
            "word-wrap" : "break-word"
        }
    }

    H = {
        commentOverlay: function(top, left) {
            return applyDefaultCSS($("<span></span>"))
                .css(CSS.commentOverlay)
                .css({"top": top + "px", "left": left + "px"})
                .addClass("commentOverlay")
                .addClass("webtrails");
        }
    }

    function highlight() {
        elementsToHighlight.css({"background": "yellow"});
    }

    function hideCommentOverlay() {
        commentOverlayShown = false;
        commentOverlay.hide();
    }

    function showCommentOverlay() {
        commentOverlayShown = true;
        commentOverlay.show();
    }

    function openOrCloseCommentOverlay() {
        commentOverlayShown ? hideCommentOverlay() : showCommentOverlay();
    }

    elementsToHighlight = $(".wtHighlight." + clientSideId)

    var finalHighlight = elementsToHighlight[elementsToHighlight.length - 1]

    var offsets = finalHighlight.offset();

    var topPosition  = offsets.top + finalHighlight.height() + spacing;
    var leftPosition = offsets.left;

    commentOverlay = HTML.commentOverlay(topPosition, leftPosition);

    elementsToHighlight.click(openOrCloseCommentOverlay);
    highlight();
}