function widgets_PopUpImage(src, title, isWithArrows, triggerName) { /* the isWithArrows parameter let the popupImage function to know if suppose to be nav arrows in the pop up window */
    var tempImage = new Image();
    tempImage.src = src + "?v=" + new Date().getTime();
    tempImage.onload = function () {
        GetParent().PopUpImage(src, title, tempImage.width, tempImage.height, isWithArrows);
        if (triggerName) {
            $(window).trigger(triggerName);
        }
    }
}

function widgets_scrollToElement(event, anchorlink) {
    GetParent().scrollToElement(anchorlink, event);
}

function widgets_linkToUrl(link) {
    window.open(link, '_blank');
}

function openPage(newLocation) {
    window.location.href = newLocation;
}

function widgets_linkToPage(page) {
    GetParent().openPage(page);
}

function GetParent() {
    if (parent && parent.ISSTUDIO) {
        return parent;
    }
    else {
        return window;
    }
}


///// UPDATE FULL WIDTH /////
rtime_magicWidget = new Date();
var timeout_magicWidget = false;
var delta_magicWidget = 200;
$(window).on( "windowResize", function() {
    rtime_magicWidget = new Date();
    if (timeout_magicWidget === false) {
        timeout_magicWidget = true;
        setTimeout(resizeend_magicWidget, delta_magicWidget);
}
});

function resizeend_magicWidget() {
    if (new Date() - rtime_magicWidget < delta_magicWidget) {
        setTimeout(resizeend_magicWidget, delta_magicWidget);
} else {
    timeout_magicWidget = false;                
    updateMagicWidgetFullWidth();
}               
}

function updateMagicWidgetFullWidth() {       
    setTimeout(function () {
        $(".dataTypeMagicWidget.fit_to_bg_new").each(function () {
            try {
                window["fixWidgetAccordingToMediaQuery_" + this.getAttribute('data-id') + "_ey"](this.getAttribute('data-id') + "_ey");
            }catch (e){}            
        });
    }, 100);
}
////////////////////////////////////


function SetImageOptimization(src, oW, oH, widgetUniqueId, width, height) {
    try {
        if (toInt) {
            width = toInt(width);
            height = toInt(height);
        } else {
            width = parseInt(width);
            height = parseInt(height);
        }

        var w400 = 400;
        var h400 = w400 * oH / oW;

        var w512 = 512;
        var h512 = w512 * oH / oW;

        var w650 = 650;
        var h650 = w650 * oH / oW;

        var w850 = 850;
        var h850 = w850 * oH / oW;

        var w1024 = 1024;
        var h1024 = w1024 * oH / oW;

        var step;

        if (w400 <= oW && w400 >= width && h400 >= height) step = 400;
        else if (w512 <= oW && w512 >= width && h512 >= height) step = 512;
        else if (w650 <= oW && w650 >= width && h650 >= height) step = 650;
        else if (w850 <= oW && w850 >= width && h850 >= height) step = 850;
        else if (w1024 <= oW && w1024 >= width && h1024 >= height) step = 1024;
        else step = -1;

        return step;
    }
    catch (e) {
        return -1;
    }
}