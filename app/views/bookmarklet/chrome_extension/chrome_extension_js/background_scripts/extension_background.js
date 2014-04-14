domain = "http://localhost:3000";
domain_name = "localhost";
resourceDownloaderAddress = "http://localhost:5000";
//resourceDownloaderAddress = "http://gentle-atoll-5058.herokuapp.com";
//domain = "http://www.webtrails.co";
//domain_name = "webtrails.co";
//message_sending = {}


var scriptsToBeInjected = ["jquery.js", "dropdown.js", "disable_selection.js", "rangy-core.js", "page_preprocessing.js",
    "background_scripts/LocalStorageTrail.js", "iframe_manager.js", "trails_objects.js","trail_preview.js",
    "TrailToolbar.js","ajax_fns.js","smart_grab.js", "autoresize.js","search_and_highlight.js","css_property_defaults.js",
    "inline_save_button_fns.js", "ui_fns.js","commenting_fns.js","whereJSisWrittenLocalChrome.js", "mutation-summary.js"];

chrome.browserAction.onClicked.addListener(function(tab) {
//  chrome.tabs.executeScript(tab.id, {code:"()"});
//    retrieveTrailData();
    chrome.tabs.getSelected(function(tab) {
        chrome.tabs.sendRequest(tab.id, {openOrCloseToolbar: true});
    });
});

//chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
//    chrome.tabs.get(addedTabId,function(tab){
//        injectToolbarAndCheckForSignInOrOutEvents(tab);
//    })
//});
////
//chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
//    if (changeInfo.status == 'loading') {
//        injectToolbarAndCheckForSignInOrOutEvents(tab);
//    }
//})

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

function injectScripts(tabId, toolbarHtml, messageScreenHtml){
    var wt_auth_token = getWtAuthToken();
    var current_trail_id = LocalStorageTrailAccess.getCurrentTrailId();
    var toolbar_display_state = getToolBarDisplayState();
    var auth_injection_string = "wt_auth_token=undefined;\n";
    var trail_id_injection_string = "startingTrailID='';\n";
    var tool_bar_state_injection_string = "toolbarShown=false;\n"
    var power_button_url = 'powerButtonUrl="' + chrome.extension.getURL('/chrome_extension_images/power.png') + '";\n';
    var content_script_loaded = 'contentScriptLoaded = "loaded";\n'
    var toolbarHtml = 'toolbarHtml = "' + toolbarHtml + '";'
    var messageScreenHtml = 'messageScreenHtml = "' + messageScreenHtml + '";'
    var noTrailsHelpUrl = 'noTrailsHelpUrl = "' + chrome.extension.getURL('/html/no_trails.html') + '";\n'
    if(wt_auth_token){
        auth_injection_string = "wt_auth_token='"+wt_auth_token + "';\n";
        if (current_trail_id){
            trail_id_injection_string = "startingTrailID='"+current_trail_id + "';\n";
        }
    }
    if (toolbar_display_state == "shown"){
        tool_bar_state_injection_string = "toolbarShown=true;\n"
    }
    var starting_injection_string = auth_injection_string+trail_id_injection_string+tool_bar_state_injection_string+power_button_url + content_script_loaded + toolbarHtml + noTrailsHelpUrl + messageScreenHtml;
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
    var toolbarDoc = document.implementation.createHTMLDocument().documentElement;
    var messageScreenDoc = document.implementation.createHTMLDocument().documentElement;
    var bootstrapCss = $("<link rel='stylesheet'></link>");
    var toolbarCss = $("<link rel='stylesheet'></link>");
    var fontAwesomeCss = $("<link rel='stylesheet'></link>");
    var messageScreenCss = $("<link rel='stylesheet'></link>");
    bootstrapCss.attr("href", chrome.extension.getURL("css/bootstrap.min.css"));
    toolbarCss.attr("href", chrome.extension.getURL("css/toolbar.css"));
    fontAwesomeCss.attr("href", chrome.extension.getURL("css/font-awesome.min.css"));
    messageScreenCss.attr("href", chrome.extension.getURL("css/message_screen.css"));

    var deferredToolbarHtml = $.ajax({
        url: "/html/toolbar.html",
        type: "get",
        success: function(html) {
            toolbarDoc.innerHTML = html;
            var $html = $(toolbarDoc);
            addTagsToHead($html, [bootstrapCss, toolbarCss, fontAwesomeCss, messageScreenCss])
        }
    });

    $.when.apply($, [deferredToolbarHtml]).always(function(){
        var fullToolbarHtml = encodeURI(toolbarDoc.outerHTML);
        callback(fullToolbarHtml);
    });
}

