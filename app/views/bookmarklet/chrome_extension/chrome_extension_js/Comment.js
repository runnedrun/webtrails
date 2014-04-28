Comment = function(spacing, highlightedRange, trackedDocument) {
    var noteContent = String(highlightedRange);
    var highlightedNodes = [];
    var clientSideId = generateClientSideId();
    var nodes = highlightedRange.getNodes();
    var commentText;
    var $body = $(trackedDocument.body);
    var commentTextAreaContainer;
    var commentTextArea;
    var commentOverlay;
    var commentBoxesShown = false;

    var thisComment = this;

    this.highlight = function() {
        $.each(highlightedNodes, function(i, highlightedNode) {
            highlightedNode.highlight();
        })
    }

    this.remove = function() {
        revertNodes();
        closeCommentBoxes();
    }

    this.canBeHighlighted = function() {
        return highlightedNodes.length > 0
    }

    var CSS = {
        commentOverlay: {
            "font-size":"12px",
            "color": "#333",
            "z-index": "2147483647",
            "margin": "5px",
            "outline": "none",
            "padding": "5px",
            "background-color": "white",
            "position": "absolute",
            "display": "none",
            "border": "1px solid",
            "border-radius": "5px"
        },
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

    function saveNoteAndRefreshAWS(comment, noteOffsets, clientSideId){
        var newNote = {
            site_id: currentNote.site.id,
            content: noteContent,
            comment: comment,
            comment_location_x: leftPosition,
            comment_location_y: topPosition,
            client_side_id: clientSideId,
            scroll_x: noteOffsets.left,
            scroll_y: noteOffsets.top,
            site_revision_number: currentNote.site.getNextRevisionNumber()
        };
        var cleanHtml = cleanHtmlForSaving();
        Request.addNote(newNote, currentNote, cleanHtml, function(resp) {
            addNewNoteToClientSideStorage(resp, cleanHtml);
        })
    }

    function postNoteAndComment(e){
        console.log("posting note");
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13 && !e.shiftKey){
            commentText = commentOverlay.find("textarea").val();
            var noteOffsets = $siteDocument.find("wtHighlight.highlightMe").first().offset();
            commentTextAreaContainer.hide();
            saveNoteAndRefreshAWS(commentText, noteOffsets, clientSideId);
        } else if(code == 27){
            closeCommentBoxes();
        }
    }

    function mirrorCommentTextArea() {
        var content = commentTextArea.val();
        console.log("mirroring text", content);
        commentOverlay.html(content);
        console.log("content is", commentOverlay.html());
        if (!commentBoxesShown && content !== "") {
            showCommentBoxes();
        }
        if (content === "") {
            hideCommentBoxes();
        }
    }

    function modifyOverlayOnFirstKeypress(e) {
        console.log("picking up key[ress");
        var charstring = stringFromCharcode(e.charCode);
        var currentText = commentTextArea.val();
        var content = currentText + charstring
        commentTextArea.val(content);
        showCommentBoxes();
        $(trackedDocument).unbind("keypress", modifyOverlayOnFirstKeypress);
        commentTextArea.focus();
        // move cursor to the end of the text
        commentTextArea[0].selectionStart = commentTextArea[0].selectionEnd = commentTextArea[0].value.length;
        thisComment.highlight();
    }


    function generateClientSideId() {
        var d = new Date();
        var n = d.getTime();
        return "client-side-id-" + n;
    }

    function reHighlightNodes() {
        if (highlightedNodes.length > 0) {
            var newSelectionRange = rangy.createRange();
            var startingNode = highlightedNodes[0].getNode();
            var endingNode = highlightedNodes[highlightedNodes.length - 1].getNode();

            newSelectionRange.setStart(startingNode, 0);
            newSelectionRange.setEnd(endingNode, endingNode.length);
            rangy.getSelection().addRange(newSelectionRange);
        }
    }

    function revertNodes() {
        $.each(highlightedNodes, function(i, highlightedNode) {
            highlightedNode.revert();
        })
    }

    function hideCommentBoxes() {
        commentBoxesShown = false;
        commentTextArea.hide();
    }

    function showCommentBoxes() {
        commentBoxesShown = true;
        commentTextArea.show();
    }

    function closeCommentBoxes() {
        commentTextArea.remove();
    }

    function stringFromCharcode(charcode) {
        if (charcode > 0xFFFF) {
            charcode -= 0x10000;
            return String.fromCharCode(0xD800 + (charcode >> 10), 0xDC00 + (charcode & 0x3FF));
        } else {
            return String.fromCharCode(charcode);
        }
    }

    // the start offset indicates the offset from the beginning of the first text node,
    // if the range does not begin with a text node we have to walk the range until we find one.
    var reachedFirstTextNode = false;

    $.each(nodes, function(i,node){
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
                new HighlightedNode(node, highlightedRange.startOffset, endOffset, clientSideId, trackedDocument);
            reachedFirstTextNode = highlightedNode.canBeHighlighted();
        }
        else if (isLastNode){
            highlightedNode = new HighlightedNode(node, 0, highlightedRange.endOffset, clientSideId, trackedDocument);
        }
        else {
            highlightedNode = new HighlightedNode(node, 0, node.length, clientSideId, trackedDocument);
        }

        if (highlightedNode.canBeHighlighted()) {
            highlightedNodes.push(highlightedNode);
        }
    });

    if (highlightedNodes.length > 0) {
        var finalHighlight = highlightedNodes[highlightedNodes.length - 1].getWtHighlight();

        var offsets = finalHighlight.offset();

        var topPosition  = offsets.top + spacing;
        var leftPosition = offsets.left;

        commentTextArea = HTML.commentOverlay(topPosition, leftPosition);

        $body.append(commentTextArea);

        commentTextArea.keydown(postNoteAndComment);

        var currentlyFocusedTag = document.activeElement.tagName.toLowerCase();

        if (!(currentlyFocusedTag === "input" || currentlyFocusedTag === "textarea")) {
            $(trackedDocument).keydown(modifyOverlayOnFirstKeypress);
        }

        reHighlightNodes();
    }
}

