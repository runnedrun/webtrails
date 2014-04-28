CommentCreator = function(xPos, yPos, spacing, highlightedRange, currentNote, siteDocument) {

    function saveNoteAndRefreshAWS(comment, noteOffsets, clientSideId){
        var newNote = {
            site_id: currentNote.site.id,
            content: noteContent,
            comment: comment,
            comment_location_x: leftPosition,
            comment_location_y: topPosition,
            client_side_id: clientSideId,
            scroll_x: noteOffsets.left,
            scroll_y: noteOffsets.top,
            site_revision_number: currentNote.site.getNextRevisionNumber()
        };
        var cleanHtml = cleanHtmlForSaving();
        Request.addNote(newNote, currentNote, cleanHtml, function(resp) {
            addNewNoteToClientSideStorage(resp, cleanHtml);
        })
    }

    function closeOverlay(){
        $siteDocument.unbind("mousedown", clickAway);
        commentOverlay.remove();
        unHighlightNewNote();
    }

    function clickAway(e){
        var clickedNode = $(e.target);
        if (clickedNode != commentOverlay && ($.inArray(e.target,commentOverlay.children())==-1)){
            closeOverlay(commentOverlay);
            var noteOffsets = $siteDocument.find("wtHighlight.highlightMe").first().offset();
            saveNoteAndRefreshAWS(commentOverlay.find("textarea").val(), noteOffsets, clientSideId);
        }
    }

    function postNoteAndComment(e){
        console.log("posting note");
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13 && !e.shiftKey){
            comment = commentOverlay.find("textarea").val();
            var noteOffsets = $siteDocument.find("wtHighlight.highlightMe").first().offset();
            closeOverlay();
            saveNoteAndRefreshAWS(comment, noteOffsets, clientSideId);
        } else if(code == 27){
            closeOverlay();
        }
    }

    function markNodeForHighlight(node, start_offset, end_offset){
        if (isTextNode(node)){
            var contents = node.nodeValue;
            var highlighted_contents = contents.slice(start_offset,end_offset);
            var whiteSpaceRegex = /^\s*$/;
            if(!highlighted_contents || whiteSpaceRegex.test(highlighted_contents)){
                console.log("nothing inside this node, not replacing");
                return false;
            }
            var unhighlighted_prepend = contents.slice(0,start_offset);
            var unhighlighted_append = contents.slice(end_offset,contents.length);

            var new_marker = siteDocument.createElement("wtHighlight")
            $(new_marker).addClass("highlightMe current-highlight " + clientSideId);

            new_marker.innerHTML = highlighted_contents;
            var node_to_replace = node;
            node_to_replace.parentNode.replaceChild(new_marker, node_to_replace);

            if (unhighlighted_prepend.length !== 0 ){
                var text_before_marker = $(siteDocument.createTextNode(unhighlighted_prepend));
                text_before_marker.insertBefore(new_marker);
            }
            if (unhighlighted_append.length !== 0){
                var text_after_marker = $(siteDocument.createTextNode(unhighlighted_append));
                text_after_marker.insertAfter(new_marker);
            }
            return true;
        } else {
            return false;
        }
    }

    function highlight_wtHighlights(){
        $siteDocument.find("wtHighlight.highlightMe").css("background","yellow");
    }

    // this is the functionality for saving to server and updating client side storage

    function addNewNoteToClientSideStorage(resp, cleanHtml){
        console.log("adding new note client side");
        currentNote.site.addRevision(resp.note_revision_number, cleanHtml);
        var newNote = currentNote.site.addNote(resp.note_update_hash);
        TrailPreview.updateWithNewNote(newNote, resp.new_note_row)
    }

    function unHighlightNewNote(){
        $siteDocument.find("wtHighlight.highlightMe").removeClass("highlightMe").css("background","none");
    }

    function generateClientSideId() {
        var d = new Date();
        var n = d.getTime();
        return "client-side-id-" + n;
    }

    function cleanHtmlForSaving() {
        var htmlClone = $(siteDocument.getElementsByTagName('html')[0]).clone();
        removeInsertedHtml(htmlClone); // edits in-place
        htmlClone.find("wtHighlight").css({"background": "none"});
        return htmlClone[0].outerHTML;
    }

    function removeInsertedHtml($htmlClone) {
        $htmlClone.find('.webtrails').remove();
    }


    var CSS = {
        commentOverlay: {
            "background": "#f0f0f0",
            "color":"#333",
            "position":"absolute",
            "border": "1px solid #ccc",
            "border-radius": "5px",
            "font-family": "'Helvetica Neue', Helvetica, Arial, sans-serif",
            "z-index": "2147483647"
        },
       commentDescription: {
            "padding": "2px",
            "text-align": "center",
            "margin-top": "3px",
            "display": "block"
       },
       commentTextArea: {
           "font-size":"12px",
           "overflow": "hidden",
           "resize": "none",
           "border-radius": "4px",
           "color": "#333",
           "z-index": "2147483647",
           "margin": "5px",
           "outline": "none",
           "padding": "5px",
           "border": "1px solid #666",
           "background-color": "white"
       }
    };
    var HTML = {
     commentOverlay: function(top, left) {
         return applyDefaultCSS($("<div></div>"))
         .css(CSS.commentOverlay)
         .css({"top": top + "px", "left": left + "px"})
         .addClass("commentOverlay")
         .addClass("webtrails");
     },
     commentDescription: function() {
         return $("<div></div>")
         .html("Hit enter, click away or type a comment here")
         .css(CSS.commentDescription);
     },
     commentTextArea: function(height, width) {
         return applyDefaultCSS($("<textarea></textarea>"))
         .css(CSS.commentTextArea)
         .css({"height": String(height)+"px", "width": String(width)+"px"});
     }
    };

    var overlayHeight = 20;
    //make this dynamic so the size of the comment box changes based on page size
    var overlayWidth = 400;
    var $siteDocument = $(siteDocument);
    var $siteBody = $(siteDocument.body);

    var topPosition  =  yPos + spacing;
    var leftPosition = xPos > overlayWidth ? (xPos - overlayWidth) : xPos;

    var commentOverlay = HTML.commentOverlay(topPosition, leftPosition);
    var commentDescription = HTML.commentDescription();
    var commentBox = HTML.commentTextArea(overlayHeight, overlayWidth);

    var comment;

    $siteBody.append(commentOverlay);
    $(commentOverlay).append(commentDescription);
    $(commentOverlay).append(commentTextArea);
    var noteContent = String(highlightedRange);


    var clientSideId = generateClientSideId()

    commentTextArea.keydown(postNoteAndComment);
    $siteDocument.mousedown(clickAway);

    commentTextArea.autosize();
    commentTextArea.focus();

    var nodes = highlightedRange.getNodes();

    // the start offset indicates the offset from the beginning of the first text node,
    // if the range does not begin with a text node we have to walk the range until we find one.
    var reachedFirstTextNode = false;
    $siteDocument.find("wtHighlight").removeClass("current-highlight").addClass("old-highlight");
    $.each(nodes,function(i,node){
        if (i == 0 || !reachedFirstTextNode){
            reachedFirstTextNode = markNodeForHighlight(node, highlightedRange.startOffset, node.length);
        }
        else if (i == (nodes.length-1)){
            markNodeForHighlight(node, 0, highlightedRange.endOffset);
        }
        else {
            markNodeForHighlight(node, 0, node.length);
        }
    });
    highlight_wtHighlights();
}