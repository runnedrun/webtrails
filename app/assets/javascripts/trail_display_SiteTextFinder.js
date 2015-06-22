console.log("highlighting loaded");

SiteTextFinder = function(trackedDoc) {
    var node = $(trackedDoc).find("body")[0];
    var textNodeIndices = [],
        siteText = [], // will be morphed into a string later
        textLength = 0;

    function isTextNode(node) {
        return node.nodeType === 3;
    }

    // collect text and index-node pairs iteratively
    var iNode = 0,
        nNodes = node.childNodes.length,
        nodeText,
        stack = [],
        child, nChildren,
        state;


    for (;;){
        while (iNode<nNodes){
            child = node.childNodes[iNode++];
            // text: collect and save index-node pair
            if (isTextNode(child)){
                textNodeIndices.push({i:textLength, n:child});
                nodeText = child.nodeValue;
                if (nodeText !== "\n"){
                    siteText.push(nodeText);
                    textLength += nodeText.length;
                }
            }
            // element: collect text of child elements,
            // except from script or style tags
            else if (child.nodeType === 1){
                // skip style/script tags
                if (child.tagName.search(/^(script|style)$/i)>=0){
                    continue;
                }
                // add extra space for tags which fall naturally on word boundaries
                if (child.tagName.search(/^(a|b|basefont|bdo|big|em|font|i|s|small|span|strike|strong|su[bp]|tt|u)$/i)<0){
                    siteText.push(' ');
                    textLength++;
                }
                // save parent's loop state
                nChildren = child.childNodes.length;
                if (nChildren){
                    stack.push({n:node, l:nNodes, i:iNode});
                    // initialize child's loop
                    node = child;
                    nNodes = nChildren;
                    iNode = 0;
                }
            }
        }
        // restore parent's loop state
        if (!stack.length){
            break;
        }
        state = stack.pop();
        node = state.n;
        nNodes = state.l;
        iNode = state.i;
    }

    siteText = siteText.join('');

    // sentinel
    textNodeIndices.push({i:siteText.length});

    this.findString = function(searchTerm) {
        var matchingText,
            iTextStart, iTextEnd,
            i, iLeft, iRight, selectedGroups = [];

        searchTerm = new RegExp(searchTerm.replace(/[.*+?|()\[\]{}\\$^]/g,'\\$&'),'ig');


        for (;;){
            // find matching text, stop if none
            matchingText = searchTerm.exec(siteText);
            if (!matchingText){
                break;
            }

            // calculate a span from the absolute indices
            // for start and end of match
            iTextStart = matchingText.index;
            iTextEnd = iTextStart + matchingText[0].length;

            // find entry in indices array (using binary search)
            iLeft = 0;
            iRight = textNodeIndices.length;
            while (iLeft < iRight) {
                i=iLeft + iRight >> 1;
                if (iTextStart < textNodeIndices[i].i){iRight = i;}
                else if (iTextStart >= textNodeIndices[i+1].i){iLeft = i + 1;}
                else {iLeft = iRight = i;}
            }

            var nodesToSelect = [];
            var endIndexSearchCurrentEntry = textNodeIndices[iLeft];
            var endIndexSearchCurrentIndex = iLeft;

            while(endIndexSearchCurrentEntry.i < iTextEnd) {
                nodesToSelect.push(endIndexSearchCurrentEntry);
                endIndexSearchCurrentIndex ++;
                endIndexSearchCurrentEntry = textNodeIndices[endIndexSearchCurrentIndex];
            }

            var startEntry = nodesToSelect[0];
            var endEntry = nodesToSelect[nodesToSelect.length -1];

            var startOffset = iTextStart - startEntry.i;
            var endOffset = iTextEnd - endEntry.i;

            var selectedNodes = [];

            nodesToSelect.forEach(function(node, i) {
                // if the doc changes for some reason in between search tree construction and this search
                // then the node will have no parent.
                if (node.n.parentNode) {
                    var isLastNode = i == (nodesToSelect.length - 1);
                    var isFirstNode = i == 0;

                    if (isFirstNode && isLastNode) {
                        selectedNodes.push(new SelectedNode(node.n, startOffset, endOffset, "", trackedDoc));
                    } else if (isFirstNode) {
                        selectedNodes.push(new SelectedNode(node.n, startOffset, node.length, "", trackedDoc))
                    } else if (isLastNode) {
                        selectedNodes.push(new SelectedNode(node.n, 0, endOffset, "", trackedDoc))
                    } else {
                        selectedNodes.push(new SelectedNode(node.n, 0, node.length, "", trackedDoc))
                    }
                }
            });

            selectedGroups.push([startEntry.i, selectedNodes]);
        }

        return selectedGroups
    }
}