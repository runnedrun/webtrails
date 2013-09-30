console.log("trail preview injected");

TPreview = function(){
    var currentNote = Trails.getCurrentTrail().getLastNote();
    var currentSite = currentNote.site;
    var currentSiteFrame = false;
    var shown = false;
    var thisTrailPreview = this;

    var nextNoteButton = wt_$(".nextNoteButton");
    var previousNoteButton = wt_$(".previousNoteButton");

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
        return wt_$($iframe[0].contentWindow);
    }

    function updateIframeBody($iframe, html) {
        console.log("updating body of iframe");
        var newDoc = document.implementation.createHTMLDocument().documentElement;
        newDoc.innerHTML = html;
        var $html = wt_$(newDoc);
        wt_$(getIDoc($iframe).body).replaceWith($html.find("body"));
    }

    function loadCurrentTrailIntoPreview() {
        var currentTrail = Trails.getCurrentTrail();
        loadSitesSynchronously(currentTrail.getLastSite());
        function loadSitesSynchronously(site){
            console.log("loading site:", site);
            if (!site) {
                return
            } else {
                addSiteToPreview(site)
                    setTimeout(function(){
                    loadSitesSynchronously(site.previousSite());
                },1000);
            }

        }
    }

    function addEmptyIframeToPreview(site, revision) {
        var siteHtmlIframe = wt_$("<iframe data-trail-id='" + site.trail.id + "' data-site-id='"+site.id+"' seamless='seamless' class='wt-site-preview'>");
        console.log("iframe", siteHtmlIframe);
        siteHtmlIframe.attr('src',"about:blank");
        siteHtmlIframe.css({
            display : "none",
            width:"100%",
            "border-top": "2px gray solid",
            position: "fixed",
            height: "200px",
            top: "25px",
            "border-bottom": "2px solid grey",
            "z-index": "2147483647"
        });
        trailDisplay.after(siteHtmlIframe);
        return siteHtmlIframe
    }

    function addSiteToPreview(site, displayIframe) {
        var siteHtmlIframe = addEmptyIframeToPreview(site, displayIframe);
        var iframeContentWindow = thisTrailPreview.setIframeContent(siteHtmlIframe, site.getFirstRevisionHtml() || "");
        return iframeContentWindow
    }

    this.init = function() {
//        loadCurrentTrailIntoPreview();
        if (currentNote) {
            this.displayNote(currentNote);
        }
    }

    this.show = function() {
        if (currentSiteFrame){
            currentSiteFrame.show();
            wt_$(document.body).css({
                top: "225px",
                position: "relative"
            });
            shown = true
        }
    }

    this.hide = function() {
        if (currentSiteFrame){
            currentSiteFrame.hide();
            shown = false;
            wt_$(document.body).css({
                top:"0px"
            });
        }
    }

    this.switchToNoteRevision = function(note, displayPreview) {
        wt_$(".wt-site-preview").remove
        var siteHtmlIframe = addEmptyIframeToPreview(note.site, displayPreview);
        var iframeContentWindow = thisTrailPreview.setIframeContent(siteHtmlIframe, note.getRevisionHtml() || "Uh oh");
        return iframeContentWindow
//        var oldSiteFrame = currentSiteFrame;
//        currentSiteFrame = wt_$("[data-site-id='" + note.site.id + "']");
//        if (!(note.site == currentSite)) {
//            currentSite = note.site;
//            if (shown){
//                oldSiteFrame.hide();
//                currentSiteFrame.show();
//            }
//        }
//        updateIframeBody(currentSiteFrame, note.getSiteRevisionHtml());
//        return currentSiteFrame

    }

    this.displayNote = function(note) {
        var trailPreview = this;
        addSiteToPreview(note.site);
        runWhenExists("[data-site-id='" + note.site.id + "']", function() {

            var $iDoc = getSiteIDoc(note.site);
            runWhenLoaded(function() {
                var noteElements = trailPreview.highlightNote(note);
                var noteLocation = noteElements.first().offset();
                $iDoc.scrollTop(noteLocation.top-100).scrollLeft(noteLocation.left);
            },$iDoc[0]);
        })
    }

    this.highlightNote = function(note) {
        var siteIDoc = getSiteIDoc(note.site);
        var noteElements = wt_$("." + note.clientSideId,siteIDoc);
        thisTrailPreview.highlightElements(noteElements);
        return noteElements
    }

    this.showNextNote = function() {
        var nextNote = currentNote.nextNote();
        if (nextNote) {
            currentNote = nextNote;
            thisTrailPreview.enableOrDisablePrevAndNextButtons(currentNote);
            thisTrailPreview.displayNote(nextNote);
        } else {
            return false
        }
    }

    this.showPreviousNote = function() {
        var previousNote = currentNote.previousNote();
        if (previousNote) {
            currentNote = previousNote;
            thisTrailPreview.enableOrDisablePrevAndNextButtons(currentNote);
            thisTrailPreview.displayNote(previousNote);
        } else {
            return false
        }
    }

    this.enableOrDisablePrevAndNextButtons = function(currentNote) {
        console.log("checking if note buttons should be enabled");
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

    this.updateWithNewNote = function(newNote) {
        console.log("updating preview with new note");
        if (!currentNote){
            currentNote = newNote;
            this.displayNote(currentNote);
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

    nextNoteButton.click(this.showNextNote);
    previousNoteButton.click(this.showPreviousNote);
    this.enableOrDisablePrevAndNextButtons(currentNote);
}
