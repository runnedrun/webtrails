console.log("inline save loaded");

function possibleHighlightStart(e){
    console.log("possible highlight start")
    mouseDown = 1;

    if (($(e.target).closest(".webtrails").length == 0) && !noteViewActive){
        $(getCurrentSiteDocument()).mouseup(function(){mouseDown = 0; highlightedTextDetect()});
    }
}

function highlightedTextDetect(){
    //this probably breaks a lot of pages
    console.log("looking for highlighted text");
    $(getCurrentSiteDocument()).unbind("mouseup");
    if (!rangy.getIframeSelection(currentSite[0]).isCollapsed){
        console.log("adding the button");
        addSaveButtonNextToNote(rangy.getIframeSelection(currentSite[0]).getRangeAt(0));
    }
}

function addSaveButtonNextToNote(highlightedTextRange){
    var currentSelection = rangy.getIframeSelection(currentSite[0]);
    var nodeLineHeight = getNodeLineHeight(currentSelection.getRangeAt(0).endContainer.parentNode);
//    var highlightedContent = smartGrabHighlightedText();
    var newNodeReadyForInsertandSaveButton = insertSaveButtonIntoNodeContent(highlightedTextRange);
    var saveButton = newNodeReadyForInsertandSaveButton[0];
    var nodeToHighlight = newNodeReadyForInsertandSaveButton[1];
    var currentSelectionRange = getHighlightedTextRange();
    var newSelectionRange = rangy.createRange();
    newSelectionRange.selectNode(nodeToHighlight);
    try{
        if (!(currentSelectionRange.collapsed)){
            var combinedRange = currentSelectionRange.union(newSelectionRange);
        }else{
            var combinedRange = newSelectionRange;
        }
        //check if the new selection range is empty, then get rid of this jank try statement
    }
    catch(e){
        combinedRange = currentSelectionRange;
    }
    currentSelection.addRange(combinedRange);
    var saveButtonPosition = saveButton.offset();
    var saveButtonTop = saveButtonPosition.top;
    var saveButtonLeft = saveButtonPosition.left;
    saveButton.remove();
    var saveSpan = insertAbsolutelyPositionedSaveButton(saveButtonLeft, saveButtonTop);
    //clean this up foo
    saveSpan.click(function(saveButtonLeft,saveButtonTop,nodeLineHeight,highlightedRange){return function(e){clickAndRemoveSaveButton(e,saveButtonLeft,saveButtonTop,nodeLineHeight,highlightedRange)} }(saveButtonLeft,saveButtonTop,nodeLineHeight,rangy.getIframeSelection(currentSite[0]).getRangeAt(0)));
    //make sure this gets handled, so no existing callback gets the event and captures it.
    $(getCurrentSiteDocument()).mousedown(removeInlineSaveButton);
}

function getHighlightedTextRange(){
    return rangy.getIframeSelection(currentSite[0]).getRangeAt(0);
}

function getLastNode(node){
    var $node = $(node);
    var contents = $node.contents();
    if (contents.length===0){
        if (isTextNode(node)){
            return node
        } else {
            var newNode = getCurrentSiteDocument().createTextNode("");
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
    var saveSpan = $("<span></span>");
    saveSpan.addClass("webtrails inline-save-button");
    saveSpan.html("Save note");
    saveSpan.css("width", "0");

    var nodeToHighlight;
    if (endContainer === startContainer){
        var nodeToHighlightPrefix = getCurrentSiteDocument().createTextNode(firstHalfOfNode.slice(0,startOffset));
        nodeToHighlight = getCurrentSiteDocument().createTextNode(firstHalfOfNode.slice(startOffset));
        insertionNode.parentNode.replaceChild(nodeToHighlightPrefix,insertionNode)
        $(nodeToHighlight).insertAfter(nodeToHighlightPrefix);
    }else{
        nodeToHighlight = getCurrentSiteDocument().createTextNode(firstHalfOfNode);
        insertionNode.parentNode.replaceChild(nodeToHighlight,insertionNode)
    }
    saveSpan.insertAfter(nodeToHighlight);
    $(getCurrentSiteDocument().createTextNode(secondHalfOfNode)).insertAfter(saveSpan);
    //make this do all the save button creation maybe?
    return [saveSpan,nodeToHighlight,insertionNode];
}

function insertAbsolutelyPositionedSaveButton(left,top){
    var saveSpan = $("<span></span>");
    saveSpan.addClass("inline-save-button webtrails");
    applyDefaultCSS(saveSpan);
    saveSpan.html("+Save note");
    saveSpan.css({
        "background" : "#f0f0f0",
        "font-size" : "12px",
        "color" : "#333",
        "position" : "absolute",
        "top" : top - 2,
        "left" : left +5,
        "border-radius": "4px",
        "cursor": "pointer",
        "z-index": "2147483647",
        "border": "1px solid #ccc",
        "padding": "2px",
        "-webkit-touch-callout": "none",
        "-webkit-user-select": "none",
        "-khtml-user-select": "none",
        "-moz-user-select": "none",
        "-ms-user-select": "none",
        "user-select": "none"
    });

    $(getCurrentSiteDocument().body).append(saveSpan)
    return saveSpan
}

function removeInlineSaveButton(e){
    if (!$(e.target).is(".inline-save-button")){
        $(getCurrentSiteDocument()).find(".inline-save-button").remove();
    }
}

function clickAndRemoveSaveButton(e,overlayLeft,overlayTop,overLaySpacing,highlightedRange){
    makeCommentCreateOverlay(overlayLeft, overlayTop,overLaySpacing,highlightedRange);
    $(getCurrentSiteDocument()).find(".inline-save-button").remove();
}

function getNodeLineHeight(element) {
    var fontsize = getComputedStyleOfElement(element, "font-size");
    if (fontsize) {
        return parseInt(fontsize.replace("px",""))*1.5 || 20; //default to 20
    } else {
        return 20;
    }

}
// returns true if the node is a text node, false if not
function isTextNode(node) {
    return node.nodeType == 3;
}
