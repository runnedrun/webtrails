//callbackTracker = {}
AWSBase = "https://s3.amazonaws.com/TrailsSitesProto";
function parse_page_and_resolve_urls(siteInfo, tabId){
    var oldAbsoluteTo = URI.prototype.absoluteTo;
    URI.prototype.absoluteTo = function(url) {
        try {
            return URI(oldAbsoluteTo.call(this,url));
        } catch(e) {
            console.log("caught error with absoluteTo while parsing this uri: ", url);
            console.log("error is", e);
            return URI(url);
        }
    };

    var stylesheetHrefs = siteInfo.stylesheet_hrefs;
    var stylesheetContents = siteInfo.stylesheet_contents;
    var currentSiteID = siteInfo.current_site_id;
    var currentTrailID = siteInfo.current_trail_id;
    var baseURI = siteInfo.base_uri;
    var currentLocation = siteInfo.current_location;
    var html = siteInfo.html;
    var isIframe = siteInfo.iframe;
    var htmlAttributes = siteInfo.html_attributes;
    var shallowSave = siteInfo.shallow_save;
    var revision = siteInfo.revision;
    var isBaseRevision = siteInfo.is_base_revision;
    var characterEncoding = siteInfo.character_encoding;

    var callbackTracker = {
        siteID: currentSiteID,
        trailID: currentTrailID,
        currentSite: currentLocation,
        baseURI: baseURI,
        styleSheetsLeft: stylesheetHrefs.length,
        styleSheets:{},
        originalToAwsUrlMap: {},
        html: false,
        isIframe: !!isIframe,
        shallowSave: shallowSave,
        revision: revision,
        isBaseRevision: isBaseRevision,
        characterEncoding: characterEncoding,
        noteId: siteInfo.note_id,
        tabId: tabId,
    };

    $.each(stylesheetHrefs,function(i,href){
        getCssAndParse(href, callbackTracker)
    })

    parseHtmlAndResolveUrls(siteInfo.html, htmlAttributes, callbackTracker);
}

function parseHtmlAndResolveUrls(html,htmlAttributes,cb) {
    var newDoc = document.implementation.createHTMLDocument().documentElement;
    newDoc.innerHTML = html;
    var $html = $(newDoc);

    $.each(htmlAttributes,function(attributeName,attributeValue){
        $html.attr(attributeName, attributeValue);
    })

    $html.find("style").each(function(i,styleElement){
        styleElement.innerHTML = parseCSSAndReplaceUrls(styleElement.innerHTML, "", cb);
    })

    var originalToAwsUrlMap = cb.originalToAwsUrlMap;

    $html.find("img[src]").each(function(i,imageElement){
        var imageUrl = imageElement.getAttribute("src");
        if (imageUrl && !imageUrl.match(/^data:/)){
            var newUrlAndFilePath = generateAwsUrl(imageUrl, cb.siteID, cb.trailID);
            var newUrl = newUrlAndFilePath.fullUrl;
            var filePath = newUrlAndFilePath.awsPath;
            var absoluteUrl = URI(imageUrl).absoluteTo(cb.baseURI).href();

            if (originalToAwsUrlMap[absoluteUrl]){
                newUrl = generateAwsUrlFromAwsPath(originalToAwsUrlMap[absoluteUrl]);
            } else {
                originalToAwsUrlMap[absoluteUrl] = filePath;
            }

            imageElement.setAttribute('src',newUrl);
        }
    })

    $html.find("base").remove();

    $html.find("a[href]").each(function(i,aref){
        var href = aref.getAttribute("href");
        if (href && !href.match(/^\s*javascript:/)){
            aref.setAttribute("target","_blank");
            aref.setAttribute("href", URI(href).absoluteTo(cb.baseURI).href());
        }
    });

    $html.find("link[href]").each(function(i,link){
        var href = link.getAttribute("href");
        if (href && !href.match(/^\s*javascript:/)){
            var absoluteUrl = URI(href).absoluteTo(cb.baseURI).href();
            link.setAttribute("href", generateAwsUrl(absoluteUrl, cb.siteID, cb.trailID).fullUrl);
        }
    })

    $html.find("iframe[src]").each(function(i,iframe){
        var src = iframe.getAttribute("src");
        if (src && !src.match(/^\s*javascript:/)){
            iframe.innerHTML = "";
            iframe.setAttribute("src", generateAwsUrl(src, cb.siteID, cb.trailID).fullUrl);
        }
    })

    $html.find("[style]").each(function(i,element){
        var css = element.getAttribute("style");
        var parsedCSS = parseCSSAndReplaceUrls(css, "", cb);
        element.setAttribute("style", parsedCSS);
    })

    var escapedHtmlAwsPath = generateAwsUrl(cb.currentSite, cb.siteID, cb.trailID).awsPath;

    cb["html"] = {awsPath: escapedHtmlAwsPath, html: newDoc.outerHTML};
    checkIfAllResourcesAreParsed(cb)
}

