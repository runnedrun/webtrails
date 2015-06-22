console.log("loading EventHandler")

EventHandler = new function() {
    this.blockEvents = false;
    var keypressHandlers = [];
    var keydownHandlers = [];
    var keyupHandlers = [];
    var self = this;

    this.keyup = function(callback) { keyupHandlers.push(callback) };

    this.removeKeyup = function(handler) { removeHandler(keyupHandlers, handler) };

    this.keydown = function(callback) { keydownHandlers.push(callback) };

    this.removeKeydown = function(handler) { removeHandler(keydownHandlers, handler) };

    this.keypress = function(callback) { keypressHandlers.push(callback) };

    this.removeKeypress = function(handler) { removeHandler(keypressHandlers, handler) };

    function removeHandler(handlerList, handlerToRemove) {
        var handlerIndex = handlerList.length - 1
        while(handlerIndex >= 0) {
            var handler = handlerList[handlerIndex]
            if ((handler.node == handlerToRemove.node) && (String(handler.callback) == String(handlerToRemove.callback))) {
                handlerList.splice(handlerIndex, 1)
            }
            handlerIndex --
        }
    }

    function listenAndBlock(handlers) {
        return function(e) {
            var blockEvents = self.blockEvents
            handlers.forEach(function(handler) {
                if (!handler.node || (handler.node == e.target)) {
                    handler.callback(e);
                }
            });

            if(blockEvents) {
                e.stopImmediatePropagation();
            }
        }
    }

    // we need special event handling here to make sure that we can kill the event before it reaches any
    // handler on the actual page, when necessary. For this we grab the event in the capturing phase
    // see http://www.quirksmode.org/js/events_order.html
    document.addEventListener("keypress", listenAndBlock(keypressHandlers), true);
    document.addEventListener("keydown", listenAndBlock(keydownHandlers), true);
    document.addEventListener("keyup", listenAndBlock(keyupHandlers), true);
}

