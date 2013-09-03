console.log("trail preview injected");

TPreview = function(){
    var currentNote = Trails.getCurrentTrail().getLastNote();
    var currentSite = currentNote.site;
    var currentSiteFrame = false;
    var shown = false;

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
        return wt_$($iframe[0].contentWindow);
    }

    this.loadCurrentTrailIntoPreview = function(){
        var trailPreview = this;
        var currentTrail = Trails.getCurrentTrail();
        console.log("before adding all the iframes");
        var $siteReadyCallbacks = wt_$.makeArray(wt_$.map(currentTrail.getSites(),function(site,i){
            var siteHtmlIfame = wt_$("<iframe data-trail-id='" + currentTrail.id + "' data-site-id='"+site.id+"' seamless='seamless' class='wt-site-preview'>");
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
            console.log("before setting iframe content");
            var $siteReadyCallback = trailPreview.setIframeContent(siteHtmlIfame,site.html).load(function(){ console.log(site.id + " is loaded");return true });
            return $siteReadyCallback;
        }));
        return $siteReadyCallbacks;
    }

    this.init = function(){
        var trailPreview = this;
        var siteReadyCallbacks = trailPreview.loadCurrentTrailIntoPreview()
        trailPreview.displayNote(currentNote);
    }

    this.show = function(){
        currentSiteFrame.show();
        wt_$(document.body).css({
            top: "225px",
            position: "relative"
        });
        shown = true
    }

    this.hide = function(){
        currentSiteFrame.hide();
        shown = false;
        wt_$(document.body).css({
            top:"0px"
        });
    }

    this.switchToSite = function(site){
        currentSiteFrame = wt_$("[data-site-id='" + site.id + "']");
        if (!(site == currentSite)){
            currentSite = site;
            if (shown){
                currentSiteFrame.hide();
                currentSiteFrame.show();
            }
        }
        return currentSiteFrame
    }

    this.displayNote = function(note){
        var trailPreview = this;
        var currentSiteIframe = this.switchToSite(note.site);
        var currentSiteDoc = getIDoc(currentSiteIframe);
        var loadedCheck = setInterval(function(){
            var iDoc = getSiteIDoc(note.site);
            if (iDoc[0].readyState === "complete"){
                var currentNoteElements = wt_$("." + note.clientSideId,currentSiteDoc);
                var currentNoteLocation = currentNoteElements.first().offset();
                currentSiteDoc.scrollTop(currentNoteLocation.top-100).scrollLeft(currentNoteLocation.left);
                trailPreview.highlightElements(currentNoteElements);
                clearInterval(loadedCheck);
            }
        },100);
    }

    this.highlightElements = function($elements){
        $elements.css({
            "background": "yellow"
        })
    }
}