function getCssAndParse(cssLocation,cb){
    $.ajax({
        url: cssLocation,
        type: "get",
        crossDomain: true,
        dataType: "text",
        success:function(resp){
            parseCSSAndReplaceUrls(resp, cssLocation, cb);
        },
        error: function(){
            console.log("error loading resource");
            checkIfAllResourcesAreParsed(cb);
        }
    })
}

function updateCallbackTracker(newCSS,awsPathForCSS,callbackTracker){
    if (awsPathForCSS){
        callbackTracker.styleSheets[awsPathForCSS] = newCSS;
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

        LocalStorageTrailAccess.getAuthToken().done(function(authToken) {
            $.ajax({
                url: resourceDownloaderAddress  + "/resource_downloader",
                type: "post",
                crossDomain: true,
                data: callbackTracker,
                beforeSend: function(xhr) { signRequestWithWtAuthToken(xhr, authToken) },
                success:function(resp){
                    if (!callbackTracker.isIframe && resp.archive_location) {
                        new DownloadStatusChecker(
                            resp.archive_location,
                            callbackTracker.tabId,
                            callbackTracker.siteID,
                            callbackTracker.revision);
                    }
                },
                error: function(){
                    console.log("server broke!");
                }
            })
        })
    }
}

function parseCSSAndReplaceUrls(css, resourceLocation,cb){
    var importOrUrlRegex = generateImportOrUrlRegex();
    var originalToAwsUrlMap = cb.originalToAwsUrlMap
    var newCSS = css.replace(importOrUrlRegex, function(matchedGroup, capturedImportUrl, capturedUrl){
        if (capturedImportUrl){
            var absoluteUrl = URI(capturedImportUrl).absoluteTo(resourceLocation).absoluteTo(cb.baseURI).href();
            cb.styleSheetsLeft +=1
            getCssAndParse(absoluteUrl,cb);
            return "@import url('" + generateAwsUrl(capturedImportUrl,cb.siteID,cb.trailID).fullUrl + "')";
        }else{
            // get rid of spaces, just in case
            capturedUrl = capturedUrl.replace(" ","");
            // ignore data urls
            if (capturedUrl.match(/^data:/)){
                return matchedGroup
            }
            var newUrlAndFilePath = generateAwsUrl(capturedUrl,cb.siteID,cb.trailID);
            var newUrl = newUrlAndFilePath.fullUrl;
            var filePath = newUrlAndFilePath.awsPath;
            var absoluteUrl = URI(capturedUrl).absoluteTo(resourceLocation).absoluteTo(cb.baseURI).href();
            if (originalToAwsUrlMap[absoluteUrl]){
                newUrl = generateAwsUrlFromAwsPath(originalToAwsUrlMap[absoluteUrl]);
            } else {
                originalToAwsUrlMap[absoluteUrl] = filePath;
            }
            return "url("+newUrl+")";
        }
    });
    if (resourceLocation != "") {
        resourceLocation = URI(resourceLocation).absoluteTo(cb.baseURI).href();
    }
    return updateCallbackTracker(newCSS, generateAwsUrl(resourceLocation, cb.siteID, cb.trailID).awsPath,cb);
}

function generateAwsUrl(url,siteID,trailID){
    if (url == ""){
        return false
    }
    // get rid of leading httpX://
    path = url.replace(/^\w+:\/\//,"");
    // get rid of leading slashes
    path = path.replace(/^\/+/,"");
    // convert colons and such to underscores
    path = path.replace(/[^-_.\/[:alnum:]]/g,"_");
    // get rid of hash
    path = path.replace(/#/g,"");

    var path_in_parts = path.split(".");
    var extensionWithQuery = path_in_parts.slice(1).pop() || "";
    var query = extensionWithQuery.split("?")[1] || "";
    var extension = extensionWithQuery.split("?")[0];

    path_in_parts.pop();
    var path_wo_extension = path_in_parts.join(".");
    var short_path_wo_extension = path_wo_extension.slice(0,90) +  "_" + query.slice(0,10);
    short_path_wo_extension = short_path_wo_extension.replace(/\/+$/g,"");
    short_path_wo_extension = short_path_wo_extension.replace(/\.\./g,"");
    short_path_wo_extension = short_path_wo_extension.replace(/\/\//g,"/");

    if (short_path_wo_extension[0]!="/"){
        short_path_wo_extension = "/" + short_path_wo_extension;
    }

    var shortPath = short_path_wo_extension + "." + extension;
    var escapedShortPath = $.map(shortPath.split("/"),function(sect,i){ return encodeURIComponent(sect) }).join("/");

    var filePath = String(trailID)+"/"+String(siteID)+ shortPath;
    var escapedFilePath = String(trailID)+"/"+String(siteID)+ escapedShortPath;
    var newLocation = generateAwsUrlFromAwsPath(escapedFilePath);
    return {fullUrl: newLocation, awsPath: filePath};
}

function generateAwsUrlFromAwsPath(path){
    //remove trailing slash
    return AWSBase + "/" + path.replace(/\/\s*$/,"");
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

