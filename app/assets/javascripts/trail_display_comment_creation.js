console.log("commenting loaded");

function makeCommentCreateOverlay(xPos, yPos, spacing,highlightedRange){
    var overlayHeight =20;
    //make this dynamic so the size of the comment box changes based on page size
    var overlayWidth = 400;

    var topPosition  =  yPos + spacing;
    var leftPosition = xPos > overlayWidth ? (xPos - overlayWidth) : xPos;

    var commentOverlay = $(getCurrentSiteDocument().createElement("div"));
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
    commentOverlay.css("top", topPosition+"px");
    commentOverlay.css("left", leftPosition+"px");
    commentOverlay.addClass("commentOverlay").addClass("webtrails");

    var commentDescription = $(getCurrentSiteDocument().createElement("div"))
//    applyDefaultCSS(commentDescription);
    commentDescription.html("Hit enter, click away or type a comment here")
    commentDescription.css({
        "padding": "2px",
        "text-align": "center",
        "margin-top": "3px",
        "display": "block"
    });

    var commentBox = $(getCurrentSiteDocument().createElement("textarea"));
    applyDefaultCSS(commentBox);
    commentBox.css({
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

    $(getCurrentSiteDocument().body).append(commentOverlay);
    $(commentOverlay).append(commentDescription);
    $(commentOverlay).append(commentBox);
    var noteContent = String(highlightedRange);
    commentBox.keydown(postNoteAndCommentWithClosure(noteContent,commentOverlay,leftPosition,topPosition));
    $(getCurrentSiteDocument()).mousedown(clickAwayWithClosure(noteContent,commentOverlay,leftPosition,topPosition));
    commentBox.autosize();
    commentBox.focus();
    var nodes = highlightedRange.getNodes();

    // the start offset indicates the offset from the beginning of the first text node,
    // if the range does not begin with a text node we have to walk the range until we find one.
    var reachedFirstTextNode = false;
    $.each(nodes,function(i,node){
        if (i == 0 || !reachedFirstTextNode){
            reachedFirstTextNode = markNodeForHighlight(node,highlightedRange.startOffset,node.length);
        }
        else if (i == (nodes.length-1)){
            markNodeForHighlight(node,0,highlightedRange.endOffset);
        }
        else {
            markNodeForHighlight(node,0,node.length);
        }
    });
    highlight_wtHighlights();
    $(".trailHighlight").css("background-color","yellow");
    return commentBox;
}

function postNoteAndComment(e,content,commentOverlay,xPos,yPos){
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13 && !e.shiftKey){
        closeOverlay();
        saveNoteAndRefreshAWS(content,commentOverlay.find("textarea").val(),xPos,yPos);
    } else if(code == 27){
        closeOverlay();
    }
}

function postNoteAndCommentWithClosure(noteContent,commentOverlay,xPos,yPos){
    return function (e){postNoteAndComment(e,noteContent,commentOverlay,xPos,yPos)}
}

function clickAwayWithClosure(noteContent,commentOverlay,xPos,yPos){
    return function (e){clickAway(e,noteContent,commentOverlay,xPos,yPos)}
}

function saveNoteAndRefreshAWS(content,comment,commentLocationX,commentLocationY){
//    noteCount++;
    var newNote = {
        content: content,
        comment: comment,
        comment_location_x: commentLocationX,
        comment_location_y: commentLocationY,
        client_side_id: "client_side_id_"+ (getNumberOfNotesForCurrentSite()),
        scroll_x: currentSite[0].contentWindow.scrollX,
        scroll_y:currentSite[0].contentWindow.scrollY
    };
    saveNewNote(newNote);
}

function closeOverlay(){
    var overlay = $(getCurrentSiteDocument()).find(".commentOverlay")
    $(getCurrentSiteDocument()).unbind("mousedown");
    $(getCurrentSiteDocument()).mousedown(function(){mouseDown=1});
    $(getCurrentSiteDocument()).mousedown(possibleHighlightStart);
    overlay.remove();
    unhighlight_wtHighlights();
}

function clickAway(e,content,commentOverlay,xPos,yPos){
    var clickedNode = $(e.target);
    if (clickedNode != commentOverlay && ($.inArray(e.target,commentOverlay.children())==-1)){
        closeOverlay(commentOverlay);
        saveNoteAndRefreshAWS(content,commentOverlay.find("textarea").val(),xPos,yPos);
    }
}

function markNodeForHighlight(node,start_offset, end_offset){
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
        var new_marker = getCurrentSiteDocument().createElement("wtHighlight");
        $(new_marker).addClass("highlightMe");
        $(new_marker).addClass('client_side_id_' + String(getNumberOfNotesForCurrentSite()));

        new_marker.innerHTML = highlighted_contents;
        var node_to_replace = node;
        node_to_replace.parentNode.replaceChild(new_marker,node_to_replace);

        if (unhighlighted_prepend.length !== 0 ){
            var text_before_marker = $(getCurrentSiteDocument().createTextNode(unhighlighted_prepend));
            text_before_marker.insertBefore(new_marker);
        }
        if (unhighlighted_append.length !== 0){
            var text_after_marker = $(getCurrentSiteDocument().createTextNode(unhighlighted_append));
            text_after_marker.insertAfter(new_marker);
        }
        return true;
    } else {
        return false;
    }
}

function highlight_wtHighlights(){
    $(getCurrentSiteDocument()).find("wtHighlight.highlightMe").css("background","yellow");
}

function unhighlight_wtHighlights(){
    $(getCurrentSiteDocument()).find("wtHighlight.highlightMe").removeClass("highlightMe").css("background","");
}


// this is the functionality for saving to server and updating client side storage

function removeInsertedHtml($htmlClone) {
    $htmlClone.find('.webtrails').remove();
}

function addNewNoteToClientSideStorage(resp){
    console.log("adding new note client side");
    var note = resp.note;
    getNoteIDsForCurrentSite().push(String(note.id));
    Notes[note.id] = note;
//    scrollToAndHighlightNote(note.id);
    updateNoteCount();
    addNoteToNoteList(note.content,note.id);
    deactivateOrReactivateNextNoteIfNecessary();
}

function addNoteToNoteList(noteContent,noteID){
    console.log("adding note to note list");
    console.log("content: ", noteContent);
    console.log("id: ", noteID);
    var noteDisplay = $(".noteList#site"+String(getCurrentSiteID()));
    console.log(noteDisplay);
    var noteWrapper = $("<div></div>");
    noteWrapper.addClass("noteWrapper");

    var noteContentDiv = $("<div></div>");
    noteContentDiv.attr("id","note"+String(noteID));
    noteContentDiv.addClass("noteContent testing1");
    noteContentDiv.html(noteContent);

    noteWrapper.append(noteContentDiv);
    noteDisplay.append(noteWrapper);
}

function saveNewNote(note){
    console.log("saving new note to trail");
    var currentHTML = getCurrentIframeHTML();
    var currentSiteUrl = $('.activeFavicon').attr("data-site-url");
    var currentSiteTitle = $('.activeFavicon').attr("data-ot");
    console.log(getCurrentSiteID());
    $.ajax({
        url: "/sites/new_note_from_view_page",
        type: "post",
        data: {
            "site[id]":getCurrentSiteID(), //this is probably unnecesary
            "site[trail_id]":trailID,
            "note": note || "none",
            "html": currentHTML,
        },
        success: addNewNoteToClientSideStorage
    });
}