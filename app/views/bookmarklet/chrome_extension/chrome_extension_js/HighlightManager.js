HighlightManager = function(trackedDoc) {
    var $doc = $(trackedDoc);
    var $body = $(trackedDoc.body);

    var currentCommentCreator;

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
        currentCommentCreator = new CommentCreator(0, highlightedTextRange, trackedDoc);
    }

    function getHighlightedTextRange(){
        return rangy.getSelection().getRangeAt(0);
    }

    $(document).on("noteSubmitted", function(submittedEvent) {
        new Comment(trackedDoc, submittedEvent.noteDetail.comment, submittedEvent.noteDetail.client_side_id);
    });

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