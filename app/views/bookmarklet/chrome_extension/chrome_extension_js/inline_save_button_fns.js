console.log("inline save loaded");

function possibleHighlightStart(){
    var startingSelectionCopy = rangy.getSelection().toString().slice(0);
    $(document).mouseup(function(){highlightedTextDetect(startingSelectionCopy)});
}

function highlightedTextDetect(startingHighlight){
    $(document).unbind("mouseup");
    if (!rangy.getSelection().isCollapsed){
        addSaveButtonNextToNote(rangy.getSelection().getRangeAt(0));
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
    var combinedRange = currentSelectionRange.union(newSelectionRange);
    currentSelection.addRange(combinedRange);
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
    return rangy.getSelection().getRangeAt(0);
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

