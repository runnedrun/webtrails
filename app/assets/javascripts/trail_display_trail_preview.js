console.log("trail preview injected");

TPreview = function(){
    var currentTrail = false;
    var currentNote = false;
    var currentSiteFrame = false;
    var shown = false;
    var thisTrailPreview = this;
    var commentBoxToggled = false;
    var halfPageViewScale = .6
    var currentComment;

    this.height = 200;
    var halfPageViewToggled = false;

    this.noteViewer = new NoteViewer(this, halfPageViewScale);
    this.getCurrentNote = function() { return currentNote }
    this.hide = function() {
        currentSiteFrame && currentSiteFrame.hide();
    };
    this.show = function() {
        currentSiteFrame && currentSiteFrame.show();
    };
    this.getCurrentIframe = function() {
        return currentSiteFrame;
    };
    this.getCurrentIDoc = function() {
        return getNoteIDoc(currentNote);
    };
    this.getCurrentComment = function() {
        return currentComment;
    }
    this.enableHalfPageView = function() {
            halfPageFrame(currentSiteFrame);
            disableSelectionInIframe(currentSiteFrame[0]);
            halfPageViewToggled = true;
    };
    this.disableHalfPageView = function() {
        fullPageFrame(currentSiteFrame);
        enableSelectionInIframe(currentSiteFrame[0]);
        halfPageViewToggled = false;
    };

    this.setIframeContent = function($iframe,html) {
        var iDoc = getIDoc($iframe)[0];
        iDoc.open();
        iDoc.writeln(html);
        iDoc.close();
        var headTag  = iDoc.getElementsByTagName("head")[0];
        headTag.className = headTag.className + " wt-element";
        return $iframe[0].contentWindow.document;
    }

    function addEmptyIframeToPreview(note, hideIframe) {
        var siteHtmlIframe = $("<iframe data-trail-id='" + note.site.trail.id + "' data-site-id='" + note.site.id +"' data-note-id=" + note.id + " seamless='seamless' class='wt-site-preview webtrails'>");
        console.log("iframe", siteHtmlIframe);
        siteHtmlIframe.attr('src',"about:blank");
        siteHtmlIframe.css({
            width:"100%",
            height: "100%",
            "z-index": "2147483645"
        });

        $(document.body).find(".siteDisplayDiv").append(halfPageViewToggled ? halfPageFrame(siteHtmlIframe) : siteHtmlIframe);
        if (halfPageViewToggled) {
//            halfPageFrame(siteHtmlIframe);
            disableSelectionInIframe(siteHtmlIframe[0]);
        }
        return siteHtmlIframe
    }

     function halfPageFrame(iframe) {
        return scaleIframe(iframe, halfPageViewScale);
    }

    function fullPageFrame(iframe) {
        return scaleIframe(iframe, 1)
        .css({
            height:"100%",
            width:"100%"
        });
    }

    function disableSelectionInIframe(iframe){
        $(iframe.contentWindow.document.body).mousedown(preventClick);
    }

    function enableSelectionInIframe(iframe){
        $(iframe.contentWindow.document.body).unbind("mousedown", preventClick);
        $(iframe.contentWindow.document.body).css({
            "-webkit-touch-callout": "all",
            "-webkit-user-select": "all",
            "-khtml-user-select": "all",
            "-moz-user-select": "all",
            "-ms-user-select": "all",
            "user-select": "all"
        })
    }

    function scaleIframe($iframe, iframeScale){
        return $iframe.css({
            "-moz-transform": "scale(" + iframeScale + ", " + iframeScale + ")",
            "-webkit-transform": "scale(" + iframeScale + ", " + iframeScale + ")",
            "-o-transform": "scale(" + iframeScale + ", " + iframeScale + ")",
            "-ms-transform": "scale(" + iframeScale + ", " + iframeScale + ")",
            "transform": "scale(" + iframeScale + ", " + iframeScale + ")",
            "-moz-transform-origin": "top left",
            "-webkit-transform-origin": "top left",
            "-o-transform-origin": "top left",
            "-ms-transform-origin": "top left",
            "transform-origin": "top left",
            "height": String($(window).height() *.93*2)+"px",
            //        "width": String($(window).width())+"px"
        });
    }

    this.initWithTrail = function(trailToPreview) {
        currentTrail = trailToPreview;
        if (trailToPreview.getFirstSite()) {
            currentNote = new BaseRevisionNote(trailToPreview.getFirstSite());
            this.displayNote(currentNote);
        } else if (currentSiteFrame){
            // for multitrail display, whenever I get around to making it
            currentSiteFrame.remove();
        }
    }

    this.switchToNoteRevision = function(note) {
        currentSiteFrame && currentSiteFrame.remove();
        var siteHtmlIframe = addEmptyIframeToPreview(note);
        var iframeDocument = thisTrailPreview.setIframeContent(siteHtmlIframe, note.getSiteRevisionHtml() || "Uh oh");
        currentSiteFrame = siteHtmlIframe;
        new SaveButtonCreator(note, iframeDocument, currentSiteFrame[0]);
        return $(iframeDocument);
    }

    this.displayNote = function(note) {
        var $iDoc = thisTrailPreview.switchToNoteRevision(note);
        currentNote = note;
        thisTrailPreview.noteViewer.highlightNoteInList(note);
        if (!note.isBase) {
            $iDoc.scrollTop(note.scrollY-300).scrollLeft(note.scrollX);
            currentComment = displayComment(note.scrollY, note.scrollX);
            runWhenLoaded(function() {
                var noteElements = thisTrailPreview.highlightNote(note);
                var noteLocation = noteElements.first().offset();
                var scrollTop = noteLocation.top-300;
                var scrollLeft = noteLocation.left;
                if ((Math.abs(noteLocation.top - note.scrollY) > 50) || (Math.abs(noteLocation.left - note.scrollX) > 50)){
                    console.log("correcting scroll", noteLocation.top, note.scrollY);
                    console.log(noteLocation.left, note.scrollX);
                    $iDoc.scrollTop(scrollTop).scrollLeft(scrollLeft);
                    currentComment.remove();
                    currentComment = displayComment(noteLocation.top, noteLocation.left);
                }
            },$iDoc[0]);
        }
        Toolbar.update(currentNote)
    };

    this.highlightNote = function(note) {
        return thisTrailPreview.highlightElements(thisTrailPreview.getNoteElements(note));
    };

    this.getNoteElements = function(note) {
        var siteIDoc = getNoteIDoc(note);
        return $("wtHighlight[data-trail-id="+Trails.getCurrentTrailId()+"].current-highlight", siteIDoc)
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
            var baseRevisionNote = new BaseRevisionNote(currentNote.site);
            thisTrailPreview.displayNote(baseRevisionNote);
        }
    }

    this.showNextSite = function() {
        var nextSite = currentNote.site.nextSite();
        if (nextSite) {
            thisTrailPreview.showSite(nextSite);
            return true
        } else {
            return false
        }
    }

    this.showPreviousSite = function() {
        var previousSite = currentNote.site.previousSite();
        if (previousSite) {
            thisTrailPreview.showSite(previousSite);
            return true
        } else {
            return false
        }
    }

    this.showSite = function(site) {
        thisTrailPreview.displayNote(new BaseRevisionNote(site))
    }

    this.highlightElements = function($elements) {
        return $elements.css({
            "background": "yellow"
        })
    }

    this.unHighlightElements = function($elements) {
        return $elements.css({
            "background": "none"
        })
    }

    this.updateWithNewNote = function(newNote, noteRowForViewer) {
        this.noteViewer.addNote(newNote, noteRowForViewer);
        if (!currentNote || (parseInt(currentNote.site.id) <= parseInt(newNote.site.id))){
            currentNote = newNote;
            thisTrailPreview.displayNote(currentNote);
        } else {
            Toolbar.update(currentNote);
        }
    }

    this.toggleOrUntoggleCommentBox = function() {
        commentBoxToggled ? unToggleCommentBox() : toggleCommentBox();
    }

    this.deleteCurrentSite = function() {
        if (canEdit() && currentNote) {
            var currentSite = currentNote.site;
            Request.deleteSite(currentSite, function() {
                if (currentSite.previousSite()) {
                    thisTrailPreview.showPreviousSite();
                } else if(currentSite.nextSite()) {
                    thisTrailPreview.showNextSite();
                } else {
                    currentSiteFrame.remove();
                    currentNote = false;
                    Toolbar.update(currentNote);
                }
                currentSite.delete();
                Toolbar.removeFavicon(currentSite);
                thisTrailPreview.noteViewer.removeSiteFromNoteList(currentSite);
            });
        }
    };

    this.deleteNote = function(note) {
        if (canEdit()) {
            var noteToBeDeleted = note;
            Request.deleteNote(noteToBeDeleted, function() {
                thisTrailPreview.showSite(note.site);
                thisTrailPreview.noteViewer.removeNoteFromNoteList(noteToBeDeleted);
                noteToBeDeleted.delete();
                Toolbar.update(currentNote);
            })
        }
    };

    function displayComment(scrollY, scrollX) {
        return new Comment(currentNote, scrollY, scrollX, thisTrailPreview, getNoteIDoc(currentNote))
    }

    function getNoteIDoc(note) {
        return getIDoc($(".wt-site-preview[data-note-id='" + note.id + "']"));
    }

    function getIWindow($iframe) {
        return $($iframe[0].contentWindow);
    }

    function preventClick(e){
        var $target = $(e.target);
        // check if the clicked thing is the comment box, we need that clickable for editing
        if (!($target.is(".comment-text") || $target.parents(".comment-text").length)){
            console.log("default prevented")
            return false
        } else{
            console.log("clicked comment box, allowing");
            return true
        }
    }

}

// the note like class which is used for displaying base revisiosn
BaseRevisionNote = function(site){
    this.site = site;
    this.nextNote = function() {
        return site.nextNoteFromBase();
    };
    this.previousNote = function() {
        return site.previousNoteFromBase() || "base";
    };
    this.getSiteRevisionHtml = function() {
        return site.getBaseRevisionHtml();
    };
    this.getPositionInSite = function() {
        return 0;
    }

    this.id = "base";
    this.isBase = true;
}
