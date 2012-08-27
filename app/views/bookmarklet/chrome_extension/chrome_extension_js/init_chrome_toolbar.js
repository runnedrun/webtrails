var s = document.createElement('script');
s.src = chrome.extension.getURL('chrome_extension_js/whereJSisWrittenLocalChrome.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
    s.parentNode.removeChild(s);
};