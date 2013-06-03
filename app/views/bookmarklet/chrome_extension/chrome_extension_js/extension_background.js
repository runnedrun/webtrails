//domain = "http://localhost:3000";
domain = "http://www.webtrails.co";
//domain_name = "localhost";
domain_name = "webtrails.co";


var scriptsToBeInjected = ["jquery191.js", "rangy-core.js","page_preprocessing.js","toolbar_ui.js","ajax_fns.js","smart_grab.js","autoresize.js",
    "jquery_elipsis.js","search_and_highlight.js","css_property_defaults.js","inline_save_button_fns.js","ui_fns.js","commenting_fns.js",
    "whereJSisWrittenLocalChrome.js"];

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(tab.id, {code:"showOrHidePathDisplay()"});
});

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
    chrome.tabs.get(addedTabId,function(tab){
        injectToolbarAndCheckForSignInOrOutEvents(tab);
    })
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        injectToolbarAndCheckForSignInOrOutEvents(tab);
    }
})

function injectToolbarAndCheckForSignInOrOutEvents(tab){
    setAuthTokenFromCookieIfNecessary();
    console.log("tabid", tab.id);
    var callbackURL = 'http://www.google.com/robots.txt';
    var domain_re = RegExp("(.|^)"+domain_name+"$")
    if (domain_re.exec(wt_$.url(tab.url).attr("host"))){
        //stuff that only happens on our own domain goes here
        if (getWtAuthToken()){
            getWtAuthTokenCookie(signOutIfSignedOutOfWebpage);
        }
    }else if (tab.url != callbackURL){
        chrome.tabs.executeScript(tab.id, {"code":"chrome.runtime.sendMessage({ loaded: [typeof(contentScriptLoaded), "+tab.id+",'"+tab.url+"']});"})
    }
}

function injectScripts(tabId){
    var wt_auth_token = getWtAuthToken();
    var current_trail_id = getCurrentTrailID();
    var toolbar_display_state = getToolBarDisplayState();
    var auth_injection_string = "wt_auth_token=undefined;\n";
    var trail_id_injection_string = "currentTrailID='';\n";
    var tool_bar_state_injection_string = "toolbarShown=false;\n"
    var power_button_url = 'powerButtonUrl="' + chrome.extension.getURL('/chrome_extension_images/power.png') + '";\n';
    if(wt_auth_token){
        auth_injection_string = "wt_auth_token='"+wt_auth_token + "';\n";
        if (current_trail_id){
            trail_id_injection_string = "currentTrailID='"+current_trail_id + "';\n";
        }
    }
    if (toolbar_display_state == "shown"){
        tool_bar_state_injection_string = "toolbarShown=true;\n"
    }
    var starting_injection_string = auth_injection_string+trail_id_injection_string+tool_bar_state_injection_string+power_button_url
    createContentScript(0,starting_injection_string,tabId);
}

function createContentScript(index_of_script, contentScriptString,tabId){
    if (index_of_script >= scriptsToBeInjected.length){
        console.log(contentScriptString);
        chrome.tabs.executeScript(tabId,{code:contentScriptString});
        return false;
    }
    scriptURL = chrome.extension.getURL('chrome_extension_js/'+scriptsToBeInjected[index_of_script]);
    wt_$.ajax({
        url: scriptURL,
        type: "get",
        success: function(data) {
           contentScriptString += ";\n"+  data;
           createContentScript(index_of_script+1, contentScriptString,tabId);
        }
    })
}

