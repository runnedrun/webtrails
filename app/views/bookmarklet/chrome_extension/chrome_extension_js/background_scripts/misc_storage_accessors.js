function getToolBarDisplayState(){
    return localStorage["wt_toolbar_display_state"]
}

function addTrailIdToLocalStorage(ID){
    localStorage["current_trail_ID"] = ID;
}

function addToolbarDisplayStateToLocalStorage(state){
    localStorage["wt_toolbar_display_state"] = String(state);
}

function getCurrentTrailID(){
    return localStorage["current_trail_ID"];
}
function clearCurrentTrailID(){
    localStorage.removeItem("current_trail_ID");
}

// cookie storage to communicate with trail viewer

function removeNewTrailNameCookie(){
    chrome.cookies.remove({
        url:domain,
        name: "wt_new_trail_name"
    })
}
function removeNewTrailIDCookie(){
    chrome.cookies.remove({
        url:domain,
        name: "wt_new_trail_id"
    })
}

function getNewTrailNameFromCookie(cookie){
    if (cookie){
        console.log("got trail name cookie");
        var unencodedCookieString = decodeURIComponent(cookie.value);
        var trailName = unencodedCookieString.replace("%20", " ");
        removeNewTrailNameCookie();
        getTrailIDCookie(trailName);
    }
}

function getTrailIDCookie(trailName){
    chrome.cookies.get({
        url:domain,
        name: "wt_new_trail_id"
    },function(cookie){
        getNewTrailIDFromCookie(cookie,trailName)
    })
}
function getNewTrailIDFromCookie(cookie,trailName){
    if (cookie){
        console.log("got trail ID cookie");
        var trailId = decodeURIComponent(cookie.value);
        removeNewTrailIDCookie();
        addNewTrailOnAllTabs(trailId,trailName);
    }
}