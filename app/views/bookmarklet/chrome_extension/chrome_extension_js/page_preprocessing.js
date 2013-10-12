console.log("loaded pre-processing");

// Edits in-place
function removeToolbarFromPage($htmlClone) {
    $htmlClone.find('.webtrails').remove();
    $htmlClone.find("body").css({"top": "0px"});
}

function removeAllUnusedTags($htmlClone){
    $htmlClone.find("script").remove();
    $htmlClone.find("noscript").remove();
    $htmlClone.find("meta").remove();
}

function getCurrentSiteHTML(){
    var htmlElement = document.getElementsByTagName('html')[0];
    var htmlClone = wt_$(htmlElement).clone();
    removeToolbarFromPage(htmlClone); // edits in-place
    removeAllUnusedTags(htmlClone);
    var processedHtml = htmlClone[0]; //gets the element, not the jquery object
    return processedHtml.outerHTML;
}

function parsePageBeforeSavingSite(resp){
    console.log("sending message");
    console.log("resp.revision_number = " + resp.revision_number);
    console.log(resp);
    var stylesheetHrefs = [];
    var stylesheetContents = [];
    var currentHTML = getCurrentSiteHTML();
    var html_attributes = {};

    wt_$.each(wt_$("html")[0].attributes,function(i,attribute){
        html_attributes[attribute.name] = attribute.value;
    })


    wt_$.each(wt_$.makeArray(document.styleSheets),function(i,stylesheet){
        var owner = stylesheet.ownerNode
        if (owner.nodeName == "LINK"){
            stylesheetHrefs.push(owner.href);
        }else if(owner.nodeName == "STYLE"){
            stylesheetContents.push(owner.innerHTML);
        }
    });

//    if (!resp.shallowSave){
//        changeObserver = new MutationSummary({callback: function(m){ console.log("mutation")}, queries: [{all: true}]});
//    } else {
//        console.log("summaries", changeObserver.takeSummaries());
//    }
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
            character_encoding: document.characterSet
        }
    }, function(response){
        console.log("page_preprocessing. parseAndResolve came back!");
    });
}