CommentCreator = function(spacing, highlightedRange, trackedDocument) {
    var noteContent = String(highlightedRange);
    var selectedNodes = [];
    var nodesToHighlight = [];
    var originalStartIndex = highlightedRange.startOffset;
    var originalEndIndex = highlightedRange.endOffset;
    var clientSideId = generateClientSideId();
    var nodes = highlightedRange.getNodes();
    var commentText;
    var $body = $(trackedDocument.body);
    var commentOverlay;
    var commentOverlayShown = false;

    var thisComment = this;

    this.remove = function() {
        revertNodes();
        removeCommentOverlay();
    }

    this.canBeHighlighted = function() {
        return selectedNodes.length > 0
    }

    var CSS = {
        commentOverlay: {
            "font-size":"12px",
            "color": "#333",
            "z-index": "2147483647",
            "padding": "5px",
            "background-color": "white",
            "position": "absolute",
            "display": "none",
            "border": "1px solid",
            "border-radius": "5px",
            "max-width" : "200px",
            "word-wrap" : "break-word"
        }
    };
    var HTML = {
        commentOverlay: function(top, left) {
            return applyDefaultCSS($("<span contentEditable='true'></span>"))
                .css(CSS.commentOverlay)
                .css({"top": top + "px", "left": left + "px"})
                .addClass("commentOverlay")
                .addClass("webtrails");
        }
    };

    function highlight() {
        $.each(nodesToHighlight, function(i, highlightedNode) {
            highlightedNode.highlight();
        })
    }

    function saveNote(content, comment, noteOffsets, clientSideId){
        var newNote = {
            content: content,
            comment: comment,
            comment_location_x: noteOffsets.top,
            comment_location_y: noteOffsets.left,
            client_side_id: clientSideId,
            scroll_x: noteOffsets.left,
            scroll_y: noteOffsets.top
        };

        $(document).trigger(noteSubmitEvent(newNote));
        saveSiteToTrail(newNote);
    }

    function checkForNotePostKeypress(e){
        console.log("checking for note post keypress");
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13 && !e.shiftKey){
            commentText = commentOverlay.html();
            var noteOffsets = selectedNodes[0].getWtHighlight().offset();
            removeCommentOverlay();
            saveNote(noteContent, commentText, noteOffsets, clientSideId);
        } else if(code == 27){
            hideOverlayAndRevert();

        }
    }

    function isEditableElement($el) {
        var tagName = $el[0].tagName.toLowerCase();

        var contentEditableParents = $el.parents().map(function() {
            if ($(this).is("[contenteditable='true']")) {
                return true;
            }
            else if ($(this).is("[contenteditable='false']")) {
                return false;
            }
        }).get();

        var isDefaultEditable =  (tagName === "input" || tagName === "textarea");
        var isContentEditable = contentEditableParents.length > 0 || $el.is("[contenteditable='true']");

        return isDefaultEditable || isContentEditable
    }

    function checkForEmptyCommentOverlayOnKeypress() {
        var content = commentOverlay.html();
        if (content === "") {
            hideOverlayAndRevert()
        }
    }

    function hideOverlayAndRevert() {
        hideCommentOverlay();
        $(trackedDocument).keypress(modifyOverlayOnFirstKeypress);
        commentOverlay.blur();
        reHighlightNodes();
    }

    function modifyOverlayOnFirstKeypress(e) {
        console.log("picking up key[ress");
        showCommentOverlay();
        $(trackedDocument).unbind("keypress", modifyOverlayOnFirstKeypress);
        commentOverlay.focus();
        moveCursorToEndOfOverlay();
        highlight();
    }

    function moveCursorToEndOfOverlay()
    {
        var range = document.createRange();
        range.selectNodeContents(commentOverlay[0]);
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }


    function generateClientSideId() {
        var d = new Date();
        var n = d.getTime();
        return "client-side-id-" + n;
    }

    function reHighlightNodes() {
        if (nodesToHighlight.length > 0) {
            var newSelectionRange = rangy.createRange();
            var firstSelectedNode = selectedNodes[0];
            var lastSelectedNode = selectedNodes[selectedNodes.length - 1];

            var startIndex;
            var startRawNode;
            if (firstSelectedNode.canBeHighlighted()) {
                startRawNode = firstSelectedNode.getNode();
                startIndex = 0;
            } else if (firstSelectedNode.isTextNode() && !firstSelectedNode.canBeHighlighted()) {
                startRawNode = firstSelectedNode.getNode();
                startIndex = originalStartIndex;
            } else if (!firstSelectedNode.isTextNode()) {
                var nodeToSelect = firstSelectedNode.getNode();
                startRawNode = nodeToSelect.parentNode;

                startIndex = Array.prototype.indexOf.call(startRawNode.childNodes, nodeToSelect);
            }

            var endIndex;
            var endRawNode;
            if (lastSelectedNode.canBeHighlighted()) {
                endRawNode = lastSelectedNode.getNode();
                endIndex = endRawNode.length;
            } else if (lastSelectedNode.isTextNode() && !lastSelectedNode.canBeHighlighted()) {
                endRawNode = lastSelectedNode.getNode();
                endIndex = originalEndIndex;
            } else if (!lastSelectedNode.isTextNode()) {
                nodeToSelect = lastSelectedNode.getNode();
                endRawNode = nodeToSelect.parentNode;
                endIndex = Array.prototype.indexOf.call(endRawNode.childNodes, nodeToSelect);

                // for some reason if the element is the last of the children then we need to set the
                // index to be larger then the length of the child nodes, in order for the node to
                // properly highlight
                endIndex + 1 == (endRawNode.childNodes.length) && endIndex ++
            }

            newSelectionRange.setStart(startRawNode, startIndex);
            newSelectionRange.setEnd(endRawNode, endIndex);
            rangy.getSelection().addRange(newSelectionRange);
        }

        nodesToHighlight.forEach(function(node) {
            node.unHighlight();
        })
    }


    function revertNodes() {
        $.each(selectedNodes, function(i, highlightedNode) {
            highlightedNode.revert();
        })
    }

    function hideCommentOverlay() {
        commentOverlayShown = false;
        commentOverlay.hide();
    }

    function showCommentOverlay() {
        commentOverlayShown = true;
        commentOverlay.show();
    }

    function removeCommentOverlay() {
        commentOverlay && commentOverlay.remove();
    }

    function stringFromCharcode(charcode) {
        if (charcode > 0xFFFF) {
            charcode -= 0x10000;
            return String.fromCharCode(0xD800 + (charcode >> 10), 0xDC00 + (charcode & 0x3FF));
        } else {
            return String.fromCharCode(charcode);
        }
    }

    function noteSubmitEvent(noteDetail) {
        return {
            type:"noteSubmitted",
            noteDetail: noteDetail,
            nodesToHighlight: nodesToHighlight
        }
    }

    if (!isEditableElement($(document.activeElement))) {

        // the start offset indicates the offset from the beginning of the first text node,
        // if the range does not begin with a text node we have to walk the range until we find one.
        var reachedFirstTextNode = false;

        $.each(nodes, function(i, node){
            var highlightedNode;

            var isLastNode = i === (nodes.length-1);
            var isFirstNode = i === 0;

            if ((isFirstNode || !reachedFirstTextNode)){
                var endOffset;

                if (isLastNode) {
                    endOffset = highlightedRange.endOffset;
                } else {
                    endOffset = node.length;
                }

                highlightedNode =
                    new SelectedNode(node, highlightedRange.startOffset, endOffset, clientSideId, trackedDocument);

            }
            else if (isLastNode){
                highlightedNode = new SelectedNode(node, 0, highlightedRange.endOffset, clientSideId, trackedDocument);
            }
            else {
                highlightedNode = new SelectedNode(node, 0, node.length, clientSideId, trackedDocument);
            }

            if (highlightedNode.isBaseNode()) {
                reachedFirstTextNode = true;
                selectedNodes.push(highlightedNode);
            }
        });

        nodesToHighlight = selectedNodes.filter(function(node, i) {
            return node.canBeHighlighted();
        });

        if (nodesToHighlight.length > 0) {
            var finalHighlight = nodesToHighlight[nodesToHighlight.length - 1].getWtHighlight();

            var offsets = finalHighlight.offset();

            var topPosition  = offsets.top + finalHighlight.height() + spacing;
            var leftPosition = offsets.left;

            commentOverlay = HTML.commentOverlay(topPosition, leftPosition);

            $body.append(commentOverlay);

            commentOverlay.keydown(checkForNotePostKeypress);
            commentOverlay.keyup(checkForEmptyCommentOverlayOnKeypress);

            $(trackedDocument).keypress(modifyOverlayOnFirstKeypress);

            reHighlightNodes();
        }
    }
}

