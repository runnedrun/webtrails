callbackTracker = {}

function parse_page_and_resolve_urls(siteInfo){
    var stylesheetHrefs = siteInfo.stylesheet_hrefs;
    var stylesheetContents = siteInfo.stylesheet_contents;
    var html = siteInfo.html;
    console.log("stylesheet hrefs",stylesheetHrefs);
    console.log("stylesheet contents",stylesheetContents);
    console.log("siteInfo",siteInfo);
    var uniqueTime = Date.now();
    callbackTracker[uniqueTime] = {styleSheetsLeft: stylesheetHrefs.length,styleSheets:[]};
    wt_$.each(stylesheetHrefs,function(i,href){
        console.log("making request to", href);
        wt_$.ajax({
            url: href,
            type: "get",
            crossDomain: true,
            success:function(resp){
                console.log("another success");
                callbackTracker[uniqueTime]["styleSheets"].push(resp);
                callbackTracker[uniqueTime]["styleSheetsLeft"]-=1;
                console.log(callbackTracker[uniqueTime]["styleSheetsLeft"], " requests left");
                if (callbackTracker[uniqueTime]["styleSheetsLeft"] == 0){
                    console.log("all requests done");
                }
            }
        })
    })
}