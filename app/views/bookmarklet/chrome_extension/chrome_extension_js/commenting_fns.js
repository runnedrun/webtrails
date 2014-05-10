console.log("commenting loaded");

function makeCommentOverlay(xPos, yPos, spacing, highlightedRange){
    if (!Trails.getCurrentTrail()) {
        butterBarNotification("Please create a trail or select an existing one.");
        return
    }
    if (!(((typeof xPos) == "number") && ((typeof yPos) == "number")) ){
        butterBarNotification("Note failed to save properly, please try again.");
        return
    }
    try {
        var nodes = highlightedRange.getNodes();
    } catch (exception) {
        butterBarNotification("Note failed to save properly, please try again.");
        return
    }

    var overlayHeight =20;
    //make this dynamic so the size of the comment box changes based on page size
    var overlayWidth = 400;

    var topPosition  =  yPos + spacing;
    var leftPosition = xPos > overlayWidth ? (xPos - overlayWidth) : xPos;

    var commentOverlay = $(document.createElement("div"));
    applyDefaultCSS(commentOverlay);
    commentOverlay.css({
        "background": "#f0f0f0",
        "color":"#333",
        "position":"absolute",
        "border": "1px solid #ccc",
        "border-radius": "5px",
        "font-family": "'Helvetica Neue', Helvetica, Arial, sans-serif",
        "z-index": "2147483647"
    });
    commentOverlay.addClass("commentOverlay").addClass("webtrails");

    var commentDescription = $(document.createElement("div"))
    commentDescription.html("Hit enter, click away or type a comment here")
    commentDescription.css({
        "padding": "2px",
        "text-align": "center",
        "margin-top": "3px",
        "display": "block"
    });

    var commentBox = $(document.createElement("textarea"));
    applyDefaultCSS(commentTextArea);
    commentTextArea.css({
        "font-size":"12px",
        "overflow": "hidden",
        "resize": "none",
        "border-radius": "4px",
        "color": "#333",
        "height": String(overlayHeight)+"px",
        "width": String(overlayWidth)+"px",
        "z-index": "2147483647",
        "margin": "5px",
        "outline": "none",
        "padding": "5px",
        "border": "1px solid #666",
        "background-color": "white"
    });

    var noteContent = String(highlightedRange);
    var reachedFirstTextNode = false;

    $("wtHighlight").removeClass("current-highlight");

    var clientSideId = generateClientSideId();

    $.each(nodes,function(i,node){
        if (i == 0 || !reachedFirstTextNode){
            reachedFirstTextNode = markNodeForHighlight(node,highlightedRange.startOffset,node.length, clientSideId);
        }
        else if (i == (nodes.length-1)){
            markNodeForHighlight(node,0,highlightedRange.endOffset);
        }
        else {
            markNodeForHighlight(node,0,node.length);
        }
    });

    var first = highlight_wtHighlights().first();
    console.log("first hightlight is", first);
    var firstElementOffsets = first.offset();
    console.log("offsets are:", firstElementOffsets);
    $(".trailHighlight").css("background-color","yellow");

    $(document.body).append(commentOverlay);
    $(commentOverlay).append(commentDescription);
    $(commentOverlay).append(commentTextArea);
    commentOverlay.offset({top: topPosition, left: leftPosition});

    commentTextArea.keydown(postNoteAndCommentWithClosure(noteContent,commentOverlay,leftPosition,topPosition, clientSideId));
    $(document).mousedown(clickAwayWithClosure(noteContent,commentOverlay,leftPosition,topPosition, clientSideId));
    commentTextArea.autosize();
    commentTextArea.focus();
    // the start offset indicates the offset from the beginning of the first text node,
    // if the range does not begin with a text node we have to walk the range until we find one.

    return commentTextArea;
}

function postNoteAndComment(e,content,commentOverlay,xPos,yPos, clientSideId){
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13 && !e.shiftKey){
        saveNoteAndRefreshAWS(content,commentOverlay.find("textarea").val(), xPos, yPos, clientSideId);
        closeOverlay();
    }  else if (code == 27){
        closeOverlay();
    }
}

function postNoteAndCommentWithClosure(noteContent,commentOverlay, commentX, commentY, clientSideId) {
    return function (e){postNoteAndComment(e,noteContent,commentOverlay,commentX,commentY, clientSideId)}
}

function clickAwayWithClosure(noteContent,commentOverlay, commentX, commentY, clientSideId) {
    return function (e){clickAway(e,noteContent,commentOverlay, commentX, commentY, clientSideId)}
}

function saveNoteAndRefreshAWS(content,comment, commentLocationX, commentLocationY, clientSideId){
    var noteOffsets = $("wtHighlight.highlightMe").first().offset();
    console.log("note offsets", noteOffsets);
    Trails.incrementNoteCount();
    saveSiteToTrail(
        {content: content,
        comment: comment,
        comment_location_x: commentLocationX,
        comment_location_y: commentLocationY,
        client_side_id: clientSideId,
        scroll_x: noteOffsets.left,
        scroll_y: noteOffsets.top}
    );
}

function clickAway(e,content,commentOverlay,commentX, commentY, clientSideId){
    var clickedNode = $(e.target);
    if (clickedNode != commentOverlay && ($.inArray(e.target,commentOverlay.children())==-1)){
        saveNoteAndRefreshAWS(content,commentOverlay.find("textarea").val(), commentX, commentY, clientSideId);
        closeOverlay(commentOverlay);
    }
}

function generateClientSideId() {
    var d = new Date();
    var n = d.getTime();
    return "client-side-id-" + n
}

function markNodeForHighlight(node,start_offset, end_offset, clientSideId){
    if (isTextNode(node)){
        var contents = node.nodeValue;
        var highlighted_contents = contents.slice(start_offset,end_offset);
        var whiteSpaceRegex = /^\s*$/;
        if(!highlighted_contents || whiteSpaceRegex.test(highlighted_contents)){
            console.log("nothing inside this node, not replacing");
            return
        }
        var unhighlighted_prepend = contents.slice(0,start_offset);
        var unhighlighted_append = contents.slice(end_offset,contents.length);
        var new_marker = document.createElement("wtHighlight");

        // need the currentHighlight class to distinguish between this note, and previous notes that are still
        // in the html, but should not be highlighted
        $(new_marker).addClass("highlightMe current-highlight " + clientSideId);
        $(new_marker).attr("data-trail-id", Trails.getCurrentTrailId());

        new_marker.innerHTML = highlighted_contents;
        var node_to_replace = node;
        node_to_replace.parentNode.replaceChild(new_marker,node_to_replace);

        if (unhighlighted_prepend.length !== 0 ){
            var text_before_marker = $(document.createTextNode(unhighlighted_prepend));
            text_before_marker.insertBefore(new_marker);
        }
        if (unhighlighted_append.length !== 0){
            var text_after_marker = $(document.createTextNode(unhighlighted_append));
            text_after_marker.insertAfter(new_marker);
        }
        return true;
    } else {
//        $(node).wrap("wtHighlight");
        return false;
    }
}

function highlight_wtHighlights(){
    return $("wtHighlight.highlightMe").css("background","yellow");
}

function unhighlight_wtHighlights(){
    $("wtHighlight.highlightMe").removeClass("highlightMe").css("background","");
}
