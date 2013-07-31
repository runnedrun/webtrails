//callbackTracker = {}
AWSBase = "https://s3.amazonaws.com/TrailsSitesProto";

function parse_page_and_resolve_urls(siteInfo){
    var stylesheetHrefs = siteInfo.stylesheet_hrefs;
    var stylesheetContents = siteInfo.stylesheet_contents;
    var currentSiteID = siteInfo.current_site_id;
    var currentTrailID = siteInfo.current_trail_id;
    var baseURI = siteInfo.base_uri;
    var currentLocation = siteInfo.current_location;
    var html = siteInfo.html;

    var callbackTracker = {
        styleSheetsLeft: stylesheetHrefs.length,
        styleSheets:{},
        originalToAwsUrlMap: {},
        html: false
    };

    wt_$.each(stylesheetHrefs,function(i,href){
        getCssAndParse(href,baseURI,callbackTracker,currentSiteID,currentTrailID)
    })

    parseHtmlAndResolveUrls(siteInfo.html,currentSiteID,currentTrailID,baseURI,currentLocation,callbackTracker);
}

function parseHtmlAndResolveUrls(html,currentSiteID,currentTrailID,baseURI,currentLocation,callbackTracker) {
    var newDoc = document.implementation.createHTMLDocument().documentElement;
    newDoc.innerHTML = html;
    var $html = wt_$(newDoc);
    var styleTags = $html.find("style");
    $html.find("style").each(function(i,styleElement){
        styleElement.innerHTML = (styleElement.innerHTML,currentSiteID,currentTrailID,"",baseURI,callbackTracker);
    })

    var originalToAwsUrlMap = callbackTracker["originalToAwsUrlMap"];

    $html.find("img").each(function(i,imageElement){
        var imageUrl = imageElement.getAttribute("src");
        if (!imageUrl.match(/^data:/)){
            var newUrl = generateAwsUrl(imageUrl,currentSiteID,currentTrailID);
            var absoluteUrl = URI(imageUrl).absoluteTo(baseURI);
            originalToAwsUrlMap[absoluteUrl] = newUrl;
        }
    })

    $html.find("base").remove();

    $html.find("a[href]").each(function(i,aref){
        var href = aref.getAttribute("href");
        if (!href.match(/^\s*javascript:/)){
            aref.setAttribute("target","_blank");
            aref.setAttribute("src", URI(href).absoluteTo(baseURI));
        }
    })

    $html.find("iframe[src]").each(function(i,iframe){
        var src = iframe.getAttribute("src");
        if (!src.match(/^\s*javascript:/)){
            iframe.innerHTML = "";
            iframe.setAttribute("src", generateAwsUrl(currentLocation,currentSiteID,currentTrailID));
        }
    })

    $html.find("[style]").each(function(i,element){
        var css = element.getAttribute("style");
        var parsedCSS = parseCSSAndReplaceUrls(css,currentSiteID,currentTrailID,"",baseURI,callbackTracker);
        element.setAttribute("style",parsedCSS);
    })

    var htmlAwsLocation = generateAwsUrl(currentLocation,currentSiteID,currentTrailID);
    callbackTracker["html"] = [htmlAwsLocation,newDoc.outerHTML];
    checkIfAllResourcesAreParsed(callbackTracker)
}

function getCssAndParse(cssLocation,baseURI,callbackTracker,currentSiteID,currentTrailID){
    wt_$.ajax({
        url: cssLocation,
        type: "get",
        crossDomain: true,
        dataType: "text",
        success:function(resp){
            parseCSSAndReplaceUrls(resp,currentSiteID,currentTrailID,cssLocation,baseURI,callbackTracker);
        },
        error: function(){
            console.log("error loading resource");
            checkIfAllResourcesAreParsed(callbackTracker);
        }
    })
}

function updateCallbackTracker(newCSS,awsLocationForCss,callbackTracker){
    if (awsLocationForCss){
        callbackTracker.styleSheets.awsLocationForCss = newCSS;
        callbackTracker.styleSheetsLeft -= 1;
        console.log(callbackTracker.styleSheetsLeft, "requests left");
        checkIfAllResourcesAreParsed(callbackTracker);
    } else{
        // it's a style attribute or style tag, just return the new css
        return newCSS
    }

}

function checkIfAllResourcesAreParsed(callbackTracker){
    if ((callbackTracker.styleSheetsLeft == 0) && callbackTracker.html){
        console.log("everything is parsed!");
        console.log(callbackTracker);
    }
}

function parseCSSAndReplaceUrls(css,siteID,trailID,cssLocation,baseURI,callbackTracker){
    var importOrUrlRegex = generateImportOrUrlRegex();
    var originalToAwsUrlMap = callbackTracker.originalToAwsUrlMap
    var newCSS = css.replace(importOrUrlRegex, function(matchedGroup, capturedImportUrl, capturedUrl){
        if (capturedImportUrl){
            var absoluteUrl = URI(capturedImportUrl).absoluteTo(cssLocation).absoluteTo(baseURI);
            callbackTracker.styleSheetsLeft +=1
            getCssAndParse(absoluteUrl.href(),baseURI,callbackTracker,siteID, trailID);
            return "@import url('" + generateAwsUrl(capturedImportUrl,siteID,trailID) + "')";
        }else{
            // get rid of spaces, just in case
            capturedUrl = capturedUrl.replace(" ","");
            // ignore data urls
            if (capturedUrl.match(/^data:/)){
                return matchedGroup
            }
            var newUrl = generateAwsUrl(capturedUrl,siteID,trailID);
            var absoluteUrl = URI(capturedUrl).absoluteTo(cssLocation).absoluteTo(baseURI);
            originalToAwsUrlMap[absoluteUrl.href()] = newUrl;
            return "url("+newUrl+")";
        }
    });
    return updateCallbackTracker(newCSS,generateAwsUrl(cssLocation,siteID,trailID),callbackTracker);
}

function generateAwsUrl(url,siteID,trailID){
    if (url == ""){
        //must be an inline style or style attribute
        return false
//        var uniqueString = String(callbackTracker[uniqueTime]["inlineStyleSheetCount"] += 1)
//        return AWSBase + "/"+String(trailID)+"/"+String(siteID)+"/wt_inline_style_" + uniqueString
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

function generateImportOrUrlRegex(){
    //@import\s+(?:url\()?["|']?([\w+-\._~:\/\?\#\[\]@!\$&*\+,=%]+)["']?\)?\s?;
    var importTagMatcherWithUrl = "@import\\s+(?:url\\()?";            //matches "@import url(" or "@import"
    var beginingQuoteMatcher = '["|\']?';                       //matches ' or " or nothing
    var urlMatcherForImport = "([\\w+-\\._~:\\/\\?\\#\\[\\]@!\\$&*\\+,=%]+)";  //matches any set of valid url characters
    var endMatcher = '["\']?\\)?\\s*'                               //matches ), "), '), ', " or nothing, followed by ;
    var importRegex = importTagMatcherWithUrl+beginingQuoteMatcher+urlMatcherForImport+endMatcher

    //url\(["']?([\w+-\._~:\/\?\#\[\]@!\$&'\(\)*\+,;=%]+)["']?\)
    var urlRegex = "url\\([\"']?([\\w+-\\._~:\\/\\?\\#\\[\\]@!\\$\\&\\*\\+,;=%]+)[\"']?\\)"

    var importOrUrlRegex = new RegExp("(?:" + importRegex + "|" + urlRegex + ")","g");
    return importOrUrlRegex
}