SelectedNode = function(node, start_offset, end_offset, clientSideId, trackedDocument) {

    var originalNodeClone = node.cloneNode(true);
    var newAppendedTextNode;
    var newPrependedTextNode;
    var canBeHighlighted = false;
    var highlighted = false;
    var wtHighlight;
    var parentNode = node.parentNode;
    var thisSelectedNode = this

    if (isTextNode(node)){
        var contents = node.nodeValue;
        var highlighted_contents = contents.slice(start_offset, end_offset);
        var whiteSpaceRegex = /^\s*$/;
        if(!highlighted_contents || whiteSpaceRegex.test(highlighted_contents)){
            console.log("nothing inside this node, not replacing");
        } else {
            var unhighlighted_prepend = contents.slice(0, start_offset);
            var unhighlighted_append = contents.slice(end_offset,contents.length);

            wtHighlight = trackedDocument.createElement("wtHighlight")
            $(wtHighlight).addClass("highlightMe current-highlight " + clientSideId);

            wtHighlight.innerHTML = highlighted_contents;
            var nodeToReplace = node;
            nodeToReplace.parentNode.replaceChild(wtHighlight, nodeToReplace);

            if (unhighlighted_prepend.length !== 0 ){
                newPrependedTextNode = $(trackedDocument.createTextNode(unhighlighted_prepend));
                newPrependedTextNode.insertBefore(wtHighlight);
            }
            if (unhighlighted_append.length !== 0){
                newAppendedTextNode = $(trackedDocument.createTextNode(unhighlighted_append));
                newAppendedTextNode.insertAfter(wtHighlight);
            }
            canBeHighlighted = true;
        }
    }

    function isTextNode(node) {
        return node.nodeType == 3;
    }

    this.isBaseNode  = function() {
        return thisSelectedNode.getNode().childNodes.length === 0
    };

    this.isTextNode = function() {
        return isTextNode(thisSelectedNode.getNode());
    }

    this.canBeHighlighted = function() {
        return canBeHighlighted;
    }

    this.highlight = function() {
        if(canBeHighlighted) {
            $(wtHighlight).css({background: "yellow"});
            highlighted = true
        }
    }

    this.unHighlight = function() {
        if(canBeHighlighted) {
            $(wtHighlight).css({background: "inherit"});
            highlighted = false
        }
    }

    this.revert = function() {
        if (canBeHighlighted) {
            if (newAppendedTextNode) {
                tryToReplaceNode(originalNodeClone, newAppendedTextNode[0]);

                if (newPrependedTextNode) {
                    tryToRemoveNode(newPrependedTextNode[0]);
                }

                tryToRemoveNode(wtHighlight);

            } else if (newPrependedTextNode) {
                tryToReplaceNode(originalNodeClone, newPrependedTextNode[0]);

                if (newAppendedTextNode) {
                    tryToRemoveNode(newAppendedTextNode[0]);
                }

                tryToRemoveNode(wtHighlight);
            } else {
                tryToReplaceNode(node, wtHighlight);
            }
        }
    }

    function tryToReplaceNode(nodeToInsert, nodeToReplace) {
        var parent = nodeToInsert[0].parentNode;
        parent && parent.replaceChild(nodeToInsert, nodeToReplace);
    }

    function tryToRemoveNode(nodeToRemove) {
        var parent = nodeToRemove[0].parentNode;
        parent && parent.removeChild(nodeToRemove);
    }

    this.getWtHighlight = function () {
        return $(wtHighlight);
    }

    this.getNode = function() {
        if (canBeHighlighted) {
            return wtHighlight.childNodes[0]
        } else {
            return node
        }
    }
}