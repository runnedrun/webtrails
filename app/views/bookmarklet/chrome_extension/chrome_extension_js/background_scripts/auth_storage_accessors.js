function getWtAuthToken(){
    return localStorage["wt_auth_token"];
}
function setWtAuthToken(wt_auth_token){
    localStorage["wt_auth_token"] = wt_auth_token;
}
function clearWtAuthToken(){
    localStorage.removeItem("wt_auth_token");
}

function setAuthTokenFromCookieIfNecessary(){
    LocalStorageTrailAccess.getAuthToken().done(function(authToken) {
        if (!authToken){
            getWtAuthTokenCookie(setAuthTokenFromCookie)
        }
    });
}

function setAuthTokenFromCookie(cookie){
    if(cookie){
        var auth_token = cookie.value;
        if(auth_token){
            signIn(auth_token);
        }
    }
}

function getWtAuthTokenCookie(callback){
    return chrome.cookies.get({
        url:domain,
        name: "wt_auth_token"
    },callback)
}

function setWtAuthTokenCookie(auth_token){
    var date = new Date();
    var secondsSinceEpoch = date.getTime()/1000;
    chrome.cookies.set({
        url: domain,
        name: "wt_auth_token",
        expirationDate: secondsSinceEpoch + 315360000,
        value: auth_token
    })
}

function removeWtAuthTokenCookie(auth_token){
    chrome.cookies.remove({
        url:domain,
        name: "wt_auth_token"
    },function(){
        console.log("auth token cookie removed!")
    })
}

function setUserId(userId){
    localStorage["userId"] = userId;
}

function clearUserId(){
    localStorage.removeItem("userId");
}

function getUserId(){
    return localStorage["userId"];
}