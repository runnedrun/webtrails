var myFrame;
var urlBox;
var pathDisplay;
var urlTextBox;

$(function() {
    myFrame = document.getElementById("UsersPage");
    urlBox = document.getElementById("urlBox");
    pathDisplay = document.getElementById("pathDisplay");
    urlTextBox = $("#urlText")
    $(urlBox).hide();
    $(pathDisplay).mouseenter(maximizePathDisplay);
    $(pathDisplay).mouseout(closePathDisplayIfNecessary);
    $(pathDisplay).click(showOrHideTools);
    $("#navigateButton").click(changeUserPage);
    minimizePathDisplay();
    $(document).keypress(verifyKeyPress);
});

function closePathDisplayIfNecessary(){
    if ($(urlBox).is(':hidden')){
        minimizePathDisplay()
    }
}

function minimizePathDisplay(){
    $("#pathDisplay").css("height","2%");
}

function maximizePathDisplay(){
    $("#pathDisplay").css("height","6%");
}

function verifyKeyPress(e){
    var code = (e.keyCode ? e.keyCode : e.which);
//    use this to check if target was body: event.target.nodeName == "BODY"
    if (code == 27){
        showOrHideTools()
    }
}

function showOrHideTools(){
        if ($(urlBox).is(':hidden')){
            $(urlBox).show();
            maximizePathDisplay()
            $(urlTextBox).focus();
        }
        else{
            $(urlBox).hide();
            minimizePathDisplay();
            $(document.body).focus();
        }
}

function changeUserPage(){
    var url = urlTextBox.val()
    if (url.search(/^http:\/\//)==-1){
        url = "http://"+url ;
    }
    myFrame.src = url;
}