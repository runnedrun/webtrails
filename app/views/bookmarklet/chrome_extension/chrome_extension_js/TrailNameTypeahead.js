TrailNameTypeahead = function(parentElement, top, left, trackedDoc, defaultTrail, onTypeheadComplete) {
    var typeaheadSelector = "trail-name-typeahead";
    var dropdown;
    var trailsList;
    var lineHeight = 12
    var selectedTrailId = false;
    var selectedTrailName;
    var thisTypeahead = this;

    var C = {
        typeaheadSpan: {
           color: "blue",
           resize: "horizontal",
           overflow: "auto",
           "color": "darkblue",
           "font-family": '"Helvetica Neue",Helvetica,Arial,sans-serif',
           "font-size": "12px",
           "resize": "none",
           "margin": "1px 0 3px 1px",
           "padding": "2px",
           "line-height": lineHeight + "px",
           "border-radius": "4px",
           "border": "1px solid darkgrey"
        },
        completedTypeahead: {
            "font-weight": "bold"
        }
    }

    var H = {
        typeaheadSpan:
            applyDefaultCSS($("<span class='.webtrails " + typeaheadSelector + "' contentEditable='true'></span>"))
            .css(C.typeaheadSpan)
    }

    this.selector = typeaheadSelector;

    function moveCursorToEndOfTypeahead() {
        var range = document.createRange();
        range.selectNodeContents(typeaheadInput[0]);
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function generateResults() {
        var truncated = truncateInputTo30Characters();
        console.log("generating results");
        var currentName = typeaheadInput.html()
        var query;
        if (currentName[0] == "@") {
            query = typeaheadInput.html().slice(1); //we don't want the @ sign at the beginning
        } else {
            query = currentName
        }

        // it may fail if an old trail name is longer than 30 characters
        try {
            var results = fuse.search(query);
        } catch(e) {
            var results = []
        }

        dropdown.refreshItems(results.slice(0, 3), query);

        return !truncated;
    }

    function truncateInputTo30Characters() {
        if (typeaheadInput.text().length > 30) {
            typeaheadInput.text(typeaheadInput.text().slice(0,30));
            moveCursorToEndOfTypeahead();
            return true
        }
    }

    function preventMoreThan30Characters() {
        if (typeaheadInput.text().length === 30) {
            return false
        }
    }

    function checkForTypeaheadSelectionKeypress(e) {
        var keyCode = e.keyCode;
        if (keyCode === 38) {
            dropdown.selectUp();
            e.preventDefault()
        } else if (keyCode === 40) {
            dropdown.selectDown();
            e.preventDefault()
        } else if (keyCode === 13 || keyCode === 9) {
            completeTypeahead(dropdown.getSelectedItem());
            e.preventDefault()
        }
    }

    function completeTypeahead(item) {
        typeaheadInput.html("@" + item.name);
        selectedTrailId = item.id;
        selectedTrailName = item.name;
        typeaheadInput.css(C.completedTypeahead);
        dropdown.hide();
        typeaheadInput.attr("contentEditable", "false");
        onTypeheadComplete();
    }

    this.remove = function() {
        dropdown.remove();
        typeaheadInput.remove();
        typeaheadInput.unbind("keydown", checkForTypeaheadSelectionKeypress);
        typeaheadInput.unbind("input", generateResults);
    }

    this.hideDropdown = function() {
        dropdown.hide();
    };

    this.getSelectedTrailId = function() { return selectedTrailId };
    this.getSelectedTrailName = function() { return selectedTrailName };

    this.$el = function() { return typeaheadInput };

    this.focus = function() {
        typeaheadInput.attr("contentEditable", "true");
        typeaheadInput.focus();
        moveCursorToEndOfTypeahead();
    };

    this.displayDefault = function() {
       completeTypeahead(defaultTrail);
    }

    var typeaheadInput = H.typeaheadSpan;

    parentElement.prepend(typeaheadInput)

    var dropdown = new TypeAheadDropdown(top + lineHeight + 10, left + 4, trackedDoc, defaultTrail);

    trailsList = []

    $.each(Trails.getTrailHash(), function(trailId, trail) {
        trailsList.push({
            id: trail.id,
            name: trail.name
        })
    });

    var options = {keys: ['name']};

    var fuse = new Fuse(trailsList, options);

    EventHandler.keydown({node: typeaheadInput[0], callback: checkForTypeaheadSelectionKeypress});
    typeaheadInput.on("input", generateResults);
    EventHandler.keypress({node: typeaheadInput, callback: preventMoreThan30Characters});
}

TypeAheadDropdown = function(top, left, trackedDoc, defaultTrail) {
    var selectedIndex = 0;

    var currentItems = [];
    var list;

    var listSelector = "trail-name-typeahead-dropdown-menu";
    var itemSelector = "trail-name-typeahead-dropdown-item";
    var itemContentSelector = "trail-name-typeahead-dropdown-content";

    var C = {
        list: {
            position: 'absolute',
            zIndex: '100',
            display: 'none',
            "padding": "5px 0",
            "margin": "2px 0 0",
            "list-style": "none",
            "background-color": "#ffffff",
            "border": "1px solid #ccc",
            "border-radius": "6px",
            "box-shadow": "0 5px 10px rgba(0, 0, 0, 0.2)",
            "background-clip": "padding-box",
            "color": "black",
            "max-width": "200px"
        },
        listItem: {
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
            "overflow": "hidden",
            "display": "block",
            "padding": "1px 8px",
            "font-family": '"Helvetica Neue",Helvetica,Arial,sans-serif',
            "color": "blue",
            "font-size": "12px",
            "background-image": "-webkit-gradient(linear, 0 0, 0 100%, from(#ffffff), to(#ffffff))",
            "font-weight": "bold"
        },
        activeListItem: {
            "color": "#ffffff",
            "background-image": "-webkit-gradient(linear, 0 0, 0 100%, from(#0088cc), to(#0077b3))",
            "outline": "0"
        }
    };

    var H = {
        list:
            $('<ul class="' + listSelector + "trail-name-typeahead-dropdown-menu" + '"></ul>')
                .css(C.list)
                .css({top: top, left: left}),
        existingTrailItem: function(name, id) {
            var item = $('<li class="' + itemSelector + '" ></li>')
                .css(C.listItem)
                .data("name", name)
                .data("id", id);

            var contentContainer =
                applyDefaultCSS($("<div class='" + itemContentSelector + "'></div>").html(name))
                .css(C.listItem);
            item.append(contentContainer);

            return item
        },
        newTrailItem: function(name) {
            var item = $('<li class="' + itemSelector + '" ></li>')
                .css(C.listItem)
                .css({color: "black", "font-weight": "normal"})
                .data("name", name);

            var contentContainer =
                applyDefaultCSS($("<div class='" + itemContentSelector + "'></div>"))
                    .html("Create new trail: " + name)
                    .css(C.listItem)
                    .css({color: "black", "font-weight": "normal"});

            item.append(contentContainer);

            return item
        }
    };

    this.remove = function() {
        list.remove();
    }

    this.hide = function() {
        list.hide();
    }

    this.getSelectedItem = function() {
        if (currentItems && currentItems.length) {
            return {
                name: currentItems[selectedIndex].data("name"),
                id: currentItems[selectedIndex].data("id") // will be false if it's a new trail
            };
        } else {
            return defaultTrail
        }
    }

    function selectItem(index) {
        var itemToSelect = currentItems[index];

        if (itemToSelect) {
            currentItems[selectedIndex].css(C.listItem)
                .find("div").css(C.listItem);

            itemToSelect.css(C.activeListItem)
                .find("div").css(C.activeListItem);

            return true
        } else {
            return false
        }
    }

    this.selectUp = function() {
        if (selectItem(selectedIndex - 1)) {
            selectedIndex -= 1
        }
    }

    this.selectDown = function() {
        if (selectItem(selectedIndex + 1)) {
            selectedIndex += 1
        }
    }

    this.refreshItems = function(trailList, query) {
        currentItems = [];
        selectedIndex = 0;
        list.html("");

        if(query !== "") {
            trailList.forEach(function(trail, i) {
                var item = H.existingTrailItem(trail.name, trail.is);
                currentItems.push(item);
                list.append(item);
            });
            var newTrailItem = H.newTrailItem(query);
            currentItems.push(newTrailItem);
            list.append(newTrailItem);

            selectItem(0);
            list.show();
        }
    }

    var list = H.list;

    $(trackedDoc.body).append(list);
}