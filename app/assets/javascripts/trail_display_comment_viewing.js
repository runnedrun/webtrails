function createCommentOverlay(commentText,xPos,yPos){
    var spacing = 10;
    var overlayMaxWidth = 300;

    var commentContainer = $("<div>");
    commentContainer.css({
        "background-color": "transparent",
        "color":"black",
        "position":"absolute",
        "z-index": "2147483647",
        "line-height": "normal",
    });
    commentContainer.addClass("commentOverlay");
    commentContainer.addClass("webtrails");

    var commentOverlay = $("<div>");
    commentOverlay.html(commentText);
    commentOverlay.css({
        "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
        "background": "white",
        "max-width": overlayMaxWidth,
        "display":"inline-block",
        "padding":"7px 2px 0px 3px",
        "font-size":"13px",
        "text-align":"left",
        "border": "2px solid black",
        "-webkit-border-top-left-radius": "5px",
        "-webkit-border-bottom-left-radius": "5px",
        "-moz-border-radius-topleft": "5px",
        "-moz-border-radius-bottomleft": "5px",
        "border-top-left-radius": "5px",
        "border-bottom-left-radius": "5px",
        "line-height": "normal",
        "word-wrap": "break-word"
    });
    commentOverlay.addClass("commentText");

    var closeCommentContainer = $("<div>");
    closeCommentContainer.css({
        "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
        "border-top": "2px solid black",
        "border-bottom": "2px solid black",
        display:"inline-block",
        "border-left": "1px solid black",
        padding:"3px 2px 3px 2px",
        "background-color": "#f0f0f0",
        "margin": "0",
        "vertical-align":"baseline",
        "line-height": "normal",
        "font-size": "16px",
        "cursor": "pointer",
        "float": "right",
        "-webkit-border-top-right-radius": "5px",
        "-webkit-border-bottom-right-radius": "5px",
        "-moz-border-radius-topright": "5px",
        "-moz-border-radius-bottomright": "5px",
        "border-top-right-radius": "5px",
        "border-bottom-right-radius": "5px",
        "border-right":"2px solid black",
    });
    closeCommentContainer.click(closeCurrentNoteAndRemoveHighlight);

    var closeCommentX = $("<img>")
    closeCommentX.css({
        height: "16px",
        "line-height": "normal",
        border: "0",
        margin: "0",
        padding: "0",
        "vertical-align": "bottom",
        "font-size": "16px",
        "height": "10px",
        "padding-top": "3.2px",
        "padding-bottom": "3.1px"
    })
    closeCommentX.attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAALCAQAAADsZ9STAAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAC+SURBVHjaLI0xbsJAFAVn7bWiyIUjV3wpJcW6IhEuI8wFuAMNyil8B3cpfYu4i+QLQCILJRLu6OloMPhTbN50U8wDpJadJACSyE5qsFI/rSNOrRQQtulseAHz+hs4GDj9QDqLgPEv/Nx/vQ1pyMPkcRIBcf/xjtrtcnGYq2dx2C7VBuZadpeR/13GsjNXI0nY+hb49q0wz99exT2cp14H2dGralNt4h4isiPqVo3P+8tVow5Qp7laALWaq4P7ACFUSsKl/FDNAAAAAElFTkSuQmCC");
    closeCommentContainer.append(closeCommentX);

    if (commentText && (typeof commentText == "string") && commentText != "") {
        commentContainer.append(commentOverlay);
        closeCommentContainer.css({"border-left": "1px solid black"});
    } else {
        closeCommentContainer.css({
            "-webkit-border-top-left-radius": "5px",
            "-webkit-border-bottom-left-radius": "5px",
            "-moz-border-radius-topleft": "5px",
            "-moz-border-radius-bottomleft": "5px",
            "border-top-left-radius": "5px",
            "border-bottom-left-radius": "5px",
            "border-left":"2px solid black"
        });
    }

    commentContainer.append(closeCommentContainer);

    if (editAccess) {
        var editCommentContainer = $("<div>");
        editCommentContainer.css({
            "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
            "border-top": "2px solid black",
            "border-bottom": "2px solid black",
            display:"inline-block",
            "border-left": "1px solid black",
            padding:"3px 2px 3px 2px",
            "background-color": "#f0f0f0",
            "margin": "0",
            "vertical-align":"baseline",
            "line-height": "normal",
            "font-size": "16px",
            "cursor": "pointer",
            "float": "right"
        });
        editCommentContainer.addClass("editCommentContainer");

        var editComment = $("<img>");
        editComment.css({
            height: "16px",
            "line-height": "normal",
            border: "0",
            margin: "0",
            padding: "0",
            "vertical-align": "bottom",
            "font-size": "16px",
        })
        editComment.attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAPCAQAAACVKo38AAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACzSURBVHjaYmDAAiT5JeUZGBixSTAfZFL4bc+CKSEjwsz5k//dQSZMHa/WFZfw3pF9xYguIaTPwPDxUk+N8mcWdAlWBgYGSY6Dp0LeIttxQe+/8X/j/3a3zzn8ZyFXggXm3N8MDAzcdyakGh5h/APXI18of3G1r91tNKMYGBgYtK7o/Ze/uNoXXYJFUp5FW+CO9u6Dp0LeIhnFwMDAkCO+Lfy/yX+Z/xhBxvCf5T8HA1YAGABa1UrG5e0BmAAAAABJRU5ErkJggg==");
        editCommentContainer.append(editComment);
        editCommentContainer.click(function(e){editCurrentComment(commentOverlay,editCommentContainer)});
        // or if you click the words, you can edit them.
        commentOverlay.click(function(e){editCurrentComment(commentOverlay,editCommentContainer)});

        var deleteCommentContainer = $("<div>");
        deleteCommentContainer.css({
            "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
            "border-top": "2px solid black",
            "border-bottom": "2px solid black",
            display:"inline-block",
            "border-left": "1px solid black",
            padding:"3px 2px 3px 2px",
            "background-color": "#f0f0f0",
            "margin": "0",
            "vertical-align":"baseline",
            "line-height": "normal",
            "font-size": "16px",
            "cursor": "pointer",
            "float": "right"
        });

        var deleteComment = $("<img>");
        deleteComment.css({
            height: "16px",
            "line-height": "normal",
            border: "0",
            margin: "0",
            padding: "0",
            "vertical-align": "bottom",
            "font-size": "16px",
        })
        deleteComment.attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAQCAQAAABnqj2yAAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACDSURBVHjavI4xCsJQEETfBltlO8Nv9AqpPICl5/CwniJo8dFCCNo7Fn8DxnxbB4aBfczumvilRYlk9GwAOOdtMCHEwTrJ5fJOipmJJGhoyaUfmc0EXj01mIA0+yUbNGXJ/jg1BILLfeoPVNM/kQnYXYf1kiej/XZqA7H6ar94jKiq9wBVaTFDLLMAdgAAAABJRU5ErkJggg==");
        deleteCommentContainer.append(deleteComment);
        deleteCommentContainer.click(deleteCurrentNoteFromTrail);

        commentContainer.append(deleteCommentContainer);
        commentContainer.append(editCommentContainer);
    }

    insertHTMLInIframe(commentContainer,currentSite);

//    var overlayWidth = getComputedStyleOfElementInIframe(commentOverlay,"width");
    var overlayHeightString = getComputedStyleOfElementInIframe(commentContainer[0],"height");
    var overlayHeightFloat = parseFloat(overlayHeightString.slice(0,overlayHeightString.length -2));
    var topPosition  =  yPos;
    var topPosition  =  yPos + spacing
//    if (topPosition < 0) {
//        topPosition = yPos + spacing * 2;
//    }
    var leftPosition = xPos;

    commentContainer.css("top", topPosition+"px");
    commentContainer.css("left", leftPosition+"px");
    return commentContainer;
}

