console.log("ui_fns loaded");

function showOrHidePathDisplay(){
    if (trailDisplay.is(":hidden")){
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
    trailDisplay.prepend("<a href="+ url+ "\" class=\"siteFavicon\"><img src='"+ domain + "'></a>")
}

function addFaviconsToDisplay(data){
    wt_$.each(data.favicons_and_urls, function(i,favicon_and_url){
            addSiteFaviconToDisplay(favicon_and_url[0],favicon_and_url[1]);
        }
    )
}

function revealTrailURL(e){
    var urlDisplay = wt_$(document.createElement("span"));
    urlDisplay.css({
        "font-size": "12px",
        "color": "white",
        "background-color": "transparent",
        "font-weight": "bold",
        height:"100%",
        "max-width": "15%",
        "float": "right",
        "margin-left": "2%",
        border: "solid white 2px"
    })
    urlDisplay.html("http://localhost:3000/trails/"+trailID);
    e.target.parentNode.replaceChild(urlDisplay[0],e.target)
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