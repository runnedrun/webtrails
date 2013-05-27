console.log('toolbar ui loaded');

function initMyBookmarklet() {
    var displayHeight = "25px";
    trailDisplay = wt_$(document.createElement("div"));
    trailDisplay.addClass("webtrails");
    trailDisplay.css({
        height:displayHeight,
        width: "100%",
        position:"fixed",
        top:"0px",
        "text-align":"left",
        "z-index": "2147483647",
        opacity: ".8",
        background: "#2E2E1F",
        color: "white",
        "line-height": "25px",
        "display":"none",
        "border-bottom-right-radius": "7px",
        "border-bottom-left-radius": "7px"
    });
    trailDisplay.mouseover(function() {
        trailDisplay.css("opacity", "1");
      }).mouseout(function(){
        trailDisplay.css("opacity", "0.8");
      });
    trailDisplay.disableSelection();

    noteDisplayWrapper = wt_$(document.createElement("div"));
    noteDisplayWrapper.css({
        height:"100%",
        width: "40%",
        "float":"right",
        "margin-left": "3%",
        "border-left": "solid",
        "opacity": "1",
        overflow: "hidden"
    });
    noteDisplayWrapper.addClass("noteDisplayWrapper").addClass("webtrails");;

    previousNoteDisplay = wt_$(document.createElement("div"));
    previousNoteDisplay.css({
        "margin": "0 0 0 5px",
        "font-size": "12px",
        "overflow": "hidden",
        "text-overflow": "ellipsis"
    });
    previousNoteDisplay.addClass("webtrails");
    previousNoteDisplay.html("Select text and press the save button to save notes.  Your last saved note will appear here");


    var linkToTrailWrapper = wt_$(document.createElement("div"));
    linkToTrailWrapper.css({
        height:"100%",
        width: "10%",
        "float": "right"
    });
    linkToTrailWrapper.addClass("webtrails");

    var linkToTrail = wt_$(document.createElement("a"));
    linkToTrail.css({
        "margin": "0 0 0 5px",
        "font-size": "12px",
        "display": "block",
        "color": "white",
        "font-weight": "bold",
        "border-radius": "5px"
    });
    linkToTrail.addClass("webtrails");

    wt_$(linkToTrail).html("View Trail");
    wt_$(linkToTrail).attr('href',"http://localhost:3000/trails/"+trailID);

    deleteNoteButton = wt_$(document.createElement("button"));
    deleteNoteButton.css({
        "font-size": "12px",
        "color": "white",
        "background-color": "transparent",
        "font-weight": "bold",
        height:"100%",
        width: "10%",
        "float": "right",
        "opacity": "0"
    });

    deleteNoteButton.html("Delete Note");
    deleteNoteButton.addClass("deleteNote").addClass("webtrails");

    saveSiteToTrailButton = wt_$(document.createElement("button"));
    saveSiteToTrailButton.css({
        "font-size": "12px",
        "color": "white",
        "background-color": "transparent",
        "font-weight": "bold",
        height:"100%",
        width: "10%",
        "float": "right",
        "border-radius": "5px"
    });
    saveSiteToTrailButton.addClass("webtrails");
    saveSiteToTrailButton.html("Save site");

    var shareTrailField = wt_$(document.createElement("input"));
    shareTrailField.css({
        "font-size": "12px",
        "color": "white",
        "background-color": "transparent",
        "font-weight": "bold",
        "height":"90%",
        "float": "right",
        "margin-left": "2%",
        "line-height": "25px",
        "text-align": "center",
        "padding": "0",
        "margin-top": "0",
        "outline": "none",
        "border-radius": "5px"
    });
    shareTrailField.addClass("webtrails");
    shareTrailField.attr("type", "text")
    shareTrailField.attr("id", "shareTrail");
    shareTrailField.attr("value", "Share Trail");

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
    });

    wt_$(trailDisplay).append(saveSiteToTrailButton);
    saveSiteToTrailButton.click(function(){saveSiteToTrail(setSiteID)});

    wt_$(trailDisplay).append(linkToTrailWrapper);
    wt_$(linkToTrailWrapper).append(linkToTrail);

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
}