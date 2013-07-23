callbackTracker = {}
AWSBase = "https://s3.amazonaws.com/TrailsSitesProto";

function parse_page_and_resolve_urls(siteInfo){
    var stylesheetHrefs = siteInfo.stylesheet_hrefs;
    var stylesheetContents = siteInfo.stylesheet_contents;
    var currentSiteID = siteInfo.current_site_id
    var currentTrailID = siteInfo.current_trail_id
    var html = siteInfo.html;
    console.log("stylesheet hrefs",stylesheetHrefs);
    console.log("stylesheet contents",stylesheetContents);
    console.log("site ID: ",currentSiteID);
    console.log("trail id: ",currentTrailID);
    console.log("siteInfo",siteInfo);
    var uniqueTime = Date.now();
    callbackTracker[uniqueTime] = {styleSheetsLeft: stylesheetHrefs.length,styleSheets:{}, originalToAwsUrlMap: {}};
    wt_$.each(stylesheetHrefs,function(i,href){
        console.log("making request to", href);
        wt_$.ajax({
            url: href,
            type: "get",
            crossDomain: true,
            dataType: "text",
            success:function(resp){
                parseCSSAndReplaceUrls(resp,currentSiteID,currentTrailID,href,uniqueTime);
            }
        })
    })
}

function updateCallbackTracker(originalToAwsUrlMap,newCSS,awsLocationForCss,uniqueTime){
    console.log("another success");
    wt_$.extend(callbackTracker[uniqueTime]["originalToAwsUrlMap"],originalToAwsUrlMap);
    callbackTracker[uniqueTime]["styleSheets"][awsLocationForCss] = newCSS;
    callbackTracker[uniqueTime]["styleSheetsLeft"]-=1;
    console.log(callbackTracker[uniqueTime]["styleSheetsLeft"], " requests left");
    if (callbackTracker[uniqueTime]["styleSheetsLeft"] == 0){
        console.log("all requests done");
    }
}

function parseCSSAndReplaceUrls(css,siteID,trailID,cssLocation,uniqueTime){
    var urlPattern = /url\(([\w+-\._~:\/\?\#\[\]@!\$&'\(\)\*\+,;=%]+)\)/g;
    var originalToAwsUrlMap = {}
    var newCSS = css.replace(urlPattern, function(match, url, urlIndex){
        // get rid of ' and " in case the url is formatted url("...")
        var url = url.replace(/['"]/g,"");
        var newUrl = generateAwsUrl(url,siteID,trailID);
        originalToAwsUrlMap[url] = newUrl;
        return "url("+newUrl+")";
    });
    updateCallbackTracker(originalToAwsUrlMap,newCSS,generateAwsUrl(cssLocation,siteID,trailID),uniqueTime);
}

function generateAwsUrl(url,siteID,trailID){
    // get rid of leading httpX://
    path = url.replace(/^\w+:\/\//,"");
    // get rid of leading slashes
    path = path.replace(/^\/+/,"");
    // convert colons and such to underscores
    path = path.replace(/[^-_.\/[:alnum:]]/g,"_");

    var path_in_parts = path.split(".");
    var extension = path_in_parts.slice(1).pop() || "";
    path_in_parts.pop();
    var path_wo_extension = path_in_parts.join(".");
    var short_path_wo_extension = path_wo_extension.slice(0,100);
    short_path_wo_extension = short_path_wo_extension.replace(/\/+$/g,"");
    short_path_wo_extension = short_path_wo_extension.replace(/\.\./g,"");
    short_path_wo_extension = short_path_wo_extension.replace(/\/\//g,"/");
    if (short_path_wo_extension[0]!="/"){
        short_path_wo_extension = "/" + short_path_wo_extension;
    }
    var newLocation = AWSBase + "/"+String(trailID)+"/"+String(siteID)+short_path_wo_extension + "." + extension;
    return newLocation
}