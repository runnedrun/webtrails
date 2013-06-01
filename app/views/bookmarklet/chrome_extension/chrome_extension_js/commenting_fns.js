console.log("commenting loaded");

function makeCommentOverlay(xPos, yPos, spacing,highlightedRange){
    var overlayHeight =spacing;
    //make this dynamic so the size of the comment box changes based on page size
    var overlayWidth = 400;

    var topPosition  =  yPos + spacing;
    var leftPosition = xPos > overlayWidth ? (xPos - overlayWidth) : xPos;

    var commentOverlay = wt_$(document.createElement("div"));
    applyDefaultCSS(commentOverlay);
    commentOverlay.css({
        "background": "#f0f0f0",
        "color":"#333",
        "position":"absolute",
        "border": "1px solid #ccc",
        "border-radius": "5px",
        "font-family": "'Helvetica Neue', Helvetica, Arial, sans-serif"
    });
    commentOverlay.css("top", topPosition+"px");
    commentOverlay.css("left", leftPosition+"px");
    commentOverlay.addClass("commentOverlay").addClass("webtrails");

    var commentDescription = wt_$(document.createElement("div"))
//    applyDefaultCSS(commentDescription);
    commentDescription.html("Hit enter, click away or type a comment here")
    commentDescription.css({
        "padding": "2px",
        "text-align": "center",
        "margin-top": "3px",
        "display": "block"
    });

    var commentBox = wt_$(document.createElement("textarea"));
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
        "border": "1px solid #666"
    });

    wt_$(document.body).append(commentOverlay);
    wt_$(commentOverlay).append(commentDescription);
    wt_$(commentOverlay).append(commentBox);
    var noteContent = String(highlightedRange);
    commentBox.keydown(postNoteAndCommentWithClosure(noteContent,commentOverlay,xPos,yPos));
    wt_$(document).mousedown(clickAwayWithClosure(noteContent,commentOverlay,xPos,yPos));
    commentBox.autosize();
    commentBox.focus();
    var nodes = highlightedRange.getNodes();
    wt_$.each(nodes,function(i,node){
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
    wt_$(".trailHighlight").css("background-color","yellow");
//    makePlaceholder(commentBox);
    return commentBox;
}

function postNoteAndComment(e,content,commentOverlay,xPos,yPos){
    if (e.keyCode == 13){
        closeOverlay();
        saveNoteAndRefreshAWS(content,commentOverlay.find("textarea").val(),xPos,yPos);
    }
}

function postNoteAndCommentWithClosure(noteContent,commentOverlay,xPos,yPos){
    return function (e){postNoteAndComment(e,noteContent,commentOverlay,xPos,yPos)}
}

function clickAwayWithClosure(noteContent,commentOverlay,xPos,yPos){
    return function (e){clickAway(e,noteContent,commentOverlay,xPos,yPos)}
}

function saveNoteAndRefreshAWS(content,comment,commentLocationX,commentLocationY){
    noteCount++;
    console.log("note count incremented", noteCount);
    var noteCountAtSave = noteCount;
    saveSiteToTrail(
        function(site_data){
            console.log("done saving"); 
            currentSiteTrailID = site_data.site_id;
            console.log(currentSiteTrailID);
            updateNoteDisplay(site_data);
        },
        {content: content, comment: comment, comment_location_x: commentLocationX, comment_location_y: commentLocationY, client_side_id: "client_side_id_"+ (noteCount - 1), scroll_x: window.scrollX, scroll_y:window.scrollY}
    );
}

function closeOverlay(){
    var overlay = wt_$(".commentOverlay")
    wt_$(document).unbind("mousedown");
    wt_$(document).mousedown(function(){mouseDown=1});
    wt_$(document).mousedown(possibleHighlightStart);
    overlay.remove();
    unhighlight_wtHighlights();
}

function clickAway(e,content,commentOverlay,xPos,yPos){
    var clickedNode = wt_$(e.target);
    if (clickedNode != commentOverlay && (wt_$.inArray(e.target,commentOverlay.children())==-1)){
        closeOverlay(commentOverlay);
        saveNoteAndRefreshAWS(content,commentOverlay.find("textarea").val(),xPos,yPos);
    }
}

function markNodeForHighlight(node,start_offset, end_offset){
    if (isTextNode(node)){
        var contents = node.nodeValue;
        var highlighted_contents = contents.slice(start_offset,end_offset);
        var whiteSpaceRegex = /^\s*wt_$/;
        if(!highlighted_contents || whiteSpaceRegex.test(highlighted_contents)){
            console.log("nothing inside this node, not replacing");
            return
        }
        var unhighlighted_prepend = contents.slice(0,start_offset);
        var unhighlighted_append = contents.slice(end_offset,contents.length);
        var new_marker = document.createElement("wtHighlight");
        wt_$(new_marker).addClass("highlightMe");
        wt_$(new_marker).addClass('client_side_id_' + String(noteCount));

        new_marker.innerHTML = highlighted_contents;
        var node_to_replace = node;
        node_to_replace.parentNode.replaceChild(new_marker,node_to_replace);

        if (unhighlighted_prepend.length !== 0 ){
            var text_before_marker = wt_$(document.createTextNode(unhighlighted_prepend));
            text_before_marker.insertBefore(new_marker);
        }
        if (unhighlighted_append.length !== 0){
            var text_after_marker = wt_$(document.createTextNode(unhighlighted_append));
            text_after_marker.insertAfter(new_marker);
        }
    } else {
//        wt_$(node).wrap("wtHighlight");
    }
}

function highlight_wtHighlights(){
    wt_$("wtHighlight.highlightMe").css("background","yellow");
}

function unhighlight_wtHighlights(){
    wt_$("wtHighlight.highlightMe").removeClass("highlightMe").css("background","");
}
