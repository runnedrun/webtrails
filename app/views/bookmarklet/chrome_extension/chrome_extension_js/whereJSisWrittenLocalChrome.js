console.log("initializing the toolbar");

var trailDisplay,
    mouseDown = 0,
    previousNoteDisplay,
    noteDisplayWrapper,
    currentSiteTrailID="",
    trailID = 2,
    userID = 1,
    saveSiteToTrailButton,
    deleteNoteButton,
    previousNoteID,
    siteHTML = getCurrentSiteHTML();
    noteCount = 0,
    webTrailsUrl = "http://localhost:3000";
    // webTrailsUrl = "http://webtrails.co";


String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

wt_$(initMyBookmarklet);

function getCurrentSiteHTML(){
    var htmlClone = wt_$(document.getElementsByTagName('html')[0]).clone();
    removeToolbarFromPage(htmlClone); // edits in-place
    var processedHtml = createMasterStyleSheet(htmlClone[0]); //gets the element, not the jquery object
    return processedHtml.innerHTML;
}

function verifyKeyPress(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 27 || code == 192){ //just tilda right now, esc is code == 27 |
        showOrHidePathDisplay();
    }
}

function setSiteID(response){
    currentSiteTrailID = response.site_id
}

function getComputedStyleOfElement(element,stylename){
    return document.defaultView.getComputedStyle(element,null)[stylename];
}

// returns true if the node is a text node, false if not
function isTextNode(node) {
    return node.nodeType == 3;
}