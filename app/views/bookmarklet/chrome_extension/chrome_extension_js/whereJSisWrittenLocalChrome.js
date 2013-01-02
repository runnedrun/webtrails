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
    noteCount = 0;


String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};


$(initMyBookmarklet);

function getCurrentSiteHTML(){
    return document.getElementsByTagName('html')[0].innerHTML;
}

function verifyKeyPress(e){
var code = (e.keyCode ? e.keyCode : e.which);
if (code == 27){
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
