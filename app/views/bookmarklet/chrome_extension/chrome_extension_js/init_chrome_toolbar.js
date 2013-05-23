var scriptstobeinjected = ["jquery141.js","rangy-core.js","toolbar_ui.js","ajax_fns.js","smart_grab.js","autoresize.js",
    "jquery_elipsis.js","search_and_highlight.js","inline_save_button_fns.js","ui_fns.js","commenting_fns.js",
    "wherejsiswrittenlocalchrome.js"];

inject_script_by_index(0);

function inject_script_by_index(index_of_script){
    if (index_of_script >= scriptstobeinjected.length){
        return false
    }
    var s = document.createelement('script');
    s.src = chrome.extension.geturl('chrome_extension_js/'+scriptstobeinjected[index_of_script]);
    (document.head||document.documentelement).appendchild(s);
    s.onload = function(e) {
        e.target.parentnode.removechild(e.target);
        inject_script_by_index(index_of_script+1);
    };
}
