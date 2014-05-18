TrailNameTypeahead = function(parentElement) {
    var selector = "trail-name-typeahead";

    var C = {
        typeaheadSpan: {
           color: "blue",
           resize: "horizontal",
           overflow: "auto"
        }
    }

    var H = {
        typeaheadSpan:
            applyDefaultCSS($("<input type='text' class='" + selector + "' contentEditable='true'></span>"))
            .css(C.typeaheadSpan)
    }

    this.isEmpty = function() {
        return typeaheadInput.val() === ""
    }

    this.selector = selector

    function moveCursorToEndOfTypeahead() {
        var range = document.createRange();
        range.selectNodeContents(typeaheadInput[0]);
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    var typeaheadInput = H.typeaheadSpan;

    parentElement.prepend(typeaheadInput)
    typeaheadInput.focus()

//    moveCursorToEndOfTypeahead();
}