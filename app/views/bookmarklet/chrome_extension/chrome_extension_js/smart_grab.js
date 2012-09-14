console.log("smart grab loaded");

function smartGrabHighlightedText(){
    var textObject = window.getSelection().getRangeAt(0);
    var text = String(textObject);
//   return text

    //this is still a bit sketchy, another days work.
    if (text[0] == " "){
        text = ltrim(text);
    }else{
        var startIndex = textObject.startOffset;
        var startContainerText = textObject.startContainer.textContent;
        var textToAddToStartOfHighlight = ""
        for (i=startIndex-1;i > -1; i--){
            var character = startContainerText[i];
            if (character==" ") {
                break
            }
            textToAddToStartOfHighlight = character + textToAddToStartOfHighlight;
        }
        text = textToAddToStartOfHighlight + text;
    }
    if (text[text.length-1] == " "){
        text = rtrim(text);
    }else{
        var endIndex = textObject.endOffset;
        var endContainerText = textObject.endContainer.textContent;
        var textToAddToEndOfHighlight = ""
        for (i=endIndex;i < endContainerText.length;i++){
            var character = endContainerText[i];
            if (character==" ") {
                break
            }
            textToAddToEndOfHighlight += character;
        }
        text += textToAddToEndOfHighlight;
    }
    return text
}

function ltrim(stringToTrim) {
    return stringToTrim.replace(/^\s+/,"");
}
function rtrim(stringToTrim) {
    return stringToTrim.replace(/\s+$/,"");
}