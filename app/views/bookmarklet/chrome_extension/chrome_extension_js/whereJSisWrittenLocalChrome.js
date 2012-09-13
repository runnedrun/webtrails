var trailDisplay,
    mouseDown = 0,
    previousNoteDisplay,
    noteDisplayWrapper,
    currentSiteTrailID="",
    trailID = 1,
    userID = 1,
    saveSiteToTrailButton,
    deleteNoteButton,
    previousNoteID,
    siteHTML = document.getElementsByTagName('html')[0].innerHTML;


String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};


$(initMyBookmarklet);

function getCurrentSiteHTML(){
    return document.getElementsByTagName('html')[0].innerHTML;
}

function verifyKeyPress(e){
var code = (e.keyCode ? e.keyCode : e.which);
if (code == 27){
    showOrHidePathDisplay();
}
}

function showOrHidePathDisplay(){
    if (trailDisplay.is(":hidden")){
        trailDisplay.show();
     }
    else {
        trailDisplay.hide();
    }

}

function setSiteID(response){
    currentSiteTrailID = response.site_id
}


function addFaviconsToDisplay(data){
    $.each(data.favicons_and_urls, function(i,favicon_and_url){
            addSiteFaviconToDisplay(favicon_and_url[0],favicon_and_url[1]);
        }
    )
}

function addSiteFaviconToDisplay(domain,url) {
    trailDisplay.prepend("<a href="+ url+ "\" class=\"siteFavicon\"><img src='"+ domain + "'></a>")
}


function revealTrailURL(e){
    var urlDisplay = $(document.createElement("span"));
    urlDisplay.css({
        "font-size": "12px",
        "color": "white",
        "background-color": "transparent",
        "font-weight": "bold",
        height:"100%",
        "max-width": "15%",
        "float": "right",
        "margin-left": "2%",
        border: "solid white 2px"
    })
    urlDisplay.html("http://localhost:3000/trails/"+trailID);
    e.target.parentNode.replaceChild(urlDisplay[0],e.target)
}


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

function mouseStopDetect (){
    var onmousestop = function(e) {
        if (mouseDown && String(window.getSelection())){
            var textNodeLineHeight = getComputedStyleOfElement(window.getSelection().getRangeAt(0).startContainer.parentNode,"lineHeight");
            var noteContent = smartGrabHighlightedText();
            makeCommentOverlay(e.pageX, e.pageY,parseInt(textNodeLineHeight.replace("px","")),noteContent);
        }
    }, thread;

    return function(e) {
        clearTimeout(thread);
        thread = setTimeout(function(){onmousestop(e)}, 700);
    };
}

function possibleHighlightStart(){
    var startingSelectionCopy = window.getSelection().toString().slice(0);
    $(document).mouseup(function(){highlightedTextDetect(startingSelectionCopy)});
}

function highlightedTextDetect(startingHighlight){
    $(document).unbind("mouseup");
    if (!window.getSelection().isCollapsed){
        addSaveButtonNextToNote(window.getSelection().getRangeAt(0));
    }
}
//onmouusedown
//function preventDoubleHighlightBug(e){
//    var highlightedText = window.getSelection().getRangeAt(0);
//    if (!highlightedText.isCollapsed){
//        $(document.mouseUpaddSaveButtonNextToNote(highlightedText);
//    }
//}

function moveNoteToPrevious(noteContent){
    previousNoteDisplay.fadeOut(100);
    previousNoteDisplay.html(noteContent);
    previousNoteDisplay.fadeIn(100);
}

function saveNoteAndRefreshAWS(content,comment,commentLocationX,commentLocationY){
    saveSiteToTrail(function(site_data){submitNoteAfterSave(site_data,content,comment,commentLocationX,commentLocationY)})
}


function deletePreviousNote(){
    $.ajax({
        url: "http://localhost:3000/notes/delete",
        type: "post",
        crossDomain: true,
        data: {
            "id": previousNoteID
        },
        success: updateNoteDisplay
    })
}

function updateNoteDisplay(data){
    if (data.id == "none") {
        moveNoteToPrevious("No more notes on this page.  Go ahead and take a few.");
        deleteNoteButton.attr("disabled","disabled");
    }else{
        previousNoteID = data.id;
        moveNoteToPrevious(data.content);
        deleteNoteButton.attr("disabled","");
    }
}

function ltrim(stringToTrim) {
	return stringToTrim.replace(/^\s+/,"");
}
function rtrim(stringToTrim) {
	return stringToTrim.replace(/\s+$/,"");
}

function getComputedStyleOfElement(element,stylename){
    return document.defaultView.getComputedStyle(element,null)[stylename];
}


function makePlaceholder(element){
    element.keydown(function (e) {
        var input = $(e.target);

        if (input && !input.data('data-entered')) {
            input.data('data-entered', true);
            input.val("");
        }
        }
    )

    // Restore the default text if empty on blur
    element.blur(function (e) {
        var input = $(e.target);

        if (input && input.val() === "") {
            input.data('data-entered', false);
            input.val(input.data('blank-value'));
        }
        }
    )

    element.data('blank-value', element.val());
    element.data('data-entered', false);
}

