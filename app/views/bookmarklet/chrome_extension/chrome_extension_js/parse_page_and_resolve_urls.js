callbackTracker = {}
AWSBase = "https://s3.amazonaws.com/TrailsSitesProto";

function parse_page_and_resolve_urls(siteInfo){
    var stylesheetHrefs = siteInfo.stylesheet_hrefs;
    var stylesheetContents = siteInfo.stylesheet_contents;
    var currentSiteID = siteInfo.current_site_id;
    var currentTrailID = siteInfo.current_trail_id;
    var currentLocation = siteInfo.current_location;
    var html = siteInfo.html;
    var uniqueTime = Date.now();
    callbackTracker[uniqueTime] = {
        styleSheetsLeft: stylesheetHrefs.length+stylesheetContents.length,
        styleSheets:{},
        originalToAwsUrlMap: {},
        inlineStyleSheetCount:0
    };
    wt_$.each(stylesheetHrefs,function(i,href){
        getCssAndParse(href,currentLocation,uniqueTime,currentSiteID,currentTrailID)
    })
    wt_$.each(stylesheetContents,function(i,css){
        console.log("parsing inline style");
        parseCSSAndReplaceUrls(css,currentSiteID,currentTrailID,"",currentLocation,uniqueTime);
    })
}

function parseHtmlAndResolveUrls() {

}

function getCssAndParse(cssLocation,currentLocation,uniqueTime,currentSiteID,currentTrailID){
    console.log("making request to", cssLocation);
    wt_$.ajax({
        url: cssLocation,
        type: "get",
        crossDomain: true,
        dataType: "text",
        success:function(resp){
            parseCSSAndReplaceUrls(resp,currentSiteID,currentTrailID,cssLocation,currentLocation,uniqueTime);
        },
        error: function(){
            console.log("error loading resource");
            checkIfAllStyleSheetsAreLoaded(uniqueTime);
        }
    })
}

function updateCallbackTracker(originalToAwsUrlMap,newCSS,awsLocationForCss,uniqueTime){
    wt_$.extend(callbackTracker[uniqueTime]["originalToAwsUrlMap"],originalToAwsUrlMap);
    callbackTracker[uniqueTime]["styleSheets"][awsLocationForCss] = newCSS;
    checkIfAllStyleSheetsAreLoaded(uniqueTime);
}

function checkIfAllStyleSheetsAreLoaded(uniqueTime){
    var numberOfStylesheetsLeft = callbackTracker[uniqueTime]["styleSheetsLeft"]-=1
    console.log(numberOfStylesheetsLeft, " requests left");
    if (numberOfStylesheetsLeft == 0){
        console.log("all requests done");
    }
}

function parseCSSAndReplaceUrls(css,siteID,trailID,cssLocation,currentLocation,uniqueTime){
    //@import\s+(?:url\()?["|']?([\w+-\._~:\/\?\#\[\]@!\$&*\+,=%]+)["']?\)?\s?;
    var importTagMatcherWithUrl = "@import\\s+(?:url\\()?";            //matches "@import url(" or "@import"
    var beginingQuoteMatcher = '["|\']?';                       //matches ' or " or nothing
    var urlMatcherForImport = "([\\w+-\\._~:\\/\\?\\#\\[\\]@!\\$&'*\\+,=%]+)";  //matches any set of valid url characters
    var endMatcher = '["\']?\\)?\\s*'                               //matches ), "), '), ', " or nothing, followed by ;
    var importRegex = importTagMatcherWithUrl+beginingQuoteMatcher+urlMatcherForImport+endMatcher

    //url\(["']?([\w+-\._~:\/\?\#\[\]@!\$&'\(\)*\+,;=%]+)["']?\)
    var urlRegex = "url\\([\"']?([\\w+-\\._~:\\/\\?\\#\\[\\]@!\\$&'\\(\\)\*\\+,;=%]+)[\"']?\\)"

    var importOrUrlRegex = new RegExp("(?:" + importRegex + "|" + urlRegex + ")","g");
    var originalToAwsUrlMap = {}
    var newCSS = css.replace(importOrUrlRegex, function(matchedGroup, capturedImportUrl, capturedUrl,urlIndex){
        if (capturedImportUrl){
            var absoluteUrl = URI(capturedImportUrl).absoluteTo(cssLocation).absoluteTo(currentLocation);
            callbackTracker[uniqueTime]["styleSheetsLeft"]+=1
            getCssAndParse(absoluteUrl.href(),currentLocation,uniqueTime,siteID, trailID);
            return "@import url('" + generateAwsUrl(capturedImportUrl,siteID,trailID,uniqueTime) + "')";
        }else{
            // get rid of spaces, just in case
            capturedUrl = capturedUrl.replace(" ","");
            // ignore data urls
            if (capturedUrl.match(/^data:/)){
                return matchedGroup
            }
            var newUrl = generateAwsUrl(capturedUrl,siteID,trailID,uniqueTime);
            var absoluteUrl = URI(capturedUrl).absoluteTo(cssLocation).absoluteTo(currentLocation);
            originalToAwsUrlMap[absoluteUrl.href()] = newUrl;
            return "url("+newUrl+")";
        }

    });
    updateCallbackTracker(originalToAwsUrlMap,newCSS,generateAwsUrl(cssLocation,siteID,trailID,uniqueTime),uniqueTime);
}

function generateAwsUrl(url,siteID,trailID,uniqueTime){
    if (url == ""){
        //must be an inline style
        var uniqueString = String(callbackTracker[uniqueTime]["inlineStyleSheetCount"] += 1)
        return AWSBase + "/"+String(trailID)+"/"+String(siteID)+"/wt_inline_style_" + uniqueString
    }
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