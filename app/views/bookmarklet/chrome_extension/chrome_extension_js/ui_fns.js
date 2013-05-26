console.log("ui_fns loaded");

function showOrHidePathDisplay(){
    if (trailDisplay.is(":hidden") && (window.location.host != 'localhost:3000') && (window.location.host.indexOf('webtrails.co') == -1) ){
        trailDisplay.show();
        if (mouseDown == 0) { // if the mouse is not pressed (not highlighting)
            highlightedTextDetect(); // check to see if they highlighted anything for the addnote button
        } else { // mouse is down, must be highlighting
            possibleHighlightStart(); // get that highlight start event so when done highlighting, addnote appears
        }
    }
    else {
        trailDisplay.hide();
        wt_$(".inlineSaveButton").remove();
    }

}

function addSiteFaviconToDisplay(domain,url) {
    var faviconLink = wt_$("<a href=\""+ url+ "\" class=\"siteFavicon webtrails\"></a>");
    var faviconImg  = wt_$("<img src='"+ domain + "' class=\"webtrails\">");
    faviconLink.css({
        "vertical-align":"top",
            padding: "0px",
            "padding-right": "3px",
            float: "left",
            overflow: "hidden",
            display: "block",
            border: "none"
            });
    faviconImg.css({
       height:"16px",
       margin: 0,
       "margin-top":"4px",
       "vertical-align":"top",
        padding: "0px"
    })

    faviconLink.append(faviconImg);
    trailDisplay.append(faviconLink);
}

function addFaviconsToDisplay(data){
    wt_$.each(data.favicons_and_urls, function(i,favicon_and_url){
            addSiteFaviconToDisplay(favicon_and_url[0],favicon_and_url[1]);
        }
    )
}

function moveNoteToPrevious(noteContent){
    previousNoteDisplay.fadeOut(100);
    previousNoteDisplay.html(noteContent);
    previousNoteDisplay.fadeIn(100);
}

function updateNoteDisplay(data){
    if (data.id == "none") {
        moveNoteToPrevious("No more notes on this page.  Go ahead and take a few.");
        deleteNoteButton.attr("disabled","disabled");
    }else{
        previousNoteID = data.id;
        moveNoteToPrevious(data.content);
        deleteNoteButton.attr("disabled","");
    }
}