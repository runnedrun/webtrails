//Comment = function(note, top, left, trailPreview, $siteDocument) {
//    var spacing = 30;
//    var editButton;
//    var commentTextElement;
//
//    this.update = function() {
//        commentTextElement.html(note.comment);
//    }
//
//    this.remove = function(){
//        thisComment.commentContainer.remove();
//    };
//
//    function editCommentText(){
//        console.log("editing comment");
//        commentTextElement.attr("contentEditable","true");
//
//
//        if(editButton){
//            editButton.find("img").attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAMCAQAAAATvv9SAAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACjSURBVHjabMyxCoJQGIbhT49SIHTKqT8Eh5YiSMJdzgXUZXg/De1NzQ0RzVGznF2hS6jd4G8QA8/xXR94ASuSdCSJPoj0kiNNUpgg7mEyxGBaz1wbfADj6nQAQAmdSTarNaecclYWij1QEn9WHGmKDYAzv4y2Lmq8MYEPIKj2+ebpfAFxfT1UHQoEEB0AwF6hsjLtrP61aEGLu1sPNMgLE34DAH8QRrvgchq2AAAAAElFTkSuQmCC");
//            editButton.unbind("click");
//            editButton.click(function() {
//                Request.updateNoteComment(note, commentTextElement.html(), function(resp){
//                    noteUpdateCallback(resp, commentTextElement.html());
//                })
//            });
//        }
//
//        commentTextElement.unbind("click");
//        $(document).click(editCommentOnClickAway)
//
//        commentTextElement.keypress(function(e){
//            console.log("got keypress");
//            var code = (e.keyCode ? e.keyCode : e.which);
//            if (code == 13 && !e.shiftKey){
//                Request.updateNoteComment(note, commentTextElement.html(), function(resp){
//                    noteUpdateCallback(resp, commentTextElement.html());
//                });
//                return false
//            }
//        });
//        commentTextElement.focus();
//        return false
//    }
//
//    function noteUpdateCallback(resp, commentText){
//        commentTextElement.attr("contentEditable","false");
//
//        if(editButton){
//            editButton.find("img").attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAPCAQAAACVKo38AAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACzSURBVHjaYmDAAiT5JeUZGBixSTAfZFL4bc+CKSEjwsz5k//dQSZMHa/WFZfw3pF9xYguIaTPwPDxUk+N8mcWdAlWBgYGSY6Dp0LeIttxQe+/8X/j/3a3zzn8ZyFXggXm3N8MDAzcdyakGh5h/APXI18of3G1r91tNKMYGBgYtK7o/Ze/uNoXXYJFUp5FW+CO9u6Dp0LeIhnFwMDAkCO+Lfy/yX+Z/xhBxvCf5T8HA1YAGABa1UrG5e0BmAAAAABJRU5ErkJggg==");
//            editButton.unbind("click");
//            editButton.click(editCommentText);
//        }
//
//        commentTextElement.click(editCommentText);
//        commentTextElement.blur(); // lose focus, and blue highlight
//        var noteID = commentTextElement.data("note-id");
//
//        note.updateComment(commentText);
//        commentTextElement.html(commentText);
//
//        //in case you change the note from the popup, you need it changed in the view page too
//        $("[data-note-id="+noteID+"] .noteComment").html(commentText)
//        $(".noteViewer").unbind("click");
//    }
//
//    function editCommentOnClickAway(e) {
//        console.log("checking for click away", e.target);
//
//        if ((e.target != commentTextElement[0])){
//            // if the click is anywhere but the comment then save the note and unselect
//            console.log("saving note");
//            Request.updateNoteComment(note, commentTextElement.html(), function(resp){
//                noteUpdateCallback(resp, commentTextElement.html());
//            })
//        }
//    }
//
//    this.createCommentContainer = function() {
//        var commentContainer = HTML.commentContainer();
//
//        var commentOverlay = commentTextElement = HTML.commentOverlay(note.comment || "");
//        commentOverlay.attr("data-note-id",note.id);
//
//        var closeCommentContainer = HTML.closeCommentContainer();
//        closeCommentContainer.click(this.remove);
//
//        var closeCommentX = HTML.closeCommentX();
//        closeCommentContainer.append(closeCommentX);
//
//        if (note.comment && (typeof note.comment == "string") && note.comment != "") {
//            commentContainer.append(commentOverlay);
//            closeCommentContainer.css({"border-left": "1px solid black"});
//        } else {
//            closeCommentContainer.css(CSS.commentContainerWithNoText);
//        }
//
//        commentContainer.append(closeCommentContainer);
//
//        if (canEdit()) {
//            editButton = HTML.editButton();
//
//            var editIcon = HTML.editCommentIcon();
//            editButton.append(editIcon);
//            editButton.click(editCommentText);
//            // or if you click the words, you can edit them.
//            commentOverlay.click(editCommentText);
//
//            var deleteButton = HTML.deleteButton();
//
//            var deleteIcon = HTML.deleteCommentIcon();
//            deleteButton.append(deleteIcon);
//            deleteButton.click(function() { trailPreview.deleteNote(note) });
//
//            commentContainer.append(deleteButton);
//            commentContainer.append(editButton);
//        }
//
//        var topPosition  =  top - spacing;
//
//        var offsetFromBottom = $siteDocument.height() - top + spacing;
//
//        var leftPosition = left;
//        commentContainer.css("bottom", offsetFromBottom +"px");
//        commentContainer.css("left", leftPosition+"px");
//        $siteDocument.find("html").css("position","relative");
//        return commentContainer;
//    };
//
//    var Statics = {
//        overlayMaxWidth: "200px"
//    }
//
//    var CSS = {
//        commentContainer: {
//            "background-color": "transparent",
//            "color":"black",
//            "position":"absolute",
//            "z-index": "2147483647",
//            "line-height": "normal"
//        },
//        commentOverlay: {
//            "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
//            "background": "white",
//            "max-width": Statics.overlayMaxWidth,
//            "display":"inline-block",
//            "padding":"7px 2px 0px 3px",
//            "font-size":"13px",
//            "text-align":"left",
//            "border": "2px solid black",
//            "-webkit-border-top-left-radius": "5px",
//            "-webkit-border-bottom-left-radius": "5px",
//            "-moz-border-radius-topleft": "5px",
//            "-moz-border-radius-bottomleft": "5px",
//            "border-top-left-radius": "5px",
//            "border-bottom-left-radius": "5px",
//            "line-height": "normal",
//            "word-wrap": "break-word"
//        },
//        closeCommentContainer: {
//            "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
//            "border-top": "2px solid black",
//            "border-bottom": "2px solid black",
//            display:"inline-block",
//            "border-left": "1px solid black",
//            padding:"6px 2px 6px 2px",
//            "background-color": "#f0f0f0",
//            "margin": "0",
//            "vertical-align":"baseline",
//            "line-height": "normal",
//            "font-size": "16px",
//            "cursor": "pointer",
//            "float": "right",
//            "-webkit-border-top-right-radius": "5px",
//            "-webkit-border-bottom-right-radius": "5px",
//            "-moz-border-radius-topright": "5px",
//            "-moz-border-radius-bottomright": "5px",
//            "border-top-right-radius": "5px",
//            "border-bottom-right-radius": "5px",
//            "border-right":"2px solid black",
//        },
//        closeCommentX: {
//            height: "10px",
//            "line-height": "normal",
//            border: "0",
//            margin: "0",
//            padding: "0",
//            "vertical-align": "bottom",
//            "font-size": "16px"
//        },
//        commentContainerWithNoText: {
//            "-webkit-border-top-left-radius": "5px",
//            "-webkit-border-bottom-left-radius": "5px",
//            "-moz-border-radius-topleft": "5px",
//            "-moz-border-radius-bottomleft": "5px",
//            "border-top-left-radius": "5px",
//            "border-bottom-left-radius": "5px",
//            "border-left":"2px solid black"
//        },
//        editButton: {
//            "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
//            "border-top": "2px solid black",
//            "border-bottom": "2px solid black",
//            display:"inline-block",
//            "border-left": "1px solid black",
//            padding:"3px 2px 3px 2px",
//            "background-color": "#f0f0f0",
//            "margin": "0",
//            "vertical-align":"baseline",
//            "line-height": "normal",
//            "font-size": "16px",
//            "cursor": "pointer",
//            "float": "right"
//        },
//        editCommentIcon: {
//            height: "16px",
//            "line-height": "normal",
//            border: "0",
//            margin: "0",
//            padding: "0",
//            "vertical-align": "bottom",
//            "font-size": "16px"
//        },
//        deleteButton: {
//            "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
//            "border-top": "2px solid black",
//            "border-bottom": "2px solid black",
//            display:"inline-block",
//            "border-left": "1px solid black",
//            padding:"3px 2px 3px 2px",
//            "background-color": "#f0f0f0",
//            "margin": "0",
//            "vertical-align":"baseline",
//            "line-height": "normal",
//            "font-size": "16px",
//            "cursor": "pointer",
//            "float": "right"
//        },
//        deleteCommentIcon: {
//            height: "16px",
//            "line-height": "normal",
//            border: "0",
//            margin: "0",
//            padding: "0",
//            "vertical-align": "bottom",
//            "font-size": "16px"
//        }
//    }
//
//    var HTML = {
//        commentContainer: function() {
//            return $("<div>")
//                .css(CSS.commentContainer)
//                .addClass("commentOverlay")
//                .addClass("webtrails");
//        },
//        commentOverlay: function(commentText) {
//            return $("<div>")
//                .html(commentText)
//                .css(CSS.commentOverlay)
//                .addClass("comment-text")
//        },
//        closeCommentContainer: function() {
//            return $("<div>")
//                .css(CSS.closeCommentContainer)
//        },
//        closeCommentX: function() {
//            return $("<img>")
//                .css(CSS.closeCommentX)
//                .attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAALCAQAAADsZ9STAAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAC+SURBVHjaLI0xbsJAFAVn7bWiyIUjV3wpJcW6IhEuI8wFuAMNyil8B3cpfYu4i+QLQCILJRLu6OloMPhTbN50U8wDpJadJACSyE5qsFI/rSNOrRQQtulseAHz+hs4GDj9QDqLgPEv/Nx/vQ1pyMPkcRIBcf/xjtrtcnGYq2dx2C7VBuZadpeR/13GsjNXI0nY+hb49q0wz99exT2cp14H2dGralNt4h4isiPqVo3P+8tVow5Qp7laALWaq4P7ACFUSsKl/FDNAAAAAElFTkSuQmCC");
//        },
//        editButton: function() {
//            return $("<div>")
//                .css(CSS.editButton)
//                .addClass("editCommentContainer")
//        },
//        editCommentIcon: function() {
//            return $("<img>")
//                .css(CSS.editCommentIcon)
//                .attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAPCAQAAACVKo38AAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACzSURBVHjaYmDAAiT5JeUZGBixSTAfZFL4bc+CKSEjwsz5k//dQSZMHa/WFZfw3pF9xYguIaTPwPDxUk+N8mcWdAlWBgYGSY6Dp0LeIttxQe+/8X/j/3a3zzn8ZyFXggXm3N8MDAzcdyakGh5h/APXI18of3G1r91tNKMYGBgYtK7o/Ze/uNoXXYJFUp5FW+CO9u6Dp0LeIhnFwMDAkCO+Lfy/yX+Z/xhBxvCf5T8HA1YAGABa1UrG5e0BmAAAAABJRU5ErkJggg==");
//        },
//        deleteButton: function(){
//            return $("<div>")
//                .css(CSS.deleteButton);
//        },
//        deleteCommentIcon: function() {
//            return $("<img>")
//                .css(CSS.deleteCommentIcon)
//                .attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAQCAQAAABnqj2yAAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACDSURBVHjavI4xCsJQEETfBltlO8Nv9AqpPICl5/CwniJo8dFCCNo7Fn8DxnxbB4aBfczumvilRYlk9GwAOOdtMCHEwTrJ5fJOipmJJGhoyaUfmc0EXj01mIA0+yUbNGXJ/jg1BILLfeoPVNM/kQnYXYf1kiej/XZqA7H6ar94jKiq9wBVaTFDLLMAdgAAAABJRU5ErkJggg==");
//        }
//    }
//
//    this.commentContainer = this.createCommentContainer();
//    var thisComment = this;
//    if ($siteDocument.length > 0) {
//        $siteDocument.find("body").append(this.commentContainer);
//    }
//}