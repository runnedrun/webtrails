console.log('toolbar ui loaded');

function initMyBookmarklet() {
    var displayHeight = "25px";
    trailDisplay = wt_$(document.createElement("div"));
    applyDefaultCSS(trailDisplay);
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
        "line-height": "18px",
        "border-bottom-right-radius": "7px",
        "border-bottom-left-radius": "7px",
        "border-bottom" : "1px solid #aaa",
        "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
        "left" : "0",
        "text-align":"center"
    });
    if(!toolbarShown){
        trailDisplay.css("display","none");
    }
    trailDisplay.disableSelection();

    settingsButton = wt_$(document.createElement("img"));
    applyDefaultCSS(settingsButton);
    settingsButton.attr('src', powerButtonUrl);
    settingsButton.addClass("webtrails");
    settingsButton.css({
        margin: "0",
        padding: "0",
        "margin-top": "6px",
        "cursor": "pointer"

    });

    settingsButtonWrapper = wt_$("<div>")
    applyDefaultCSS(settingsButtonWrapper);
    settingsButtonWrapper.append(settingsButton)
    settingsButtonWrapper.css({
        margin: "0",
        padding: "0",
        height: "100%",
        "float": "right",
        "padding-right": "5px",
        "padding-left": "5px",
        "border-bottom-right-radius": "7px",
        "cursor": "pointer"
    })
    settingsButtonWrapper.addClass("webtrails");
    settingsButtonWrapper.addClass("wt_settingsButton");

    noteDisplayWrapper = wt_$(document.createElement("div"));
    applyDefaultCSS(noteDisplayWrapper);
    noteDisplayWrapper.css({
        "height":"18px",
        "width": "30%",
        "float":"right",
        "margin-left": "3%",
        "opacity": "1",
        "overflow": "hidden",
        "margin-top": "2px",
        "border-top-left-radius": "5px",
        "border-bottom-left-radius": "5px",
        "background-color": "#d1d1d1",
        "border": "1px solid #aaa",
        "border-right-width": "0px",
        "cursor": "default"
    });
    noteDisplayWrapper.addClass("noteDisplayWrapper").addClass("webtrails");;

    previousNoteDisplay = wt_$(document.createElement("div"));
    applyDefaultCSS(previousNoteDisplay);
    previousNoteDisplay.css({
        "margin-left": "1%",
        "font-size": "12px",
        "overflow": "hidden",
        "text-overflow": "ellipsis",
        "text-align": "center"
    });
    previousNoteDisplay.addClass("webtrails");
    previousNoteDisplay.html("Select text and press the save button to save notes.  Your last saved note will appear here");


    var linkToTrailWrapper = wt_$(document.createElement("div"));
    applyDefaultCSS(linkToTrailWrapper);
    linkToTrailWrapper.css({
        "height":"100%",
        "display": "inline-block",
        "float": "left",
        "margin-top": "3px",
        "width": "7%",
        "overflow": "hidden",
        "margin-left": "1%"
    });
    linkToTrailWrapper.addClass("webtrails");

    var linkToTrail = wt_$(document.createElement("a"));
    applyDefaultCSS(linkToTrail);
    linkToTrail.css({
        "margin-left": "1%",
        "margin-right": "1%",
        "font-size": "12px",
        "color": "#333",
        "font-weight": "bold",
        "text-shadow": "1px 1px #F0f0f0",
        "text-decoration": "underline",
        "cursor":"pointer"
    });
    linkToTrail.addClass("webtrails");
//    linkToTrail.attr("target", "_blank");

    trailSelect = wt_$(document.createElement("select"));
//    applyDefaultCSS(trailSelect);
    trailSelect.css({
        "float": "left",
        "margin-left": "1%",
        "margin-right": "0px",
        "margin-top": "3px",
        "margin-bottom": "0",
        "width": "10%",
        "height": "18px",
        "font-size": "13px",
        "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif'
    });
    trailSelect.addClass("webtrails");
    trailSelect.change(trailSelectChanged);

    wt_$(linkToTrail).html("View Trail");
    wt_$(linkToTrail).click(function(event){
        window.open(webTrailsUrl + "/trails/"+currentTrailID, "_blank")
    })

