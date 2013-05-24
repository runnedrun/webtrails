chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(tab.id, {code:"var s = document.createElement('script'); s.innerHTML='showOrHidePathDisplay();'; (document.head||document.documentElement).appendChild(s);"});
});