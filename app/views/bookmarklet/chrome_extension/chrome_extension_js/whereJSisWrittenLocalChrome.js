siteHTML = document.getElementsByTagName('html')[0].innerHTML;

var trailDisplay;
var mouseDown = 0;
var previousNoteDisplay;
var noteDisplayWrapper;
var currentSiteTrailID;
var trailID = 4;
var userID = 3;
var saveSiteToTrailButton;
var deleteNoteButton;
var previousNoteID;
String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

initMyBookmarklet();

function initMyBookmarklet() {
    var displayHeight = "25px";
    trailDisplay = $(document.createElement("div"));
    trailDisplay.addClass("trailDisplay");
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
        "line-height": "25px"
    });

    noteDisplayWrapper = $(document.createElement("div"));
    noteDisplayWrapper.css({
        height:"100%",
        width: "40%",
        "float":"right",
        "margin-left": "3%",
        "border-left": "solid",
        "opacity": "0",
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
    previousNoteDisplay.html("Select text and hold down mouse to save notes.  Your last saved note will appear here");


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
        "padding-top: 2.5px;" +
        "float: left;" +
        "overflow: hidden;" +
        "display: block;" +
        "}" +
        ".siteFavicon img { " +
        "height: 20px;" +
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
    saveSiteToTrailButton.click(addSiteToTrail);

    $(trailDisplay).append(linkToTrailWrapper);
    $(linkToTrailWrapper).append(linkToTrail);

    initializeAutoResize();
    initializeJqueryEllipsis();
    rangy.init();
    previousNoteDisplay.ellipsis();

    //document bindings

    $(document.body).keypress(verifyKeyPress);

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
            html: siteHTML
            }
    })
//    document.onmousemove = mouseStopDetect();
    $(document).mousedown(possibleHighlightStart);
    saveSiteToTrailButton.attr("disabled","disabled");
    saveSiteToTrailButton.html("Site saved");
    noteDisplayWrapper.fadeTo(200,1);
    deleteNoteButton.fadeTo(200,1);
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

