console.log("loaded pre-processing");

// Edits in-place
function removeToolbarFromPage($htmlClone) {
    $htmlClone.find('.webtrails').remove();
    $htmlClone.find("body").css({
        "margin-top": Toolbar.bodyMarginTop,
        "position": Toolbar.bodyPosition,
    });
}

function removeAllUnusedTags($htmlClone){
    $htmlClone.find("script").remove();
    $htmlClone.find("noscript").remove();
    $htmlClone.find("meta").remove();
}

function getCurrentSiteHTML(){
    var htmlElement = document.getElementsByTagName('html')[0];
    var htmlClone = $(htmlElement).clone();
    if (!(typeof Toolbar === "undefined")) removeToolbarFromPage(htmlClone); // edits in-place
    removeAllUnusedTags(htmlClone);
    var processedHtml = htmlClone[0]; //gets the element, not the jquery object
    return processedHtml.outerHTML;
}

function parsePageBeforeSavingSite(resp){
    console.log("sending message");
    console.log("resp.revision_number = " + resp.revision_number);
    var stylesheetHrefs = [];
    var stylesheetContents = [];
    var currentHTML = getCurrentSiteHTML();
    var html_attributes = {};

    $.each($("html")[0].attributes,function(i,attribute){
        html_attributes[attribute.name] = attribute.value;
    });

    $.each($.makeArray(document.styleSheets),function(i,stylesheet){
        var owner = stylesheet.ownerNode
        if (owner.nodeName == "LINK"){
            stylesheetHrefs.push(owner.href);
        }else if(owner.nodeName == "STYLE"){
            stylesheetContents.push(owner.innerHTML);
        }
    });

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
        if (resp.update_on_finish) {
            updateTrailDataInLocalStorage();
        }
    });
}