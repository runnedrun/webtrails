console.log("trail preview injected");

TPreview = function(){
    var currentNote = Trails.getCurrentTrail().getLastNote();
    var currentSite = currentNote.site;
    var currentSiteFrame = false;
    var shown = false;
    var trailPreview = this;

    var nextNoteButton = wt_$(".nextNoteButton");
    var previousNoteButton = wt_$(".previousNoteButton");

    function getIDoc($iframe){
        return wt_$($iframe[0].contentWindow.document);
    }

    function getSiteIDoc(site){
       return getIDoc(wt_$("[data-site-id='" + site.id + "']"));
    }

    function getIWindow($iframe){
        return wt_$($iframe[0].contentWindow);
    }

    this.setIframeContent = function($iframe,html){
        var iDoc = getIDoc($iframe)[0];
        iDoc.open();
        iDoc.writeln(html);
        iDoc.close();
        var headTag  = iDoc.getElementsByTagName("head")[0];
        headTag.className = headTag.className + " wt-site-preview";
        return wt_$($iframe[0].contentWindow);
    }

    this.loadCurrentTrailIntoPreview = function(){
        var trailPreview = this;
        var currentTrail = Trails.getCurrentTrail();
        console.log("before adding all the iframes");

        loadIframeSynchronously(currentTrail.getLastSite());

        function loadIframeSynchronously(site){
            if (!site){
                return
            }
            trailPreview.addSiteToPreview(site).load(function(){
                loadIframeSynchronously(site.previousSite());
            });
        }
    }

    this.addSiteToPreview = function(site){
        console.log("Adding: ", site.id);
        var siteHtmlIfame = wt_$("<iframe data-trail-id='" + site.trail.id + "' data-site-id='"+site.id+"' seamless='seamless' class='wt-site-preview'>");
        siteHtmlIfame.attr('src',"about:blank");
        siteHtmlIfame.css({
            display : "none",
            width:"100%",
            "border-top": "2px gray solid",
            position: "fixed",
            height: "200px",
            top: "25px",
            "border-bottom": "2px solid grey",
            "z-index": "2147483647"
        });
        trailDisplay.after(siteHtmlIfame);
        var iframeContentWindow = trailPreview.setIframeContent(siteHtmlIfame, site.html);
        return iframeContentWindow
    }

    this.init = function(){
        this.loadCurrentTrailIntoPreview();
        if (currentNote){
            this.displayNote(currentNote);
        }
    }

    this.show = function(){
        if (currentSiteFrame){
            currentSiteFrame.show();
            wt_$(document.body).css({
                top: "225px",
                position: "relative"
            });
            shown = true
        }
    }

    this.hide = function(){
        if (currentSiteFrame){
            currentSiteFrame.hide();
            shown = false;
            wt_$(document.body).css({
                top:"0px"
            });
        }
    }

    this.switchToSite = function(site){
        var oldSiteFrame = currentSiteFrame;
        currentSiteFrame = wt_$("[data-site-id='" + site.id + "']");
        if (!(site == currentSite)){
            currentSite = site;
            if (shown){
                oldSiteFrame.hide();
                currentSiteFrame.show();
            }
        }
        return currentSiteFrame
    }

    this.displayNote = function(note){
        console.log("displaying note: ", note.id);
        var trailPreview = this;
        runWhenExists("[data-site-id='" + note.site.id + "']", function(){
            trailPreview.switchToSite(note.site);
            var $iDoc = getSiteIDoc(note.site);
            runWhenLoaded(function(){
                var noteElements = trailPreview.highlightNote(note);
                var noteLocation = noteElements.first().offset();
                $iDoc.scrollTop(noteLocation.top-100).scrollLeft(noteLocation.left);
            },$iDoc[0]);
        })
    }

    this.highlightNote = function(note){
        var siteIDoc = getSiteIDoc(note.site);
        var noteElements = wt_$("." + note.clientSideId,siteIDoc);
        trailPreview.highlightElements(noteElements);
        return noteElements
    }

    this.showNextNote = function(){
        var nextNote = currentNote.nextNote();
        if (nextNote) {
            currentNote = nextNote;
            trailPreview.enableOrDisablePrevAndNextButtons(currentNote);
            trailPreview.displayNote(nextNote);
        } else {
            return false
        }
    }

    this.showPreviousNote = function(){
        var previousNote = currentNote.previousNote();
        if (previousNote) {
            currentNote = previousNote;
            trailPreview.enableOrDisablePrevAndNextButtons(currentNote);
            trailPreview.displayNote(previousNote);
        } else {
            return false
        }
    }

    this.enableOrDisablePrevAndNextButtons = function(currentNote){
        if(currentNote && currentNote.nextNote()){
            nextNoteButton.enable();
        } else {
            nextNoteButton.disable();
        }
        if(currentNote && currentNote.previousNote()){
            previousNoteButton.enable();
        } else {
            previousNoteButton.disable();
        }
    }

    this.highlightElements = function($elements){
        $elements.css({
            "background": "yellow"
        })
    }

    this.updateWithNewNote = function(newNote){
        console.log("updating preview with new note");
        if (!currentNote){
            currentNote = newNote;
            this.displayNote(currentNote);
        }
        this.enableOrDisablePrevAndNextButtons();
    }


    console.log(nextNoteButton);

    nextNoteButton.disable = previousNoteButton.disable = function(){
        this.prop('disabled', true);
        this.css({
            color: "grey"
        })
        this.enabled = false;
    }

    nextNoteButton.enable = previousNoteButton.enable = function(){
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
