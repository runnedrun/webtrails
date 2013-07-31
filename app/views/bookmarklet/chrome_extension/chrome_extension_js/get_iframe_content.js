console.log("loaded iframe listener, document.domain is", document.domain);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.parse_and_resolve_iframe_urls){
        console.log("checking if we need to parse this frame");
        var siteInfo = request.parse_and_resolve_iframe_urls;
        var frameLocation = window.location.href;
        if ((typeof(contentScriptLoaded) == "undefined") && !(siteInfo.current_location == frameLocation)){
            console.log("parsing this frame")
            parsePageBeforeSavingSite(wt_$.extend(siteInfo,{iframe:true}));
        }else{
            console.log("top window, not sending message");
        }
    }
})