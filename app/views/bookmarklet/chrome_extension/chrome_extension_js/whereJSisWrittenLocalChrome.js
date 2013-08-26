console.log("initializing the toolbar");

var trailDisplay,
    faviconHolder,
    mouseDown = 0,
    previousNoteDisplay,
    noteDisplayWrapper,
    currentSiteID="",
    trailSelect,
    saveSiteToTrailButton,
    deleteNoteButton,
    previousNoteID,
    siteHTML = getCurrentSiteHTML(),
    noteCount = 0,
    siteSavedDeeply = false,
    trailPreview = false
    loggedIn = false;
    faviconsFetched = false;
//    webTrailsUrl = "http://www.webtrails.co";
    webTrailsUrl = "http://localhost:3000";

String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

wt_$(initExtension);

function initExtension(){
    console.log("init extension");
    initializeTrailsObject(makeToolBar);
}

function initializeTrailsObject(callback){
    console.log("get trails object");
    chrome.runtime.sendMessage({getTrailsObject:"get it!"}, function(response) {
        Trails = new TrailsObject(response,startingTrailID);
        callback(Trails)
    });
}

function verifyKeyPress(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 27 && e.shiftKey){    //tilda = 192, esc is code == 27
        showOrHidePathDisplay();
    } else if (e.altKey){
        displaySaveButtonWhileKeyIsPressed()
    }
}

function setSiteID(siteID){
    currentSiteID = siteID
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

