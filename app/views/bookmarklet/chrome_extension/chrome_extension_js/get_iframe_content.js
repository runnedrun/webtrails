console.log("loaded iframe listener, document.domain is", document.domain);
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.parse_and_resolve_iframe_urls){
        console.log("checking if we need to parse this frame");
        var siteInfo = request.parse_and_resolve_iframe_urls;
        var frameLocation = window.location.href;
        var isWtSitePreview = wt_$("head").hasClass("wt-site-preview");
        console.log("head of iframe",wt_$("head"), wt_$("head").hasClass("wt-site-preview"));
        if ((window !== top) && !(siteInfo.current_location == frameLocation) && !isWtSitePreview){
            console.log("parsing this frame");
            parsePageBeforeSavingSite(wt_$.extend(siteInfo,{iframe:true}));
        }else{
            console.log("top window, not sending message");
        }
    }
})