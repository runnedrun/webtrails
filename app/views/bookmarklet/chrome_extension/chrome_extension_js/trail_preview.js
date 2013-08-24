console.log("trail preview injected");

function TrailPreview(siteID,trailD,notes, previewHtml) {
    this.$IDoc = wt_$(wt_$(".wt-trail-preview")[0].contentWindow.document);
    this.notes = notes;
    this.previewHtml = previewHtml;
    this.$iframe = wt_$(".wt-trail-preview");

    this.insertHTMLInIframe = function (html,$iframe){
        var siteBody = wt_$('body', this.$IDoc);
        siteBody.append(html);
    }

    this.init = function(){
        this.insertHTMLInIframe(this.previewHtml);
    }
    this.show = function(){
        this.$iframe.show();
    }
}