function closeOverlay(overlay){
    $(document).unbind("mousedown");
    $(document).mousedown(function(){mouseDown=1});
    $(document).mousedown(possibleHighlightStart);
    overlay.remove();
    unHighlight();

}

function unHighlight(){
    $(".trailHighlight").attr("style","").removeClass("trailHighlight");
}

function clickAway(e,content,commentOverlay,xPos,yPos){
    var clickedNode = $(e.target);
    if (clickedNode != commentOverlay && ($.inArray(e.target,commentOverlay.children())==-1)){
        saveNoteAndRefreshAWS(content,commentOverlay.find("textarea").val(),xPos,yPos)
        closeOverlay(commentOverlay)
    }
}

function addSaveButtonNextToNote(highlightedTextRange){
    var currentSelection = window.getSelection();
    var highlightedContent = smartGrabHighlightedText();
    var newNodeReadyForInsertandSaveButton = insertSaveButtonIntoNodeContent(highlightedTextRange);
    var saveButton = newNodeReadyForInsertandSaveButton[0];
    var nodeToHighlight = newNodeReadyForInsertandSaveButton[1];

    var newSelectionRange = document.createRange();
    newSelectionRange.selectNode(nodeToHighlight);

    currentSelection.addRange(newSelectionRange);
    var saveButtonPosition = saveButton.offset();
    var saveButtonTop = saveButtonPosition.top;
    var saveButtonLeft = saveButtonPosition.left;
    saveButton.remove();
    var saveSpan = insertAbsolutelyPositionedSaveButton(saveButtonLeft, saveButtonTop);
    var nodeLineHeight = parseInt(getComputedStyleOfElement(currentSelection.getRangeAt(0).endContainer.parentNode, "lineHeight").replace("px",""));

    saveSpan.click(function(saveButtonLeft,saveButtonTop,nodeLineHeight,highlightedContent){ return function(e){clickAndRemoveSaveButton(e,saveButtonLeft,saveButtonTop,nodeLineHeight,highlightedContent)} }(saveButtonLeft,saveButtonTop,nodeLineHeight,highlightedContent));
    $(document).mousedown(removeInlineSaveButton);
}

function getHighlightedTextRange(){
    return window.getSelection().getRangeAt(0);
}

function getLastNode(node){
    var $node = $(node);
    var contents = $node.contents();
    if (contents.length===0){
        if (node.nodeType === 3){
            return node
        } else {
            var newNode = document.createTextNode("");
            node.appendChild(newNode);
            return newNode;
        }
    } else {
        return getLastNode(contents.last()[0])
    }
}
function insertSaveButtonIntoNodeContent(highlightedTextRange){
    var startContainer = highlightedTextRange.startContainer
    var endContainer = highlightedTextRange.endContainer
    var startOffset = highlightedTextRange.startOffset
    var endOffset = highlightedTextRange.endOffset
    var insertionNode;
    if ($(endContainer).contents().length === 0){
        insertionNode = endContainer;
    } else {
        insertionNode = getLastNode(endContainer);
    }
    var textNodeContent = insertionNode.textContent;
    var firstHalfOfNode =  textNodeContent.slice(0,endOffset);
    var secondHalfOfNode =  textNodeContent.slice(endOffset);
    var saveSpan = $("<span class='inlineSaveButton'></span>");
    saveSpan.html("Save note");
    saveSpan.css("width", "0");

    var nodeToHighlight;
    if (endContainer === startContainer){
        var nodeToHighlightPrefix = document.createTextNode(firstHalfOfNode.slice(0,startOffset));
        nodeToHighlight = document.createTextNode(firstHalfOfNode.slice(startOffset));
        insertionNode.parentNode.replaceChild(nodeToHighlightPrefix,insertionNode)
        $(nodeToHighlight).insertAfter(nodeToHighlightPrefix);
    }else{
        nodeToHighlight = document.createTextNode(firstHalfOfNode);
        insertionNode.parentNode.replaceChild(nodeToHighlight,insertionNode)
    }
    saveSpan.insertAfter(nodeToHighlight);
    $(document.createTextNode(secondHalfOfNode)).insertAfter(saveSpan);
    return [saveSpan,nodeToHighlight,insertionNode];
}

function insertAbsolutelyPositionedSaveButton(left,top){
    var saveSpan = $("<span class='inlineSaveButton'></span>");
    saveSpan.html("+Save note");
    saveSpan.addClass("inlineSaveButton");
    saveSpan.css({
        "background" : "black",
        "font-size" : "12px",
        "color" : "white",
        "position" : "absolute",
        "top" : top,
        "left" : left +5,
        "border-radius": "4px",
        "cursor": "pointer",
        "z-index": "9999"

    });
    $(document.body).append(saveSpan)
    return saveSpan
}

function removeInlineSaveButton(e){
    if (!$(e.target).is(".inlineSaveButton")){
        $(".inlineSaveButton").remove();
    }
}

function clickAndRemoveSaveButton(e,overlayLeft,overlayTop,overLaySpacing,noteContent){
    var commentBox = makeCommentOverlay(overlayLeft, overlayTop,overLaySpacing,noteContent);
    $(".inlineSaveButton").remove();
}

