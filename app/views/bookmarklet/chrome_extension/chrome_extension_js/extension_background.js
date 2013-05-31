domain = "http://localhost:3000";
domain_name = "localhost";
//domain_name = "webtrails.co";

var scriptsToBeInjected = ["jquery191.js", "rangy-core.js","page_preprocessing.js","toolbar_ui.js","ajax_fns.js","smart_grab.js","autoresize.js",
    "jquery_elipsis.js","search_and_highlight.js","inline_save_button_fns.js","ui_fns.js","commenting_fns.js",
    "whereJSisWrittenLocalChrome.js"];

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(tab.id, {code:"showOrHidePathDisplay()"});
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        var callbackURL = chrome.extension.getURL('http://www.google.com/robots.txt');
        var domain_re = RegExp("(.|^)"+domain_name+"$")
        if ((tab.url != callbackURL) && !domain_re.exec(wt_$.url(tab.url).attr("host"))){
            injectScripts(tabId);
        }
    }
})

function injectScripts(tabId){
    var wt_auth_token = getWtAuthToken();
    var current_trail_id = getCurrentTrailID();
    console.log("auth token",wt_auth_token);
    console.log("current trail id",current_trail_id);
    var auth_injection_string = "wt_auth_token=undefined;\n";
    var trail_id_injection_string = "currentTrailID='';\n";
    if(wt_auth_token){
        console.log("injecting with token");
        auth_injection_string = "wt_auth_token='"+wt_auth_token + "';\n";
        if (current_trail_id){
            console.log("injecting with currentTrailID");
            trail_id_injection_string = "currentTrailID='"+current_trail_id + "';\n";
        }
    }
    createContentScript(0,auth_injection_string+trail_id_injection_string,tabId);
}

function createContentScript(index_of_script, contentScriptString,tabId){
    if (index_of_script >= scriptsToBeInjected.length){
//        console.log(contentScriptString);
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
console.log(OAuth2())
console.log(client_secret,"client secret");

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.login){
            console.log("authorizing");
            googleAuth.authorize(function() {
                console.log("authorized");
                console.log("now getting user information from server");
                logInOrCreateUser(function(resp){
                  console.log('loginorcreateusercallback', resp);
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
    })

function logInOrCreateUser(callback){
    console.log("loginorcreatuser called")
    console.log(googleAuth.getAccessToken());
    var authToken =  googleAuth.getAccessToken();
    console.log(domain + "/users/login_or_create_gmail_user")
    wt_$.ajax({
        url: domain + "/users/login_or_create_gmail_user",
        type: "post",
        data: {
            "access_token":authToken,
            "expires_on": googleAuth.get("expiresIn") + googleAuth.get("accessTokenDate")
        },
        success: function(resp){
            wt_auth_token = resp.wt_authentication_token;
            console.log(resp.wt_authentication_token)
            localStorage["wt_auth_token"] = wt_auth_token;
            var date = new Date();
            var secondsSinceEpoch = date.getTime()/1000;
            chrome.cookies.set({
                url: domain,
                name: "wt_auth_token",
                expirationDate: secondsSinceEpoch + 315360000,
                value: wt_auth_token
            },function(resp){
                console.log(resp);
                console.log("cookie set!")
            })
            callback(resp)
        },
        error: function(error){
          console.log("error!",error);
        }
    })
}

function signOut(){
    localStorage.removeItem("wt_auth_token");
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
function getCurrentTrailID(){
    return localStorage["current_trail_ID"];
}

function addTrailIdToLocalStorage(ID){
    localStorage["current_trail_ID"] = ID;
}