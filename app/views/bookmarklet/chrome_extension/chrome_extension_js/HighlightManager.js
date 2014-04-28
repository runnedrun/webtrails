HighlightManager = function(trackedDoc) {
    var $doc = $(trackedDoc);
    var $body = $(trackedDoc.body);

    var currentCommentBox;

    function possibleHighlightStart(e){
        console.log("possible highlight start")
        mouseDown = 1;
        if (($(e.target).closest(".webtrails").length == 0)){
            $doc.mouseup(function(){mouseDown = 0; highlightedTextDetect()});
        }
    }

    function highlightedTextDetect(){
        console.log("looking for highlighted text");
        $doc.unbind("mouseup");
        if (!rangy.getSelection().isCollapsed){
            console.log("adding the button");
            addComment(getHighlightedTextRange());
        }
    }

    function addComment(highlightedTextRange){
        currentCommentBox = new Comment(10, highlightedTextRange, trackedDoc);
        if (currentCommentBox.canBeHighlighted()) {
            $doc.mousedown(handleMouseDown);
            function handleMouseDown() {
                currentCommentBox.remove();
                $doc.unbind("mousedown", handleMouseDown)
            }
        }
    }

    function getHighlightedTextRange(){
        return rangy.getSelection().getRangeAt(0);
    }

    this.watchDocument = function() {
        $doc.mousedown(function() {
            mouseDown=1;
        });
        $doc.mouseup(function(){
            mouseDown=0;
        });
        $doc.mousedown(possibleHighlightStart);
    }

    this.watchDocument();
}