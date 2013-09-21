console.log('toolbar ui loaded');

function makeToolBar() {
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
//        "border-bottom-right-radius": "7px",
//        "border-bottom-left-radius": "7px",
        "border-bottom" : "1px solid #aaa",
        "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
        "left" : "0",
        "text-align":"center"
    });
//    if(!toolbarShown){
        trailDisplay.css("display","none");
//    }
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

    previousNoteButton = wt_$(document.createElement("button"));
    applyDefaultCSS(previousNoteButton);
    previousNoteButton.css({
        "font-size": "12px",
//        "color": "#aaa",
        "font-weight": "bold",
        "height": "18px",
        "margin-top" : "2px",
        "margin-left": "3%",
        "width": "7%",
        "float": "right",
        "border": "1px solid #aaa",
        "border-top-left-radius": "5px",
        "border-bottom-left-radius": "5px",
        "background-color": "#dedede",
        "cursor": "default",
        "text-align": "center"
    });
    previousNoteButton.html("Previous Note");
    previousNoteButton.addClass("previousNoteButton").addClass("webtrails");;

    nextNoteButton = wt_$(document.createElement("button"));
    applyDefaultCSS(nextNoteButton);
    nextNoteButton.css({
        "font-size": "12px",
//        "color": "#aaa",
        "background-color": "#f0f0f0",
        "font-weight": "bold",
        "height":"18px",
        "margin-top" : "2px",
        "margin-right": "5px",
        "width": "7%",
        "float": "right",
        "border": "1px solid #aaa",
        "border-top-right-radius": "5px",
        "border-bottom-right-radius": "5px",
        "background-color": "#dedede",
        "cursor": "default",
        "text-align": "center"
    });
    nextNoteButton.addClass("nextNoteButton").addClass("webtrails");
    nextNoteButton.html("Next Note");

    deleteNoteButton = wt_$(document.createElement("img"));
    applyDefaultCSS(deleteNoteButton);
    deleteNoteButton.css({
        "font-size": "12px",
//        "color": "#aaa",
//        "background-color": "#FF8080",
        "font-weight": "bold",
        "height":"18px",
        "margin-top" : "2px",
        "margin-right": "5px",
        "width": "18px",
        "float": "right",
        "border": "1px solid #aaa",
        "border-radius": "5px",
        "cursor": "default",
        "text-align": "center"
    });
    deleteNoteButton.attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAQCAQAAABnqj2yAAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACDSURBVHjavI4xCsJQEETfBltlO8Nv9AqpPICl5/CwniJo8dFCCNo7Fn8DxnxbB4aBfczumvilRYlk9GwAOOdtMCHEwTrJ5fJOipmJJGhoyaUfmc0EXj01mIA0+yUbNGXJ/jg1BILLfeoPVNM/kQnYXYf1kiej/XZqA7H6ar94jKiq9wBVaTFDLLMAdgAAAABJRU5ErkJggg==");
    deleteNoteButton.addClass("deleteNoteButton").addClass("webtrails");

    showCommentButton = wt_$(document.createElement("img"));
    applyDefaultCSS(showCommentButton);
    showCommentButton.css({
        "font-size": "12px",
//        "color": "#aaa",
//        "background-color": "#FF8080",
        "font-weight": "bold",
        "height":"14px",
        "margin-top" : "2px",
        "margin-right": "50px",
        "width": "14px",
        "float": "right",
        "padding": "2px",
        "border": "1px solid #aaa",
        "border-radius": "5px",
        "cursor": "default",
        "text-align": "center"
    });
    showCommentButton.attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAQAAAD8fJRsAAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABdSURBVHjaYpR8zyDAgAk+MBr+Z8Ii/o+BCZswAwMTA3ZxBgaqSjB/wSbM/IXxvw0Di8l+BgbuOzMKNL/CZf4wMDAwMBj/t7t9zuE/C5o2SX6swgwM/1n+m2AKAwYAj4MXXMHl+7EAAAAASUVORK5CYII=");
    showCommentButton.addClass("showCommentButton").addClass("webtrails");


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
        window.open(webTrailsUrl + "/trails/"+Trails.getCurrentTrailId(), "_blank")
    })

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

//    var trailPreviewIframe = wt_$("<iframe class='wt-trail-preview'></iframe>");
//    applyDefaultCSS((trailPreviewIframe));
//    trailPreviewIframe.css({
//        height: "200px",
//        display: "none",
//        width: "100%",
//        "z-index": "2147483647",
//        position: "relative",
//        top: "25px",
//        border: "4px solid black"
//    })


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
//    wt_$(document.body).prepend(trailPreviewIframe);
    wt_$(document.body).prepend(trailDisplay);

    trailDisplay.append(settingsButtonWrapper);

    trailDisplay.append(showCommentButton)
    trailDisplay.append(deleteNoteButton)
    trailDisplay.append(nextNoteButton);
//    deleteNoteButton.click(deletePreviousNote);
//    deleteNoteButton.attr("enabled","disabled");
    trailDisplay.append(previousNoteButton);

    trailDisplay.append(shareTrailField);
    shareTrailField.click(function() {
        shareTrailField.attr("value", webTrailsUrl + '/trails/'+Trails.getCurrentTrailId());
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
    insertTrailPreview();
//    setTimeout(insertTrailPreview,5000);
//    runWhenLoaded(function(){
//        console.log("about to insert trail preview");
//        setTimeout(insertTrailPreview,1000);
//    });

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

function insertTrailPreview(){
    console.log("inserting the trail preview");
    TrailPreview = new TPreview();
    TrailPreview.init();
}

function initSignedInExperience(){
    loggedIn = true;
    if (!faviconsFetched){
        clearFaviconHolder();
        fetchFavicons();
        faviconsFetched = true;
    }
    trailDisplay.children().not(".wt-site-preview").show();
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