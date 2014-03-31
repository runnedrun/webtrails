console.log("ui_fns loaded");

function butterBarNotification(message) {
    var butterBarContainer = $("<div></div>").css({
        position: "fixed",
        top: "0px",
        "z-index": "2147483647",
        width: "100%",
        "text-align": "center"
    })
    var butterBar = $("<div>" + message + "</div>").css({
        "background-color": "#666666",
        color: "white",
        display: "inline",
        "font-family": "arial, sans-serif",
        padding: "5px"
    });
    butterBarContainer.append(butterBar);
    $(document.body).prepend(butterBarContainer);
    butterBar.hide();
    butterBar.fadeIn(400, function(){
        setTimeout(function(){
            butterBar.fadeOut(400, function(){
                butterBar.remove();
            });
        },2000);
    });
    console.log("butter bar is shown!", butterBar);
}

function displaySaveButtonWhileKeyIsPressed(keycode){
    if (!toolbarShown && wt_auth_token) {
        keycode = typeof keycode == "undefined" ? keycode : "18";
        var saveButton = highlightedTextDetect();
        $(document.body).keyup(function(e){
            if (e.keycode == keycode && saveButton){
                saveButton.remove()
                $(document).unbind("keyup",arguments.callee)
            }
        })
    }
}

function growFaviconHolder() {
    faviconHolder.stop().animate({"height": "200px"});
}

function shrinkFaviconHolder() {
    faviconHolder.stop().animate({"height": "20px"});
}

