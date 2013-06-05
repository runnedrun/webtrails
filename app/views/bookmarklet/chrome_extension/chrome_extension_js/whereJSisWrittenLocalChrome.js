console.log("initializing the toolbar");

var trailDisplay,
    faviconHolder,
    mouseDown = 0,
    previousNoteDisplay,
    noteDisplayWrapper,
    currentSiteTrailID="",
    trailSelect,
    saveSiteToTrailButton,
    deleteNoteButton,
    previousNoteID,
    siteHTML = getCurrentSiteHTML(),
    noteCount = 0,
    siteSavedDeeply = false,
    loggedIn = false;
    faviconsFetched = false;
    contentScriptLoaded = "loaded";
//    webTrailsUrl = "http://localhost:3000";
   webTrailsUrl = "http://www.webtrails.co";



String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

wt_$(initMyBookmarklet);

function getCurrentSiteHTML(){
    var htmlClone = wt_$(document.getElementsByTagName('html')[0]).clone();
    removeToolbarFromPage(htmlClone); // edits in-place
    removeAllUnusedTags(htmlClone);
    var processedHtml = createMasterStyleSheet(htmlClone[0]); //gets the element, not the jquery object
    return processedHtml.outerHTML;
}

function verifyKeyPress(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 27 && e.shiftKey){    //tilda = 192, esc is code == 27
        showOrHidePathDisplay();
    }
}

function setSiteID(response){
    currentSiteTrailID = response.site_id
}

// if error returns null
function getComputedStyleOfElement(element,stylename){
    var style = document.defaultView.getComputedStyle(element,null);
    if (style) {
        return style[stylename];
    } else {
        return null;
    }
}

function getNodeLineHeight(element) {
    var fontsize = getComputedStyleOfElement(element, "font-size");
    if (fontsize) {
        return parseInt(fontsize.replace("px",""))*1.5 || 20; //default to 20
    } else {
        return 20;
    }
    
}
// returns true if the node is a text node, false if not
function isTextNode(node) {
    return node.nodeType == 3;
}

function setCurrentTrailID(ID){
    currentTrailID = ID;
    chrome.runtime.sendMessage({setCurrentTrailID:ID}, function(response) {
        console.log(response);
    });
}