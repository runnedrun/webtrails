console.log("loaded pre-processing");

function removeNodes(nodes) {
    var nodeList = [].slice.call(nodes, 0)
    for (i in nodeList) { nodeList[i].remove() }
}

// Edits in-place
function removeToolbarFromPage(htmlClone) {
    removeNodes(htmlClone.querySelectorAll('.webtrails'));
    var body = htmlClone.querySelector("body");
    body.style["margin-top"] = Toolbar.bodyMarginTop;
    body.style["position"] = Toolbar.bodyPosition;
}

function removeAllUnusedTags($htmlClone){
    removeNodes($htmlClone.querySelectorAll("script"));
    removeNodes($htmlClone.querySelectorAll("noscript"));
    removeNodes($htmlClone.querySelectorAll("meta"));
}

function getCurrentSiteHTML(){
    var htmlElement = document.querySelector('html');
    var htmlClone = htmlElement.cloneNode(true);
    if (!(typeof Toolbar === "undefined")) removeToolbarFromPage(htmlClone); // edits in-place
    removeAllUnusedTags(htmlClone);
    var processedHtml = htmlClone; //gets the element, not the jquery object
    return processedHtml.outerHTML;
}

function parsePageBeforeSavingSite(resp){
    console.log("sending message");
    console.log("resp.revision_number = " + resp.revision_number);
    var stylesheetHrefs = [];
    var stylesheetContents = [];
    var currentHTML = getCurrentSiteHTML();
    var html_attributes = {};

    var realHtmlAttributes = document.querySelector("html").attributes

    for (var attr, i=0, attrs=realHtmlAttributes, l=attrs.length; i<l; i++){
        attr = attrs.item(i)
        html_attributes[attr.nodeName] = attr.nodeValue;
    }

    var styleSheets = document.styleSheets;
    var styleSheetList = [].slice.call(styleSheets, 0);
    for (i in styleSheetList) {
        var styleSheet = styleSheetList[i];
        var owner = styleSheet.ownerNode
        if (owner.nodeName == "LINK"){
            stylesheetHrefs.push(owner.href);
        }else if(owner.nodeName == "STYLE"){
            stylesheetContents.push(owner.innerHTML);
        }
    }

    chrome.runtime.sendMessage({
        parseAndResolve:{
            html: currentHTML,
            stylesheet_hrefs: stylesheetHrefs,
            stylesheet_contents: stylesheetContents,
            current_site_id: resp.current_site_id,
            current_trail_id: resp.current_trail_id,
            current_location: window.location.href,
            base_uri: document.baseURI,
            iframe: resp.iframe,
            html_attributes: html_attributes,
            shallow_save: resp.shallow_save,
            revision: resp.revision_number,
            is_base_revision: resp.isBaseRevision || false,
            character_encoding: document.characterSet,
            note_id: resp.note_id || undefined
        }
    }, function(response){
        console.log("page_preprocessing. parseAndResolve came back!");
//        if (resp.update_on_finish) {
//            updateTrailDataInLocalStorage();
//        }
    });
}