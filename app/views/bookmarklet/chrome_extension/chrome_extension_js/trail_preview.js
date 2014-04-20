console.log("trail preview injected");

function TPreview(
    previewContainer, height, nextNoteButton, previousNoteButton, showCommentButton, deleteNoteButton,
    commentBox, iframeKeypressHandler, iframeKeyupHandler, iframeClickHandler, parentToolbar
    ) {
    var currentTrail = false;
    var currentNote = false;
    var currentSiteFrame = false;
    var shown = false;
    var thisTrailPreview = this;
    var commentBoxToggled = false
    height = 200;

    var initialized = false;

    function initialize() {
        showCommentButton.click(toggleOrUntoggleCommentBox);
        nextNoteButton.click(thisTrailPreview.showNextNote);
        previousNoteButton.click(thisTrailPreview.showPreviousNote);
        deleteNoteButton.click(deleteCurrentNote);
        initialized = true;
    }

    function getSiteIDoc(site) {
       return thisTrailPreview.getIDoc(previewContainer.find("[data-site-id='" + site.id + "']"));
    }

    function addEmptyIframeToPreview(site) {
        var siteHtmlIframe = $("<iframe data-trail-id='" + site.trail.id + "' data-site-id='"+site.id+"' seamless='seamless' class='wt-site-preview webtrails'>");
        siteHtmlIframe.attr('src',"about:blank");
        siteHtmlIframe.css({
            display: shown ? "block" :"none",
            width:"100%",
            "border-top": "2px gray solid",
            height: height + "px",
            "border-bottom": "2px solid grey"
        });
        previewContainer.html(siteHtmlIframe);
        return siteHtmlIframe
    }

    this.getCurrentNote = function() {
        return currentNote
    }

    this.initWithTrail = function(trailToPreview) {
        console.log("initing with trail");
        currentTrail = trailToPreview;
        currentNote = currentTrail.getLastNote();
        if (currentNote && initialized) {
            this.displayNote(currentNote);
        } else {
            if (!currentTrail.getFirstSite()) {
                parentToolbar.showNoSitesInTrailHelp();
            } else {
                parentToolbar.showNoNotesInTrailHelp();
            }
        }
        thisTrailPreview.enableOrDisablePrevAndNextButtons(currentNote);
    }

    this.show = function() {
        shown = true;
        if (!initialized) {
            initialize();
            if (currentNote) {
                this.displayNote(currentNote);
            }
        }

        if (currentSiteFrame){
            currentSiteFrame.show();
        }
    };

    this.hide = function() {
        shown = false;
        if (currentSiteFrame){
            currentSiteFrame.hide();
        }
    };

    this.switchToNoteRevision = function(note, hidePreview) {
        currentSiteFrame && currentSiteFrame.remove();
        var siteHtmlIframe = addEmptyIframeToPreview(note.site);
        var deferredIDoc = note.getSiteRevisionHtml().then(function(html) {
            var iframeDocument = $(thisTrailPreview.setIframeContent(siteHtmlIframe, html || "Uh oh"));
            iframeDocument.keydown(iframeKeypressHandler);
            iframeDocument.keyup(iframeKeyupHandler);
            iframeDocument.click(iframeClickHandler);
            currentSiteFrame = siteHtmlIframe;
            return iframeDocument
        });

        return deferredIDoc;
    }

    this.displayNote = function(note, hidePreview) {
        currentNote = note;
        if (note.id == -1) { return }; // if it's a special display note
        var deferredIdoc = thisTrailPreview.switchToNoteRevision(note, hidePreview);

        $(document).trigger({type:"noteDisplayed", note: note});

        deferredIdoc.done(function($iDoc) {
            var body = $iDoc.find("body");
            body.scrollTop(note.scrollY-100).scrollLeft(note.scrollX);
            if (commentBoxToggled) {
                displayComment();
            }
            thisTrailPreview.runWhenLoaded(function() {
                if (currentNote == note) {
                    var noteElements = thisTrailPreview.highlightSingleNote(note);
                    var noteLocation = noteElements.first().offset();
                    if (noteLocation) {
                        var scrollTop = noteLocation.top-100;
                        var scrollLeft = noteLocation.left;
                        if ((Math.abs(noteLocation.top - note.scrollY) > 10) || (Math.abs(noteLocation.left - note.scrollX) > 10)){
                            console.log("correcting scroll", noteLocation.top, note.scrollY);
                            console.log(noteLocation.left, note.scrollX);
                            body.scrollTop(scrollTop).scrollLeft(scrollLeft);
                        }
                    }
                }
            },$iDoc[0]);
        })
    }

    this.highlightSingleNote = function(note) {
        return thisTrailPreview.highlightElements(thisTrailPreview.getNoteElements(note));
    };

    this.getNoteElements = function(note) {
        var siteIDoc = getSiteIDoc(note.site);
        return $("."+ site.clientSideId", siteIDoc)
    }

    this.showNextNote = function() {
        var nextNote = currentNote.nextNote();
        if (nextNote) {
            thisTrailPreview.displayNote(nextNote);
            thisTrailPreview.enableOrDisablePrevAndNextButtons(currentNote);
            return true
        } else {
            return false
        }
    }

    this.showPreviousNote = function() {
        var previousNote = currentNote.previousNote();
        if (previousNote) {
            thisTrailPreview.displayNote(previousNote);
            thisTrailPreview.enableOrDisablePrevAndNextButtons(currentNote);
            return true
        } else {
            return false
        }
    }

    this.enableOrDisablePrevAndNextButtons = function(currentNote) {
        if(currentNote && currentNote.nextNote()) {
            nextNoteButton.enable();
        } else {
            nextNoteButton.disable();
        }
        if(currentNote && currentNote.previousNote()) {
            console.log("enabling previous note");
            previousNoteButton.enable();
        } else {
            previousNoteButton.disable();
        }
    }

    this.highlightElements = function($elements) {
        return $elements.css({
            "background": "yellow"
        })
    }

    this.clear = function() {
        currentNote = false;
        if (currentSiteFrame) {
            currentSiteFrame.remove();
        }
    }

    function displayComment() {
        commentBox.show();
        commentBox.find(".comment-text").html(currentNote.comment || "no comment");
    }

    function removeComment() {
        commentBox.hide();
    }

    function toggleCommentBox() {
        displayComment();
        commentBoxToggled = true;
        showCommentButton.addClass("active");
    }

    function unToggleCommentBox() {
        removeComment();
        commentBoxToggled = false;
        showCommentButton.removeClass("active");
    }

    function toggleOrUntoggleCommentBox() {
        commentBoxToggled ? unToggleCommentBox() : toggleCommentBox();
    }

    function deleteCurrentNote(){
        var noteToBeDeleted = currentNote;
        deleteNote(noteToBeDeleted, function() {
            if (!thisTrailPreview.showPreviousNote()){
                if (!thisTrailPreview.showNextNote()){
                    parentToolbar.showNoNotesInTrailHelp();
                }
            };
            if (noteToBeDeleted.site.isCurrentSite()) {
                Trails.decrementNoteCount();
            }
            noteToBeDeleted.delete();
            thisTrailPreview.enableOrDisablePrevAndNextButtons(currentNote);
        })
    }

    function updateWithNewNote(newNoteEvent) {
        if (!currentNote || (parseInt(currentNote.site.id) <= parseInt(newNoteEvent.note.site.id))){
            currentNote = newNoteEvent.note;
            if (initialized) {
                thisTrailPreview.displayNote(currentNote);
            }
        }
        thisTrailPreview.enableOrDisablePrevAndNextButtons(currentNote);
    }
    $(document).on("newNote", updateWithNewNote);

    nextNoteButton.disable = previousNoteButton.disable = function() {
        this.prop('disabled', true);
        this.css({
            color: "grey"
        })
        this.enabled = false;
    }

    nextNoteButton.enable = previousNoteButton.enable = function() {
        this.prop('disabled', false);
        this.css({
            color: "black"
        })
        this.enabled = true;
    }
}
TPreview.prototype = IframeManager

// A note like class which returns to a note when prev is hit, for when there is no note.
NoNoteNote = function(site, noteToReturnTo){
    this.site = site;
    this.nextNote = function() {
        return false
    };
    this.previousNote = function() {
        return noteToReturnTo;
    };
    this.getSiteRevisionHtml = function() {
        return "no notes for this site";
    };
    this.getPositionInSite = function() {
        return 0;
    }

    this.id = "-1";
}