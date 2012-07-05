var trailDisplay;
var mouseDown = 0;
var noteDisplay;
var previousNoteDisplay;
var noteDisplayWrapper;
var linkToTrail;
var currentSiteTrailID;
var trailID = window.trailID;
var userID = window.userID;

var nextId = 0;
var rangeIntersectsNode = (typeof window.Range != "undefined"
        && Range.prototype.intersectsNode) ?

    function(range, node) {
        return range.intersectsNode(node);
    } :

    function(range, node) {
        var nodeRange = node.ownerDocument.createRange();
        try {
            nodeRange.selectNode(node);
        } catch (e) {
            nodeRange.selectNodeContents(node);
        }

        return range.compareBoundaryPoints(Range.END_TO_START, nodeRange) == -1 &&
            range.compareBoundaryPoints(Range.START_TO_END, nodeRange) == 1;
    };

function initMyBookmarklet() {
    trailDisplay = $(document.createElement("div"));
    trailDisplay.css({
        height:"10%",
        width: "100%",
        position:"fixed",
        top:"0px",
        "text-align":"left",
        "z-index": "1000",
        "padding-left":"10px",
        opacity: ".8",
        background: "#2E2E1F",
        color: "#CCCCA3"
    });

    noteDisplayWrapper = $(document.createElement("div"));
    noteDisplayWrapper.css({
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

    noteDisplay = $(document.createElement("div"));
    noteDisplay.css({
        height:"40%",
        width: "100%",
        top:"5%",
        "padding-left": "5px",
        "border-left": "solid",
        "text-align":"left",
        "z-index": "0",
        opacity: ".8",
        background: "#2E2E1F",
        color: "#CCCCA3",
        float: "right"
    });

    previousNoteDisplay = $(document.createElement("div"));
    previousNoteDisplay.css({
        height:"40%",
        width: "100%",
        position: "absolute",
        bottom:"5%",
        "padding-left": "5px",
        "border-top": "solid",
        "border-left": "solid",
        "text-align":"left",
        "z-index": "0",
        opacity: ".8",
        background: "#2E2E1F",
        color: "#CCCCA3",
        "overflow": "hidden",
        "text-overflow": "ellipsis"
    });

    linkToTrail = $(document.createElement("a"));
    linkToTrail.css({
        height:"100%",
        width: "40%",
        top:"0px",
        "text-align":"left",
        "float":"right",
        "z-index": "0",
        opacity: ".8",
        background: "#2E2E1F",
        "font-size": "24",
        color: "#CCCCA3"
    });

    //inserting global stylings
    var cssStyle = $(document.createElement("style"));
    $(document.getElementsByTagName("head")[0]).append(cssStyle);
    cssStyle.html(".siteFavicon {" +
        "padding-right: 5px;" +
        "padding-top: 10px;" +
        "float: left;"
    );

    //adding all the toolbar elements to the DOM.
    $(document.body).prepend(trailDisplay);

    trailDisplay.append(noteDisplayWrapper);
    noteDisplayWrapper.append(noteDisplay);
    noteDisplayWrapper.append(previousNoteDisplay);
    noteDisplay.html("Select text and hold down mouse to save notes");
    previousNoteDisplay.html("Your last saved note will appear here");
    noteDisplay.addClass("noteDisplay");

    $(trailDisplay).append(linkToTrail);
    $(linkToTrail).html("View Trail");
    $(linkToTrail).attr('href',"http://localhost:3000/trails/"+trailID);



    initializeJqueryEllipsis();
    noteDisplay.ellipsis();
    previousNoteDisplay.ellipsis();

    $(document.body).keypress(verifyKeyPress);
    document.onmousemove = mouseStopDetect();

    document.body.onmousedown = function() {
     mouseDown=1;
    };
    document.body.onmouseup = function() {
      mouseDown=0;
    };

    fetchFavicons();
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
    var currentSite = window.location.href;
    $.ajax({
        url: "http://localhost:3000/sites",
        type: "post",
        crossDomain: true,
        data: {
           "site[id]":currentSiteTrailID,
           "site[url]":currentSite,
           "site[trail_id]":trailID,
           "site[title]": document.title,
           "user": userID,
            notes: "none",
            html: document.getElementsByTagName('html')[0].innerHTML
            }
    })
}

function fetchFavicons(){
    var currentSite = window.location.href;
    $.ajax({
        url: "http://localhost:3000/trail/site_list",
        type: "get",
        crossDomain: true,
        data: {
            "trail_id": trailID,
            "current_url": currentSite
        },
        success: addFaviconsToDisplay
    })
}

function addFaviconsToDisplay(data){
    currentSiteTrailID = data["site_id"]
    $.each(data.favicons_and_urls, function(i,favicon_and_url){
            addSiteFaviconToDisplay(favicon_and_url[0],favicon_and_url[1]);
        }
    )
    addSiteToTrail();
}


function addSiteFaviconToDisplay(domain,url) {
    trailDisplay.prepend("<a href="+ url+ "\" class=\"siteFavicon\"><img src='"+ domain + "'></a>")
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


function smartGrabHighlightedText(){
   textObject = window.getSelection().getRangeAt(0);
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
       if (nextSpaceIndex && previousSpaceIndex){
        if ((previousSpaceIndex + 1) !== startIndex){
            var wholeWord = startContainerText.slice(previousSpaceIndex+1,nextSpaceIndex);
            text = wholeWord.concat(text.substr(nextSpaceIndex-startIndex, text.length -1));
            }
        }else{
           var wholeWord = startContainerText;
           text = wholeWord.concat(text.substr(startContainerText.length-startIndex, text.length -1));
       }
   }
    if (text[text.length-1] == " "){
       text = rtrim(text);
   }else{
       var endIndex = textObject.endOffset;
       spaceIndices = [];
       var endContainerText = textObject.endContainer.textContent;
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

        if (nextSpaceIndex && previousSpaceIndex){
            if ((nextSpaceIndex - 1) !== endIndex){
                var wholeWord = endContainerText.slice(previousSpaceIndex+1,nextSpaceIndex);
                text = text.substr(0, text.length - (endIndex-previousSpaceIndex)).concat(" " + wholeWord);
                }
        }else{
            var wholeWord = endContainerText;
            text = text.substr(0, text.length - endIndex).concat(wholeWord);
        }

   }
   return text
}

function mouseStopDetect (){
    var onmousestop = function() {
    if (mouseDown && String(window.getSelection())){
        window.getSelection().removeAllRanges();
        var noteContent = noteDisplay.html();
        $.ajax({
        url: "http://localhost:3000/notes",
        type: "post",
        crossDomain: true,
        data: {
           "note[content]":noteContent,
           "note[site_id]":currentSiteTrailID,
           "note[scroll_x]": window.scrollX,
           "note[scroll_y]": window.scrollY
        }
        })
        moveNoteToPrevious(noteContent);
    }
    }, thread;

    return function() {
        if (mouseDown && String(window.getSelection())){
            var text = smartGrabHighlightedText();
            $(".noteDisplay").html(text);
        }
        clearTimeout(thread);
        thread = setTimeout(onmousestop, 1000);
    };
}

function moveNoteToPrevious(noteContent){
    noteDisplay.fadeOut(100);
    noteDisplay.html("Great! Now go ahead and select more notes.");
    previousNoteDisplay.fadeOut(100);
    previousNoteDisplay.html(noteContent);
    previousNoteDisplay.fadeIn(100);
    noteDisplay.fadeIn(100);
}

function ltrim(stringToTrim) {
	return stringToTrim.replace(/^\s+/,"");
}
function rtrim(stringToTrim) {
	return stringToTrim.replace(/\s+$/,"");
}

// This is for ellipsing on Firefox

/*
 * MIT LICENSE
 * Copyright (c) 2009-2011 Devon Govett.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

function initializeJqueryEllipsis(){
    (function($) {
        $.fn.ellipsis = function(enableUpdating){
            var s = document.documentElement.style;
            if (!('textOverflow' in s || 'OTextOverflow' in s)) {
                return this.each(function(){
                    var el = $(this);
                    if(el.css("overflow") == "hidden"){
                        var originalText = el.html();
                        var w = el.width();

                        var t = $(this.cloneNode(true)).hide().css({
                            'position': 'absolute',
                            'width': 'auto',
                            'overflow': 'visible',
                            'max-width': 'inherit'
                        });
                        el.after(t);

                        var text = originalText;
                        while(text.length > 0 && t.width() > el.width()){
                            text = text.substr(0, text.length - 1);
                            t.html(text + "...");
                        }
                        el.html(t.html());

                        t.remove();

                        if(enableUpdating == true){
                            var oldW = el.width();
                            setInterval(function(){
                                if(el.width() != oldW){
                                    oldW = el.width();
                                    el.html(originalText);
                                    el.ellipsis();
                                }
                            }, 200);
                        }
                    }
                });
            } else return this;
        };
    })(jQuery);
}



