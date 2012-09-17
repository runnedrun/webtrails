var scriptsToBeInjected = ["jquery141.js","rangy-core.js","toolbar_ui.js","ajax_fns.js","smart_grab.js","autoresize.js",
    "jquery_elipsis.js","search_and_highlight.js","inline_save_button_fns.js","ui_fns.js","commenting_fns.js",
    "whereJSisWrittenLocalChrome.js"];
for (i=0;i<scriptsToBeInjected.length;i++){
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('chrome_extension_js/'+scriptsToBeInjected[i]);
    (document.head||document.documentElement).appendChild(s);
    s.onload = function(e) {
        e.target.parentNode.removeChild(e.target);
    };
}