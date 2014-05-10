console.log("trail preview injected");

function TPreview(
    previewContainer, height, nextNoteButton, previousNoteButton, deleteNoteButton, iframeClickHandler, parentToolbar
) {
    var currentTrail = false;
    var currentNote = false;
    var currentSiteFrame = false;
    var thisTrailPreview = this;

    var initialized = false;

    this.initializeView = function() {
        nextNoteButton.click(thisTrailPreview.showNextNote);
        previousNoteButton.click(thisTrailPreview.showPreviousNote);
        deleteNoteButton.click(deleteCurrentNote);
        initialized = true;

        if (currentNote) {
            thisTrailPreview.displayNote(currentNote);
        }
    }

    this.viewInitialized = function() { return initialized };

    function getSiteIDoc(site) {
       return thisTrailPreview.getIDoc(previewContainer.find("[data-site-id='" + site.id + "']"));
    }

    function addEmptyIframeToPreview(site) {
        var siteHtmlIframe = $("<iframe data-trail-id='" + site.trail.id + "' data-site-id='"+site.id+"' seamless='seamless' class='wt-site-preview webtrails'>");
        siteHtmlIframe.attr('src',"about:blank");
        siteHtmlIframe.css({
            display: "block",
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
        } else if(!currentNote) {
            if (!currentTrail.getFirstSite()) {
                parentToolbar.showNoSitesInTrailHelp();
            } else {
                parentToolbar.showNoNotesInTrailHelp();
            }
        }
    };

    this.switchToNoteRevision = function(note, hidePreview) {
        currentSiteFrame && currentSiteFrame.remove();
        var siteHtmlIframe = addEmptyIframeToPreview(note.site);
        var deferredIDoc = note.getSiteRevisionHtml().then(function(html) {
            var iframeDocument = $(thisTrailPreview.setIframeContent(siteHtmlIframe, html || "Uh oh"));
            iframeDocument.click(iframeClickHandler);
            currentSiteFrame = siteHtmlIframe;
            return iframeDocument
        });

        return deferredIDoc;
    }

    this.displayNote = function(note, hidePreview) {
        currentNote = note;

        $(document).trigger({type:"noteDisplayed", note: note});

        if (!note) return; // if there is no note to display, quit now

        var deferredIdoc = thisTrailPreview.switchToNoteRevision(note, hidePreview);

        if (note.baseNote) return;

        deferredIdoc.done(function($iDoc) {
            var body = $iDoc.find("body");
            body.scrollTop(note.scrollY-50).scrollLeft(note.scrollX);
            thisTrailPreview.runWhenLoaded(function() {
                if (currentNote == note) {
                    var noteElements = thisTrailPreview.highlightSingleNote(note);
                    var noteLocation = noteElements.first().offset();
                    if (noteLocation) {
                        var scrollTop = noteLocation.top -50;
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
        return $("." + note.clientSideId, siteIDoc)
    }

    this.showNextNote = function() {
        var nextNote = currentNote.nextNote();
        if (nextNote) {
            thisTrailPreview.displayNote(nextNote);
            return true
        } else {
            return false
        }
    }

    this.showPreviousNote = function() {
        var previousNote = currentNote.previousNote();
        if (previousNote) {
            thisTrailPreview.displayNote(previousNote);
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
        document.trigger({type: "trailPreviewCleared"});
    };

    function updateWithDeletedSite(siteDeletedEvent) {
        var site = siteDeletedEvent.site;

        var nextSite = site.nextSite();
        var prevSite = site.previousSite();

        if (prevSite && prevSite.getLastNote()) {
            thisTrailPreview.displayNote(prevSite.getLastNote());
        } else if (nextSite && nextSite.getFirstNote()) {
            thisTrailPreview.displayNote(nextSite.getFirstNote());
        } else if (prevSite || nextSite) {
            parentToolbar.showNoNotesInTrailHelp()
        } else {
            parentToolbar.showNoSitesInTrailHelp();
        }
    }
    $(document).on("siteDeleted", updateWithDeletedSite);

    function updateWithDeletedNote(noteDeletedEvent) {
        var note = noteDeletedEvent.note;
        var previousNote = note.previousNote();
        var nextNote = note.nextNote();
        if (note === currentNote) {
            if (!note.isBase) {
                // if there are more notes on this site, show them, otherwise
                // just show the base revision for the site.
                if (previousNote.site === note.site) {
                    thisTrailPreview.displayNote(previousNote);
                } else if (nextNote.site === note.site) {
                    thisTrailPreview.displayNote(nextNote);
                } else {
                    thisTrailPreview.displayNote(new BaseRevisionNote(note.site));
                }
            } else {
                if (!note.showPreviousNote()){
                    if (!note.showNextNote()){
                        parentToolbar.showNoNotesInTrailHelp();
                    }
                }
            }
        }
    }
    $(document).on("noteDeleted", updateWithDeletedNote);

    function deleteCurrentNote(){
        var noteToBeDeleted = currentNote;
        deleteNote(noteToBeDeleted, function() {
            noteToBeDeleted.delete();
        })
    }

    function updateWithNewNote(newNoteEvent) {
        if (!currentNote || ((parseInt(currentNote.site.id) <= parseInt(newNoteEvent.note.site.id)))){
            currentNote = newNoteEvent.note;
            if (initialized) {
                thisTrailPreview.displayNote(currentNote);
            }
        }
    }
    $(document).on("newNote", updateWithNewNote);
}
TPreview.prototype = IframeManager