console.log("inline save loaded");

function possibleHighlightStart(){
    if(Toolbar.isShown()){
        $(document).mouseup(highlightedTextDetect);
    }
}

function highlightedTextDetect(){
    $(document).unbind("mouseup", highlightedTextDetect);
    if (!rangy.getSelection().isCollapsed){
        return addSaveButtonNextToNote(rangy.getSelection().getRangeAt(0));
    }
    return false
}

function addSaveButtonNextToNote(highlightedTextRange){
    var currentSelection = rangy.getSelection();
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
    saveSpan.click(function(saveButtonLeft,saveButtonTop,nodeLineHeight,highlightedRange){return function(e){clickAndRemoveSaveButton(e,saveButtonLeft,saveButtonTop,nodeLineHeight,highlightedRange)} }(saveButtonLeft,saveButtonTop,nodeLineHeight,rangy.getSelection().getRangeAt(0)));
    //make sure this gets handled, so no existing callback gets the event and captures it.
    $(document).mousedown(removeInlineSaveButton);
    return saveSpan
}

function getHighlightedTextRange(){
    return rangy.getSelection().getRangeAt(0);
}

function getLastNode(node){
    var $node = $(node);
    var contents = $node.contents();
    if (contents.length===0){
        if (isTextNode(node)){
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
    var saveSpan = $("<span class='inlineSaveButton webtrails'></span>");
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
    //make this do all the save button creation maybe?
    return [saveSpan,nodeToHighlight,insertionNode];
}

function insertAbsolutelyPositionedSaveButton(left,top){
    var saveSpan = $("<span class='inlineSaveButton webtrails'></span>");
    applyDefaultCSS(saveSpan);
    saveSpan.html("+Save note");
    saveSpan.addClass("inlineSaveButton");
    saveSpan.css({
        "background" : "#f0f0f0",
        "font-size" : "12px",
        "color" : "#333",
        "position" : "absolute",
//        "top" : top - 2,
//        "left" : left +5,
        "border-radius": "4px",
        "cursor": "pointer",
        "z-index": "2147483647",
        "border": "1px solid #ccc",
        "padding": "2px"
    });
    $(document.body).append(saveSpan)
    saveSpan.offset({top: top - 2, left: left + 5});
    return saveSpan
}

function removeInlineSaveButton(e){
    if (!$(e.target).is(".inlineSaveButton")){
        $(".inlineSaveButton").remove();
    }
}

function clickAndRemoveSaveButton(e,overlayLeft,overlayTop,overLaySpacing,highlightedRange){
    makeCommentOverlay(overlayLeft, overlayTop,overLaySpacing,highlightedRange);
    $(".inlineSaveButton").remove();
}

