console.log("loaded pre-processing");

// Edits in-place
function removeToolbarFromPage($htmlClone) {
  $htmlClone.find('.webtrails').remove();
}

function createMasterStyleSheet(html){
    var newStyleSheetString = "";
    wt_$(document.styleSheets).each(function(i,stylesheet){
        wt_$(stylesheet.rules).each(function(i,rule){
            newStyleSheetString += "\n" + rule.cssText;
        });
    });
    var masterStyleSheet = wt_$(document.createElement("style"));
    masterStyleSheet.className = "masterStylesheet";
    wt_$(html.getElementsByTagName("head")[0]).prepend(masterStyleSheet);
    masterStyleSheet.html(newStyleSheetString);
    window.master = masterStyleSheet;
    console.log(html);
    return html;
}