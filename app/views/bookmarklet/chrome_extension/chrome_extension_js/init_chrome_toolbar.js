var scriptsToBeInjected = ["jquery191.js","rangy-core.js","page_preprocessing.js","toolbar_ui.js","ajax_fns.js","smart_grab.js","autoresize.js",
    "jquery_elipsis.js","search_and_highlight.js","inline_save_button_fns.js","ui_fns.js","commenting_fns.js",
    "whereJSisWrittenLocalChrome.js"];

inject_script_by_index(0);

function inject_script_by_index(index_of_script){
    if (index_of_script >= scriptsToBeInjected.length){
        return false;
    }
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('chrome_extension_js/'+scriptsToBeInjected[index_of_script]);
    (document.head||document.documentElement).appendChild(s);
    s.onload = function(e) {
        e.target.parentNode.removeChild(e.target);
        inject_script_by_index(index_of_script+1);
    };
}