//    wt_$(linkToTrail).attr('href', "#");

    deleteNoteButton = wt_$(document.createElement("button"));
    applyDefaultCSS(deleteNoteButton);
    deleteNoteButton.css({
        "font-size": "12px",
        "color": "#aaa",
        "background-color": "#f0f0f0",
        "font-weight": "bold",
        "height":"18px",
        "margin-top" : "2px",
        "margin-right": "1%",
        "width": "7%",
        "float": "right",
        "border": "1px solid #aaa",
        "border-top-right-radius": "5px",
        "border-bottom-right-radius": "5px",
        "cursor": "default",
        "text-align": "center"
    });

    deleteNoteButton.html("Delete Note");
    deleteNoteButton.addClass("deleteNote").addClass("webtrails");

    saveSiteToTrailButton = wt_$(document.createElement("button"));
    applyDefaultCSS(saveSiteToTrailButton);
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
        "margin-top": "2px",
        "line-height": "normal",
        "cursor": "pointer"
    });
    saveSiteToTrailButton.addClass("webtrails");
    saveSiteToTrailButton.html("Save site");

    var shareTrailField = wt_$(document.createElement("input"));
    applyDefaultCSS(shareTrailField);
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
        "cursor": "pointer"
    });
    shareTrailField.addClass("webtrails");
    shareTrailField.attr("type", "text");
    shareTrailField.attr("id", "shareTrail");
    shareTrailField.attr("value", "Share Trail");

    faviconHolder = wt_$(document.createElement("div"));
    applyDefaultCSS(faviconHolder);
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
        "width": "15%",
        "display": "inline-block",
        "overflow":"auto"
    });
    faviconHolder.addClass("webtrails");
    faviconHolder.attr("id", "faviconHolder");

    loggedOutMessage = wt_$("<div>");
    applyDefaultCSS(loggedOutMessage);
    loggedOutMessage.html("Hit the power button on the right to sign in using Google")
    loggedOutMessage.css({
        "margin-right": "auto",
        "margin-left": "auto",
        "height": "100%",
        "width": "30%",
        "padding-top": "5px",
        "font-size": "16px",
    });
    loggedOutMessage.addClass("loggedOutMessage");

    //adding all the toolbar elements to the DOM.
    wt_$(document.body).prepend(trailDisplay);

    trailDisplay.append(settingsButtonWrapper);

    trailDisplay.append(deleteNoteButton);
    deleteNoteButton.click(deletePreviousNote);
    deleteNoteButton.attr("enabled","disabled");

    trailDisplay.append(noteDisplayWrapper);

    noteDisplayWrapper.append(previousNoteDisplay);

    trailDisplay.append(shareTrailField);
    shareTrailField.click(function() {
        shareTrailField.attr("value", webTrailsUrl + '/trails/'+currentTrailID);
        shareTrailField.focus();
        shareTrailField.select();
        shareTrailField.css({"cursor": "text"});
    });

    trailDisplay.append(saveSiteToTrailButton);
    saveSiteToTrailButton.css({
        "text-align":"center"
    });
    saveSiteToTrailButton.click(function(){saveSiteToTrail()});

    trailDisplay.append(trailSelect);

    trailDisplay.append(linkToTrailWrapper);
    linkToTrailWrapper.append(linkToTrail);

    trailDisplay.append(faviconHolder);
    trailDisplay.append(loggedOutMessage);
    faviconHolder.mouseenter(growFaviconHolder).mouseleave(shrinkFaviconHolder)



    initializeAutoResize();
    initializeJqueryEllipsis();
    previousNoteDisplay.ellipsis()


    if (wt_auth_token){
        initSignedInExperience()
    }else{
        initSignedOutExperience()
    }
    //document bindings

    wt_$(document.body).keydown(verifyKeyPress);

    wt_$(document.body).mousedown(function() {
        mouseDown=1;
    });
    wt_$(document.body).mouseup(function(){
        mouseDown=0;
    });

    try {
        var bodymargin = wt_$('body').css('margin-left')
        if (bodymargin) {
            trailDisplay.css("margin-left", "-" + bodymargin);
        }
    }catch (e) {}
}

function initSignedInExperience(){
    loggedIn = true;
    if (!faviconsFetched){
        clearFaviconHolder();
        fetchFavicons();
        faviconsFetched = true;
    }
    trailDisplay.children().show();
    loggedOutMessage.hide();
    settingsButtonWrapper.css("background-color","#94FF70")
    settingsButtonWrapper.unbind("click");
    settingsButtonWrapper.click(function(){
        signOut();
        return false
    })
    wt_$(document).mousedown(possibleHighlightStart);
}

function initSignedOutExperience(){
    console.log("signing out");
    loggedIn = false;
    trailDisplay.children().not(".wt_settingsButton").hide();
    settingsButtonWrapper.css("background-color","#FF8080")
    loggedOutMessage.show();
    wt_$(document).unbind("mousedown");
    wt_$(".inlineSaveButton").remove();
    settingsButtonWrapper.unbind("click");
    settingsButtonWrapper.click(function(){
        signIn()
        return false
    })
}

function signOut(){
    chrome.runtime.sendMessage({logout:"now!"}, function(response) {
        initSignedOutExperience();
    });
}

function signIn(){
    chrome.runtime.sendMessage({login:"login"}, function(response) {
        wt_auth_token = response.wt_auth_token;
        initSignedInExperience();
    });
}


//function checkIfSignedIn(){
//    chrome.runtime.sendMessage({isUserSignedIn:"check"}, function(response) {
//        console.log(response.wt_auth_token);
//        wt_auth_token = response.wt_auth_token;
//    });
//}