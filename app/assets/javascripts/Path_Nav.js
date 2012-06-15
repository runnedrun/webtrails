var myFrame;
var urlBox;
var trailDisplay;
var urlTextBox;
var trailButton;
var trailName;
var trailId;
var currentSite;

$(function() {
    myFrame = document.getElementById("UsersPage");
    urlBox = document.getElementById("urlBox");
    trailDisplay = document.getElementById("trailDisplay");
    urlTextBox = $("#urlText");
    trailButton = $("#trailButton");
    trailButton.click(enterName);
    myFrame.onload = function() {currentSite = myFrame.src};
    $(urlBox).hide();
    $(trailDisplay).mouseenter(maximizeTrailDisplay);
    $(trailDisplay).mouseout(closeTrailDisplayIfNecessary);
    $(trailDisplay).click(showOrHideTools);
    $("#navigateButton").click(changeUserPage);
    minimizeTrailDisplay();
    $(document).keypress(verifyKeyPress);
});

function closeTrailDisplayIfNecessary(){
    if ($(urlBox).is(':hidden')){
        minimizeTrailDisplay()
    }
}

function minimizeTrailDisplay(){
    $("#trailDisplay").css("height","2%");
}

function maximizeTrailDisplay(){
    $("#trailDisplay").css("height","6%");
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
            maximizeTrailDisplay()
            $(urlTextBox).focus();
        }
        else{
            $(urlBox).hide();
            minimizeTrailDisplay();
            $(document.body).focus();
        }
}

function changeUserPage(){
    var url = urlTextBox.val()
    if (url.search(/^http:\/\//)==-1){
        url = "http://"+url ;
    }
    myFrame.src = url;
    trailButton.val("Add Site to Trail")
    trailButton.click(addSiteToTrail)
}

function enterName() {
    trailButton.val("Enter Trail Name --->");
    urlTextBox.focus();
    trailButton.click(saveToTrail)
}

function addSiteToTrail(){
    currentSite = myFrame.src;
    $.ajax({
        url: "/create_site",
        type: "post",
        data: {
           site: {
                    url: currentSite,
                    trail_id: trailId
                },
           notes: "none"
                },
        success: continueTrailSession()
    })
}

function saveToTrail(){
    trailName = urlTextBox.val();
    currentSite = myFrame.src;
    $.ajax({
        url: "/create_trail",
        type: "post",
        data: {
            "trail" : {
                name:trailName,
                owner: userId //declared in the html
            },
            sites: [{
                    url: currentSite,
                    notes: "none"
                }]
                },
        success: startTrailSession
    })
}

function startTrailSession(data) {
    trailId = data["id"];
    trailButton.val("Site added to trail");
    trailButton.unbind("click");
    $(trailDisplay).append("<div id='trailName'>" + trailName + "</div>");
    addSiteFaviconToDisplay();
}

function continueTrailSession(data) {
    trailButton.val("Site Added");
    trailButton.unbind("click");
    addSiteFaviconToDisplay();
}

function addSiteFaviconToDisplay() {
    searchName = currentSite.substring(7,currentSite.length-1);
    console.log(searchName);
    $(trailDisplay).append("<a href='"+currentSite+"' class='siteFavicon'><img src='http://www.google.com/s2/favicons?domain=" + searchName +"'/></a>")
}
