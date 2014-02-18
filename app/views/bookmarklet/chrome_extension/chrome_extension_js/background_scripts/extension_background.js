domain = "http://localhost:3000";
domain_name = "localhost";
resourceDownloaderAddress = "http://localhost:5000";
//domain = "http://www.webtrails.co";
//domain_name = "webtrails.co";
message_sending = {}


var scriptsToBeInjected = ["jquery.js", "bootstrap.min.js", "disable_selection.js", "rangy-core.js", "page_preprocessing.js","iframe_manager.js", "trails_objects.js","trail_preview.js","TrailToolbar.js",
    "ajax_fns.js","smart_grab.js","autoresize.js","search_and_highlight.js","css_property_defaults.js","inline_save_button_fns.js",
    "ui_fns.js","commenting_fns.js","whereJSisWrittenLocalChrome.js", "mutation-summary.js"];

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(tab.id, {code:"showOrHidePathDisplay()"});
});

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
    chrome.tabs.get(addedTabId,function(tab){
        injectToolbarAndCheckForSignInOrOutEvents(tab);
    })
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'loading') {
        injectToolbarAndCheckForSignInOrOutEvents(tab);
    }
})

function injectToolbarAndCheckForSignInOrOutEvents(tab){
    setAuthTokenFromCookieIfNecessary();
    var callbackURL = 'http://www.google.com/robots.txt';
    var domain_re = RegExp("(.|^)"+domain_name+"$")
    var beginningOfQuery = tab.url.indexOf("?")
    var justUrl = tab.url.slice(0,beginningOfQuery);
    if (domain_re.exec($.url(tab.url).attr("host"))){
        //stuff that only happens on our own domain goes here
        if (getWtAuthToken()){
            getWtAuthTokenCookie(signOutIfSignedOutOfWebpage);
        }
        if (tab.url.indexOf('/trails') == -1) {
            // if we are not on a /trails/:index view page, then we can still use this toolbar
            askTabForLoaded(tab);
        }
    }else if (justUrl != callbackURL){
        askTabForLoaded(tab);
    }
}

function askTabForLoaded(tab) {
    if (!message_sending[tab.id+":"+tab.url]){
        message_sending[tab.id+":"+tab.url] = Date.now();
        chrome.tabs.executeScript(tab.id, {"code":"chrome.runtime.sendMessage({ loaded: [typeof(contentScriptLoaded), "+tab.id+",'"+tab.url+"']});"});
    }
    cleanUpMessageSendingObject();
}

function injectScripts(tabId, toolbarHtml){
    var wt_auth_token = getWtAuthToken();
    var current_trail_id = LocalStorageTrailAccess.getCurrentTrailId();
    var toolbar_display_state = getToolBarDisplayState();
    var auth_injection_string = "wt_auth_token=undefined;\n";
    var trail_id_injection_string = "startingTrailID='';\n";
    var tool_bar_state_injection_string = "toolbarShown=false;\n"
    var power_button_url = 'powerButtonUrl="' + chrome.extension.getURL('/chrome_extension_images/power.png') + '";\n';
    var content_script_loaded = 'contentScriptLoaded = "loaded";\n'
    var toolbarHtml = 'toolbarHtml = "' + toolbarHtml + '";'
    var noTrailsHelpUrl = 'noTrailsHelpUrl = "' + chrome.extension.getURL('/html/no_trails.html') + '";\n'
    var noNotesHelpUrl = 'noNotesHelpUrl = "' + chrome.extension.getURL('/html/no_notes.html') + '";\n'
    if(wt_auth_token){
        auth_injection_string = "wt_auth_token='"+wt_auth_token + "';\n";
        if (current_trail_id){
            trail_id_injection_string = "startingTrailID='"+current_trail_id + "';\n";
        }
    }
    if (toolbar_display_state == "shown"){
        tool_bar_state_injection_string = "toolbarShown=true;\n"
    }
    var starting_injection_string = auth_injection_string+trail_id_injection_string+tool_bar_state_injection_string+power_button_url + content_script_loaded + toolbarHtml + noTrailsHelpUrl + noNotesHelpUrl;
    createContentScript(0,starting_injection_string,tabId);
    // update the local trail data
    retrieveTrailData();
}

function createContentScript(index_of_script, contentScriptString,tabId){
    if (index_of_script >= scriptsToBeInjected.length){
        chrome.tabs.executeScript(tabId,{code:contentScriptString});
        return false;
    }
    scriptURL = chrome.extension.getURL('chrome_extension_js/'+scriptsToBeInjected[index_of_script]);
    $.ajax({
        url: scriptURL,
        type: "get",
        success: function(data) {
           contentScriptString += ";\n"+  data;
           createContentScript(index_of_script+1, contentScriptString,tabId);
        }
    })
}

