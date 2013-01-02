console.log("commenting loaded");

function makeCommentOverlay(xPos, yPos, spacing,highlightedRange){
    var overlayHeight =spacing;
    //make this dynamic so the size of the comment box changes based on page size
    var overlayWidth = 400;

    var topPosition  =  yPos + spacing;
    var leftPosition = xPos > overlayWidth ? (xPos - overlayWidth) : xPos;

    var commentOverlay = $(document.createElement("div"));
    commentOverlay.css({
        "background": "#2E2E1F",
        "opacity": .9,
        "color":"white",
        "position":"absolute"
    });
    commentOverlay.css("top", topPosition+"px");
    commentOverlay.css("left", leftPosition+"px");
    commentOverlay.addClass("commentOverlay");

    var commentDescription = $(document.createElement("div"))
    commentDescription.html("Hit enter, click away or type a comment here")
    commentDescription.css({
        "border": "2px solid black"
    });

    var commentBox = $(document.createElement("textarea"));
    commentBox.css({
        "font-size":"12px",
        "overflow": "hidden",
        "resize": "none",
        "border": "4px solid black",
        "border-radius": "4px",
        "color": "black",
        "height": String(overlayHeight)+"px",
        "width": String(overlayWidth)+"px",
        "z-index": "9999"
    });

    $(document.body).append(commentOverlay);
    $(commentOverlay).append(commentDescription);
    $(commentOverlay).append(commentBox);
    var noteContent = String(highlightedRange);
    commentBox.keydown((function(noteContent,commentOverlay,xPos,yPos){return (function (e){postNoteAndComment(e,noteContent,commentOverlay,xPos,yPos)})})(noteContent,commentOverlay,xPos,yPos));
    $(document).mousedown((function(noteContent,commentOverlay,xPos,yPos){return (function (e){clickAway(e,noteContent,commentOverlay,xPos,yPos)})})(noteContent,commentOverlay,xPos,yPos));
    commentBox.autosize();
    commentBox.focus();
    var nodes = highlightedRange.getNodes();
    $.each(nodes,function(i,node){
        if (i == 0){
            markNodeForHighlight(node,highlightedRange.startOffset,node.length);
        }
        else if (i == (nodes.length-1)){
            markNodeForHighlight(node,0,highlightedRange.endOffset);
        }
        else {
            markNodeForHighlight(node,0,node.length);
        }
    });

//    commentBox.val("Hit enter, click away or type a comment now");

//    doHighlight(document,"trailHighlight",parsedNoteContent);
    highlight_wtHighlights();
    $(".trailHighlight").css("background-color","yellow");
//    makePlaceholder(commentBox);
    return commentBox;
}

function postNoteAndComment(e,content,commentOverlay,xPos,yPos){
    if (e.keyCode == 13){
        closeOverlay(commentOverlay);
        saveNoteAndRefreshAWS(content,commentOverlay.find("textarea").val(),xPos,yPos);
    }
}

function saveNoteAndRefreshAWS(content,comment,commentLocationX,commentLocationY){
    saveSiteToTrail(function(site_data){submitNoteAfterSave(site_data,content,comment,commentLocationX,commentLocationY)})
}

function closeOverlay(overlay){
    $(document).unbind("mousedown");
    $(document).mousedown(function(){mouseDown=1});
    $(document).mousedown(possibleHighlightStart);
    overlay.remove();
    unhighlight_wtHighlights();

}

function clickAway(e,content,commentOverlay,xPos,yPos){
    var clickedNode = $(e.target);
    if (clickedNode != commentOverlay && ($.inArray(e.target,commentOverlay.children())==-1)){
        closeOverlay(commentOverlay)
        saveNoteAndRefreshAWS(content,commentOverlay.find("textarea").val(),xPos,yPos)
    }
}

function markNodeForHighlight(node,start_offset, end_offset){
    //paul will make this a global
    if (node.nodeType === 3){
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
        $(new_marker).addClass("highlightMe");
        $(new_marker).addClass('client_side_id_' + String(noteCount));

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
    } else {
//        $(node).wrap("wtHighlight");
    }
}

function highlight_wtHighlights(){
    $("wtHighlight.highlightMe").css("background","yellow");
}

function unhighlight_wtHighlights(){
    $("wtHighlight.highlightMe").removeClass("highlightMe").css("background","");
}