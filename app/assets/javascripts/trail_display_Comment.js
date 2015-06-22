// this object does not deal directly with note objects, as it may be initalized before a note is fully saved.

Comment = function(displayDoc, note, spacing) {
    var commentOverlay;
    var overlayContainer;
    var commentOverlayShown = false;
    var elementsToHighlight;
    var spacing = spacing || 0;
    var $displayDoc = $(displayDoc);
    var $body = $(displayDoc.body);
    var finalHighlight;
    var thisComment = this;

    var C = {
        trashCanDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAQCAQAAABnqj2yAAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACDSURBVHjavI4xCsJQEETfBltlO8Nv9AqpPICl5/CwniJo8dFCCNo7Fn8DxnxbB4aBfczumvilRYlk9GwAOOdtMCHEwTrJ5fJOipmJJGhoyaUfmc0EXj01mIA0+yUbNGXJ/jg1BILLfeoPVNM/kQnYXYf1kiej/XZqA7H6ar94jKiq9wBVaTFDLLMAdgAAAABJRU5ErkJggg==",
        overylayContainer: {
            "z-index": "2147483643", // make sure this is lower then the height of the toolbar
            "position": "absolute",
            "display": "flex"
        },
        commentOverlay: {
            "font-size":"12px",
            "color": "#333",
            "padding": "5px",
            "background-color": "white",
            "border": "1px solid",
            "border-radius": "5px",
            "max-width": "200px",
            "word-wrap": "break-word",
            "display": "block"
        },
        deleteButton: {
            "height": "15px",
            "background": "white",
            "margin-left": "5px",
            "cursor": "pointer"
        }
    };

    H = {
        commentOverlay: function(startEditable) {
            var overlay = applyDefaultCSS($("<span></span>"))
                .css(C.commentOverlay)
            startEditable && overlay.attr("contentEditable", "true");
            return overlay
        },
        overlayContainer: function(top, left, overlay, deleteButton){
            return applyDefaultCSS($("<div></div>"))
                .css(C.overylayContainer)
                .css({"top": top + "px", "left": left + "px"})
                .addClass("commentOverlay")
                .addClass("webtrails")
                .append(overlay)
                .append(deleteButton)
                .hide()
        },
        deleteButton: $("<img></img>").attr("src", C.trashCanDataUrl).css(C.deleteButton)
    };

    this.remove = function() {
        overlayContainer && overlayContainer.remove();
        elementsToHighlight && elementsToHighlight.attr("style", "");
    };

    this.update = function() {
        commentOverlay && commentOverlay.html(note.comment);
    };

    this.sourceNote = function() {
        return note
    };

    this.scrollToComment = function(scrollOffset, onScrolled) {
        if(docIsLoaded(displayDoc)) {
            scrollToNoteWithoutCheck();
        } else {
            var scrollTop = note.scrollY - scrollOffset;
            var scrollLeft = note.scrollX;

            $displayDoc.scrollTop(scrollTop).scrollLeft(scrollLeft);

            runWhenLoaded(function() {
                scrollToNoteWithoutCheck();
            }, displayDoc);
        }

        function scrollToNoteWithoutCheck() {
            var offsets = getCommentOffsets();
            $displayDoc.scrollTop(offsets.top - scrollOffset).scrollLeft(offsets.left);
            onScrolled && onScrolled();
        }
    }

    function getCommentOffsets() {
        var commentOffsets = finalHighlight.offset();

        return {
            top: commentOffsets.top + finalHighlight.height() + spacing,
            left: commentOffsets.left
        }
    }

    function insertCommentOverlay() {
        runWhenLoaded(function() {
            var offsets = getCommentOffsets();

            commentOverlay = H.commentOverlay(true);

            var comment = (!note.comment || note.comment === "") ? "no comment" : note.comment

            commentOverlay.html(comment);

            var deleteButton = H.deleteButton;
            deleteButton.click(deleteNote);

            overlayContainer = H.overlayContainer(offsets.top, offsets.left, commentOverlay, deleteButton);

            $body.append(overlayContainer);

            elementsToHighlight.click(openOrCloseCommentOverlay);

            elementsToHighlight.css({cursor: "pointer"});

            var noteOffsets = $(elementsToHighlight[0]).offset();

            commentOverlay.keypress(checkForNoteUpdateKeyPress)
        }, displayDoc);
    }

    function runWhenLoaded(fn, doc) {
        var doc = doc || document;
        var loadedCheck = setInterval(function(){
            if (docIsLoaded(doc)){
                clearInterval(loadedCheck);
                fn(doc);
            }
        }, 50);
    };

    function docIsLoaded(doc) {
        return doc.readyState === "complete";
    }

    function highlight() {
        elementsToHighlight.css({"background": "yellow"});
    }

    function hideCommentOverlay() {
        commentOverlayShown = false;
        overlayContainer && overlayContainer.hide();
    }

    function showCommentOverlay() {
        commentOverlayShown = true;
        overlayContainer && overlayContainer.show();
    }

    function openOrCloseCommentOverlay() {
        commentOverlayShown ? hideCommentOverlay() : showCommentOverlay();
    }

    function checkForNoteUpdateKeyPress(e){
        console.log("checking for note post keypress");
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13 && !e.shiftKey){
            var newNoteContent = commentOverlay.html();
            commentOverlay.blur();
            Request.updateNoteComment(note, newNoteContent, function(){});
        } else if(code == 27){
            commentOverlay.blur();
        }
    }

    function deleteNote() {
        TrailPreview.deleteNote(note);
    }

    elementsToHighlight = $displayDoc.find("wtHighlight." + note.clientSideId);
    finalHighlight = $(elementsToHighlight[elementsToHighlight.length - 1]);

    if (false) {
        highlight();
        insertCommentOverlay();
    } else {
        var textFinder = new SiteTextFinder(displayDoc);
        var possibleMatchedNodes = textFinder.findString(note.content);

        if (possibleMatchedNodes) {
            // find the match which is closest to where we expect this note to be.
            var sortedMatches = possibleMatchedNodes.sort(function(nodeIndexAndSelectedNodes) {
                var nodeIndex = nodeIndexAndSelectedNodes[0];
                return Math.abs(nodeIndex - note.nodeIndex);
            });

            var nodesToHighlight = sortedMatches[0][1];

            elementsToHighlight = $(nodesToHighlight.map(function(node, i) {
                node.constructWtHighlight();
                return node.getWtHighlight()[0];
            }));

            finalHighlight = $(elementsToHighlight[elementsToHighlight.length - 1]);

            highlight();
            insertCommentOverlay();
        } else {
            console.log("could not find note on page!!")
        }
    }
}