function removeCurrentComment(){
    if (currentCommentBox){
        currentCommentBox.remove();
    }
}

function editCurrentComment($commentText,$editContainer){
    console.log("editing comment");
    var editButton = $editContainer;
    var commentText = $commentText;
    commentText.attr("contentEditable","true");
    editButton.find("img").attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAMCAQAAAATvv9SAAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACjSURBVHjabMyxCoJQGIbhT49SIHTKqT8Eh5YiSMJdzgXUZXg/De1NzQ0RzVGznF2hS6jd4G8QA8/xXR94ASuSdCSJPoj0kiNNUpgg7mEyxGBaz1wbfADj6nQAQAmdSTarNaecclYWij1QEn9WHGmKDYAzv4y2Lmq8MYEPIKj2+ebpfAFxfT1UHQoEEB0AwF6hsjLtrP61aEGLu1sPNMgLE34DAH8QRrvgchq2AAAAAElFTkSuQmCC");
    editButton.unbind("click");
    commentText.unbind("click");
    editButton.click(function(){saveCommentToServer($commentText,$editContainer)});
    commentText.keypress(function(e){
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13 && !e.shiftKey){
            saveCommentToServer($commentText,$editContainer)
            return false
        }
    });
    commentText.focus();
}
function saveCommentToServer($commentText,$editContainer){
    console.log("saving to server");
    console.log($commentText.html());
    $.ajax({
        url: "/notes/update",
        type: "post",
        data: {
            "id" : getCurrentNoteID(),
            "comment": $commentText.html()
        },
        success: function(resp){console.log("note saved");noteUpdateCallback(resp,$commentText,$editContainer)}
    });
}