function addTagsToHead($html, tags) {
    var tagString = "";
    $.each(tags, function(i, tag) {
        tagString += tag[0].outerHTML
    });
    var head = $html.find('head');
    head[0].innerHTML = tagString;
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
            signOut();
            sendResponse({response:"signed out"});
        }
        if (request.loaded && (request.loaded[0] == "undefined")){
            var tabId = request.loaded[1];
            var tabUrl = request.loaded[2];
            if (message_sending[tabId+":"+tabUrl]){
                delete message_sending[tabId+":" + tabUrl];
            }
            getToolbarIframeHtml(function(toolbarHtml, messageScreenHtml){
                injectScripts(tabId, toolbarHtml, messageScreenHtml);
            })
        }
        if (request.parseAndResolve){
            parse_page_and_resolve_urls(request.parseAndResolve, sender.tab.id);
            if (!request.parseAndResolve.iframe){
                console.log("sending message to iframes")
                chrome.tabs.sendRequest(sender.tab.id, {parse_and_resolve_iframe_urls:request.parseAndResolve});
            }else{
                console.log("message sent to iframes, now getting parse requests from all iframe");
            }
        }
        if (request.updateTrailsObject){
            console.log("received update trails message");
            retrieveTrailData();
        }
        if (request.getToolbarHtml) {
            console.log("getting toolbar html");
            getToolbarIframeHtml(function(fullToolbarHtml){
                console.log("sending html response");
                chrome.tabs.sendRequest(sender.tab.id, {htmlObject: {
                    toolbarHtml: fullToolbarHtml,
                }});
            })
        }
        if (request.iframeToolBarKeyPress) {
            chrome.tabs.sendRequest(sender.tab.id, {iframeToolBarKeyPress: request.iframeToolBarKeyPress});
        }
    }
);

chrome.commands.onCommand.addListener(function(command) {
    console.log('got command', command);
    if (command == "open-or-close-toolbar") {
        chrome.tabs.getSelected(function(tab) {
            chrome.tabs.sendRequest(tab.id, {openOrCloseToolbar: true});
        })
    }

    if (command == "show-note-scroller") {
        chrome.tabs.getSelected(function(tab) {
            chrome.tabs.sendRequest(tab.id, {showNoteScroller: true});
        })
    }
});

chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        if (request.logInFromWebsite) {
            console.log("getting a request to log in from the website");
            signIn(request.logInFromWebsite);
        }

        if (request.updateTrailsObject) {
            retrieveTrailData();
        }
    }
);

function retrieveTrailData(prefetchedHtml){
    console.log("fetching trail data now!");
    LocalStorageTrailAccess.getAuthToken().done(function(authToken){
        $.ajax({
            url: domain + "/users/get_all_trail_data",
            type: "get",
            beforeSend: function(xhr){ signRequestWithWtAuthToken(xhr, authToken) },
            success: function(resp){
                updateStoredTrailData(resp.trail_hash, resp.user_id, prefetchedHtml);
            }
        })
    })
}

function updateStoredTrailData(trailsObject, userId, prefetchedHtml){
    setUserId(userId);
    console.log("trails object from server", trailsObject);
    var deferreds = LocalStorageTrailAccess.addOrUpdateTrails(trailsObject, prefetchedHtml);
    $.when.apply($, deferreds).always(function(responses){
        console.log("trail data updated, pushing message to all tabs");
    });
}

function logInOrCreateUser(callback){
    var authToken = googleAuth.getAccessToken();
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
    LocalStorageTrailAccess.clearAuthToken();
    LocalStorageTrailAccess.clearCurrentTrailId()
    clearUserId();
    removeWtAuthTokenCookie();
    sendSignOutMessageToAllTabs();
}

function signIn(wt_auth_token){
    LocalStorageTrailAccess.getAuthToken().done(function(auth_token) {
        if(!auth_token) {
            console.log("sending signed in message to all tabs");
            retrieveTrailData();
            LocalStorageTrailAccess.setAuthToken(wt_auth_token);
            setWtAuthTokenCookie(wt_auth_token);
            sendSignInMessageToAllTabs();
        }
    })
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
    LocalStorageTrailAccess.getExtensionInitializationData().done(function(initObject) {
        sendMessageToAllTabs({"logInAllTabs":{
            authToken: initObject.authToken,
            startingTrailId: initObject.currentTrailId,
            trailsObject: initObject.trails
        }})
    })
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

function signRequestWithWtAuthToken(xhr, authToken){
    xhr.setRequestHeader("WT_AUTH_TOKEN", authToken);
    xhr.setRequestHeader("Accept", "application/json");
}


