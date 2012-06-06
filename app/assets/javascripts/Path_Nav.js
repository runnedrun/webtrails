var textDisplay;
var myFrame;
var urlBox;
var myFrameContent;
var pathDisplay;

$(function() {
    myFrame = document.getElementById("UsersPage");
    urlBox = document.getElementById("urlBox");
    pathDisplay = document.getElementById("pathDisplay");
    $(urlBox).hide();
    $(pathDisplay).hide();

    $(document).keypress(showOrHideUrlBox);

    myFrame.onload = iframeFillPage;
});

function selectIframeText(){
    myFrame = document.getElementById("UsersPage");
    textDisplay = document.getElementById("textDisplay");
}
function iframeFillPage(){
    myFrameContent = myFrame.contentWindow.document;
    myFrame.height = myFrameContent.body.scrollHeight;
    $(myFrameContent).keypress(showOrHideUrlBox);
    myFrame.style.visibility = "visible";
}

function showOrHideUrlBox(e){
    var code = (e.keyCode ? e.keyCode : e.which);
//    use this to check if target was body: event.target.nodeName == "BODY"
    if (code == 27){
        if ($(urlBox).is(':hidden')){
            $(urlBox).show();
            $(pathDisplay).show();
            $(urlBox).focus();
        }
        else{
            $(urlBox).hide();
            $(pathDisplay).hide();
            $(document.body).focus();
        }
    }
}