function noteUpdateCallback(resp, $commentText,$editContainer){
    var editButton = $editContainer;
    var commentText = $commentText;
    commentText.attr("contentEditable","false");
    editButton.find("img").attr("src","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAPCAQAAACVKo38AAAACXBIWXMAAAsTAAALEwEAmpwYAAADGGlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjaY2BgnuDo4uTKJMDAUFBUUuQe5BgZERmlwH6egY2BmYGBgYGBITG5uMAxIMCHgYGBIS8/L5UBFTAyMHy7xsDIwMDAcFnX0cXJlYE0wJpcUFTCwMBwgIGBwSgltTiZgYHhCwMDQ3p5SUEJAwNjDAMDg0hSdkEJAwNjAQMDg0h2SJAzAwNjCwMDE09JakUJAwMDg3N+QWVRZnpGiYKhpaWlgmNKflKqQnBlcUlqbrGCZ15yflFBflFiSWoKAwMD1A4GBgYGXpf8EgX3xMw8BSMDVQYqg4jIKAUICxE+CDEESC4tKoMHJQODAIMCgwGDA0MAQyJDPcMChqMMbxjFGV0YSxlXMN5jEmMKYprAdIFZmDmSeSHzGxZLlg6WW6x6rK2s99gs2aaxfWMPZ9/NocTRxfGFM5HzApcj1xZuTe4FPFI8U3mFeCfxCfNN45fhXyygI7BD0FXwilCq0A/hXhEVkb2i4aJfxCaJG4lfkaiQlJM8JpUvLS19QqZMVl32llyfvIv8H4WtioVKekpvldeqFKiaqP5UO6jepRGqqaT5QeuA9iSdVF0rPUG9V/pHDBYY1hrFGNuayJsym740u2C+02KJ5QSrOutcmzjbQDtXe2sHY0cdJzVnJRcFV3k3BXdlD3VPXS8Tbxsfd99gvwT//ID6wIlBS4N3hVwMfRnOFCEXaRUVEV0RMzN2T9yDBLZE3aSw5IaUNak30zkyLDIzs+ZmX8xlz7PPryjYVPiuWLskq3RV2ZsK/cqSql01jLVedVPrHzbqNdU0n22VaytsP9op3VXUfbpXta+x/+5Em0mzJ/+dGj/t8AyNmf2zvs9JmHt6vvmCpYtEFrcu+bYsc/m9lSGrTq9xWbtvveWGbZtMNm/ZarJt+w6rnft3u+45uy9s/4ODOYd+Hmk/Jn58xUnrU+fOJJ/9dX7SRe1LR68kXv13fc5Nm1t379TfU75/4mHeY7En+59lvhB5efB1/lv5dxc+NH0y/fzq64Lv4T8Ffp360/rP8f9/AA0ADzT6lvFdAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACzSURBVHjaYmDAAiT5JeUZGBixSTAfZFL4bc+CKSEjwsz5k//dQSZMHa/WFZfw3pF9xYguIaTPwPDxUk+N8mcWdAlWBgYGSY6Dp0LeIttxQe+/8X/j/3a3zzn8ZyFXggXm3N8MDAzcdyakGh5h/APXI18of3G1r91tNKMYGBgYtK7o/Ze/uNoXXYJFUp5FW+CO9u6Dp0LeIhnFwMDAkCO+Lfy/yX+Z/xhBxvCf5T8HA1YAGABa1UrG5e0BmAAAAABJRU5ErkJggg==");
    editButton.unbind("click");
    editButton.click(function(){editCurrentComment($commentText,$editContainer)});
    $commentText.click(function(){editCurrentComment($commentText,$editContainer)});
    $commentText.blur(); // lose focus, and blue highlight
}

// Not used, removed from the UI on the view toolbar
function showOrHideCurrentComment(){
    if($("#turnOffCommentsCheckbox").is(":checked")){
        $(iframeContentWindow().document).find(".commentOverlay").hide();
    }else{
        $(iframeContentWindow().document).find(".commentOverlay").show();
    }
}