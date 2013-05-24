console.log("autoresize loaded");

// Autosize 1.9.1 - jQuery plugin for textareas
// (c) 2011 Jack Moore - jacklmoore.com
// license: www.opensource.org/licenses/mit-license.php


function initializeAutoResize(){
    (function (wt_$) {
        var
            hidden = 'hidden',
            borderBox = 'border-box',
            copy = '<textarea tabindex="-1" style="position:absolute; top:-9999px; left:-9999px; right:auto; bottom:auto; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden">',
        // line-height is omitted because IE7/IE8 doesn't return the correct value.
            copyStyle = [
                'fontFamily',
                'fontSize',
                'fontWeight',
                'fontStyle',
                'letterSpacing',
                'textTransform',
                'wordSpacing',
                'textIndent'
            ],
            oninput = 'oninput',
            onpropertychange = 'onpropertychange',
            test = wt_$(copy)[0];

        test.setAttribute(oninput, "return");

        if (wt_$.isFunction(test[oninput]) || onpropertychange in test) {
            wt_$.fn.autosize = function (className) {
                return this.each(function () {
                    var
                        ta = this,
                        wt_$ta = wt_$(ta),
                        mirror,
                        minHeight = wt_$ta.height(),
                        maxHeight = parseInt(wt_$ta.css('maxHeight'), 10),
                        active,
                        i = copyStyle.length,
                        resize,
                        boxOffset = 0;

                    if (wt_$ta.css('box-sizing') === borderBox || wt_$ta.css('-moz-box-sizing') === borderBox || wt_$ta.css('-webkit-box-sizing') === borderBox){
                        boxOffset = wt_$ta.outerHeight() - wt_$ta.height();
                    }

                    if (wt_$ta.data('mirror') || wt_$ta.data('ismirror')) {
                        // if autosize has already been applied, exit.
                        // if autosize is being applied to a mirror element, exit.
                        return;
                    } else {
                        mirror = wt_$(copy).data('ismirror', true).addClass(className || 'autosizejs')[0];

                        resize = wt_$ta.css('resize') === 'none' ? 'none' : 'horizontal';

                        wt_$ta.data('mirror', wt_$(mirror)).css({
                            overflow: hidden,
                            overflowY: hidden,
                            wordWrap: 'break-word',
                            resize: resize
                        });
                    }

                    // Opera returns '-1px' when max-height is set to 'none'.
                    maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 9e4;

                    // Using mainly bare JS in this function because it is going
                    // to fire very often while typing, and needs to very efficient.
                    function adjust() {
                        var height, overflow;
                        // the active flag keeps IE from tripping all over itself.  Otherwise
                        // actions in the adjust function will cause IE to call adjust again.
                        if (!active) {
                            active = true;

                            mirror.value = ta.value;

                            mirror.style.overflowY = ta.style.overflowY;

                            // Update the width in case the original textarea width has changed
                            mirror.style.width = wt_$ta.css('width');

                            // Needed for IE to reliably return the correct scrollHeight
                            mirror.scrollTop = 0;

                            // Set a very high value for scrollTop to be sure the
                            // mirror is scrolled all the way to the bottom.
                            mirror.scrollTop = 9e4;

                            height = mirror.scrollTop;
                            overflow = hidden;
                            if (height > maxHeight) {
                                height = maxHeight;
                                overflow = 'scroll';
                            } else if (height < minHeight) {
                                height = minHeight;
                            }
                            ta.style.overflowY = overflow;

                            ta.style.height = height + boxOffset + 'px';

                            // This small timeout gives IE a chance to draw it's scrollbar
                            // before adjust can be run again (prevents an infinite loop).
                            setTimeout(function () {
                                active = false;
                            }, 1);
                        }
                    }

                    // mirror is a duplicate textarea located off-screen that
                    // is automatically updated to contain the same text as the
                    // original textarea.  mirror always has a height of 0.
                    // This gives a cross-browser supported way getting the actual
                    // height of the text, through the scrollTop property.
                    while (i--) {
                        mirror.style[copyStyle[i]] = wt_$ta.css(copyStyle[i]);
                    }

                    wt_$('body').append(mirror);

                    if (onpropertychange in ta) {
                        if (oninput in ta) {
                            // Detects IE9.  IE9 does not fire onpropertychange or oninput for deletions,
                            // so binding to onkeyup to catch most of those occassions.  There is no way that I
                            // know of to detect something like 'cut' in IE9.
                            ta[oninput] = ta.onkeyup = adjust;
                        } else {
                            // IE7 / IE8
                            ta[onpropertychange] = adjust;
                        }
                    } else {
                        // Modern Browsers
                        ta[oninput] = adjust;
                    }

                    wt_$(window).resize(adjust);

                    // Allow for manual triggering if needed.
                    wt_$ta.bind('autosize', adjust);

                    // Call adjust in case the textarea already contains text.
                    adjust();
                });
            };
        } else {
            // Makes no changes for older browsers (FireFox3- and Safari4-)
            wt_$.fn.autosize = function () {
                return this;
                color:"white";   };
        }

    }(wt_$));
}