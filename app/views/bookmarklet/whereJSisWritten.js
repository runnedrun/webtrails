var trailDisplay;
var mouseDown = 0;
var noteDisplay;
var previousNoteDisplay;
var noteDisplayWrapper;
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
        height:"40%%",
        width: "100%",
        position: "absolute",
        top:"5%",
        "padding-left": "5px",
        "border-left": "solid",
        "text-align":"left",
        "z-index": "0",
        opacity: ".8",
        background: "#2E2E1F",
        color: "#CCCCA3"
    });

    previousNoteDisplay = $(document.createElement("div"));
    previousNoteDisplay.css({
        height:"40%%",
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
        url: "http://localhost:3000/sites",
        type: "post",
        crossDomain: true,
        data: {
           "site[url]":currentSite,
           "site[trail_id]":trailID,
           "site[title]": document.title,
           "user": userID,
            notes: "none"
                },
        success: addFaviconsToDisplay
    })
}
function addFaviconsToDisplay(data){
    currentSiteTrailID = data["site_id"]
    $.each(data["sites"], function(i,site){
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

        if ((previousSpaceIndex + 1) !== startIndex){
            var wholeWord = startContainerText.slice(previousSpaceIndex+1,nextSpaceIndex);
            text = wholeWord.concat(text.substr(nextSpaceIndex-startIndex, text.length -1));
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

        if ((nextSpaceIndex - 1) !== endIndex){
            var wholeWord = endContainerText.slice(previousSpaceIndex+1,nextSpaceIndex);
            text = text.substr(0, text.length - (endIndex-previousSpaceIndex)).concat(" " + wholeWord);
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

//this is for adding a css class, in case I want to do text highlighting.

function applyClassToSelection(cssClass) {
    var uniqueCssClass = "selection_" + (++nextId);
    var sel = window.getSelection();
    if (sel.rangeCount < 1) {
        return;
    }
    var range = sel.getRangeAt(0);
    var startNode = range.startContainer, endNode = range.endContainer;

    if (endNode.nodeType == 3) {
        endNode.splitText(range.endOffset);
        range.setEnd(endNode, endNode.length);
    }

    if (startNode.nodeType == 3) {
        startNode = startNode.splitText(range.startOffset);
        range.setStart(startNode, 0);
    }

    var containerElement = range.commonAncestorContainer;
    if (containerElement.nodeType != 1) {
        containerElement = containerElement.parentNode;
    }

    var treeWalker = document.createTreeWalker(
        containerElement,
        NodeFilter.SHOW_TEXT,
        function(node) {
            return rangeIntersectsNode(range, node) ?
                NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
        false
    );

    var selectedTextNodes = [];
    while (treeWalker.nextNode()) {
        selectedTextNodes.push(treeWalker.currentNode);
    }

    var textNode, span;

    for (var i = 0, len = selectedTextNodes.length; i < len; ++i) {
        textNode = selectedTextNodes[i];
        span = document.createElement("span");
        span.className = cssClass + " " + uniqueCssClass;
        textNode.parentNode.insertBefore(span, textNode);
        span.appendChild(textNode);
    }

    return uniqueCssClass;
}

function removeSpansWithClass(cssClass) {
    var spans = document.body.getElementsByClassName(cssClass),
        span, parentNode;

    spans = Array.prototype.slice.call(spans, 0);

    for (var i = 0, len = spans.length; i < len; ++i) {
        span = spans[i];
        parentNode = span.parentNode;
        parentNode.insertBefore(span.firstChild, span);
        parentNode.removeChild(span);

        parentNode.normalize();
    }
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



