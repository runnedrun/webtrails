console.log("trail preview injected");

TPreview = function(){
    var currentTrail = false;
    var currentNote = false;
    var currentSiteFrame = false;
    var shown = false;
    var thisTrailPreview = this;
    var commentBoxToggled = false
    this.height = 200;

    var nextNoteButton = wt_$(".nextNoteButton");
    var previousNoteButton = wt_$(".previousNoteButton");
    var showCommentButton = wt_$(".showCommentButton");
    var deleteNoteButton = wt_$(".deleteNoteButton");

    function getIDoc($iframe) {
        return wt_$($iframe[0].contentWindow.document);
    }

    function getSiteIDoc(site) {
       return getIDoc(wt_$("[data-site-id='" + site.id + "']"));
    }

    function getIWindow($iframe) {
        return wt_$($iframe[0].contentWindow);
    }

    this.setIframeContent = function($iframe,html) {
        var iDoc = getIDoc($iframe)[0];
        iDoc.open();
        iDoc.writeln(html);
        iDoc.close();
        var headTag  = iDoc.getElementsByTagName("head")[0];
        headTag.className = headTag.className + " wt-site-preview";
        return $iframe[0].contentWindow.document;
    }

    function addEmptyIframeToPreview(site, hideIframe) {
        var siteHtmlIframe = wt_$("<iframe data-trail-id='" + site.trail.id + "' data-site-id='"+site.id+"' seamless='seamless' class='wt-site-preview webtrails'>");
        console.log("iframe", siteHtmlIframe);
        siteHtmlIframe.attr('src',"about:blank");
        siteHtmlIframe.css({
            visibility: hideIframe ? "hidden" :"visible",
            width:"100%",
            "border-top": "2px gray solid",
            position: "fixed",
            height: thisTrailPreview.height + "px",
            top: "25px",
            "border-bottom": "2px solid grey",
            "z-index": "2147483645"
        });
        trailDisplay.after(siteHtmlIframe);
        return siteHtmlIframe
    }

    this.initWithTrail = function(trailToPreview) {
        currentTrail = trailToPreview
        currentNote = currentTrail.getLastNote();
        console.log("current note in init with trail", currentNote);
        if (currentNote) {
            console.log("going to display note");
            this.displayNote(currentNote, !toolbarShown);
        } else if (currentSiteFrame){
            currentSiteFrame.remove();
        }
    }

    this.show = function() {
        if (currentSiteFrame){
            var pageOffset = thisTrailPreview.height + 25
            currentSiteFrame.css({visibility: "visible"});
            wt_$(document.body).css({
                top: pageOffset + "px",
                position: "relative"
            });
            wt_$(document.body).scrollTop(wt_$(document.body).scrollTop() + pageOffset);
            shown = true
        }
    }

    this.hide = function() {
        if (currentSiteFrame){
            var pageOffset = thisTrailPreview.height + 25
            currentSiteFrame.css({visibility: "hidden"});
            shown = false;
            wt_$(document.body).css({
                top:"0px"
            });
            wt_$(document.body).scrollTop(wt_$(document.body).scrollTop() - pageOffset);
        }
    }

    this.switchToNoteRevision = function(note, hidePreview) {
        currentSiteFrame && currentSiteFrame.remove();
        var siteHtmlIframe = addEmptyIframeToPreview(note.site, hidePreview);
        var iframeDocument = thisTrailPreview.setIframeContent(siteHtmlIframe, note.getSiteRevisionHtml() || "Uh oh");
        currentSiteFrame = siteHtmlIframe;
        return wt_$(iframeDocument);
    }

    this.displayNote = function(note, hidePreview) {
        var $iDoc = thisTrailPreview.switchToNoteRevision(note, hidePreview);
        $iDoc.scrollTop(note.scrollY-100).scrollLeft(note.scrollX);
        currentNote = note;
        if (commentBoxToggled) {
            displayComment();
        }
        runWhenLoaded(function() {
            var noteElements = thisTrailPreview.highlightNote(note);
            var noteLocation = noteElements.first().offset();
            var scrollTop = noteLocation.top-100;
            var scrollLeft = noteLocation.left;
            if ((Math.abs(noteLocation.top - note.scrollY) > 10) || (Math.abs(noteLocation.left - note.scrollX) > 10)){
                console.log("correcting scroll", noteLocation.top, note.scrollY);
                console.log(noteLocation.left, note.scrollX);
                $iDoc.scrollTop(scrollTop).scrollLeft(scrollLeft);
            }
        },$iDoc[0]);
    }

    this.highlightNote = function(note) {
        var siteIDoc = getSiteIDoc(note.site);
        var noteElements = wt_$("wtHighlight[data-trail-id="+Trails.getCurrentTrailId()+"]", siteIDoc);
        thisTrailPreview.highlightElements(noteElements);
        return noteElements
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
        $elements.css({
            "background": "yellow"
        })
    }

    function displayComment() {
        removeComment()
        var commentBox = wt_$("<div></div>")
        applyDefaultCSS(commentBox).css({
            position: "fixed",
            height: thisTrailPreview.height,
            top: "25px",
            right: "0px",
            width: "150px",
            background: "#F0F0F0",
            "z-index": "2147483647",
            "font-size": "12px",
            "padding": "0 5px 0 5px"
        }).addClass("wt-note-comment");
        var commentHeader = wt_$("<div>Comment:</div>")
        applyDefaultCSS(commentHeader).css({
            "border-bottom": "2px black solid",
            "font-size": "14px",
            "width": "100%",
            "display": "block",
            "margin-bottom": "5px",
            "margin-top": "5px"
        });
        commentBox.append(commentHeader).append("<div>"+ (currentNote.comment || "no comment") + "</div>");
        wt_$(document.body).append(commentBox);
    }

    function removeComment() {
        wt_$(".wt-note-comment").remove();
    }

    function toggleCommentBox() {
        displayComment();
        commentBoxToggled = true;
        showCommentButton.css({
            "background": "grey"
        });
    }

    function unToggleCommentBox() {
        removeComment();
        commentBoxToggled = false;
        showCommentButton.css({
            "background": "none"
        });
    }

    function toggleOrUntoggleCommentBox() {
        commentBoxToggled ? unToggleCommentBox() : toggleCommentBox();
    }

    function deleteCurrentNote(){
        var noteToBeDeleted = currentNote;
        deleteNote(noteToBeDeleted, function() {
            if (!thisTrailPreview.showPreviousNote()){
                if (!thisTrailPreview.showNextNote()){
                    thisTrailPreview.hide();
                }
            };
            if (noteToBeDeleted.site.isCurrentSite()) {
                Trails.decrementNoteCount();
            }
            noteToBeDeleted.delete();
            thisTrailPreview.enableOrDisablePrevAndNextButtons(currentNote);
        })
    }

    this.updateWithNewNote = function(newNote) {
        if (!currentNote || (parseInt(currentNote.site.id) <= parseInt(newNote.site.id))){
            currentNote = newNote;
            this.displayNote(currentNote, !toolbarShown);
        }
        this.enableOrDisablePrevAndNextButtons();
    }

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

    showCommentButton.click(toggleOrUntoggleCommentBox);
    nextNoteButton.click(this.showNextNote);
    previousNoteButton.click(this.showPreviousNote);
    deleteNoteButton.click(deleteCurrentNote);

    this.enableOrDisablePrevAndNextButtons(currentNote);
}