function getToolbarIframeHtml(callback) {
    var newDoc = document.implementation.createHTMLDocument().documentElement;

    $.ajax({
        url: "/html/toolbar.html",
        type: "get",
        success: function(html) {
            newDoc.innerHTML = html;
            var $html = $(newDoc);

            var bootstrapCss = $("<link rel='stylesheet'></link>");
            var toolbarCss = $("<link rel='stylesheet'></link>");
            bootstrapCss.attr("href", chrome.extension.getURL("css/bootstrap.min.css"));
            toolbarCss.attr("href", chrome.extension.getURL("css/toolbar.css"));
            var head = $html.find('head');

            head[0].innerHTML = bootstrapCss[0].outerHTML + toolbarCss[0].outerHTML

            var fullHtml = encodeURI(newDoc.outerHTML);
            callback(fullHtml);
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
                logInOrCreateUser(function(resp){
                    sendResponse({"wt_auth_token": resp.wt_authentication_token});
                });
            });
           return true;
        };
        if (request.setCurrentTrailID){
            LocalStorageTrailAccess.setCurrentTrailId(request.setCurrentTrailID);
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
        if (request.loaded && (request.loaded[0] == "undefined")){
            var tabId = request.loaded[1];
            var tabUrl = request.loaded[2];
            if (message_sending[tabId+":"+tabUrl]){
                delete message_sending[tabId+":"+tabUrl];
            }
            getToolbarIframeHtml(function(toolbarHtml){
                injectScripts(tabId, toolbarHtml);
            })
        }
        if (request.parseAndResolve){
            parse_page_and_resolve_urls(request.parseAndResolve);
            if (!request.parseAndResolve.iframe){
                console.log("sending message to iframes")
                chrome.tabs.sendRequest(sender.tab.id, {parse_and_resolve_iframe_urls:request.parseAndResolve});
            }else{
                console.log("message sent to iframes, now getting parse requests from all iframe");
            }
        }
        if (request.getTrailsObject){
            sendResponse(LocalStorageTrailAccess.getTrails());
        }
        if (request.updateTrailsObject){
            console.log("received update trails message");
            retrieveTrailData();
        }
    }
);

function retrieveTrailData(){
    console.log("fethcing trail data now!");
    $.ajax({
        url: domain + "/users/get_all_trail_data",
        type: "get",
        beforeSend: signRequestWithWtAuthToken,
        success: function(resp){
            updateStoredTrailData(resp.trail_hash, resp.user_id);
        }
    })
}

function updateStoredTrailData(trailsObject, userId){
    setUserId(userId);
    console.log("trails object from server", trailsObject);
    var deferreds = LocalStorageTrailAccess.addOrUpdateTrails(trailsObject);
    $.when.apply($, deferreds).always(function(responses){
        console.log("trail data updated, pushing message to all tabs");
        sendTrailToAllTabs();
    });
}

function sendTrailToAllTabs(){
    var trailsObject = LocalStorageTrailAccess.getTrails();
    console.log(trailsObject)
    sendMessageToAllTabs({updateTrails: trailsObject});
}

function logInOrCreateUser(callback){
    var authToken =  googleAuth.getAccessToken();
    $.ajax({
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

function cleanUpMessageSendingObject(){
    var currentTime = Date.now();
    $.each(message_sending,function(tabId,time){
        if ((currentTime - time) > (10 * 1000)){
            delete message_sending[tabId];
        }
    })
}

function signOut(){
    clearWtAuthToken();
    clearCurrentTrailID();
    clearUserId()
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

function sendSignOutMessageToAllTabs(){
    sendMessageToAllTabs({"logOutAllTabs":"logitout!"});
}

function sendSignInMessageToAllTabs(){
    sendMessageToAllTabs({"logInAllTabs":[getWtAuthToken(),getCurrentTrailID()]})
}

function showToolbarOnAllTabs(){
    sendMessageToAllTabs({"showToolBarOnAllTabs":"do it!"})
}

function hideToolbarOnAllTabs(){
    sendMessageToAllTabs({"hideToolBarOnAllTabs":"do it!"})
}

function sendMessageToAllTabs(message){
    chrome.windows.getAll({populate: true}, function(windows){
        $.each(windows,function(index,window){
            $.each(window.tabs, function() {
                chrome.tabs.sendRequest(this.id, message);
            });
        })
    } )
}

function signRequestWithWtAuthToken(xhr,ajaxRequest){
    xhr.setRequestHeader("WT_AUTH_TOKEN",getWtAuthToken());
    xhr.setRequestHeader("Accept","application/json");
}


