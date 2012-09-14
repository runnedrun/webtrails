console.log("commenting loaded");

function makeCommentOverlay(xPos, yPos, spacing,noteContent){
    var overlayHeight =spacing;
    var overlayWidth = 400;

    var topPosition  =  yPos + spacing
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
    commentBox.keydown((function(noteContent,commentOverlay,xPos){return (function (e){postNoteAndComment(e,noteContent,commentOverlay,xPos,yPos)})})(noteContent,commentOverlay,xPos));
    $(document).mousedown((function(noteContent,commentOverlay,yPos){return (function (e){clickAway(e,noteContent,commentOverlay,xPos,yPos)})})(noteContent,commentOverlay,yPos));
    commentBox.autosize();
    commentBox.focus();
//    commentBox.val("Hit enter, click away or type a comment now");
    var parsedNoteContent = noteContent.replace(/\r\r/gm,"\r ");
    parsedNoteContent = parsedNoteContent.replace(/\n\n/gm,"\n ");
    parsedNoteContent = parsedNoteContent.replace(/\r\n\r\n/gm,"\r\n ");

    doHighlight(document,"trailHighlight",parsedNoteContent);
    $(".trailHighlight").css("background-color","yellow");
//    makePlaceholder(commentBox);
    return commentBox;
}

function postNoteAndComment(e,content,commentOverlay,xPos,yPos){
    if (e.keyCode == 13){
        saveNoteAndRefreshAWS(content,commentOverlay.find("textarea").val(),xPos,yPos);
        closeOverlay(commentOverlay);
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
    unHighlight();

}

function clickAway(e,content,commentOverlay,xPos,yPos){
    var clickedNode = $(e.target);
    if (clickedNode != commentOverlay && ($.inArray(e.target,commentOverlay.children())==-1)){
        saveNoteAndRefreshAWS(content,commentOverlay.find("textarea").val(),xPos,yPos)
        closeOverlay(commentOverlay)
    }
}

