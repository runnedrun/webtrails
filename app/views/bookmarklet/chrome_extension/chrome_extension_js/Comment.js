// this object does not deal directly with note objects, as it may be initalized before a note is fully saved.

Comment = function(displayDoc, noteComment, clientSideId, spacing, noteId, onCommentDisplayed) {
    var commentOverlay;
    var overlayContainer;
    var commentOverlayShown = false;
    var elementsToHighlight;
    var noteId = noteId;
    var spacing = spacing || 0;
    var $displayDoc = $(displayDoc);
    var $body = $(displayDoc.body);
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
    }

    this.remove = function() {
        overlayContainer && overlayContainer.remove();
        $(document).unbind("downloadComplete", hideSavingSpinnerIfNecessary);
        $(document).unbind("downloadTimedOut", hideSavingSpinnerIfNecessary);
        $(document).unbind("noteIdReceived", setNoteIdIfNecessary);
        elementsToHighlight && elementsToHighlight.attr("style", "");
    }

    function runWhenLoaded(fn, doc) {
        var doc = doc || document;
        var loadedCheck = setInterval(function(){
            if (doc.readyState === "complete"){
                clearInterval(loadedCheck);
                fn(doc);
            }
        }, 50);
    };

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
            updateNoteText(newNoteContent, noteId, function(){ console.log("not submitted successfully") });
        } else if(code == 27){
            commentOverlay.blur();
        }
    }

    function deleteNote() {
        // we submit a fake note object here
        deleteNoteRequest({id: noteId}, function(){
            thisComment.remove();
        });
    }

    function hideSavingSpinnerIfNecessary(event) {
        console.log("checking if we should hide spinner");
        if (event.noteDetails.clientSideId === clientSideId) {
            console.log("hiding spinner");
        }
    }

    function setNoteIdIfNecessary(event) {
        if (event.noteDetails.clientSideId == clientSideId) {
            noteId = event.noteDetails.noteId;
            commentOverlay.attr("contentEditable", true);
            commentOverlay.keypress(checkForNoteUpdateKeyPress);
        }
    }

    elementsToHighlight = $displayDoc.find("wtHighlight." + clientSideId);
    var finalHighlight = $(elementsToHighlight[elementsToHighlight.length - 1]);

    if (finalHighlight.length > 0) {
        highlight();

        runWhenLoaded(function() {
            var commentOffsets = finalHighlight.offset();

            var topPosition  = commentOffsets.top + finalHighlight.height() + spacing;
            var leftPosition = commentOffsets.left;

            commentOverlay = H.commentOverlay(!!noteId);
            commentOverlay.html(noteComment);

            var deleteButton = H.deleteButton;
            deleteButton.click(deleteNote);

            overlayContainer = H.overlayContainer(topPosition, leftPosition, commentOverlay, deleteButton);

            $body.append(overlayContainer);

            elementsToHighlight.click(openOrCloseCommentOverlay);

            elementsToHighlight.css({cursor: "pointer"});

            var noteOffsets = $(elementsToHighlight[0]).offset();

            onCommentDisplayed && onCommentDisplayed(noteOffsets.top, noteOffsets.left);
        }, displayDoc);
    }

    $(document).on("downloadComplete", hideSavingSpinnerIfNecessary);
    $(document).on("downloadTimedOut", hideSavingSpinnerIfNecessary);
    $(document).on("noteIdReceived", setNoteIdIfNecessary);
}

