function initOrDisableNoteView(){
    if (noteViewActive){
        disableNoteViewMode();
    }else{
        initNoteViewMode()
    }
}

function initNoteViewMode(){
    initHalfSiteView();
    showNoteList();
    noteViewActive = true;
}

function disableNoteViewMode(){
    disableHalfSiteView();
    hideNoteList();
    noteViewActive = false;
}

function initHalfSiteView(){
    var iframes = $("iframe");
    scaleIframe(iframes,.5);
    iframes.each(disableSelectionInIframe);
//    $(".siteDisplayDiv").addClass("span6");
//    $(".siteDisplayDiv").css({width:"50%"});
}

function disableHalfSiteView(){
    var iframes = $("iframe");
    scaleIframe(iframes,1);
    iframes.each(enableSelectionInIframe);
    iframes.css({
        height:"100%",
        width:"100%"
    });
    $(".siteDisplayDiv").css({width:"100%"});
//    $(".siteDisplayDiv").removeClass("span6");
}

function preventClick(e){
    console.log("default prevented")
    e.preventDefault();
}

function disableSelectionInIframe(i,iframe){
    $(iframe.contentWindow.document.body).mousedown(preventClick);
    $(iframe.contentWindow.document.body).css({
        "-webkit-touch-callout": "none",
        "-webkit-user-select": "none",
        "-khtml-user-select": "none",
        "-moz-user-select": "none",
        "-ms-user-select": "none",
        "user-select": "none"
    })
}

function enableSelectionInIframe(i,iframe){
    $(iframe.contentWindow.document.body).unbind("mousedown",preventClick);
    $(iframe.contentWindow.document.body).css({
        "-webkit-touch-callout": "all",
        "-webkit-user-select": "all",
        "-khtml-user-select": "all",
        "-moz-user-select": "all",
        "-ms-user-select": "all",
        "user-select": "all"
    })
}

function scaleIframe($iframe,iframeScale){
    $iframe.css({
        "-moz-transform": "scale(" + iframeScale + ", " + iframeScale + ")",
        "-webkit-transform": "scale(" + iframeScale + ", " + iframeScale + ")",
        "-o-transform": "scale(" + iframeScale + ", " + iframeScale + ")",
        "-ms-transform": "scale(" + iframeScale + ", " + iframeScale + ")",
        "transform": "scale(" + iframeScale + ", " + iframeScale + ")",
        "-moz-transform-origin": "top left",
        "-webkit-transform-origin": "top left",
        "-o-transform-origin": "top left",
        "-ms-transform-origin": "top left",
        "transform-origin": "top left",
        "height": String($(window).height() *.93*2)+"px",
//        "width": String($(window).width())+"px"
    });
}

function showNoteList(){
    $(".noteViewer").show();
    $(".noteContent").dotdotdot();
}

function hideNoteList(){
    $(".noteViewer").hide();
}