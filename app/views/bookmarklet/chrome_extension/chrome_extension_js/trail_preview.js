console.log("trail preview injected");

TPreview = function(){
    this.$iDoc = wt_$(wt_$(".wt-trail-preview")[0].contentWindow.document);
    this.$iframe = wt_$(".wt-trail-preview");
    console.log(Trails.getCurrentTrail().getLastNote());
    var currentNote = Trails.getCurrentTrail().getLastNote();
    var currentSiteFrame = false;

    function getIDoc($iframe){
        return wt_$($iframe[0].contentWindow.document);
    }

    this.setIframeContent = function($iframe,html){
        getIDoc($iframe)[0].write(html);
    }

    this.insertHTMLIntoIframe = function(html){
        var iframeToInsertInto = this.$iDoc;
        var siteBody = wt_$("body", iframeToInsertInto);
        siteBody.append(html);
    }

    this.loadCurrentTrailIntoPreview = function(){
        var trailPreview = this;
        var currentTrail = Trails.getCurrentTrail();
        wt_$.each(currentTrail.getSites(),function(i,site){
            var siteHtmlIfame = wt_$("<iframe data-site-id='"+site.id+"' seamless='seamless' class='wt-site-preview'>");
//            siteHtmlIfame.attr('src',"data:text/html;charset=utf-8," + escape(site.html));
            siteHtmlIfame.css({
                width:"100%",
                display:"none"
            });
            trailPreview.insertHTMLIntoIframe(siteHtmlIfame);
            trailPreview.setIframeContent(siteHtmlIfame,site.html)
        })
    }

    this.init = function(){
        this.loadCurrentTrailIntoPreview();
        this.displayNote(currentNote);
    }

    this.show = function(){
        this.$iframe.show();
    }

    this.displayNote = function(note){
        wt_$("wt-site-preview").hide();
        var siteIframe = this.$iDoc.find("[data-site-id='"+note.site.id+"']")
        var $siteIDoc = getIDoc(siteIframe).find("body");
//        var currentNoteElements = wt_$("#"+note.clientSideId,$siteIDoc);
        var currentNoteElements = wt_$("." + note.clientSideId,$siteIDoc);
        console.log(currentNoteElements);
        console.log($siteIDoc[0]);
        var currentNoteLocation = currentNoteElements.first().offset();
        siteIframe.show();
        $siteIDoc.scrollTop(currentNoteLocation.top).scrollLeft(currentNoteLocation.left);
        currentSiteFrame = siteIframe;

    }
}
