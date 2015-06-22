CommentCreator = function(spacing, highlightedRange, trackedDocument, currentSite) {
    var noteContent = String(highlightedRange);
    var selectedNodes = [];
    var nodesToHighlight = [];
    var originalStartIndex = highlightedRange.startOffset;
    var originalEndIndex = highlightedRange.endOffset;
    var clientSideId = generateClientSideId();
    var nodes = highlightedRange.getNodes();
    var commentText;
    var $trackedDocument = $(trackedDocument);
    var $body = $(trackedDocument.body);
    var commentOverlay;
    var commentOverlayWrapper;
    var commentOverlayShown = false;
    var top;
    var left;

    var thisComment = this;

    var CSS = {
        commentOverlay: {
            "font-size":"12px",
            "color": "#333",
            "word-wrap": "break-word",
            "padding": "2px"
        },
        commentOverlayWrapper: {
            position: "absolute",
            "background-color": "white",
            "display": "none",
            "z-index": "2147483647",
            "border": "1px solid",
            "border-radius": "5px",
            "max-width": "200px",
            "padding": "1px 1px 1px 1px"
        }
    };
    var HTML = {
        commentOverlay:
            applyDefaultCSS($("<span></span>"))
                .css(CSS.commentOverlay)
                .addClass("commentOverlay")
                .addClass("webtrails"),

        commentOverlayWrapper: function(top,left) {
            return applyDefaultCSS($("<span></span>"))
                .css(CSS.commentOverlayWrapper)
                .css({"top": top + "px", "left": left + "px"})
                .addClass("commentOverlayWrapper")
                .addClass("webtrails");
        }
    };

    function unbindAllWatchers() {
        $trackedDocument.unbind("mousedown", removeAndRevert);
        $trackedDocument.unbind("keypress", modifyOverlayOnFirstKeypress);
        $trackedDocument.unbind("keyup", checkForEmptyCommentOverlayOnKeypress);
        $trackedDocument.unbind("keydown", checkForNotePostKeypress);
    }

    function removeAndRevert() {
        revertNodes();
        removeCommentOverlay();
        unbindAllWatchers();
    }

    function hideOverlayAndRevert() {
        hideCommentOverlay();
        $trackedDocument.keypress(modifyOverlayOnFirstKeypress);
        commentOverlay.unbind("keypress", checkForEmptyCommentOverlayOnKeypress);
        commentOverlay.blur();
        reHighlightNodes();
    }

    function highlight() {
        $.each(nodesToHighlight, function(i, highlightedNode) {
            highlightedNode.highlight();
        })
    }

    function removeInsertedHtml($htmlClone) {
        $htmlClone.find('.webtrails').remove();
    }

    function cleanHtmlForSaving() {
        var htmlClone = $(trackedDocument.getElementsByTagName('html')[0]).clone();
        removeInsertedHtml(htmlClone); // edits in-place
        htmlClone.find("wtHighlight").css({"background": "none"});
        return htmlClone[0].outerHTML;
    }

    function saveNote(content, comment, noteOffsets, clientSideId){
        var nodeIndex = calculateNodeIndex(trackedDocument, nodesToHighlight[0].getNode());

        var newNote = {
            site_id: currentSite.id,
            content: content,
            comment: comment,
            comment_location_x: noteOffsets.left,
            comment_location_y: noteOffsets.top,
            client_side_id: clientSideId,
            scroll_x: noteOffsets.left,
            scroll_y: noteOffsets.top,
            site_revision_number: currentSite.getNextRevisionNumber(),
            node_index: nodeIndex
        };

        var cleanHtml = cleanHtmlForSaving();

        Request.addNote(newNote, currentSite, cleanHtml, function(resp) {
            addNewNoteToClientSideStorage(resp, cleanHtml);
        })
    }

    function addNewNoteToClientSideStorage(resp, cleanHtml){
        console.log("adding new note client side");
        currentSite.addRevision(resp.note_revision_number, cleanHtml);
        var newNote = currentSite.addNote(resp.note_update_hash);
        // TODO: just use the event here instead of the calling update with new note directly
        TrailPreview.updateWithNewNote(newNote, resp.new_note_row);
        $(document).trigger(noteSubmitEvent(newNote));
    }

    function checkForNotePostKeypress(e){
        console.log("checking for note post keypress");
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13 && !e.shiftKey){
            commentText = commentOverlay.html();
            var noteOffsets = selectedNodes[0].getWtHighlight().offset();
            removeCommentOverlay();
            unbindAllWatchers();
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

        console.log(content);

        if (!content || content === "") {
            hideOverlayAndRevert();
        }
    }

    function modifyOverlayOnFirstKeypress(e) {
        if (e.charCode) {
            highlight();
            showCommentOverlay();
            $(trackedDocument).unbind("keypress", modifyOverlayOnFirstKeypress);
            focus();
        }
    }

    function moveCursorToEndOfOverlay() {
        var range = document.createRange();
        range.selectNodeContents(commentOverlay[0]);
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function focus() {
        commentOverlay.attr("contentEditable", "true");
        commentOverlay.focus();
        moveCursorToEndOfOverlay();
    }

    function generateClientSideId() {
        var d = new Date();
        var n = d.getTime();
        return "client-side-id-" + n;
    }

    function calculateNodeIndex(trackedDoc, firstNode) {
        var node = $(trackedDoc).find("body")[0];
        var index = 0;

        function isTextNode(node) {
            return node.nodeType === 3;
        }

        // collect text and index-node pairs iteratively
        var iNode = 0,
            nNodes = node.childNodes.length,
            stack = [],
            child, nChildren,
            state;


        for (;;){
            while (iNode<nNodes){
                child = node.childNodes[iNode++];
                // text: collect and save index-node pair
                if (isTextNode(child)){
                    var nodeText = child.nodeValue;
                    if (nodeText !== "\n"){
                        index += nodeText.length;
                    }
                    if (firstNode === child) {
                        break
                    }
                }
                // element: collect text of child elements,
                // except from script or style tags
                else if (child.nodeType === 1){
                    // skip style/script tags
                    if (child.tagName.search(/^(script|style)$/i)>=0){
                        continue;
                    }
                    // add extra space for tags which fall naturally on word boundaries
                    if (child.tagName.search(/^(a|b|basefont|bdo|big|em|font|i|s|small|span|strike|strong|su[bp]|tt|u)$/i)<0){
                        index++;
                    }
                    // save parent's loop state
                    nChildren = child.childNodes.length;
                    if (nChildren){
                        stack.push({n:node, l:nNodes, i:iNode});
                        // initialize child's loop
                        node = child;
                        nNodes = nChildren;
                        iNode = 0;
                    }
                }
            }
            // restore parent's loop state
            if (!stack.length){
                break;
            }
            state = stack.pop();
            node = state.n;
            nNodes = state.l;
            iNode = state.i;
        }

        return index
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
        commentOverlayWrapper.hide();
    }

    function showCommentOverlay() {
        commentOverlayShown = true;
        commentOverlayWrapper.show();
    }

    function removeCommentOverlay() {
        commentOverlayWrapper && commentOverlayWrapper.remove();
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
                    new SelectedNode(node, highlightedRange.startOffset, endOffset, clientSideId, trackedDocument)
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
            return node.constructWtHighlight();
        });

        if (nodesToHighlight.length > 0) {
            var finalHighlight = nodesToHighlight[nodesToHighlight.length - 1].getWtHighlight();

            var offsets = finalHighlight.offset();

            top  = offsets.top + finalHighlight.height() + spacing;
            left = offsets.left;

            var commentOverlayWrapper = HTML.commentOverlayWrapper(top, left);
            commentOverlay = HTML.commentOverlay;

            commentOverlayWrapper.append(commentOverlay);

            $body.append(commentOverlayWrapper);

            commentOverlay.keydown(checkForNotePostKeypress);
            commentOverlay.keyup(checkForEmptyCommentOverlayOnKeypress);
            $(trackedDocument).keypress(modifyOverlayOnFirstKeypress);

            $(trackedDocument).mousedown(removeAndRevert);

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

    this.constructWtHighlight = function() {
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

                $(wtHighlight).text(highlighted_contents);
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
                return true
            }
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
        var parent = nodeToReplace.parentNode;
        parent && parent.replaceChild(nodeToInsert, nodeToReplace);
    }

    function tryToRemoveNode(nodeToRemove) {
        var parent = nodeToRemove.parentNode;
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