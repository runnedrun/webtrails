var scriptsToBeInjected = ["jquery191.js", "rangy-core.js","page_preprocessing.js","toolbar_ui.js","ajax_fns.js","smart_grab.js","autoresize.js",
    "jquery_elipsis.js","search_and_highlight.js","inline_save_button_fns.js","ui_fns.js","commenting_fns.js",
    "whereJSisWrittenLocalChrome.js"];

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(tab.id, {code:"showOrHidePathDisplay()"});
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        var callbackURL = chrome.extension.getURL('http://www.google.com/robots.txt');
        if (tab.url != callbackURL){
            injectScripts(tabId);
        }
    }
})

function injectScripts(tabId){
    createContentScript(0,"",tabId);
}

function createContentScript(index_of_script, contentScriptString,tabId){
    if (index_of_script >= scriptsToBeInjected.length){
        chrome.tabs.executeScript(tabId,{code:contentScriptString});
        return false;
    }
    scriptURL = chrome.extension.getURL('chrome_extension_js/'+scriptsToBeInjected[index_of_script]);
    wt_$.ajax({
        url: scriptURL,
        type: "get",
        success: function(data) {
           contentScriptString += "\n;"+  data;
           createContentScript(index_of_script+1, contentScriptString,tabId);
        }
    })
}

client_secret = "t2iqu6oxQbkXf7wdSXhtXXm0";
googleAuth = new OAuth2('google', {
    client_id: '910353473891.apps.googleusercontent.com',
    client_secret: client_secret,
    api_scope: 'https://www.googleapis.com/auth/tasks'
});
console.log(client_secret,"client secret");

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.login){
            console.log("authorizing");
            googleAuth.authorize(function() {
                console.log("authorized");
                console.log(googleAuth.getAccessToken());
                sendResponse({text: "success!"});
            })
           return true
        };
    })