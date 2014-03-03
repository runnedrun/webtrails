IframeManager = new function FrameManager() {
    var thisFrameManager = this;

    this.getIDoc = function($iframe) {
        return $($iframe[0].contentWindow.document);
    };

    this.getIWindow = function($iframe) {
        return $($iframe[0].contentWindow);
    };

    this.setIframeContent = function($iframe,html) {
        var iDoc = thisFrameManager.getIDoc($iframe)[0];
        iDoc.open();
        iDoc.writeln(html);
        iDoc.close();
        var headTag  = iDoc.getElementsByTagName("head")[0];
        headTag.className = headTag.className + " wt-element";
        return $iframe[0].contentWindow.document;
    };

    this.runWhenLoaded = function(fn, doc){
        var doc = doc || document;
        var loadedCheck = setInterval(function(){
            if (doc.readyState === "complete"){
                clearInterval(loadedCheck);
                fn(doc);
            }
        },100);
    };

    this.i$ = function(frame, selector) {
        return thisFrameManager.getIDoc(frame).find(selector);
    };
}