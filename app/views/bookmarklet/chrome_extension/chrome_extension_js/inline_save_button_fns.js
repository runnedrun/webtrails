console.log("inline save loaded");

function possibleHighlightStart(){
    if(!trailDisplay.is(":hidden")){
        // this seems unused
        // var startingSelectionCopy = rangy.getSelection().toString().slice(0);
        mouseDown = 1;
        wt_$(document).mouseup(function(){mouseDown = 0; highlightedTextDetect()});
    }
}

function highlightedTextDetect(){
    if(!trailDisplay.is(":hidden")){
        //this probably breaks a lot of pages
        wt_$(document).unbind("mouseup");
        if (!rangy.getSelection().isCollapsed){
            addSaveButtonNextToNote(rangy.getSelection().getRangeAt(0));
        }
    }
}

function addSaveButtonNextToNote(highlightedTextRange){
    var currentSelection = rangy.getSelection();
    var highlightedContent = smartGrabHighlightedText();
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
    var nodeLineHeight = parseInt(getComputedStyleOfElement(currentSelection.getRangeAt(0).endContainer.parentNode, "lineHeight").replace("px",""));

    //clean this up foo
    saveSpan.click(function(saveButtonLeft,saveButtonTop,nodeLineHeight,highlightedRange){return function(e){clickAndRemoveSaveButton(e,saveButtonLeft,saveButtonTop,nodeLineHeight,highlightedRange)} }(saveButtonLeft,saveButtonTop,nodeLineHeight,rangy.getSelection().getRangeAt(0)));
    //make sure this gets handled, so no existing callback gets the event and captures it.
    wt_$(document).mousedown(removeInlineSaveButton);
}

function getHighlightedTextRange(){
    return rangy.getSelection().getRangeAt(0);
}

function getLastNode(node){
    var wt_$node = wt_$(node);
    var contents = wt_$node.contents();
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
    if (wt_$(endContainer).contents().length === 0){
        insertionNode = endContainer;
    } else {
        insertionNode = getLastNode(endContainer);
    }
    var textNodeContent = insertionNode.textContent;
    var firstHalfOfNode =  textNodeContent.slice(0,endOffset);
    var secondHalfOfNode =  textNodeContent.slice(endOffset);
    var saveSpan = wt_$("<span class='inlineSaveButton'></span>");
    saveSpan.html("Save note");
    saveSpan.css("width", "0");

    var nodeToHighlight;
    if (endContainer === startContainer){
        var nodeToHighlightPrefix = document.createTextNode(firstHalfOfNode.slice(0,startOffset));
        nodeToHighlight = document.createTextNode(firstHalfOfNode.slice(startOffset));
        insertionNode.parentNode.replaceChild(nodeToHighlightPrefix,insertionNode)
        wt_$(nodeToHighlight).insertAfter(nodeToHighlightPrefix);
    }else{
        nodeToHighlight = document.createTextNode(firstHalfOfNode);
        insertionNode.parentNode.replaceChild(nodeToHighlight,insertionNode)
    }
    saveSpan.insertAfter(nodeToHighlight);
    wt_$(document.createTextNode(secondHalfOfNode)).insertAfter(saveSpan);
    //make this do all the save button creation maybe?
    return [saveSpan,nodeToHighlight,insertionNode];
}

function insertAbsolutelyPositionedSaveButton(left,top){
    var saveSpan = wt_$("<span class='inlineSaveButton'></span>");
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
        "z-index": "2147483647"

    });
    wt_$(document.body).append(saveSpan)
    return saveSpan
}

function removeInlineSaveButton(e){
    if (!wt_$(e.target).is(".inlineSaveButton")){
        wt_$(".inlineSaveButton").remove();
    }
}

function clickAndRemoveSaveButton(e,overlayLeft,overlayTop,overLaySpacing,highlightedRange){
    makeCommentOverlay(overlayLeft, overlayTop,overLaySpacing,highlightedRange);
    wt_$(".inlineSaveButton").remove();
}