function revealTrailURL(e){
    var urlDisplay = $(document.createElement("span"));
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

function smartGrabHighlightedText(){
   var textObject = window.getSelection().getRangeAt(0);
   var text = String(textObject);
//   return text

   //this is still a bit sketchy, another days work.
   if (text[0] == " "){
       text = ltrim(text);
   }else{
       var startIndex = textObject.startOffset;
       var startContainerText = textObject.startContainer.textContent;
       var textToAddToStartOfHighlight = ""
       for (i=startIndex-1;i > -1; i--){
           var character = startContainerText[i];
            if (character==" ") {
                break
            }
           textToAddToStartOfHighlight = character + textToAddToStartOfHighlight;
       }
       console.log(textToAddToStartOfHighlight);
       text = textToAddToStartOfHighlight + text;
       console.log(text);
   }
    if (text[text.length-1] == " "){
       text = rtrim(text);
   }else{
        var endIndex = textObject.endOffset;
        var endContainerText = textObject.endContainer.textContent;
        var textToAddToEndOfHighlight = ""
        for (i=endIndex;i < endContainerText.length;i++){
            var character = endContainerText[i];
            if (character==" ") {
                break
            }
            textToAddToEndOfHighlight += character;
        }
        console.log(textToAddToEndOfHighlight);
        text += textToAddToEndOfHighlight;
    }
   return text
}

function makeCommentOverlay(xPos, yPos, spacing,noteContent){
    var overlayHeight =spacing;
    var overlayWidth = 400;

    var topPosition  =  yPos + spacing
    var leftPosition = xPos > overlayWidth ? (xPos - overlayWidth) : xPos;

    var commentOverlay = $(document.createElement("div"));
    commentOverlay.css({
        "background": "#2E2E1F",
        "opacity": .9,
        "color":"white",
        "position":"absolute"
    });
    commentOverlay.css("top", topPosition+"px");
    commentOverlay.css("left", leftPosition+"px");
    commentOverlay.addClass("commentOverlay");

    var commentDescription = $(document.createElement("div"))
    commentDescription.html("Hit enter, click away or type a comment here")
    commentDescription.css({
        "border": "2px solid black"
    });

    var commentBox = $(document.createElement("textarea"));
    commentBox.css({
        "font-size":"12px",
        "overflow": "hidden",
        "resize": "none",
        "border": "4px solid black",
        "border-radius": "4px",
        "color": "black",
        "height": String(overlayHeight)+"px",
        "width": String(overlayWidth)+"px",
        "z-index": "9999"
    });

    $(document.body).append(commentOverlay);
    $(commentOverlay).append(commentDescription);
    $(commentOverlay).append(commentBox);
    commentBox.keydown((function(noteContent,commentOverlay,xPos){return (function (e){postNoteAndComment(e,noteContent,commentOverlay,xPos,yPos)})})(noteContent,commentOverlay,xPos));
    $(document).mousedown((function(noteContent,commentOverlay,yPos){return (function (e){clickAway(e,noteContent,commentOverlay,xPos,yPos)})})(noteContent,commentOverlay,yPos));
    commentBox.autosize();
    commentBox.focus();
//    commentBox.val("Hit enter, click away or type a comment now");
    var parsedNoteContent = noteContent.replace(/\r\r/gm,"\r ");
    parsedNoteContent = parsedNoteContent.replace(/\n\n/gm,"\n ");
    parsedNoteContent = parsedNoteContent.replace(/\r\n\r\n/gm,"\r\n ");

    doHighlight(document,"trailHighlight",parsedNoteContent);
    $(".trailHighlight").css("background-color","yellow");
//    makePlaceholder(commentBox);
    return commentBox;
}

function postNoteAndComment(e,content,commentOverlay,xPos,yPos){
    if (e.keyCode == 13){
        submitNote(content,commentOverlay.find("textarea").val(),xPos,yPos);
        closeOverlay(commentOverlay);
    }
}

function mouseStopDetect (){
    var onmousestop = function(e) {
        if (mouseDown && String(window.getSelection())){
            var textNodeLineHeight = getComputedStyleOfElement(window.getSelection().getRangeAt(0).startContainer.parentNode,"lineHeight");
            var noteContent = smartGrabHighlightedText();
            makeCommentOverlay(e.pageX, e.pageY,parseInt(textNodeLineHeight.replace("px","")),noteContent);
        }
    }, thread;

    return function(e) {
        clearTimeout(thread);
        thread = setTimeout(function(){onmousestop(e)}, 700);
    };
}

function possibleHighlightStart(){
    var startingSelectionCopy = window.getSelection().toString().slice(0);
    $(document).mouseup(function(){highlightedTextDetect(startingSelectionCopy)});
}

function highlightedTextDetect(startingHighlight){
    $(document).unbind("mouseup");
    if (!window.getSelection().isCollapsed){
        addSaveButtonNextToNote(window.getSelection().getRangeAt(0));
    }
}
//onmouusedown
//function preventDoubleHighlightBug(e){
//    var highlightedText = window.getSelection().getRangeAt(0);
//    if (!highlightedText.isCollapsed){
//        $(document.mouseUpaddSaveButtonNextToNote(highlightedText);
//    }
//}

function moveNoteToPrevious(noteContent){
    previousNoteDisplay.fadeOut(100);
    previousNoteDisplay.html(noteContent);
    previousNoteDisplay.fadeIn(100);
}

function submitNote(content,comment,commentLocationX,commentLocationY){
    $.ajax({
        url: "http://localhost:3000/notes",
        type: "post",
        crossDomain: true,
        data: {
            "note[content]": content,
            "note[comment]": comment,
            "note[comment_location_x]": commentLocationX,
            "note[comment_location_y]": commentLocationY,
            "note[site_id]": currentSiteTrailID,
            "note[scroll_x]": window.scrollX,
            "note[scroll_y]": window.scrollY
        },
        success: updateNoteDisplay
    })
}

function deletePreviousNote(){
    $.ajax({
        url: "http://localhost:3000/notes/delete",
        type: "post",
        crossDomain: true,
        data: {
            "id": previousNoteID
        },
        success: updateNoteDisplay
    })
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

function ltrim(stringToTrim) {
	return stringToTrim.replace(/^\s+/,"");
}
function rtrim(stringToTrim) {
	return stringToTrim.replace(/\s+$/,"");
}

function getComputedStyleOfElement(element,stylename){
    return document.defaultView.getComputedStyle(element,null)[stylename];
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
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES Oppeared in the early 1960s, teenagers in superhero comic books were usually relegaR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
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

// Autosize 1.9.1 - jQuery plugin for textareas
// (c) 2011 Jack Moore - jacklmoore.com
// license: www.opensource.org/licenses/mit-license.php


function initializeAutoResize(){
    (function ($) {
        var
            hidden = 'hidden',
            borderBox = 'border-box',
            copy = '<textarea tabindex="-1" style="position:absolute; top:-9999px; left:-9999px; right:auto; bottom:auto; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden">',
        // line-height is omitted because IE7/IE8 doesn't return the correct value.
            copyStyle = [
                'fontFamily',
                'fontSize',
                'fontWeight',
                'fontStyle',
                'letterSpacing',
                'textTransform',
                'wordSpacing',
                'textIndent'
            ],
            oninput = 'oninput',
            onpropertychange = 'onpropertychange',
            test = $(copy)[0];

        test.setAttribute(oninput, "return");

        if ($.isFunction(test[oninput]) || onpropertychange in test) {
            $.fn.autosize = function (className) {
                return this.each(function () {
                    var
                        ta = this,
                        $ta = $(ta),
                        mirror,
                        minHeight = $ta.height(),
                        maxHeight = parseInt($ta.css('maxHeight'), 10),
                        active,
                        i = copyStyle.length,
                        resize,
                        boxOffset = 0;

                    if ($ta.css('box-sizing') === borderBox || $ta.css('-moz-box-sizing') === borderBox || $ta.css('-webkit-box-sizing') === borderBox){
                        boxOffset = $ta.outerHeight() - $ta.height();
                    }

                    if ($ta.data('mirror') || $ta.data('ismirror')) {
                        // if autosize has already been applied, exit.
                        // if autosize is being applied to a mirror element, exit.
                        return;
                    } else {
                        mirror = $(copy).data('ismirror', true).addClass(className || 'autosizejs')[0];

                        resize = $ta.css('resize') === 'none' ? 'none' : 'horizontal';

                        $ta.data('mirror', $(mirror)).css({
                            overflow: hidden,
                            overflowY: hidden,
                            wordWrap: 'break-word',
                            resize: resize
                        });
                    }

                    // Opera returns '-1px' when max-height is set to 'none'.
                    maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 9e4;

                    // Using mainly bare JS in this function because it is going
                    // to fire very often while typing, and needs to very efficient.
                    function adjust() {
                        var height, overflow;
                        // the active flag keeps IE from tripping all over itself.  Otherwise
                        // actions in the adjust function will cause IE to call adjust again.
                        if (!active) {
                            active = true;

                            mirror.value = ta.value;

                            mirror.style.overflowY = ta.style.overflowY;

                            // Update the width in case the original textarea width has changed
                            mirror.style.width = $ta.css('width');

                            // Needed for IE to reliably return the correct scrollHeight
                            mirror.scrollTop = 0;

                            // Set a very high value for scrollTop to be sure the
                            // mirror is scrolled all the way to the bottom.
                            mirror.scrollTop = 9e4;

                            height = mirror.scrollTop;
                            overflow = hidden;
                            if (height > maxHeight) {
                                height = maxHeight;
                                overflow = 'scroll';
                            } else if (height < minHeight) {
                                height = minHeight;
                            }
                            ta.style.overflowY = overflow;

                            ta.style.height = height + boxOffset + 'px';

                            // This small timeout gives IE a chance to draw it's scrollbar
                            // before adjust can be run again (prevents an infinite loop).
                            setTimeout(function () {
                                active = false;
                            }, 1);
                        }
                    }

                    // mirror is a duplicate textarea located off-screen that
                    // is automatically updated to contain the same text as the
                    // original textarea.  mirror always has a height of 0.
                    // This gives a cross-browser supported way getting the actual
                    // height of the text, through the scrollTop property.
                    while (i--) {
                        mirror.style[copyStyle[i]] = $ta.css(copyStyle[i]);
                    }

                    $('body').append(mirror);

                    if (onpropertychange in ta) {
                        if (oninput in ta) {
                            // Detects IE9.  IE9 does not fire onpropertychange or oninput for deletions,
                            // so binding to onkeyup to catch most of those occassions.  There is no way that I
                            // know of to detect something like 'cut' in IE9.
                            ta[oninput] = ta.onkeyup = adjust;
                        } else {
                            // IE7 / IE8
                            ta[onpropertychange] = adjust;
                        }
                    } else {
                        // Modern Browsers
                        ta[oninput] = adjust;
                    }

                    $(window).resize(adjust);

                    // Allow for manual triggering if needed.
                    $ta.bind('autosize', adjust);

                    // Call adjust in case the textarea already contains text.
                    adjust();
                });
            };
        } else {
            // Makes no changes for older browsers (FireFox3- and Safari4-)
            $.fn.autosize = function () {
                return this;
          color:"white";   };
        }

    }(jQuery));
}

function makePlaceholder(element){
    element.keydown(function (e) {
        var input = $(e.target);

        if (input && !input.data('data-entered')) {
            input.data('data-entered', true);
            input.val("");
        }
        }
    )

    // Restore the default text if empty on blur
    element.blur(function (e) {
        var input = $(e.target);

        if (input && input.val() === "") {
            input.data('data-entered', false);
            input.val(input.data('blank-value'));
        }
        }
    )

    element.data('blank-value', element.val());
    element.data('data-entered', false);
}

function doHighlight(node,className,searchFor,which){
    var doc = document;

    // normalize node argument
    if (typeof node === 'string') {
        node = doc.getElementById(node);
    }

    // normalize search arguments, here is what is accepted:
    // - single string
    // - single regex (optionally, a 'which' argument, default to 0)
    if (typeof searchFor === 'string') {
        // rhill 2012-01-29: escape regex chars first
        // http://stackoverflow.com/questions/280793/case-insensitive-string-replacement-in-javascript
        searchFor = new RegExp(searchFor.replace(/[.*+?|()\[\]{}\\$^]/g,'\\$&'),'ig');
    }
    which = which || 0;

    // initialize root loop
    var indices = [],
        text = [], // will be morphed into a string later
        iNode = 0,
        nNodes = node.childNodes.length,
        nodeText,
        textLength = 0,
        stack = [],
        child, nChildren,
        state;
    // collect text and index-node pairs
    for (;;){
        while (iNode<nNodes){
            child=node.childNodes[iNode++];
            // text: collect and save index-node pair
            if (child.nodeType === 3){
                indices.push({i:textLength, n:child});
                nodeText = child.nodeValue;
                text.push(nodeText);
                if (nodeText == "\n"){
                }
                textLength += nodeText.length;
            }
            // element: collect text of child elements,
            // except from script or style tags
            else if (child.nodeType === 1){
                // skip style/script tags
                if (child.tagName.search(/^(script|style)$/i)>=0){
                    continue;
                }
                // add extra space for tags which fall naturally on word boundaries
                if (child.tagName.search(/^(a|b|basefont|bdo|big|em|font|i|s|small|span|strike|strong|su[bp]|tt|u)$/i)<0){
                    text.push(' ');
                    textLength++;
                }
                // save parent's loop state
                nChildren = child.childNodes.length;
                if (nChildren){
                    stack.push({n:node, l:nNodes, i:iNode});
                    // initialize child's loop
                    node = child;
                    nNodes = nChildren;
                    iNode = 0;
                }
            }
        }
        // restore parent's loop state
        if (!stack.length){
            break;
        }
        state = stack.pop();
        node = state.n;
        nNodes = state.l;
        iNode = state.i;
    }

    // quit if found nothing
    if (!indices.length){
        return;
    }

    // morph array of text into contiguous text
    text = text.join('');

    // sentinel
    indices.push({i:text.length});

    // find and hilight all matches
    var iMatch, matchingText,
        iTextStart, iTextEnd,
        i, iLeft, iRight,
        iEntry, entry,
        parentNode, nextNode, newNode,
        iNodeTextStart, iNodeTextEnd,
        textStart, textMiddle, textEnd;

    // loop until no more matches
    for (;;){

        // find matching text, stop if none
        matchingText = searchFor.exec(text);
        if (!matchingText || matchingText.length<=which || !matchingText[which].length){
            break;
        }

        // calculate a span from the absolute indices
        // for start and end of match
        iTextStart = matchingText.index;
        for (iMatch=1; iMatch < which; iMatch++){
            iTextStart += matchingText[iMatch].length;
        }
        iTextEnd = iTextStart + matchingText[which].length;

        // find entry in indices array (using binary search)
        iLeft = 0;
        iRight = indices.length;
        while (iLeft < iRight) {
            i=iLeft + iRight >> 1;
            if (iTextStart < indices[i].i){iRight = i;}
            else if (iTextStart >= indices[i+1].i){iLeft = i + 1;}
            else {iLeft = iRight = i;}
        }
        iEntry = iLeft;

        // for every entry which intersect with the span of the
        // match, extract the intersecting text, and put it into
        // a span tag with specified class
        while (iEntry < indices.length){
            entry = indices[iEntry];
            node = entry.n;
            nodeText = node.nodeValue;
            parentNode = node.parentNode;
            nextNode = node.nextSibling;
            iNodeTextStart = iTextStart - entry.i;
            iNodeTextEnd = Math.min(iTextEnd,indices[iEntry+1].i) - entry.i;

            // slice of text before hilighted slice
            textStart = null;
            if (iNodeTextStart > 0){
                textStart = nodeText.substring(0,iNodeTextStart);
            }

            // hilighted slice
            textMiddle = nodeText.substring(iNodeTextStart,iNodeTextEnd);

            // slice of text after hilighted slice
            textEnd = null;
            if (iNodeTextEnd < nodeText.length){
                textEnd = nodeText.substr(iNodeTextEnd);
            }

            // update DOM according to found slices of text
            if (textStart){
                node.nodeValue = textStart;
            }
            else {
                parentNode.removeChild(node);
            }
            newNode = doc.createElement('span');
            newNode.appendChild(doc.createTextNode(textMiddle));
            newNode.className = className;
            parentNode.insertBefore(newNode,nextNode);
            if (textEnd){
                newNode = doc.createTextNode(textEnd);
                parentNode.insertBefore(newNode,nextNode);
                indices[iEntry] = {n:newNode,i:iTextEnd}; // important: make a copy, do not overwrite
            }

            // if the match doesn't intersect with the following
            // index-node pair, this means this match is completed
            iEntry++;
            if (iTextEnd <= indices[iEntry].i){
                break;
            }
        }
    }
}

function closeOverlay(overlay){
    $(document).unbind("mousedown");
    $(document).mousedown(function(){mouseDown=1});
    $(document).mousedown(possibleHighlightStart);
    overlay.remove();
    unHighlight();

}

function unHighlight(){
    $(".trailHighlight").attr("style","").removeClass("trailHighlight");
}

function clickAway(e,content,commentOverlay,xPos,yPos){
    var clickedNode = $(e.target);
    if (clickedNode != commentOverlay && ($.inArray(e.target,commentOverlay.children())==-1)){
        submitNote(content,commentOverlay.find("textarea").val(),xPos,yPos)
        closeOverlay(commentOverlay)
    }
}

function addSaveButtonNextToNote(highlightedTextRange){
    var currentSelection = window.getSelection();
    var highlightedContent = smartGrabHighlightedText();
    var newNodeReadyForInsertandSaveButton = insertSaveButtonIntoNodeContent(highlightedTextRange);
    var saveButton = newNodeReadyForInsertandSaveButton[0];
    var nodeToHighlight = newNodeReadyForInsertandSaveButton[1];

    var newSelectionRange = document.createRange();
    newSelectionRange.selectNode(nodeToHighlight);

    currentSelection.addRange(newSelectionRange);
    var saveButtonPosition = saveButton.offset();
    var saveButtonTop = saveButtonPosition.top;
    var saveButtonLeft = saveButtonPosition.left;
    saveButton.remove();
    var saveSpan = insertAbsolutelyPositionedSaveButton(saveButtonLeft, saveButtonTop);
    var nodeLineHeight = parseInt(getComputedStyleOfElement(currentSelection.getRangeAt(0).endContainer.parentNode, "lineHeight").replace("px",""));

    saveSpan.click(function(saveButtonLeft,saveButtonTop,nodeLineHeight,highlightedContent){ return function(e){clickAndRemoveSaveButton(e,saveButtonLeft,saveButtonTop,nodeLineHeight,highlightedContent)} }(saveButtonLeft,saveButtonTop,nodeLineHeight,highlightedContent));
    $(document).mousedown(removeInlineSaveButton);
}

function getHighlightedTextRange(){
    return window.getSelection().getRangeAt(0);
}

function getLastNode(node){
    var $node = $(node);
    var contents = $node.contents();
    if (contents.length===0){
        if (node.nodeType === 3){
            return node
        } else {
            var newNode = document.createTextNode("");
            node.appendChild(newNode);
            return newNode;
        }
    } else {
        return getLastNode(contents.last()[0])
    }
}
function insertSaveButtonIntoNodeContent(highlightedTextRange){
    var startContainer = highlightedTextRange.startContainer
    var endContainer = highlightedTextRange.endContainer
    var startOffset = highlightedTextRange.startOffset
    var endOffset = highlightedTextRange.endOffset
    var insertionNode;
    if ($(endContainer).contents().length === 0){
        insertionNode = endContainer;
    } else {
        insertionNode = getLastNode(endContainer);
    }
    var textNodeContent = insertionNode.textContent;
    var firstHalfOfNode =  textNodeContent.slice(0,endOffset);
    var secondHalfOfNode =  textNodeContent.slice(endOffset);
    var saveSpan = $("<span class='inlineSaveButton'></span>");
    saveSpan.html("Save note");
    saveSpan.css("width", "0");

    var nodeToHighlight;
    if (endContainer === startContainer){
        var nodeToHighlightPrefix = document.createTextNode(firstHalfOfNode.slice(0,startOffset));
        nodeToHighlight = document.createTextNode(firstHalfOfNode.slice(startOffset));
        insertionNode.parentNode.replaceChild(nodeToHighlightPrefix,insertionNode)
        $(nodeToHighlight).insertAfter(nodeToHighlightPrefix);
    }else{
        nodeToHighlight = document.createTextNode(firstHalfOfNode);
        insertionNode.parentNode.replaceChild(nodeToHighlight,insertionNode)
    }
    saveSpan.insertAfter(nodeToHighlight);
    $(document.createTextNode(secondHalfOfNode)).insertAfter(saveSpan);
    return [saveSpan,nodeToHighlight,insertionNode];
}

function insertAbsolutelyPositionedSaveButton(left,top){
    var saveSpan = $("<span class='inlineSaveButton'></span>");
    saveSpan.html("+Save note");
    saveSpan.addClass("inlineSaveButton");
    saveSpan.css({
        "background" : "black",
        "font-size" : "12px",
        "color" : "white",
        "position" : "absolute",
        "top" : top,
        "left" : left +5,
        "border-radius": "4px",
        "cursor": "pointer",
        "z-index": "9999"

    });
    $(document.body).append(saveSpan)
    return saveSpan
}

function removeInlineSaveButton(e){
    if (!$(e.target).is(".inlineSaveButton")){
        $(".inlineSaveButton").remove();
    }
}

function clickAndRemoveSaveButton(e,overlayLeft,overlayTop,overLaySpacing,noteContent){
    console.log("here");
    var commentBox = makeCommentOverlay(overlayLeft, overlayTop,overLaySpacing,noteContent);
    $(".inlineSaveButton").remove();
}