HighlightedNode = function(node, start_offset, end_offset, clientSideId, trackedDocument) {

    var originalNodeClone = node.cloneNode(true);
    var originalNode;
    var newAppendedTextNode;
    var newPrependedTextNode;
    var canBeHighlighted = false;
    var highlighted = false;
    var wtHighlight;
    var parentNode = node.parentNode;

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
            originalNode = nodeToReplace.parentNode.replaceChild(wtHighlight, nodeToReplace);

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

    this.canBeHighlighted = function() {
        return canBeHighlighted;
    }

    this.highlight = function() {
        $(wtHighlight).css({background: "yellow"});
        highlighted = true
    }

    this.revert = function() {
        if (canBeHighlighted) {
            if (newAppendedTextNode) {
                $(originalNodeClone).insertBefore(newAppendedTextNode);
                parentNode.removeChild(newAppendedTextNode[0]);

                if (newPrependedTextNode) {
                    parentNode.removeChild(newPrependedTextNode[0]);
                }

                parentNode.removeChild(wtHighlight);

            } else if (newPrependedTextNode) {
                $(originalNodeClone).insertBefore(newPrependedTextNode);
                parentNode.removeChild(newPrependedTextNode[0]);

                if (newAppendedTextNode) {
                    parentNode.removeChild(newAppendedTextNode[0]);
                }

                parentNode.removeChild(wtHighlight);

            } else {
                parentNode.replaceChild(originalNodeClone, wtHighlight);
            }
        }
    }

    this.getWtHighlight = function () {
        return $(wtHighlight);
    }

    this.getNode = function() {
        return wtHighlight.childNodes[0]
    }
}