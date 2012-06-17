var v = "1.4.1";
var trailDisplay;
var trailID = 3;
var script = document.createElement("script");
script.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
script.onload = script.onreadystatechange = initMyBookmarklet;
document.getElementsByTagName("head")[0].appendChild(script);


function initMyBookmarklet() {
    trailDisplay = $(document.createElement("div"));
    trailDisplay.css({
        height:"6%",
        width: "100%",
        position:"fixed",
        top:"0px",
        "text-align":"left",
        float:"left",
        "z-index": "1000",
        opacity: ".8",
        background: "#2E2E1F",
        color: "#CCCCA3"
    });
    noteDisplay = $(document.createElement("div"));
    noteDisplay.css({
        height:"100%",
        width: "40%",
        top:"0px",
        "text-align":"left",
        "float":"right",
        "z-index": "0",
        opacity: ".8",
        background: "#2E2E1F",
        color: "#CCCCA3"
    });
    $(document.body).prepend(trailDisplay);
    trailDisplay.append(noteDisplay);
    noteDisplay.html("Select text and hold down mouse to save notes");
    $(document.body).keypress(verifyKeyPress);
    document.onmousemove = mouseStopDetect;
    addSiteToTrail();
}

function verifyKeyPress(e){
var code = (e.keyCode ? e.keyCode : e.which);
if (code == 27){
    showOrHidePathDisplay();
}
}

function showOrHidePathDisplay(){
    if (trailDisplay.is(":hidden")){
        trailDisplay.show();
     }
    else {
        trailDisplay.hide();
    }

}

function addSiteToTrail(){
    currentSite = window.location.href;
    $.ajax({
        url: "http://192.168.1.3:3000/sites",
        type: "post",
        crossDomain: true,
        data: {
           "site[url]":currentSite,
           "site[trail_id]":trailID,
            notes: "none"
                },
        success: addFaviconsToDisplay
    })
}
function addFaviconsToDisplay(data){
    $.each(data, function(i,site){
        addSiteFaviconToDisplay(site.slice(7,site.length-1).split("/")[0],site);
        }
    )
}


function addSiteFaviconToDisplay(domain,url) {
    trailDisplay.prepend("<a href="+ url+ "\" class=\"siteFavicon\"><img src=\"http://www.google.com/s2/favicons?domain=" + domain + "\"/></a>")
}

function includeTrailSubString(arr,subString) {
    for(var i=0; i<arr.length; i++) {
        var key = arr[i].split("=")[0];
        if (key.trim() == subString.trim()){
            return arr[i].split("=")[1];
        } ;
    }
    return ""
}


function fillTextDivWithText(){

}

function smartGrabHighlightedText(textObject){
   var text = String(textObject);
   if (text[0] == " "){
       text = ltrim(text);
   }else{

       var startIndex = textObject.startOffset;
       var spaceIndices = [];
       var startContainerText = textObject.startContainer.textContent;
       $.each(startContainerText, function(i,character){
            if (character==" ") {
                spaceIndices.push(i);
                if (i >= startIndex){
                    return false
                }
            }
       });
       nextSpaceIndex= spaceIndices.pop();
       previousSpaceIndex = spaceIndices.pop();

        if ((previousSpaceIndex + 1) !== startIndex){
            var wholeWord = startContainerText.slice(previousSpaceIndex+1,nextSpaceIndex);
            text = wholeWord.concat(text.substr(nextSpaceIndex-startIndex, text.length -1));
        }
   }
    if (text[text.length-1] == " "){
       text = rtrim(text);
   }else{
       endIndex = textObject.endOffset;
       spaceIndices = [];
       endContainerText = textObject.endContainer.textContent;
       $.each(endContainerText, function(i,character){
            if (character==" ") {
                spaceIndices.push(i);
                if (i>=endIndex){
                    return false
                }
            }
       });

       nextSpaceIndex= spaceIndices.pop();
       previousSpaceIndex = spaceIndices.pop();

        if ((nextSpaceIndex - 1) !== endIndex){
            var wholeWord = endContainerText.slice(previousSpaceIndex+1,nextSpaceIndex);
            text = text.substr(0, text.length - (endIndex-previousSpaceIndex)).concat(" " + wholeWord);
        }

   }
   return text
}


function mouseStopDetect (){
    var onmousestop = function() {
    console.log("mouse stopped")
    }, thread;

    return function() {
        clearTimeout(thread);
        thread = setTimeout(onmousestop, 1000);
    };
}

function ltrim(stringToTrim) {
	return stringToTrim.replace(/^\s+/,"");
}
function rtrim(stringToTrim) {
	return stringToTrim.replace(/\s+$/,"");
}







