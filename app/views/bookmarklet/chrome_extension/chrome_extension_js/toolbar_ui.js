console.log('toolbar ui loaded');

function initMyBookmarklet() {
    var displayHeight = "25px";
    trailDisplay = wt_$(document.createElement("div"));
    trailDisplay.addClass("webtrails");
    trailDisplay.css({
        "height":displayHeight,
        "width": "100%",
        "position":"fixed",
        "top":"0px",
        "text-align":"left",
        "z-index": "2147483647",
        "opacity": "1",
        "background": "#F0F0F0",
        "color": "#333",
        "line-height": "25px",
        "display":"none",
        "border-bottom-right-radius": "7px",
        "border-bottom-left-radius": "7px",
        "border-bottom" : "1px solid #aaa",
        "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif'
    });
    trailDisplay.disableSelection();

    noteDisplayWrapper = wt_$(document.createElement("div"));
    noteDisplayWrapper.css({
        "height":"20px",
        "width": "40%",
        "float":"right",
        "margin-left": "3%",
        "opacity": "1",
        "overflow": "hidden",
        "margin-top": "2px",
        "border-radius": "5px",
        "background-color": "#d1d1d1"
    });
    noteDisplayWrapper.addClass("noteDisplayWrapper").addClass("webtrails");;

    previousNoteDisplay = wt_$(document.createElement("div"));
    previousNoteDisplay.css({
        "margin-left": "5px",
        "font-size": "12px",
        "overflow": "hidden",
        "text-overflow": "ellipsis"
    });
    previousNoteDisplay.addClass("webtrails");
    previousNoteDisplay.html("Select text and press the save button to save notes.  Your last saved note will appear here");


    var linkToTrailWrapper = wt_$(document.createElement("div"));
    linkToTrailWrapper.css({
        "height":"100%",
        "display": "inline-block",
        "float": "left"
    });
    linkToTrailWrapper.addClass("webtrails");

    var linkToTrail = wt_$(document.createElement("a"));
    linkToTrail.css({
        "margin-left": "5px",
        "margin-right": "5px",
        "font-size": "12px",
        "color": "#333",
        "font-weight": "bold",
        "text-shadow": "1px 1px #F0f0f0",
        "text-decoration": "underline"
    });
    linkToTrail.addClass("webtrails");

    wt_$(linkToTrail).html("View Trail");
    wt_$(linkToTrail).attr('href',"http://localhost:3000/trails/"+trailID);

    deleteNoteButton = wt_$(document.createElement("button"));
    deleteNoteButton.css({
        "font-size": "12px",
        "color": "#333",
        "background-color": "transparent",
        "font-weight": "bold",
        "height":"100%",
        "width": "7%",
        "float": "right",
        "opacity": "0",
        "border": "1px solid #333",
        "text-shadow": "1px 1px #F0f0f0"
    });

    deleteNoteButton.html("Delete Note");
    deleteNoteButton.addClass("deleteNote").addClass("webtrails");

    saveSiteToTrailButton = wt_$(document.createElement("button"));
    saveSiteToTrailButton.css({
        "font-size": "12px",
        "color": "#333",
        "background-color": "transparent",
        "font-weight": "bold",
        "height":"20px",
        "width": "7%",
        "float": "right",
        "border-radius": "5px",
        "border": "1px solid #333",
        "text-shadow": "1px 1px #F0f0f0",
        "margin-top": "2px",
        "line-height": "normal"
    });
    saveSiteToTrailButton.addClass("webtrails");
    saveSiteToTrailButton.html("Save site");

    var shareTrailField = wt_$(document.createElement("input"));
    shareTrailField.css({
        "font-size": "12px",
        "color": "#333",
        "background-color": "transparent",
        "font-weight": "bold",
        "height":"20px",
        "width":"7%",
        "float": "right",
        "margin-left": "2%",
        "line-height": "normal",
        "text-align": "center",
        "padding": "0",
        "margin-top": "2px",
        "outline": "none",
        "border-radius": "5px",
        "border": "1px solid #333",
        "text-shadow": "1px 1px #f0f0f0",
        "cursor": "pointer"
    });
    shareTrailField.addClass("webtrails");
    shareTrailField.attr("type", "text");
    shareTrailField.attr("id", "shareTrail");
    shareTrailField.attr("value", "Share Trail");

    faviconHolder = wt_$(document.createElement("div"));
    faviconHolder.css({
        "font-size": "12px",
        "color": "#333",
        "background-color": "#f0f0f0",
        "height":"19px",
        "line-height": "25px",
        "text-align": "center",
        "padding": "0",
        "margin-top": "2px",
        "border-radius": "7px",
        "border": "1px solid #ccc",
        "width": "14%",
        "display": "inline-block",
        "overflow":"auto"
    });
    faviconHolder.addClass("webtrails");
    faviconHolder.attr("id", "faviconHolder");

    //adding all the toolbar elements to the DOM.
    wt_$(document.body).prepend(trailDisplay);

    wt_$(trailDisplay).append(deleteNoteButton);
    deleteNoteButton.click(deletePreviousNote);
    deleteNoteButton.attr("enabled","disabled");

    wt_$(trailDisplay).append(noteDisplayWrapper);

    wt_$(noteDisplayWrapper).append(previousNoteDisplay);

    wt_$(trailDisplay).append(shareTrailField);
    shareTrailField.click(function() {
        shareTrailField.attr("value", webTrailsUrl + '/trails/'+trailID);
        shareTrailField.focus();
        shareTrailField.select();
        shareTrailField.css({"cursor": "text"});
    });

    wt_$(trailDisplay).append(saveSiteToTrailButton);
    saveSiteToTrailButton.click(function(){saveSiteToTrail(setSiteID)});

    wt_$(trailDisplay).append(linkToTrailWrapper);
    wt_$(linkToTrailWrapper).append(linkToTrail);

    wt_$(trailDisplay).append(faviconHolder);
    faviconHolder.mouseenter(growFaviconHolder).mouseleave(shrinkFaviconHolder)

    initializeAutoResize();
    initializeJqueryEllipsis();
    previousNoteDisplay.ellipsis();

    //document bindings

    wt_$(document.body).keydown(verifyKeyPress);

    wt_$(document.body).mousedown(function() {
        mouseDown=1;
    });
    wt_$(document.body).mouseup(function(){
        mouseDown=0;
    });

    fetchFavicons();
    wt_$(document).mousedown(possibleHighlightStart);

    try {
        var bodymargin = wt_$('body').css('margin-left')
        if (bodymargin) {
            trailDisplay.css("margin-left", "-" + bodymargin);
        }
    }catch (e) {}
}