client_secret = "t2iqu6oxQbkXf7wdSXhtXXm0";
googleAuth = new OAuth2('google', {
    client_id: '910353473891.apps.googleusercontent.com',
    client_secret: client_secret,
    api_scope:'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.login){
            googleAuth.authorize(function() {
                console.log("authorized");
                console.log("now getting user information from server");
                logInOrCreateUser(function(resp){
                    sendResponse({"wt_auth_token": resp.wt_authentication_token});
                });
            });
           return true;
        };
        if (request.setCurrentTrailID){
            addTrailIdToLocalStorage(request.setCurrentTrailID);
            sendResponse("set in local storage");
        }
        if (request.logout){
            signOut()
            sendResponse({response:"signed out"});
        }
        if (request.showToolBarOnAllTabs){
            addToolbarDisplayStateToLocalStorage("shown")
            showToolbarOnAllTabs();
        }
        if (request.hideToolBarOnAllTabs){
            addToolbarDisplayStateToLocalStorage("hidden")
            hideToolbarOnAllTabs();
        }
        console.log(request);
        if (request.loaded && (request.loaded[0] !== "string")){
            var tabId = request.loaded[1];
            var tabUrl = request.loaded[2];
            injectScripts(tabId);
        }
    })

function logInOrCreateUser(callback){
    var authToken =  googleAuth.getAccessToken();
    wt_$.ajax({
        url: domain + "/users/login_or_create_gmail_user",
        type: "post",
        data: {
            "access_token":authToken,
            "expires_on": googleAuth.get("expiresIn") + googleAuth.get("accessTokenDate")
        },
        success: function(resp){
            var wt_auth_token = resp.wt_authentication_token;
            signIn(wt_auth_token)
            callback(resp)
        },
        error: function(error){
          console.log("error!",error);
        }
    })
}

function signOut(){
    clearWtAuthToken();
    clearCurrentTrailID();
    removeWtAuthTokenCookie();
    sendSignOutMessageToAllTabs();
}

function signIn(wt_auth_token){
    setWtAuthToken(wt_auth_token);
    setWtAuthTokenCookie(wt_auth_token);
    sendSignInMessageToAllTabs();
}

function signOutIfSignedOutOfWebpage(cookie){
    if (!cookie){
        signOut();
    }
}

function setAuthTokenFromCookieIfNecessary(){
    if (!getWtAuthToken()){
        getWtAuthTokenCookie(setAuthTokenFromCookie)
    }
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
        console.log("cookie removed!")
    })
}

function getWtAuthToken(){
    return localStorage["wt_auth_token"];
}
function setWtAuthToken(wt_auth_token){
    localStorage["wt_auth_token"] = wt_auth_token;
}
function clearWtAuthToken(){
    localStorage.removeItem("wt_auth_token");
}

function getCurrentTrailID(){
    return localStorage["current_trail_ID"];
}
function clearCurrentTrailID(){
    localStorage.removeItem("current_trail_ID");
}


function getToolBarDisplayState(){
    return localStorage["wt_toolbar_display_state"]
}

function addTrailIdToLocalStorage(ID){
    localStorage["current_trail_ID"] = ID;
}

function addToolbarDisplayStateToLocalStorage(state){
    localStorage["wt_toolbar_display_state"] = String(state);
}

function sendSignOutMessageToAllTabs(){
    chrome.tabs.getAllInWindow(null, function(tabs) {
        wt_$.each(tabs, function() {
            chrome.tabs.sendRequest(this.id, {"logOutAllTabs":"logitout!"});
        });
    });
}

function sendSignInMessageToAllTabs(){
    chrome.tabs.getAllInWindow(null, function(tabs) {
        wt_$.each(tabs, function() {
            chrome.tabs.sendRequest(this.id, {"logInAllTabs":[getWtAuthToken(),getCurrentTrailID()]});
        });
    });
}

function showToolbarOnAllTabs(){
    chrome.tabs.getAllInWindow(null, function(tabs) {
        wt_$.each(tabs, function() {
            chrome.tabs.sendRequest(this.id, {"showToolBarOnAllTabs":"do it!"});
        });
    });
}

function hideToolbarOnAllTabs(){
    chrome.tabs.getAllInWindow(null, function(tabs) {
        wt_$.each(tabs, function() {
            chrome.tabs.sendRequest(this.id, {"hideToolBarOnAllTabs":"do it!"});
        });
    });
}

