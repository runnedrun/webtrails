function getNoteIDsForCurrentSite(){
    return siteHash[getCurrentSiteID()]["noteIDs"];
}

function getCurrentNoteID(){
    return getNoteIDsForCurrentSite()[currentNoteIndex];
}

function getNumberOfNotesForCurrentSite(){
    return getNoteIDsForCurrentSite().length;
}

// will return null if error
function getComputedStyleOfElement(element, stylename, separateDocument){
    var currentDocument = separateDocument || document
    var style = currentDocument.defaultView.getComputedStyle(element,null);
    if (style) {
        return style[stylename];
    } else {
        return null;
    }
}

function getCurrentSiteID(){
    return siteIDs[currentSiteIndex];
}

function getCurrentSiteDocument(){
    return currentSite[0].contentWindow.document
}

function getCurrentIframeHTML(){
    var htmlClone = $(getCurrentSiteDocument().getElementsByTagName('html')[0]).clone();
    removeInsertedHtml(htmlClone); // edits in-place
    return htmlClone[0].outerHTML;
}

function iframeContentWindow(){
    return $(".currentSite")[0].contentWindow;
}

function getSiteDocumentByID(siteID){
    $("#"+siteID)[0].contentWindow.document
}