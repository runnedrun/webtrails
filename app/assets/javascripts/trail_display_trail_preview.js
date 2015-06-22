console.log("trail preview injected");

TPreview = function(){
    var currentTrail = false;
    var currentNote = false;
    var currentSiteFrame = false;
    var shown = false;
    var thisTrailPreview = this;
    var commentBoxToggled = false;
    var halfPageViewScale = .85;
    var commentManager = new CommentManager(thisTrailPreview);

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
        return getIDoc(currentSiteFrame)
    };
    this.getCurrentComment = function() {
        return currentComment;
    }
    this.enableHalfPageView = function() {
            halfPageFrame(currentSiteFrame);
//            disableSelectionInIframe(currentSiteFrame[0]);
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

    function getCurrentScrollPosition() {
        return {
            top: getIDoc(currentSiteFrame).scrollTop(),
            left: getIDoc(currentSiteFrame).scrollLeft()
        }
    }

    function addEmptyIframeToPreview(note, hideIframe) {
        var siteHtmlIframe = $("<iframe data-trail-id='" + note.site.trail.id + "' data-site-id='" + note.site.id +"' data-note-id=" + note.id + " seamless='seamless' class='wt-site-preview webtrails'>");
        console.log("iframe", siteHtmlIframe);
        siteHtmlIframe.attr('src',"about:blank");
        siteHtmlIframe.css({
            width:"100%",
            height: "100%",
            "z-index": "2147483645",
            "visibility":"hidden"
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
            "height": String($(window).height() * .94 * 2)+"px"
        });
    }

    this.initWithTrail = function(trailToPreview, startingSiteId, startingNoteId) {
        currentTrail = trailToPreview;
        if (trailToPreview.getFirstSite()) {
            var startingSite =
                (startingSiteId && trailToPreview.getSite(startingSiteId)) || trailToPreview.getFirstSite();
            var currentNote =
                (startingNoteId && startingSite.getNote(startingNoteId))
                    || startingSite.getFirstNote()
                    || new BaseRevisionNote(startingSite);

            this.displayNote(currentNote);
        } else if (currentSiteFrame){
            // for multitrail display, whenever I get around to making it
            currentSiteFrame.remove();
        }
    }

    this.switchToNoteRevision = function(note) {
//        currentSiteFrame && currentSiteFrame.remove();
        var oldFrame = currentSiteFrame;
        var siteHtmlIframe = addEmptyIframeToPreview(note);
        var iframeDocument = thisTrailPreview.setIframeContent(siteHtmlIframe, note.getSiteRevisionHtml() || "Uh oh");
        currentSiteFrame = siteHtmlIframe;
        new HighlightManager(iframeDocument, currentSiteFrame[0], note.site);
        return oldFrame
    }

    this.displayNote = function(note, overrideScroll) {
        var oldSiteFrame = thisTrailPreview.switchToNoteRevision(note);
        var $iDoc = thisTrailPreview.getCurrentIDoc();

        commentManager.showAllCommentsOnSite(note.site);

        currentNote = note;
        window.location.hash = note.site.id + "-" + note.id;

        var showDoc = function() {
            currentSiteFrame.css({"visibility": "visible"});
            oldSiteFrame && oldSiteFrame.remove();
        };

        // scroll to the comment, and display the doc.
        if (overrideScroll) {
            $iDoc.scrollTop(overrideScroll.top).scrollLeft(overrideScroll.left);
            showDoc();
        } else if (!note.isBase) {
            commentManager.scrollToComment(note, 300, showDoc);
        } else {
            showDoc();
        }

        Toolbar.update(currentNote)
    };

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

    this.showSite = function(site, overrideScroll) {
        thisTrailPreview.displayNote(new BaseRevisionNote(site), overrideScroll);
    }

    this.updateWithNewNote = function(newNote, noteRowForViewer) {
        this.noteViewer.addNote(newNote, noteRowForViewer);
        if (!currentNote || (parseInt(currentNote.site.id) <= parseInt(newNote.site.id))){
            currentNote = newNote;
            thisTrailPreview.displayNote(currentNote, getCurrentScrollPosition());
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
                thisTrailPreview.showSite(note.site, getCurrentScrollPosition());
                thisTrailPreview.noteViewer.removeNoteFromNoteList(noteToBeDeleted);
                noteToBeDeleted.delete();
                Toolbar.update(currentNote);
            })
        }
    };

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

CommentManager = function(trailPreview) {
    var comments = {};

    this.showAllCommentsOnSite = function(site) {
        comments[site.id] = {};

        var currentDoc = trailPreview.getCurrentIDoc()[0];

        $.each(site.getNotes(), function(i, note) {
            if (!note.isBase) {
                if (!comments[site.id][note.id]) {
                    var comment = new Comment(currentDoc, note, 0);
                    comments[site.id][note.id] = comment;
                }
            }
        });
    }

    this.scrollToComment = function(note, scrollOffset, onScrolled) {
        comments[note.site.id][note.id].scrollToComment(scrollOffset, onScrolled);
    }
}
