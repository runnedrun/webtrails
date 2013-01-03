console.log('toolbar ui loaded');

function initMyBookmarklet() {
    var displayHeight = "25px";
    trailDisplay = $(document.createElement("div"));
    trailDisplay.css({
        height:displayHeight,
        width: "100%",
        position:"fixed",
        top:"0px",
        "text-align":"left",
        "z-index": "1000",
        "padding-left":"10px",
        opacity: ".8",
        background: "#2E2E1F",
        color: "white",
        "line-height": "25px",
        "display":"none"
    });

    noteDisplayWrapper = $(document.createElement("div"));
    noteDisplayWrapper.css({
        height:"100%",
        width: "40%",
        "float":"right",
        "margin-left": "3%",
        "border-left": "solid",
        "opacity": "1",
        overflow: "hidden"
    });
    noteDisplayWrapper.addClass("noteDisplayWrapper");

    previousNoteDisplay = $(document.createElement("div"));
    previousNoteDisplay.css({
        "margin": "0 0 0 5px",
        "font-size": "12px",
        "overflow": "hidden",
        "text-overflow": "ellipsis"
    });
    previousNoteDisplay.html("Select text and press the save button to save notes.  Your last saved note will appear here");


    var linkToTrailWrapper = $(document.createElement("div"));
    linkToTrailWrapper.css({
        height:"100%",
        width: "10%",
        "float": "right"
    });

    var linkToTrail = $(document.createElement("a"));
    linkToTrail.css({
        "margin": "0 0 0 5px",
        "font-size": "12px",
        "display": "block",
        "color": "white",
        "font-weight": "bold"
    });

    $(linkToTrail).html("View Trail");
    $(linkToTrail).attr('href',"http://localhost:3000/trails/"+trailID);

    deleteNoteButton = $(document.createElement("button"));
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
    deleteNoteButton.addClass("deleteNote");

    saveSiteToTrailButton = $(document.createElement("button"));
    saveSiteToTrailButton.css({
        "font-size": "12px",
        "color": "white",
        "background-color": "transparent",
        "font-weight": "bold",
        height:"100%",
        width: "10%",
        "float": "right"
    });

    saveSiteToTrailButton.html("Save site");

    var shareTrailButton = $(document.createElement("button"));
    shareTrailButton.css({
        "font-size": "12px",
        "color": "white",
        "background-color": "transparent",
        "font-weight": "bold",
        height:"100%",
        width: "10%",
        "float": "right",
        "margin-left": "2%"
    })

    shareTrailButton.html("Share Trail");

    //inserting global stylings
    var cssStyle = $(document.createElement("style"));
    $(document.getElementsByTagName("head")[0]).append(cssStyle);
    cssStyle.html(".siteFavicon {" +
        "padding-right: 2.5px;" +
        "float: left;" +
        "overflow: hidden;" +
        "display: block;" +
        "height: 20px;" +
        "border: none;" +
        "}" +
        ".siteFavicon img { " +
        "height: 20px;" +
        "margin: 0" +
        "}"
    );

    //adding all the toolbar elements to the DOM.
    $(document.body).prepend(trailDisplay);

    $(trailDisplay).append(deleteNoteButton);
    deleteNoteButton.click(deletePreviousNote);
    deleteNoteButton.attr("disabled","disabled");

    $(trailDisplay).append(noteDisplayWrapper);

    $(noteDisplayWrapper).append(previousNoteDisplay);

    $(trailDisplay).append(shareTrailButton);
    shareTrailButton.click(revealTrailURL);

    $(trailDisplay).append(saveSiteToTrailButton);
    saveSiteToTrailButton.click(function(){saveSiteToTrail(setSiteID)});

    $(trailDisplay).append(linkToTrailWrapper);
    $(linkToTrailWrapper).append(linkToTrail);

    initializeAutoResize();
    initializeJqueryEllipsis();
    previousNoteDisplay.ellipsis();

    //document bindings

    document.onkeydown = verifyKeyPress;

    document.body.onmousedown = function() {
        mouseDown=1;
    };
    document.body.onmouseup = function() {
        mouseDown=0;
    };

    fetchFavicons();
    $(document).mousedown(possibleHighlightStart);
}