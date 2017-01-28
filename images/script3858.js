try {
    if (window == window.top) {
        eraseCookie("documentdomain");
    }
    var documentdomain = getParameterByName("documentdomain");
    if (!documentdomain) {
        documentdomain = readCookie("documentdomain");
    }
    if (documentdomain && documentdomain != "") {
        document.domain = documentdomain;
        createCookie("documentdomain", documentdomain, 1);
    }
} catch (e) {
}

var skr = null;
var skrOptions = {
    forceHeight: false
};
//var $bp_data = null;
//var _lastBreakpoint = '';
var isMobileDevice = false;
//Same as in jquery.flexslider.js (but sometimes only this is loaded). Also the same as in General.js in the studio.
var enumCaptionAnimation = {
    NoAnimation: "No Animation",
    FadeIn: "Fade In",
    SlideUp: "Slide Up",
    SlideDown: "Slide Down",
    SlideRight: "Slide Right",
    SlideLeft: "Slide Left",
    SlideHorizontally: "Slide Horizontally",
    SlideVertically: "Slide Vertically"
};

var captionAnimationTimeout; //for saving (and later clearing) delay of caption animation "animate" effects
var $bp_data = null;
var _lastBreakpoint = '';
var scrollWidth = 0;

function toInt(value, defaultValue) {
    returnValue = 0;
    if (!defaultValue) defaultValue = 0;
    try {
        returnValue = parseInt(value) || defaultValue;
    }
    catch (e) {
        log(e);
    }

    return returnValue;
}

function reinitParallaxAccordingToBreakpoint() {
    if (skrollr.get()) {
        var curSkr = skrollr.get();

        curSkr.destroy(function () {
            skrollr.init(skrOptions);
            skr = skrollr.get();
        });
    }
    else {
        skrollr.init(skrOptions);
        skr = skrollr.get();
    }
}

$(window).resize(function () {
    if (dontResize == true) return; //dont do resize during change mediaquery event working
    removeZoomForNotMobileDevices();
    var parallaxedElements = $('[data-parallax]').filter(function () {
        //return ($(this).is(':visible') == true && (!this.getAttribute('data-initbr') || this.getAttribute('data-initbr') == _currentBreakpoint));
        return ($(this).is(':visible') == true);
    });
    parallaxedElements.removeClass('show-parallax');
    updateMainPanelWidth();

    if (parallaxedElements.length > 0) {
        UpdateStylesForNonParallaxBreakpoint(parallaxedElements);
    }

    updateVideoWidth(true);
    updateVideoBackground(true);

    handleresizeDefaultGallery();
    parallaxedElements.addClass('show-parallax')
    //SetBackgroundAttachment();
    prepareFixedMobileMenu()

    /* Fallback in for beacking point */
    if ($('.mobile-menu')) {
        if ($('.mobile-toggle').css('display') == 'none') $('.mobile-menu').closest('.mobile').hide();
    }
    $(window).trigger("windowResize");
});

function prepareFixedMobileMenu() {
    //$('.mobile-menu').closest('.dataTypeMenu').css('overflow-y','auto').css('overflow-x','hidden');
    var fixedMenus = $('.mobile-menu').closest('.dataTypeMenu').filter(function () {
        return window.getComputedStyle(this).position == 'fixed'
    })
    fixedMenus.each(function () {
        $(this).css('overflow-y', 'auto').css('overflow-x', 'hidden')
        var mobileMenuToggle = getMobileMenuToggleByMenu(this.id)[0];
        var height = document.documentElement.clientHeight - window.getComputedStyle(this).top.replace('px', '');
        var maxHeight = Math.floor(height * 0.7)
        $(this).css('max-height', maxHeight);
        $(this).css('height', 'auto');
    })

}

function UpdateStylesForNonParallaxBreakpoint(parallaxedElements) {
    if (parallaxedElements.length > 0) {
        var mainContent = $('.dataTypeMainContent')[0] || $('[data-type="MainContent"]')[0];
        parallaxedElements.each(function () {
            if (this.getAttribute('data-initbr') && this.getAttribute('data-initbr') != _currentBreakpoint) {
                if ($(this).hasClass('video_fit_to_bg') || $(this).hasClass('video_fit_to_width'))
                    return;
                if ($(this).hasClass('fit_to_bg_new')) {
                    this.style.width = 'auto';
                    this.style.right = '0px';
                    this.style.left = '0px';
                }
                else {
                    $(this).css(
                    {
                        top: '',
                        left: ''
                    });
                    var newLeft = toInt(getStyle(this, 'left')) - toInt(getStyle(this, 'borderLeftWidth')) + mainContent.offsetLeft;
                    var newTop = toInt(getStyle(this, 'top')) - toInt(getStyle(this, 'borderTopWidth'));
                    $(this).css(
                    {
                        top: newTop,
                        left: newLeft
                    });
                }
            }
        });
    }
}

$(window).scroll(function () {
    //fixBackgroundPositionForAttachment();
});

function handleresizeDefaultGallery() {

    var enumFittingType = {
        OriginalSize: 0,
        FitToWidth: 1,
        FitToHeight: 2,
        Stretch: 3,
        Pattern: 4,
        None: 5,
        RepeatX: 6,
        RepeatY: 7
    };
    var enumImagePositionType = {
        TopLeft: 0,
        TopRight: 1,
        BottomRight: 2,
        BottomLeft: 3,
        Center: 4,
        None: 5,
        TopCenter: 6,
        BottomCenter: 7,
        Right: 8,
        Left: 9
    };

    $('.DefaultGallery').each(function (index) {
        var elm = this.children[0];

        var properites = {
            'at': 'slide',
            //at - animationType
            'iw': 0,
            //iw - itemWidth
            'im': 0,
            //im - itemMargin
            'ft': 3,
            //ft - fittingType
            'pt': 4 //pt - positionType
        };

        properties = GetParamsFromClassName(this, properites);


        var $img = $(elm).find('ul.slides li').children('img');

        // remove pattern
        $img.css("display", "inline");
        $img.parent().css("background-repeat", "no-repeat").css("background-image", "none");

        var galleryWidth = elm.clientWidth;
        var galleryHeight = elm.clientHeight;

        $img.each(function (i, img) {
            var originalWidth = this.getAttribute("data-initialWidth");
            var originalHeight = this.getAttribute("data-initialHeight");
            var ft = properites.ft * 1;
            switch (ft) {
                case enumFittingType.OriginalSize:
                    $(this).css("width", originalWidth + 'px').css("height", originalHeight + 'px');
                    break;
                case enumFittingType.FitToWidth:
                    var ratio = originalHeight / originalWidth;
                    var imageWidth = galleryWidth;
                    var imageHeight = imageWidth * ratio;
                    $(this).css("width", imageWidth + 'px').css("height", imageHeight + 'px');
                    break;
                case enumFittingType.FitToHeight:
                    var ratio = originalHeight / originalWidth;
                    var imageHeight = galleryHeight;
                    var imageWidth = imageHeight / ratio;
                    $(this).css("width", imageWidth + 'px').css("height", imageHeight + 'px');
                    break;
                case enumFittingType.Stretch:
                    var imageHeight = galleryHeight;
                    var imageWidth = galleryWidth;
                    $(this).css("width", imageWidth + 'px').css("height", imageHeight + 'px');
                    break;
                case enumFittingType.Pattern:
                    this.style.display = "none";
                    this.parentNode.style.width = galleryWidth + 'px';
                    this.parentNode.style.height = galleryHeight + 'px';
                    this.parentNode.style.backgroundRepeat = "repeat";
                    this.parentNode.style.backgroundImage = "url(" + this.src + ")";
                    break;
            }
            var pt = properites.pt * 1;
            switch (pt) {
                case enumImagePositionType.TopLeft:
                    $(this).css("margin-left", '0px').css("margin-top", '0px');
                    break;
                case enumImagePositionType.TopRight:
                    $(this).css("margin-left", (galleryWidth - toInt($(this).css("width"))) + 'px').css("margin-top", '0px');
                    break;
                case enumImagePositionType.BottomRight:
                    $(this).css("margin-left", (galleryWidth - toInt($(this).css("width"))) + 'px').css("margin-top", (galleryHeight - toInt($(this).css("height"))) + 'px');
                    break;
                case enumImagePositionType.BottomLeft:
                    $(this).css("margin-left", '0px').css("margin-top", (galleryHeight - toInt($(this).css("height"))) + 'px');
                    break;
                case enumImagePositionType.Center:
                    $(this).css("margin-left", (galleryWidth - toInt($(this).css("width"))) / 2 + 'px').css("margin-top", (galleryHeight - toInt($(this).css("height"))) / 2 + 'px');
                    break;
            }

        });
    });
}

function removeZoomForNotMobileDevices() {
    if (navigator.userAgent.match(/iPad/i)) {
        isMobileDevice = true;
    }

    if (navigator.userAgent.match(/iPod/i)) {
        isMobileDevice = true;
    }

    if (navigator.userAgent.match(/iPhone/i)) {
        isMobileDevice = true;
    }

    if (navigator.userAgent.match(/Android/i)) {
        isMobileDevice = true;
    }

    if (navigator.userAgent.match(/BlackBerry/i)) {
        isMobileDevice = true;
    }

    if (navigator.userAgent.match(/Windows Phone/i)) {
        isMobileDevice = true;
    }

    if (navigator.userAgent.match(/Opera Mobi/i)) {
        isMobileDevice = true;
    }

    if (navigator.userAgent.match(/webOS/i)) {
        isMobileDevice = true;
    }

    if (isMobileDevice == false) {
        try {
            document.getElementsByTagName("html")[0].style.zoom = 1;
            if (navigator.userAgent.match(/firefox/i))
                document.getElementsByTagName("html")[0].setAttribute("style", "-moz-transform:none");
            if (window.innerWidth)
                scrollWidth = window.innerWidth - document.documentElement.clientWidth;
        }
        catch (e)
        { }
    }
}

var dontResize = false;

function LeftFix() {
    dontResize = true; //dont do resize during change mediaquery event working
    try {
        prevMainContentOffsetLeft = 0;
        var mainContent = $('.dataTypeMainContent')[0] || $('[data-type="MainContent"]')[0];

        var fixedElements = $('[data-type]').filter(function () { return $(this).css('position') == "fixed" });
        fixedElements.each(function () {
            if (!$(this).hasClass('fit_to_bg_new')) {
                $($(this)[0]).css('left', '');
            }
        });
        var parallaxedElements = $('[data-parallax]').filter(function () {
            //return ($(this).is(':visible') == true && (!this.getAttribute('data-initbr') || this.getAttribute('data-initbr') == _currentBreakpoint));
            return ($(this).is(':visible') == true);
        });
        parallaxedElements.removeClass('show-parallax');
        parallaxedElements.each(function () {
            var parallaxIsActiveInCurrentBreakPoint = !this.getAttribute('data-initbr') || this.getAttribute('data-initbr') == _currentBreakpoint;
            if (parallaxIsActiveInCurrentBreakPoint) { //reset inline style for element with parallax in specific Breakpoint only, there is parallax disabled
                this.style.left = '';
                this.style.top = '';
            }
        });
        if (parallaxedElements.length > 0) {
            reinitParallaxAccordingToBreakpoint();
        }
        parallaxedElements.addClass('show-parallax');
    }
    catch (e)
    { }
    finally {
        dontResize = false;
    }
}

function AddMatchMediaListenersForMediaQuery() {
    /// <summary>Run code whenever window is resized and a media query point is CROSSED (e.g. phone rotate). The code may run more than once. </summary>
    if (window.matchMedia) {
        var mediaQueries = ['screen and (max-width:959px)',
                       'screen and (max-width:767px)',
            'screen and (max-width:479px)'
        ];
        mediaQueries.forEach(function (query) {
            window.matchMedia(query).addListener(function (mql) {
                resetPushEventListeners();
                handleMainAndFooterContentHeightAccordingToChildrenBottom();
                SetCurrentBreakPointBodyClass();

                LeftFix();
                SetDefaultRepeaterPage();
                createPushEventListeners(true);
                $(window).trigger("mediaQueriesChange");
            });
        });
    }
}

function setBreakPoint() {
    var viewport = document.querySelector("meta[name=viewport]");
    if (!viewport) return;
    viewport.setAttribute('content', 'width=device-width, initial-scale=1');

    var width = document.body.scrollWidth;
    var startsfrom_val = null;
    var bp_val = null;
    var pc_val = null;

    var $bp_data = $('.bp_data');

    for (i = 0; i < $bp_data.length; i++) {
        var bp_data = $bp_data[i];
        var startsfrom = bp_data.getAttribute("data-startsfrom");
        var value = bp_data.getAttribute("data-value");
        var bp = bp_data.getAttribute("data-bp");
        if (startsfrom > width && !bp_val) {
            startsfrom_val = startsfrom;
            bp_val = value;
        }
        if (bp == "pc" && !bp_val) {
            bp_val = value;
        }

    }
    if (bp_val > width) {
        initial = width / bp_val;
        viewport.setAttribute('content', 'width=device-width, initial-scale=' + initial);
    }
}

function handleMainAndFooterContentHeightAccordingToChildrenBottom() {
    /// <summary>Fixes "MainContent" height in the page, in case it has a child element that is lower than it.</summary>
    /* (Gilad, 22.7.15) This situation happens "by design" in at least two scenarios:
    
     a) An element which is lower than the ip's MainContent was moved to the master page using "repeat on all pages".
     b) An element which is lower than the breakpoint's MainContent was inserted in a higher breakpoint.
    
     In both cases, the height of MainContent is NOT updated in the JSON. Instead, there are different "fix functions" that enlarge the height:
    
     * In the studio, there's some function that adds "min-height" to the MainContent ONLY WHEN IT'S RENDERED.
     * In the publisher, there "FixMainContentCenterHeight" function that is supposed to fix problem a only, but the fix from there doesn't get to the site.
     * This function here in the script that fixes both problems - a and b.
     */
    var $main = $('main');
    var $mainContent = $main.find('[data-type="MainContent"]');
    var mainContent = $mainContent[0];
    mainContent.style.height = ""; //clear previous calculation - the height will be taken from the CSS (that came from the publisher). Important when resizing to lower BP.
    var mainContentBottom = mainContent.clientHeight + $main[0].offsetTop;
    $mainContent.children('[data-type]:visible').each(function () {
        //Some elements have "block_important" class - they might be actually hidden in the css, but are temporarily shown (later this class is removed).  See also other comments about this here in script.js.
        //To solve this bug, maybe remove "block_important" class, check if element is display:none, ignore it if it is, and then put "block_important" back. 
        if ($(this).hasClass('block_important')) {
            $(this).removeClass('block_important');
            if ($(this).css('display') != "none") {
                var elementBottom = this.clientHeight + this.offsetTop;
                mainContentBottom = Math.max(elementBottom, mainContentBottom);
            }
            $(this).addClass('block_important');
        } else {
            var elementBottom = this.clientHeight + this.offsetTop;
            mainContentBottom = Math.max(elementBottom, mainContentBottom);
        }
    });
    mainContent.style.height = mainContentBottom - $main[0].offsetTop + 'px';

}

function SetCurrentBreakPointBodyClass() {
    var width = document.body.scrollWidth + scrollWidth - 1;
    var bp_val = null;
    var data_br = "pc";
    //var $bp_data = $('.bp_data');

    for (i = 0; i < $bp_data.length; i++) {
        var bp_data = $bp_data[i];
        var startsfrom = bp_data.getAttribute("data-startsfrom");
        var value = bp_data.getAttribute("data-value");
        var bp = bp_data.getAttribute("data-bp");
        if (startsfrom > width && !bp_val) {
            bp_val = value;
            data_br = bp;
        }
        if (bp == "pc" && !bp_val) {
            bp_val = value;
            data_br = bp;
        }
    }
    _currentBreakpoint = data_br;

    if (_lastBreakpoint != _currentBreakpoint) {
        _lastBreakpoint = _currentBreakpoint;
        document.body.setAttribute('class', data_br + '_view');
        //console.log("update curBp " + _currentBreakpoint);
    }
}
setTimeout(function () { if (document.body.style.display == 'none') { document.body.style.display = 'block' } }, 2500)
$(document).ready(function () {
    document.body.style.display = 'block';
    $bp_data = $('.bp_data');
    removeZoomForNotMobileDevices();
    SetCurrentBreakPointBodyClass();
    AddMatchMediaListenersForMediaQuery();
    var parallaxedElements = $('[data-parallax]').filter(function () {
        //return ($(this).is(':visible') == true && (!this.getAttribute('data-initbr') || this.getAttribute('data-initbr') == _currentBreakpoint));
        return ($(this).is(':visible') == true);
    });
    // causing gap in maincontent customer bugs v7
    handleMainAndFooterContentHeightAccordingToChildrenBottom();
    updateMainPanelWidth();
    fixHideVimeoControl();
    updateVideoBackground(true);
    updateVideoWidth(true);
    updateVideoHeight();

    if (parallaxedElements.length > 0) {
        //skr = skrollr.init(skrOptions);
        UpdateStylesForNonParallaxBreakpoint(parallaxedElements);
    }

    handleImageTextCaption();
    handleDefaultGallery();
    handleMatrixGallery();

    //fix text caption in gallery that includes 'contenteditable'
    $('div[data-reference="body"]').each(function () {
        $(this).removeAttr("contenteditable");
    });

    var vph = $(window).height();
    if ($(document).height() > vph) {
        $('html').css('height', 'auto');
    }

    $('.width_height_max').css('width', '100%', 'height', '100%');

    $(".popup_anchor").closest(".image_text_caption").find(".inner_text_con").mouseover(function (event) {
        $(this).css("cursor", "pointer");
    });

    //fix menu to fire onmouseover for IE
    if (($.browser && $.browser.msie) || isIE11) {
        FixTextRtlForIE();
        $('ul.image_wa').each(function () {
            $(this).css('width', $(this).find('li').first().css('width'));
        });
    };

    $(".block_important").removeClass("block_important"); //this class is added in the publisher, we think it's to avoid problems with flex-slider that crashes on
    //"display: none" elements. Maybe this line can be moved earlier. See also other comments about this here in script.js.

    $("[data-formmode='MessageMode']").addClass("none_important");
    parallaxedElements.addClass('show-parallax');


    //SetBackgroundAttachment();

    var imageGalleryObjects = document.getElementsByClassName("galleryTextCaption");
    for (var i = 0; i < imageGalleryObjects.length; i++) {
        if (imageGalleryObjects[i] && imageGalleryObjects[i].children[0])
            imageGalleryObjects[i].style.height = imageGalleryObjects[i].children[0].offsetHeight + "px";
    }


    /* Mobile Menu Binds */
    $('.mobile-toggle').click(mobileMenuToggle);
    $('.mobile button').click(mobileMenuExpand);

    /* Hide the mobile menu when someone click on link*/
    $('.mobile a').click(function () {
        $(this).closest('.mobile').hide();
    });
    prepareFixedMobileMenu();
    createPushEventListeners(false);
    $(window).trigger("documentReady");
});

if (!window.getComputedStyle) {
    window.getComputedStyle = function (el, pseudo) {
        this.el = el;
        this.getPropertyValue = function (prop) {
            var re = /(\-([a-z]){1})/g;
            if (prop == 'float') prop = 'styleFloat';
            if (re.test(prop)) {
                prop = prop.replace(re, function () {
                    return arguments[2].toUpperCase();
                });
            }
            return el.currentStyle[prop] ? el.currentStyle[prop] : null;
        }
        return this;
    }
}

function getStyle(elm, prop) {
    if (isIE && isWin && !isOpera) {
        return ((window.getComputedStyle(elm, null).getPropertyValue(prop) != "") ? window.getComputedStyle(elm, null).getPropertyValue(prop) : window.getComputedStyle(elm, null)[prop])
    }
    else {
        return window.getComputedStyle(elm, null)[prop]
    }
}
var prevMainContentOffsetLeft = 0;
$(window).keydown(function (event) {
    event = event || window.event;
    var keycode = event.charCode || event.keyCode;
    if (keycode === 27) {
        var imagepopup_overlay = document.getElementById("imagepopup_overlay");
        if (imagepopup_overlay) {
            imagepopup_overlay.parentNode.removeChild(imagepopup_overlay);
        }
    }
});
//------------------------------------------------------------
// Text Caption - (Image Over & Image Out) functions
//------------------------------------------------------------

//called on document.ready
function handleImageTextCaption() {
    $('.imageTextCaption').each(

        function prepareImageCaptionAnimation() {
            /// <summary>Moves the text caption elements to their correct starting position according to their animation.
            /// For example, "SlideRight" captions are moved left outside of the wrapper div.</summary>
            if ($(this)[0].children[0].offsetWidth != 0) $(this).css('width', $(this)[0].children[0].offsetWidth)
            if ($(this)[0].children[0].offsetHeight != 0) $(this).css('height', $(this)[0].children[0].offsetHeight);
            var captionAnimationType = $(this)[0].children[0].getAttribute('data-captionAnimationType');
            switch (captionAnimationType) {
                case enumCaptionAnimation.SlideUp:
                    $(this.children[0]).css('top', $(this)[0].offsetHeight);
                    break;
                case enumCaptionAnimation.SlideDown:
                    $(this.children[0]).css('top', -$(this)[0].offsetHeight);
                    break;
                case enumCaptionAnimation.SlideRight:
                    $(this.children[0]).css('left', -$(this)[0].offsetWidth);
                    break;
                case enumCaptionAnimation.SlideLeft:
                    $(this.children[0]).css('left', $(this)[0].offsetWidth);
                    break;
            }
        });
    $('.imageTextCaption').click(function (ev) {
        $(this).closest('.image_text_caption').find('a.popup_anchor').trigger('click'); /*ev.cancelBubble = true;return false;*/
    });
    $('.imageTextCaption .text_caption').click(function (ev) {
        var popup_anchor = $(this).closest('.image_text_caption').find('.popup_anchor')[0];
        if (!popup_anchor) return;
        var src = popup_anchor.getAttribute('data-src');
        var title = popup_anchor.getAttribute('data-title');
        var originalWidth = popup_anchor.getAttribute('data-originalWidth');
        var originalHeight = popup_anchor.getAttribute('data-originalHeight');
        PopUpImage(src, title, originalWidth, originalHeight); /*ev.cancelBubble = true;return false;*/
    });

}

function handleImageEvent(ev, isImageOver) {
    /// <summary>Runs caption animation.</summary>
    /// <param name="isImageOver">Boolean - if true, it's an "imageOver" event, false - it's an "imageOut" event</param>

    //(27.8.15) Since the publisher writes *3* onmouseovers and *2* onmouseout for each image, and the gallery also has these unnecessary events,
    //I think the purpose of the code here is to find the actual caption animation and exit if there isn't one. See comments in publisher's "Text.cs"/"Image.cs".
    ev = ev || event;
    var elm = ev.srcElement || ev.target;
    var $imageel = $(elm).closest(".image_text_caption");
    if ($imageel.length == 0) return;
    var imageel = $imageel[0];
    var textel = $(imageel).find(".dataTypeText")[0] || $(imageel).find("[data-type='text']")[0];
    if (!isImageOver) {
        if ($(imageel).find(ev.relatedTarget).length > 0) return;
    }


    var captionAnimationDuration = textel.getAttribute('data-captionAnimationDuration') * 1000;
    var entranceDelay = textel.getAttribute('data-captionAnimationDelay') * 1000;
    var captionAnimationDelay = isImageOver ? entranceDelay : 0; //On exit, there should be no delay

    function doAnimation(animationDef, isFadeIn) {
        /// <summary>Runs the actual jquery "animate" using the provided parameter - for both "Over" and "Out" events.</summary>
        var $elm = isFadeIn ? $(textel.parentNode) : $(textel);
        if (entranceDelay > 0 && captionAnimationTimeout) {
            //Only clear timeout if element has delay && timeout is defined.
            //It seems the correct logic would be to add "&& !isImageOver" - i.e. clear timeout only on mouseOut events. But for some reason, this (clearing them on mouseOver too) works much better...
            clearTimeout(captionAnimationTimeout);
        }
        var classForAnimating = "animating",
            classForFinishedAnimation = "finishedEntranceAnimation";
        if (isImageOver || $elm.hasClass(classForAnimating) || $elm.hasClass(classForFinishedAnimation)) {
            //don't do anything when mousing out of element with the caption outside

            if ($elm.hasClass(classForAnimating)) { //is(':animated') didn't work well enough.
                $elm.stop().removeClass(classForAnimating); //Fixed the annoying bug that was around for 2.5 years...
                captionAnimationDelay = 0; //We were in the middle of an animation, so don't use delay for continuing it
            }

            function reallyDoAnimation() {
                $elm.removeClass(classForFinishedAnimation).addClass(classForAnimating);

                $elm.animate(animationDef, captionAnimationDuration, function () { //callback for "animate"
                    if (isImageOver) $elm.addClass(classForFinishedAnimation);
                    $elm.removeClass(classForAnimating);
                })
            }

            if (captionAnimationDelay == 0) {
                //No need for timeout if there's no delay
                reallyDoAnimation();
            }
            else {
                captionAnimationTimeout = setTimeout(function () {
                    reallyDoAnimation()
                }, captionAnimationDelay);
            }

        }
    }

    //There's similar code inside flexSlider itself, and it's responsible for the image GALLERIES text caption animation.
    switch (textel.getAttribute('data-captionAnimationType')) {
        //Run animation with definitions for the jquery "animate". The first refers to "imageOver" event, the second - "imageOut"
        case enumCaptionAnimation.FadeIn:
            doAnimation(isImageOver ?
            {
                opacity: 1
            } :
            {
                opacity: 0
            }, true);
            break;
        case enumCaptionAnimation.SlideUp:
            doAnimation(isImageOver ?
            {
                top: 0
            } :
            {
                top: textel.offsetHeight
            });
            break;
        case enumCaptionAnimation.SlideDown:
            doAnimation(isImageOver ?
            {
                top: 0
            } :
            {
                top: -textel.offsetHeight
            });
            break;
        case enumCaptionAnimation.SlideRight:
            doAnimation(isImageOver ?
            {
                left: 0
            } :
            {
                left: -textel.offsetWidth
            });
            break;
        case enumCaptionAnimation.SlideLeft:
            doAnimation(isImageOver ?
            {
                left: 0
            } :
            {
                left: textel.offsetWidth
            });
            break;
    }
}

//------------------------------------------------------------
// Menu functions
//------------------------------------------------------------

function MenuOver(menu, ev, direction, ulId) {

    ev = ev || event;
    var elm = ev.srcElement || ev.target;
    var pos = GETGLOBALPOSITION(menu);

    if (menu.id.indexOf('menuElement') == 0) {
        var lis = menu.parentNode.children;

        for (var i = 0; i < lis.length; i++) {
            var childMenu = lis[i].getAttribute('childMenu') ? lis[i].getAttribute('childMenu') : lis[i].getAttribute('data-childMenu');
            if (childMenu) {
                document.getElementById(childMenu).style.display = "none";
            }
        }
    }
    else if (menu.id.indexOf('mainMenuElement') == 0) {
        var lisMain = menu.parentNode.children;

        for (var i = 0; i < lisMain.length; i++) {

            var childMenuId = lisMain[i].getAttribute('childmenu') ? lisMain[i].getAttribute('childMenu') : lisMain[i].getAttribute('data-childMenu');
            if (childMenuId) {
                var childMenu = document.getElementById(childMenuId);
                var lisChild = childMenu.children;
                for (var j = 0; j < lisChild.length; j++) {
                    HideMenuFromParent(lisChild[j]);
                }
            }
        }
    }
    else if (ulId && menu.id.indexOf('mainMenuElement') == 0) {
        var lis = document.getElementById(ulId).children;

        for (var i = 0; i < lis.length; i++) {
            var childMenu = lis[i].getAttribute('childMenu') ? lis[i].getAttribute('childMenu') : lis[i].getAttribute('data-childMenu');
            if (childMenu) {
                document.getElementById(childMenu).style.display = "none";
            }
        }
    }

    if (!ulId) return;

    var child = document.getElementById(ulId);
    child.style.position = "absolute";
    child.style.display = "block";
    var children = child.childNodes;
    for (var i = 0; i < children.length; i++) {
        var sub = children[i];
        sub.parentMenu = menu;
    }

    if (menu.id.indexOf("mainMenuElement") == 0) {
        //window.status = menu.layout;
        var topFixer = 0;
        var leftFixer = 0;

        /* Handler for Vertical Menu */
        if ($(menu).closest('.menu').hasClass('vertical')) {
            if ($(menu).closest('.menu').hasClass('right')) {
                leftFixer = -$(child).outerWidth(true);
            }
            else {
                leftFixer = $(menu).outerWidth(true);
            }
            topFixer = -$(menu).outerHeight(true);
        }

        child.style.top = (pos.top + topFixer) + menu.offsetHeight + "px";
        child.style.left = (pos.left + leftFixer) + "px";
    }
    else {
        child.style.top = pos.top + "px";
        if (direction == "rtl") child.style.left = (pos.left - child.scrollWidth) + "px";
        else child.style.left = pos.left + menu.offsetWidth + "px";
    }
}

function MenuOverTest(menu, ev, direction, ulId, changeTop) {

    var pos = GETGLOBALPOSITION(menu);
    if (!ulId) return;
    var child = document.getElementById(ulId);

    child.style.position = "absolute";
    child.style.display = "block";
    var children = child.childNodes;
    for (var i = 0; i < children.length; i++) {
        var sub = children[i];
        sub.parentMenu = menu;
    }

    if (menu.id.indexOf("mainMenuElement") == 0) {
        child.style.top = (menu.clientHeight) + "px";
    }
}

function MenuOut(menu, ev, ulId) {
    ev = ev || event;
    var elm = ev.srcElement || ev.target;
    var menuElement = GetMenuElement(ev);

    if (menuElement) {
        return;
    }

    HideChildMenu(menu, menuElement, ulId);
    HideMenu(menu, menuElement);
}

function menuLiClick(menu, ev, href, newTab) {
    var evElem = ev.srcElement || ev.target;
    if (evElem.tagName.toLowerCase() != "li") return;
    if (evElem.children[0].onclick && evElem.children[0].onclick.toString().indexOf('scrollToElement(\'') > '-1') {
        evElem.children[0].click();
    }
    else {
        if (newTab == "true") window.open('', '_new').location.href = href;
        else window.location.href = href;
    }
}

function HideChildMenu(menu, menuElement, ulId) {

    if (menu.id.indexOf("mainMenu") == 0) {
        if (!menuElement || menuElement == menu.nextSibling || menuElement == menu.previousSibling) {
            if (ulId) {
                var child = document.getElementById(ulId);
                child.style.display = "none";
            }
        }
    }
    else if (menu.id.indexOf("menuElement") == 0) {
        if (ulId) {
            var child = document.getElementById(ulId);
            child.style.display = "none";
        }
    }
}

function HideMenu(menu, menuElement) {

    if (!menuElement && menu.id.indexOf("mainMenuElement") != 0 && menu.id.indexOf("mainMenuVerElement") != 0) {

        menu.parentNode.style.display = "none";
        if (menu.parentMenu) HideMenu(menu.parentMenu);
    }
}

function HideMenuFromParent(menu) {
    if (!menu) return;
    menu.parentNode.style.display = "none";
    var childMenuId = menu.getAttribute('childmenu') ? menu.getAttribute('childmenu') : menu.getAttribute('data-childmenu');

    if (childMenuId) {
        var childMenu = document.getElementById(childMenuId);
        if (childMenu) HideMenuFromParent(childMenu.children[0]);
    }

}

function GETGLOBALPOSITION(elm, toElement) {
    var left = 0;
    var top = 0;

    while (elm) {
        if (elm == toElement) break;
        left += elm.offsetLeft;
        top += elm.offsetTop;
        elm = elm.offsetParent;
    }
    return {
        top: top,
        left: left
    };
}

function GetMenuElement(ev) {
    ev = ev || event;
    var elm = ev.toElement || ev.relatedTarget || ev.currentTarget;

    if (elm.tagName.toLowerCase() == 'li') {
        elm = elm.parentNode;
    }

    if (elm.tagName.toLowerCase() == 'ul') {
        elm = elm.children[0];
    }

    while (elm) {
        if (!elm.getAttribute) return null;
        if (elm.id.indexOf("menuElement") == 0) break;
        elm = elm.parentNode;
    }
    return elm;
}
//------------------------------------------------------------
// Form functions
//------------------------------------------------------------

function AjaxHandler() {
    this.Send = function (method, url, params, bAsync, OnComplete, OnError) {
        var req;
        if (window.XMLHttpRequest) req = new XMLHttpRequest();
        else if (window.ActiveXObject) req = new ActiveXObject('Microsoft.XMLHTTP');

        if (bAsync) {
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    if (req.status < 400) {
                        if (OnComplete) OnComplete(req);
                    }
                    else if (OnError) OnError(req.status, req.statusText, req.responseText);
                }
            }
        }
        req.open(method, url, bAsync);

        if (params) {
            req.setRequestHeader('Content-Type', 'application/soap+xml; charset=utf-8');
            req.setRequestHeader('Content-Length', params.length);
            req.send(params);
        }
        else req.send();

        return req;
    }
}

function Encode(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/''/g, '&quot;').replace(/''/g, '&apos;');
}

function IsEmail(emailToCheck) {
    if (emailToCheck == '') return false;
    var currentChar;
    for (var i = 0; i < emailToCheck.length; i++) {
        currentChar = emailToCheck.charAt(i);
        if ((currentChar < 'a' || currentChar > 'z') && (currentChar < 'A' || currentChar > 'Z') && (currentChar < '0' || currentChar > '9') && (currentChar != '_') && (currentChar != '-') && (currentChar != '@') && (currentChar != '.')) return false;
    }
    var atPosition = emailToCheck.indexOf('@');
    if (atPosition < 1) return false;
    if (atPosition < emailToCheck.lastIndexOf('@')) return false;
    if (atPosition > emailToCheck.lastIndexOf('.') - 2) return false;
    if (emailToCheck.lastIndexOf('.') > emailToCheck.length - 3) return false;
    return true;
}

function IsDate(entry) {
    try {
        var mo, day, yr;
        var re = /\b\d{1,2}[\/|\-|\.]\d{1,2}[\/|\-|\.]\d{2,4}\b/;
        if (re.test(entry)) {
            var delimChar = (entry.indexOf('/') != -1) ? '/' : (entry.indexOf('.') != -1) ? '.' : '-';
            var delim1 = entry.indexOf(delimChar);
            var delim2 = entry.lastIndexOf(delimChar);
            mo = parseInt(entry.substring(0, delim1), 10);
            day = parseInt(entry.substring(delim1 + 1, delim2), 10);
            yr = parseInt(entry.substring(delim2 + 1), 10);
            var testDate = new Date(yr, mo - 1, day);
            if (testDate.getDate() == day) {
                if (testDate.getMonth() + 1 == mo) {
                    if (testDate.getFullYear() == yr || testDate.getYear() == yr) {
                        return true;
                    }
                }
            }
        }
    }
    catch (e)
    { }
    return false;
}

function IsNumber(sNum) {
    var regxp = /^[0-9]+$/;
    if (!regxp.test(sNum)) return false;
    return true;
}

function IsPhone(value) {
    value = value.replace(/\./g, '').replace(/ /g, '').replace(/-/g, '').replace(/\+/g, '').replace(/\(/g, '').replace(/\)/g, '');
    var regxp = /^[0-9]+$/;
    if (!regxp.test(value) || value.length < 7) return false;
    return true;

}

function GenerateEnvelope(siteId, pageName, formId, formFields, recievingEmail, recievingEmailFrom, recievingEmailSubject) {
    if (!recievingEmailFrom) {
        recievingEmailFrom = "no-reply@design-editor.com";
    }
    if (!recievingEmailSubject) {
        recievingEmailSubject = "New Form Submission From Your Website";
    }
    else {
        recievingEmailSubject = recievingEmailSubject.replace('&', 'and');
    }
    var envelope = '<?xml version="1.0" encoding="utf-8"?>' + '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">' + '<soap12:Body>' + '<SaveForm xmlns="http://tempuri.org/">' + '<siteId>' + siteId + '</siteId>' + '<pageName>' + pageName + '</pageName>' + '<formId>' + formId + '</formId>' + '<formFields>' + Encode(formFields) + '</formFields>' + '<recievingEmailAddress>' + recievingEmail + '</recievingEmailAddress>' + '<recievingEmailFrom>' + recievingEmailFrom + '</recievingEmailFrom>' + '<recievingEmailSubject>' + recievingEmailSubject + '</recievingEmailSubject>' + '</SaveForm>' + '</soap12:Body>' + '</soap12:Envelope>';


    return envelope;

}

function showMessageMode(node) {
    var formMode;
    if (node.getAttribute) {
        formMode = node.getAttribute('data-formmode');
        if (formMode == 'FormMode') {
            //"block_important" is completely removed elsewhere here in script.js - see other comments about it.
            $(node).removeClass("block_important");
            $(node).addClass("none_important");
        }
        else if (formMode == 'MessageMode') {
            $(node).removeClass("none_important");
            $(node).addClass("block_important");
        }

        for (var i = 0; i < node.children.length; i++) {
            showMessageMode(node.children[i]);
        }
    }
}

function hideErrorMessages(node) {
    var etc;
    if (node.getAttribute) {
        etc = node.getAttribute('data-etc');

        if (etc == 'FormErrorMessage') node.style.display = 'none';

        for (var i = 0; i < node.children.length; i++) {
            hideErrorMessages(node.children[i]);
        }
    }
}
//------------------------------------------------------------
// Flash functions
//------------------------------------------------------------
//v1.7
// Flash Player Version Detection
// Detect Client Browser type
// Copyright 2005-2007 Adobe Systems Incorporated.  All rights reserved.
var isIE = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
var isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
var isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;
var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);

function ControlVersion() {
    var version;
    var axo;
    var e;

    // NOTE : new ActiveXObject(strFoo) throws an exception if strFoo isn't in the registry
    try {
        // version will be set for 7.X or greater players
        axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
        version = axo.GetVariable("$version");
    }
    catch (e)
    { }

    if (!version) {
        try {
            // version will be set for 6.X players only
            axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");

            // installed player is some revision of 6.0
            // GetVariable("$version") crashes for versions 6.0.22 through 6.0.29,
            // so we have to be careful. 
            // default to the first public version
            version = "WIN 6,0,21,0";

            // throws if AllowScripAccess does not exist (introduced in 6.0r47)		
            axo.AllowScriptAccess = "always";

            // safe to call for 6.0r47 or greater
            version = axo.GetVariable("$version");

        }
        catch (e)
        { }
    }

    if (!version) {
        try {
            // version will be set for 4.X or 5.X player
            axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
            version = axo.GetVariable("$version");
        }
        catch (e)
        { }
    }

    if (!version) {
        try {
            // version will be set for 3.X player
            axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
            version = "WIN 3,0,18,0";
        }
        catch (e)
        { }
    }

    if (!version) {
        try {
            // version will be set for 2.X player
            axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            version = "WIN 2,0,0,11";
        }
        catch (e) {
            version = -1;
        }
    }

    return version;
}

// JavaScript helper required to detect Flash Player PlugIn version information

function GetSwfVer() {
    // NS/Opera version >= 3 check for Flash plugin in plugin array
    var flashVer = -1;

    if (navigator.plugins != null && navigator.plugins.length > 0) {
        if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
            var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
            var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
            var descArray = flashDescription.split(" ");
            var tempArrayMajor = descArray[2].split(".");
            var versionMajor = tempArrayMajor[0];
            var versionMinor = tempArrayMajor[1];
            var versionRevision = descArray[3];
            if (versionRevision == "") {
                versionRevision = descArray[4];
            }
            if (versionRevision[0] == "d") {
                versionRevision = versionRevision.substring(1);
            }
            else if (versionRevision[0] == "r") {
                versionRevision = versionRevision.substring(1);
                if (versionRevision.indexOf("d") > 0) {
                    versionRevision = versionRevision.substring(0, versionRevision.indexOf("d"));
                }
            }
            var flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
        }
    }
        // MSN/WebTV 2.6 supports Flash 4
    else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = 4;
        // WebTV 2.5 supports Flash 3
    else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = 3;
        // older WebTV supports Flash 2
    else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 2;
    else if (isIE && isWin && !isOpera) {
        flashVer = ControlVersion();
    }
    return flashVer;
}

// When called with reqMajorVer, reqMinorVer, reqRevision returns true if that version or greater is available

function DetectFlashVer(reqMajorVer, reqMinorVer, reqRevision) {
    versionStr = GetSwfVer();
    if (versionStr == -1) {
        return false;
    }
    else if (versionStr != 0) {
        if (isIE && isWin && !isOpera) {
            // Given "WIN 2,0,0,11"
            tempArray = versionStr.split(" "); // ["WIN", "2,0,0,11"]
            tempString = tempArray[1]; // "2,0,0,11"
            versionArray = tempString.split(","); // ['2', '0', '0', '11']
        }
        else {
            versionArray = versionStr.split(".");
        }
        var versionMajor = versionArray[0];
        var versionMinor = versionArray[1];
        var versionRevision = versionArray[2];

        // is the major.revision >= requested major.revision AND the minor version >= requested minor
        if (versionMajor > parseFloat(reqMajorVer)) {
            return true;
        }
        else if (versionMajor == parseFloat(reqMajorVer)) {
            if (versionMinor > parseFloat(reqMinorVer)) return true;
            else if (versionMinor == parseFloat(reqMinorVer)) {
                if (versionRevision >= parseFloat(reqRevision)) return true;
            }
        }
        return false;
    }
}

function AC_AddExtension(src, ext) {
    if (src.indexOf('?') != -1) return src.replace(/\?/, ext + '?');
    else return src + ext;
}

function AC_Generateobj(objAttrs, params, embedAttrs) {
    var str = '';
    if (isIE && isWin && !isOpera) {
        str += '<object ';
        for (var i in objAttrs) {
            str += i + '="' + objAttrs[i] + '" ';
        }
        str += '>';
        for (var i in params) {
            str += '<param name="' + i + '" value="' + params[i] + '" /> ';
        }
        str += '</object>';
    }
    else {
        str += '<embed ';
        for (var i in embedAttrs) {
            str += i + '="' + embedAttrs[i] + '" ';
        }
        str += '> </embed>';
    }

    document.write(str);
}

function AC_FL_RunContent() {
    var ret = AC_GetArgs(arguments, ".swf", "movie", "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000", "application/x-shockwave-flash");
    AC_Generateobj(ret.objAttrs, ret.params, ret.embedAttrs);
}

function AC_SW_RunContent() {
    var ret = AC_GetArgs(arguments, ".dcr", "src", "clsid:166B1BCA-3F9C-11CF-8075-444553540000", null);
    AC_Generateobj(ret.objAttrs, ret.params, ret.embedAttrs);
}

function AC_GetArgs(args, ext, srcParamName, classid, mimeType) {
    var ret = new Object();
    ret.embedAttrs = new Object();
    ret.params = new Object();
    ret.objAttrs = new Object();
    for (var i = 0; i < args.length; i = i + 2) {
        var currArg = args[i].toLowerCase();

        switch (currArg) {
            case "classid":
                break;
            case "pluginspage":
                ret.embedAttrs[args[i]] = args[i + 1];
                break;
            case "src":
            case "movie":
                args[i + 1] = AC_AddExtension(args[i + 1], ext);
                ret.embedAttrs["src"] = args[i + 1];
                ret.params[srcParamName] = args[i + 1];
                break;
            case "onafterupdate":
            case "onbeforeupdate":
            case "onblur":
            case "oncellchange":
            case "onclick":
            case "ondblclick":
            case "ondrag":
            case "ondragend":
            case "ondragenter":
            case "ondragleave":
            case "ondragover":
            case "ondrop":
            case "onfinish":
            case "onfocus":
            case "onhelp":
            case "onmousedown":
            case "onmouseup":
            case "onmouseover":
            case "onmousemove":
            case "onmouseout":
            case "onkeypress":
            case "onkeydown":
            case "onkeyup":
            case "onload":
            case "onlosecapture":
            case "onpropertychange":
            case "onreadystatechange":
            case "onrowsdelete":
            case "onrowenter":
            case "onrowexit":
            case "onrowsinserted":
            case "onstart":
            case "onscroll":
            case "onbeforeeditfocus":
            case "onactivate":
            case "onbeforedeactivate":
            case "ondeactivate":
            case "type":
            case "codebase":
            case "id":
                ret.objAttrs[args[i]] = args[i + 1];
                break;
            case "width":
            case "height":
            case "align":
            case "vspace":
            case "hspace":
            case "class":
            case "title":
            case "accesskey":
            case "name":
            case "tabindex":
                ret.embedAttrs[args[i]] = ret.objAttrs[args[i]] = args[i + 1];
                break;
            default:
                ret.embedAttrs[args[i]] = ret.params[args[i]] = args[i + 1];
        }
    }
    ret.objAttrs["classid"] = classid;
    if (mimeType) ret.embedAttrs["type"] = mimeType;
    return ret;
}

//*********************************************************************************
// gallery scroller
//*********************************************************************************
var ourInterval;
var scrollSpeed = 10;
var scrollDelta = 5;
var igObj;

var Scroller = {
    Init: function (id) {
        igObj = document.getElementById(id);
    },
    Start: function (direction, id) {
        ourInterval = setInterval("Scroller." + direction + "('" + id + "')", scrollSpeed);
    },
    End: function () {
        clearInterval(ourInterval);
    },
    Right: function (id) {
        this.Init(id);
        igObj.scrollLeft -= scrollDelta;
    },
    Left: function (id) {
        this.Init(id);
        igObj.scrollLeft += scrollDelta;
    },
    Up: function (id) {
        this.Init(id);
        igObj.scrollTop -= scrollDelta;
    },
    Down: function (id) {
        this.Init(id);
        igObj.scrollTop += scrollDelta;
    }
}

//*********************************************************************************
// search
//*********************************************************************************
var pageNumber = 1;
var totalPages = 1;
var currPage = 1;

function OnSearchBoxClick(pageName, pageType, internalId, btnObj, fieldId, siteId) {
    var searchString = "";
    var field = document.getElementById(fieldId);

    if (field && field.value) field.value = TrimFunctions.All(field.value);

    var thisPage = location.href;
    if (thisPage.indexOf('_SearchResults') > -1) {
        if (field && field.value != '') searchString = field.value;
        else searchString = thisPage.substring(thisPage.indexOf('?q=') + 3);
        GetSearchResults(siteId, searchString);
    }
    else {
        pageName += "_" + internalId + '_SearchResults.html';

        if (field && field.value != '') {
            searchString = pageName + '?q=' + field.value;
            location.href = searchString;
        }
    }
}

function GetSearchResults(siteId, query) {
    var ajaxHandler = new AjaxHandler();

    var params = GetSearchParams(siteId, query);
    var response = ajaxHandler.Send('POST', 'LuceneSearch.asmx', params, false);

    var allData = {};

    if (response.responseText) {
        response = SearchUtils.ParseResponse(response.responseText, 'SearchResult');
        allData = eval('(' + response + ')');
    }

    pageNumber = 1;
    totalPages = 1;
    currPage = 1;
    BuildResultsGrid(allData);
    showPage(1);
}

function BuildResultsGrid(allData) {
    var searchResultsGrid = document.getElementById('SearchResults');
    if (searchResultsGrid) {
        SetBoxStyle(searchResultsGrid);
        var output = '';
        var itemsPerPage = Math.ceil(searchResultsGrid.offsetHeight / 60);
        var navHeight = 0;
        if (navigatorObj) {
            navHeight += parseInt(navigatorObj.height || 0);
            navHeight += parseInt(navigatorObj.marginTop || 0);
            navHeight += parseInt(navigatorObj.marginBottom || 0);
        }

        if (allData.results && allData.results.length > 0) {

            if (Math.floor(allData.results.length / itemsPerPage) > 1) itemsPerPage = Math.ceil((searchResultsGrid.offsetHeight - navHeight) / 60);

            var divStyle = SetResultsDivMargin();

            for (var i = 0; i < allData.results.length; i++) {
                if (i % itemsPerPage == 0) {
                    if (i > 0) {
                        totalPages++;
                        output += '</div>';
                    }
                    output += '<div id="resultsPage' + totalPages + '" style="display:none;' + divStyle + '">';
                }

                var line = allData.results[i];
                output += SearchUtils.AddLink(line.title, line.filename) + '<br/>';
                output += SearchUtils.FixChars(line.sample) + '<br/>';
            }
            output += '</div>';
            if (totalPages > 1) output += BuildNavigator();
        }
        else {
            if (resultsBox && resultsBox.direction == 'ltr') output = 'No results were found';
            else output = 'לא נמצאו תשובות';
        }
        searchResultsGrid.innerHTML = output;
    }
}

function BuildNavigator() {
    var elmStyle = '';
    var outputString = '<div style="position:absolute;width:' + navigatorObj.width + 'px;height:' + navigatorObj.height + 'px;top:' + navigatorObj.top + 'px;left:' + navigatorObj.left + 'px;">';

    outputString += '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td align="center">';
    outputString += '<table border="0" cellspacing="0" cellpadding="0" align="center" style="height:' + navigatorObj.height + 'px;">';
    outputString += '<tbody>';
    outputString += '<tr>';

    if (navigatorObj.navPrevBackgroundRepeat) elmStyle += 'background-repeat:' + navigatorObj.navPrevBackgroundRepeat + ';';
    if (navigatorObj.navPrevBackgroundColor) elmStyle += 'background-color:' + navigatorObj.navPrevBackgroundColor + ';';
    if (navigatorObj.navPrevBackgroundImage) elmStyle += 'background-image:' + TGalleryManager.GetBgImageUrl(navigatorObj, navigatorObj.navPrevBackgroundImage) + ';';
    if (navigatorObj.navPrevBackgroundImageWidth) elmStyle += 'width:' + navigatorObj.navPrevBackgroundImageWidth + 'px;';
    if (navigatorObj.navPrevBorderColor) elmStyle += 'border-color:' + navigatorObj.navPrevBorderColor + ';';
    if (navigatorObj.navPrevBorderStyle) elmStyle += 'border-style:' + navigatorObj.navPrevBorderStyle + ';';
    if (navigatorObj.navFontColor) elmStyle += 'color:' + navigatorObj.navFontColor + ';';
    if (navigatorObj.navPrevBorderWidth) {
        elmStyle += 'border-width:' + navigatorObj.navPrevBorderWidth + 'px;';
        if (!navigatorObj.navPrevBorderStyle) elmStyle += 'border-style:solid;';
    }

    outputString += '<td align="center" style="' + elmStyle + '"><span style="cursor:pointer;" onclick="pagination(\'prev\')">';
    if (navigatorObj.navPrevText) outputString += navigatorObj.navPrevText;
    else if (!navigatorObj.navPrevBackgroundImage && !navigatorObj.navPrevBackgroundColor) outputString += "Prev";
    outputString += '</span></td>';

    outputString += '<td width="10px">&nbsp;</td>';

    for (var i = 1; i <= totalPages; i++) {
        outputString += '<td align="center">';
        outputString += '<span style="cursor:pointer;" onclick="showPage(' + i + ')" id="pager' + i + '">' + i + '</span>&nbsp;';
        outputString += '</td>';
    }

    outputString += '<td width="10px">&nbsp;</td>';

    elmStyle = '';
    if (navigatorObj.navNextBackgroundRepeat) elmStyle += 'background-repeat:' + navigatorObj.navNextBackgroundRepeat + ';';
    if (navigatorObj.navNextBackgroundColor) elmStyle += 'background-color:' + navigatorObj.navNextBackgroundColor + ';';
    if (navigatorObj.navNextBackgroundImage) elmStyle += 'background-image:' + TGalleryManager.GetBgImageUrl(navigatorObj, navigatorObj.navNextBackgroundImage) + ';';
    if (navigatorObj.navNextBackgroundImageWidth) elmStyle += 'width:' + navigatorObj.navNextBackgroundImageWidth + 'px;';
    if (navigatorObj.navNextBorderColor) elmStyle += 'border-color:' + navigatorObj.navNextBorderColor + ';';
    if (navigatorObj.navNextBorderStyle) elmStyle += 'border-style:' + navigatorObj.navNextBorderStyle + ';';
    if (navigatorObj.navFontColor) elmStyle += 'color:' + navigatorObj.navFontColor + ';';
    if (navigatorObj.navNextBorderWidth) {
        elmStyle += 'border-width:' + navigatorObj.navNextBorderWidth + 'px;';
        if (!navigatorObj.navNextBorderStyle) elmStyle += 'border-style:solid;';
    }

    outputString += '<td align="center" style="' + elmStyle + '"><span style="cursor:pointer;" onclick="pagination(\'next\')">';
    if (navigatorObj.navNextText) outputString += navigatorObj.navNextText;
    else if (!navigatorObj.navNextBackgroundImage && !navigatorObj.navNextBackgroundColor) outputString += "Next";
    outputString += '</span></td>';

    outputString += '</tr>';
    outputString += '</tbody>';
    outputString += '</table>';
    outputString += '</td></tr></tbody></table>';
    outputString += '</div>';
    return outputString;

}

function pagination(func) {
    if (func == 'next' && currPage < totalPages) showPage(currPage + 1);
    if (func == 'prev' && currPage > 1) showPage(currPage - 1);
}

function showPage(pageNum) {
    currPage = pageNum;
    for (var i = 1; i <= totalPages; i++) {
        var pager = document.getElementById('pager' + i);
        var panel = document.getElementById('resultsPage' + i);
        if (i == currPage) {
            if (pager) {
                pager.style.color = (navigatorObj.navSelectedFontColor ? navigatorObj.navSelectedFontColor : 'black');
                pager.style.fontWeight = (navigatorObj.navSelectedFontWeight ? navigatorObj.navSelectedFontWeight : 'bold');
                if (navigatorObj.navSelectedFontSize) pager.style.fontSize = navigatorObj.navSelectedFontSize + 'px;';
            }
            if (panel) panel.style.display = 'block';
        }
        else {
            if (pager) {
                pager.style.color = (navigatorObj.navFontColor ? navigatorObj.navFontColor : 'black');
                pager.style.fontWeight = (navigatorObj.navFontWeight ? navigatorObj.navFontWeight : 'normal');
                if (navigatorObj.navFontSize) pager.style.fontSize = navigatorObj.navFontSize + 'px;';
            }
            if (panel) panel.style.display = 'none';
        }
    }
}

function SetBoxStyle(searchResultsGrid) {
    if (!resultsBox.direction) resultsBox.direction = 'ltr';
    searchResultsGrid.style.direction = resultsBox.direction;
    searchResultsGrid.style.dir = resultsBox.direction;
    searchResultsGrid.style.textAlign = resultsBox.direction == 'rtl' ? 'right' : 'left';
}

function SetResultsDivMargin() {
    var style = '';
    if (resultsBox.paddingTop) style += 'margin-top:' + resultsBox.paddingTop + 'px;';
    if (resultsBox.paddingLeft) style += 'margin-left:' + resultsBox.paddingLeft + 'px;';
    if (resultsBox.paddingRight) style += 'margin-right:' + resultsBox.paddingRight + 'px;';
    if (resultsBox.paddingBottom) style += 'margin-bottom:' + resultsBox.paddingBottom + 'px;';
    return style;
}

var GetSearchParams = function (siteId, searchString) {
    var params = '<?xml version="1.0" encoding="utf-8"?>';
    params += '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">';
    params += '<soap12:Body>';
    params += '<Search xmlns="http://tempuri.org/">';
    params += '<siteId>' + siteId + '</siteId>';
    params += '<searchString>' + searchString + '</searchString>';
    params += '</Search>';
    params += '</soap12:Body>';
    params += '</soap12:Envelope>';
    return params;
}

var SearchUtils = {
    FixChars: function (str) {
        return str.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
    },
    AddLink: function (title, url) {
        return '<a href="' + url + '" style="text-decoration:underline;">' + title + '</a>';
    },
    ParseResponse: function (responseText, functionName) {
        var regExp = '<' + functionName + '>(.*)</' + functionName + '>';
        var match = responseText.toString().match(regExp);
        if (match.length && match.length == 2) return match[1];
        else return 'Error';
    }
}

function ResetValue(element, initialText) {
    /// <summary>"Placeholder" simulation - deletes or bring back the predefined text. We can't use html's "placeholder" because the predefined text has styling. </summary>
    if (element.value && element.value == initialText) element.value = '';
    else {
        if (element.value == '') element.value = initialText;
    }
}

function PopUpImage(src, title, originalWidth, originalHeight, isWithArrows) {
    if (document.getElementById("imagepopup_overlay")) return;
    var imagepopup_overlay = document.createElement("div");
    imagepopup_overlay.id = "imagepopup_overlay"
    imagepopup_overlay.className = "imagepopup_overlay imagepopup_overlay_fixed";
    imagepopup_overlay.style.width = "auto";
    imagepopup_overlay.style.height = "auto";
    var height = originalHeight;
    var width = originalWidth;

    imagepopup_overlay.style.display = "block";
    imagepopup_overlay.onclick = function (ev) {
        var elm = ev.srcElement || ev.target;
        if (elm.id == "imagepopup_overlay") {
            imagepopup_overlay.parentNode.removeChild(imagepopup_overlay);
        }
    };

    var imagepopup_wrap = document.createElement("div");
    imagepopup_wrap.className = "imagepopup_wrap imagepopup_desktop imagepopup_type_image imagepopup_opened";

    var widthRat = $(window).width() / originalWidth;
    var heightRat = $(window).height() / originalHeight;
    if (widthRat < heightRat) {
        if (width > 0.85 * $(window).width()) {
            var ratio = (0.85 * $(window).width()) / width;
            width = 0.85 * $(window).width();
            height = height * ratio;
        }
    }
    else {
        if (height > 0.85 * $(window).height()) {
            var ratio = (0.85 * $(window).height()) / height;
            height = 0.85 * $(window).height();
            width = width * ratio;
        }
    }


    imagepopup_wrap.style.width = width + "px";
    imagepopup_wrap.style.height = height + "px";

    imagepopup_wrap.style.position = "absolute";
    imagepopup_wrap.style.top = "50%";
    imagepopup_wrap.style.left = "50%";
    imagepopup_wrap.style.opacity = 0;
    imagepopup_wrap.style.filter = 'alpha(opacity=0)';
    imagepopup_wrap.style.overflow = "visible";
    try {
        if (parseFloat($("html").css("zoom")) > 1 && isMobileDevice == true) {
            imagepopup_wrap.style.zoom = 1 / parseFloat($("html").css("zoom"));
            if (navigator.userAgent.match(/firefox/i)) {
                imagepopup_wrap.setAttribute("style", "-moz-transform:none");
            }
        }
    } catch (e) {
    }
    var imagepopup_skin = document.createElement("div");
    imagepopup_skin.className = "imagepopup_skin";
    imagepopup_skin.style.width = "auto";
    imagepopup_skin.style.height = "auto";

    if (isWithArrows) {
        /* Left arrow image */

        var imagepopup_leftArrowImage = document.createElement("img");
        /*imagepopup_leftArrowImage.style.position = "absolute";
        imagepopup_leftArrowImage.style.right = "0";
        imagepopup_leftArrowImage.style.top = "50%";
        imagepopup_leftArrowImage.style.transform = "translateY(-50%)";
        imagepopup_leftArrowImage.style.WebkitTransform = "translateY(-50%)";
        imagepopup_leftArrowImage.style.msTransform = "translateY(-50%)";
        imagepopup_leftArrowImage.style.zIndex = "1";
        imagepopup_leftArrowImage.style.cursor = "pointer";*/
        imagepopup_leftArrowImage.src = '//images.design-editor.com/-1/imagepopup/fancybox_sprite_left.png';
        imagepopup_leftArrowImage.className = "imagepopup_leftArrow";
        /* Left arrow div */

        var imagepopup_leftArrow = document.createElement("div");
        imagepopup_leftArrow.className = "leftArrow";
        /*imagepopup_leftArrow.style.position = "absolute";
        imagepopup_leftArrow.style.height = "100%";
        imagepopup_leftArrow.style.width = "4%";
        imagepopup_leftArrow.style.zIndex = "1";*/

        /* Right arrow image */

        var imagepopup_rightArrowImage = document.createElement("img");
        /*imagepopup_rightArrowImage.style.position = "absolute";
        imagepopup_rightArrowImage.style.top = "50%";
        imagepopup_rightArrowImage.style.transform = "translateY(-50%)";
        imagepopup_rightArrowImage.style.WebkitTransform = "translateY(-50%)";
        imagepopup_rightArrowImage.style.msTransform = "translateY(-50%)";
        imagepopup_rightArrowImage.style.zIndex = "1";
        imagepopup_rightArrowImage.style.cursor = "pointer";*/
        imagepopup_rightArrowImage.src = '//images.design-editor.com/-1/imagepopup/fancybox_sprite_right.png';
        imagepopup_rightArrowImage.className = "imagepopup_rightArrow";
        /* Right Arrow div */

        var imagepopup_rightArrow = document.createElement("div");
        imagepopup_rightArrow.className = "rightArrow";
        /*imagepopup_rightArrow.style.right = "0";
        imagepopup_rightArrow.style.position = "absolute";
        imagepopup_rightArrow.style.height = "100%";
        imagepopup_rightArrow.style.width = "4%";
        imagepopup_rightArrow.style.zIndex = "1";*/
    }

    var imagepopup_outer = document.createElement("div");
    imagepopup_outer.className = "imagepopup_outer";

    var imagepopup_inner = document.createElement("div");
    imagepopup_inner.className = "imagepopup_inner";
    imagepopup_inner.style.overflow = "visible";
    imagepopup_inner.style.width = width + "px";
    imagepopup_inner.style.height = height + "px";

    var imagepopup_image_Instance = new Image();
    imagepopup_image_Instance.src = src;

    imagepopup_image_Instance.onload = function () {
        imagepopup_wrap.style.marginTop = -(imagepopup_wrap.clientHeight / 2) + "px";
        imagepopup_wrap.style.marginLeft = -(imagepopup_wrap.clientWidth / 2) + "px";
        imagepopup_wrap.style.opacity = 1;
        imagepopup_wrap.style.filter = 'alpha(opacity=100)';
    };

    var imagepopup_image = document.createElement("img");
    imagepopup_image.src = src;
    imagepopup_image.className = "imagepopup_image";
    imagepopup_image.style.width = "100%";
    imagepopup_image.style.height = "100%";
    imagepopup_image.alt = "";

    var imagepopup_title = document.createElement("div");
    imagepopup_title.className = "imagepopup_title imagepopup_title_float_wrap";
    imagepopup_title.style.overflow = "visible";
    imagepopup_title.style.width = width + "px";
    imagepopup_title.style.height = height + "px";

    var imagepopup_title_text = document.createElement("span");
    imagepopup_title_text.className = "imagepopup_title_text";
    imagepopup_title_text.innerHTML = title;

    var imagepopup_item = document.createElement("a");
    imagepopup_item.className = "imagepopup_item imagepopup_close";
    imagepopup_item.href = "javascript:void(0);";
    imagepopup_item.title = "Close";

    imagepopup_item.onclick = function () {
        imagepopup_overlay.parentNode.removeChild(imagepopup_overlay);
    };

    imagepopup_inner.appendChild(imagepopup_image);
    imagepopup_outer.appendChild(imagepopup_inner);
    imagepopup_title.appendChild(imagepopup_title_text);

    if (isWithArrows) {
        imagepopup_leftArrow.appendChild(imagepopup_leftArrowImage); /* add the left image to div */
        imagepopup_rightArrow.appendChild(imagepopup_rightArrowImage); /* add the right image to div */
        imagepopup_skin.appendChild(imagepopup_leftArrow); /* add the left div to imagepopup_skin */
        imagepopup_skin.appendChild(imagepopup_rightArrow); /* add the right div to imagepopup_skin */
    }

    imagepopup_skin.appendChild(imagepopup_outer);
    if (title != "") {
        imagepopup_skin.appendChild(imagepopup_title);
    }
    else {
        imagepopup_title.style.opacity = 0;
        imagepopup_title.style.pointerEvents = "none";
        imagepopup_skin.appendChild(imagepopup_title);
    }
    imagepopup_skin.appendChild(imagepopup_item);
    imagepopup_wrap.appendChild(imagepopup_skin);
    imagepopup_overlay.appendChild(imagepopup_wrap);

    document.body.appendChild(imagepopup_overlay);
}

function PopUpImageResize(src, title) {
    if (!document.getElementById("imagepopup_overlay")) return;
    var originalWidth, originalHeight;

    var imagepopup_image_Instance = new Image();
    imagepopup_image_Instance.src = src;
    imagepopup_image_Instance.onload = function () {
        originalWidth = imagepopup_image_Instance.width;
        originalHeight = imagepopup_image_Instance.height;
        var height = originalHeight;
        var width = originalWidth;

        var imagepopup_wrap = document.getElementsByClassName("imagepopup_wrap")[0];

        var widthRat = $(window).width() / originalWidth;
        var heightRat = $(window).height() / originalHeight;
        if (widthRat < heightRat) {
            if (width > 0.85 * $(window).width()) {
                var ratio = (0.85 * $(window).width()) / width;
                width = 0.85 * $(window).width();
                height = height * ratio;
            }
        }
        else {
            if (height > 0.85 * $(window).height()) {
                var ratio = (0.85 * $(window).height()) / height;
                height = 0.85 * $(window).height();
                width = width * ratio;
            }
        }

        imagepopup_wrap.style.width = width + "px";
        imagepopup_wrap.style.height = height + "px";
        imagepopup_wrap.style.marginTop = -(imagepopup_wrap.clientHeight / 2) + "px";
        imagepopup_wrap.style.marginLeft = -(imagepopup_wrap.clientWidth / 2) + "px";

        var imagepopup_inner = document.getElementsByClassName("imagepopup_inner")[0];
        imagepopup_inner.style.width = width + "px";
        imagepopup_inner.style.height = height + "px";

        var imagepopup_image = document.getElementsByClassName("imagepopup_image")[0];
        imagepopup_image.src = src;

        var imagepopup_title = document.getElementsByClassName("imagepopup_title")[0];
        imagepopup_title.style.width = width + "px";
        imagepopup_title.style.height = height + "px";

        var imagepopup_title_text = document.getElementsByClassName("imagepopup_title_text")[0];
        imagepopup_title_text.innerHTML = title;

        if (title != "") {
            imagepopup_title.style.opacity = 1;
            imagepopup_title.style.pointerEvents = "initial";
        }
        else {
            imagepopup_title.style.opacity = 0;
            imagepopup_title.style.pointerEvents = "none";
        }
    };
}

//*********************************************************************************
// string functions
//*********************************************************************************
var TrimFunctions = {
    Left: function (str) {
        return str.replace(/^\s+/, '');
    },
    Right: function (str) {
        return str.replace(/\s+$/, '');
    },
    All: function (str) {
        return str.replace(/^\s+|\s+$/g, '');
    }
}

var PaddingFunctions = {
    Left: function (str, padChar, num) {
        var re = new RegExp(".{" + num + "}$");
        var pad = "";
        if (!padChar) padChar = " ";
        do {
            pad += padChar;
        }
        while (pad.length < num);
        return re.exec(pad + val)[0];
    },
    Right: function (str, padChar, num) {
        var re = new RegExp("^.{" + num + "}");
        var pad = "";
        if (!padChar) padChar = " ";
        do {
            pad += padChar;
        }
        while (pad.length < num);
        return re.exec(val + pad)[0];
    }
}

//*********************************************************************************
// Anchor functions
//*********************************************************************************

function scrollToElement(elmId, ev) {
    var $elm = $("#" + elmId);
    if ($elm.length == 0) $elm = $('[data-id="' + elmId + '"]');
    if ($elm.length > 0 && $elm.offset()) {
        if (_isMobile) // isMobile == true => skr !=null => has parallax elements in page.
        {
            var start = _mobileOffset;
            var from = {
                property: start
            };
            var to = {
                property: start + $elm.offset().top
            };

            jQuery(from).animate(to,
            {
                duration: 1000,
                step: function () {
                    _mobileOffset = this.property;
                    //console.log('Currently @ ' + this.property);
                }
            }, function () {
                _mobileOffset = 0;
            });
        }
        else {
            var isMobile = (/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera)
            if (isMobile) {
                window.location.hash = '';
                window.location.hash = $elm[0].id;
            }
            else {
                $('html, body').animate(
                {
                    scrollTop: $elm.offset().top
                }, 1500);
            }

        }

        //console.log('after scroll to element _mobileOffset : ' + _mobileOffset)
    }

    if (ev) {
        ev = ev || window.event;
        ev.cancelBubble = true;
        return false;
    }
}

//*********************************************************************************
// functions from html file
//*********************************************************************************

function updateMainPanelWidth() {
    ///<summary>Handles special calculations for elements - "fit to width", parallax etc. Happens every resize.</summary>
    var body_width = document.body.scrollWidth;
    var body_height = (document.body.scrollHeight > document.body.clientHeight) ? document.body.scrollHeight : document.body.clientHeight;

    var fitToBgLegacy = $('.fit_to_bg');
    var fitToBg = $('.fit_to_bg_new').filter(function () {
        var $parent = $(this).parent()
        var parentType = $parent.data('type');
        return parentType == "MainContent" || parentType == "MainPanel" || $parent.attr('data-linkToAnchor') !== undefined
    })

    /*removed by Yuri 01/12/2015. Residues of old fitToBgLegacy code, can see in changeset 4 in TFS*/
    //var style = document.getElementsByTagName('style')[0];
    //if (!style) {
    //    style = document.createElement('style');
    //    document.getElementsByTagName('head')[0].appendChild(style);
    //}

    //if (style.styleSheet) {
    //    style.styleSheet.cssText = "";
    //}
    //else {
    //    style.innerHTML = "";
    //}


    fitToBgLegacy.css('width', body_width);


    fitToBgLegacy.removeAttr("style");

    var mainContent = $('.dataTypeMainContent')[0] || $('[data-type="MainContent"]')[0];

    fitToBg.each(function () {
        if ($(this).hasClass("pushedElement")) //get inline top value of pushed element
        {
            var topPushedElement = getStyle(this, "top");
        }
        $(this).removeAttr("style");
        if ($(this).hasClass("pushedElement")) //set back inline top value of pushed element
        {
            this.style.top = topPushedElement;
        }
        var position = getStyle(this, "position");
        if (position == "fixed") {
            return true; //continue
        }
        var left = this.parentNode.offsetLeft;
        var borderRightWidth = getStyle(this, "borderRightWidth").replace('px', '');
        var borderLeftWidth = getStyle(this, "borderLeftWidth").replace('px', '');

        var left = (body_width - mainContent.clientWidth) / 2;
        if (body_width > mainContent.clientWidth) {
            this.style.width = body_width - borderRightWidth - borderLeftWidth + 'px';
            this.style.left = -left + 'px';
        }
        else {
            this.style.width = mainContent.clientWidth - borderRightWidth - borderLeftWidth + 'px';
            this.style.left = '0';
        }
        /* fix magicWidget zoom */
        /* fix magicWidget zoom */
        if ($(this).attr("data-type") == "MagicWidget" && isMobileDevice == true) {
            if (parseFloat($("html").css("zoom")) > 1) {
                this.style.width = mainContent.clientWidth - borderRightWidth - borderLeftWidth + 'px';
                this.style.left = mainContent.offsetLeft;
            }
        }
    });


    var fixedElements = $('[data-type]').filter(function () { return $(this).css('position') == "fixed" });
    fixedElements.each(function () {
        var cssText = this.style.cssText;
        if ($(this).hasClass('fit_to_bg_new')) {
            this.style.width = 'auto';
            this.style.right = '0px';
            this.style.left = '0px';
        }
        else {

            this.style.left = parseInt(getStyle(this, "left")) + mainContent.offsetLeft - prevMainContentOffsetLeft + 'px';
        }

    });
    var parallaxedElements = $('[data-parallax]').filter(function () {
        return ($(this).is(':visible') == true && (!this.getAttribute('data-initbr') || this.getAttribute('data-initbr') == _currentBreakpoint));
    });
    parallaxedElements.each(function () {

        if ($(this).hasClass('video_fit_to_bg') || $(this).hasClass('video_fit_to_width'))
            return;
        if ($(this).hasClass('fit_to_bg_new')) {
            this.style.width = 'auto';
            this.style.right = '0px';
            this.style.left = '0px';
        }
        else {
            var that = this;
            var obj = $(this).data();

            $.each(obj, function (key, value) {
                if (!value.toString()) return;
                var matchLeft = value.toString().match("left:(.*?)px;");
                if (matchLeft) {
                    var left = matchLeft[1];
                    if (left) {
                        var newLeft = parseInt(left) - toInt(getStyle(that, 'borderLeftWidth')) + mainContent.offsetLeft;
                        value = value.replace(matchLeft[0], 'left:' + newLeft + 'px;');
                        $(that).attr('data-' + key, value);
                        var f = 0;
                    }
                }

                var matchTop = value.toString().match("top:(.*?)px;");
                if (matchTop) {
                    var top = matchTop[1];
                    if (top) {
                        var newTop = parseInt(top) - toInt(getStyle(that, 'borderTopWidth'));
                        value = value.replace(matchTop[0], 'top:' + newTop + 'px;');
                        $(that).attr('data-' + key, value);
                    }
                }
            });
        }



    });

    if (parallaxedElements.length > 0) {
        reinitParallaxAccordingToBreakpoint();
    }

    //skrollr.init()
    prevMainContentOffsetLeft = mainContent.offsetLeft;
}

// +++++++ Height +++++++
function updateVideoHeight() {
    var body_width = document.body.scrollWidth;
    var body_height = document.body.clientHeight;
    var videoFitToHeight = $('.video_fit_to_height');

    videoFitToHeight.each(function () {
        var position = getStyle($(this)[0], "position");
        if (position == "fixed")
            return true;
        $(this).removeAttr("style");

        var parentHeight = $(this)[0].parentNode.parentNode.offsetHeight;
        var borderTopWidth = getStyle($(this)[0], "borderTopWidth").replace('px', '');
        var borderBottomWidth = getStyle($(this)[0], "borderBottomWidth").replace('px', '');
        var borderRightWidth = getStyle($(this)[0], "borderRightWidth").replace('px', '');
        var borderLeftWidth = getStyle($(this)[0], "borderLeftWidth").replace('px', '');

        var fullHeight = parentHeight - borderTopWidth - borderBottomWidth;
        var ratio = this.getAttribute("data-ratioaspect");
        if (isNaN(ratio))
            ratio = 9 / 16;
        var marginLeft = (fullHeight / ratio - $(this)[0].clientWidth) / 2;
        $(this)[0].children[0].style.marginLeft = -marginLeft + 'px';

        $(this)[0].children[0].style.width = (fullHeight / ratio) + 'px';


        $(this)[0].style.height = fullHeight + 'px';
        $(this)[0].style.top = '0'
    });
};

// +++++++ Width +++++++
function updateVideoWidth(updateAll) {
    var body_width = document.body.clientWidth;
    var videoFitToWidth = $('.video_fit_to_width');
    var videoFitToWidth = $('.video_fit_to_width').filter(function () {
        var $parent = $(this).parent()
        var parentType = $parent.data('type');
        return parentType == "MainContent" || parentType == "MainPanel" || $parent.attr('data-linkToAnchor') !== undefined
    })

    videoFitToWidth.each(function () {
        var elmWidth = body_width;
        var position = getStyle($(this)[0], "position");
        if ($(this).hasClass("pushedElement")) //get inline top value of pushed element
        {
            var topPushedElement = getStyle(this, "top");
        }
        $(this).removeAttr("style");
        if ($(this).hasClass("pushedElement")) //set back inline top value of pushed element
        {
            this.style.top = topPushedElement;
        }
        var top = $(this)[0].parentNode.parentNode.offsetTop;
        var elmHeight = this.offsetHeight;
        var marginLeft = $(this)[0].parentNode.offsetLeft;
        if ($(this)[0].parentNode.getAttribute("data-type") === "RepeaterItem") {
            if (!updateAll)
                return true;
            elmWidth = $($(this)[0]).parents(".dataTypeRepeaterItem")[0].offsetWidth;
            elmHeight = $($(this)[0]).parents(".dataTypeRepeaterItem")[0].offsetHeight;
            marginLeft = 0;
        }

        var borderTopWidth = getStyle($(this)[0], "borderTopWidth").replace('px', '');
        var borderBottomWidth = getStyle($(this)[0], "borderBottomWidth").replace('px', '');
        var borderRightWidth = getStyle($(this)[0], "borderRightWidth").replace('px', '');
        var borderLeftWidth = getStyle($(this)[0], "borderLeftWidth").replace('px', '');

        var fullHeight = elmHeight - borderTopWidth - borderBottomWidth;
        var fullWidth = elmWidth - borderRightWidth - borderLeftWidth;
        var ratio = this.getAttribute("data-ratioaspect");
        $(this)[0].style.width = fullWidth + 'px';
        if (isNaN(ratio))
            ratio = 9 / 16;
        if (fullHeight < fullWidth * ratio) // Width is larger
        {
            $(this)[0].children[0].style.width = fullWidth + 'px';
            $(this)[0].children[0].style.height = (fullWidth * ratio) + 'px';
            var marginTop = (fullWidth * ratio - fullHeight) / 2;
            $(this)[0].children[0].style.marginTop = -marginTop + 'px';
            $(this)[0].children[0].style.marginLeft = '0px';
            $(this)[0].children[0].style.left = '0';
            $(this)[0].style.left = -marginLeft + 'px';
        }
        else // Height is larger
        {
            $(this)[0].children[0].style.height = fullHeight + 'px';
            $(this)[0].children[0].style.width = (fullHeight / ratio) + 'px';
            $(this)[0].style.left = -marginLeft + 'px';
            $(this)[0].children[0].style.top = '0';
            $(this)[0].children[0].style.marginTop = '0px';
            $(this)[0].children[0].style.marginLeft = -((fullHeight / ratio - elmWidth) / 2) + 'px';
        }
        //$(this)[0].style.height = fullHeight + 'px';
    });
}

// +++++++ Background +++++++
function updateVideoBackground(updateAll) {
    var body_width = document.body.clientWidth;
    var body_height = document.body.clientHeight;
    var videoFitToBackground = $('.video_fit_to_bg');

    videoFitToBackground.each(function () {
        var elmWidth = body_width;
        var position = getStyle($(this)[0], "position");
        if (position == "fixed")
            return true;
        $(this).removeAttr("style");
        var top = $(this)[0].parentNode.parentNode.offsetTop;
        var elmHeight = $(this)[0].parentNode.parentNode.offsetHeight;
        var marginLeft = $(this)[0].parentNode.offsetLeft;
        if ($(this)[0].parentNode.getAttribute("data-type") === "RepeaterItem") {
            if (!updateAll)
                return true;
            elmWidth = $($(this)[0]).parents(".dataTypeRepeaterItem")[0].offsetWidth;
            elmHeight = $($(this)[0]).parents(".dataTypeRepeaterItem")[0].offsetHeight;
            marginLeft = 0;
        }

        var borderTopWidth = getStyle($(this)[0], "borderTopWidth").replace('px', '');
        var borderBottomWidth = getStyle($(this)[0], "borderBottomWidth").replace('px', '');
        var borderRightWidth = getStyle($(this)[0], "borderRightWidth").replace('px', '');
        var borderLeftWidth = getStyle($(this)[0], "borderLeftWidth").replace('px', '');

        var fullHeight = elmHeight - borderTopWidth - borderBottomWidth;
        var fullWidth = elmWidth - borderRightWidth - borderLeftWidth;
        var ratio = this.getAttribute("data-ratioaspect");
        if (isNaN(ratio))
            ratio = 9 / 16;
        if (fullHeight < fullWidth * ratio) // Width is larger
        {
            $(this)[0].children[0].style.width = fullWidth + 'px';
            $(this)[0].children[0].style.height = (fullWidth * ratio) + 'px';
            var marginTop = (fullWidth * ratio - fullHeight) / 2;
            $(this)[0].children[0].style.marginTop = -marginTop + 'px';
            $(this)[0].children[0].style.left = '0';
            $(this)[0].style.width = fullWidth + 'px';
            $(this)[0].style.left = -marginLeft + 'px';
        }
        else // Height is larger
        {
            $(this)[0].children[0].style.height = fullHeight + 'px';
            $(this)[0].children[0].style.width = (fullHeight / ratio) + 'px';
            $(this)[0].style.width = fullHeight / ratio + 'px';
            $(this)[0].style.left = -marginLeft - ((fullHeight / ratio - elmWidth) / 2) + 'px';
            $(this)[0].children[0].style.top = '0';
            //$(this)[0].children[0].style.top = top + 'px';
            $(this)[0].children[0].style.marginTop = '0px';
        }
        $(this)[0].style.height = fullHeight + 'px';
    });
}

function fixHideVimeoControl() {
    var vimeoHideControl = $('.video_fit_to_bg');
    vimeoHideControl.each(function () {
        var position = getStyle($(this)[0], "position");
        if (position == "fixed")
            return true;

    });
}

function handleDefaultGallery() {

    var classes = {};

    $('.DefaultGallery').each(function (index) {

        var currGallery = this;

        var properites = {
            'at': 'slide',
            //at - animationType
            'iw': 0,
            //iw - itemWidth
            'im': 0,
            //im - itemMargin
            'ft': 3,
            //ft - fittingType
            'pt': 4 //pt - positionType
        };

        properties = GetParamsFromClassName(this, properites);

        function setNavigatorClick(navClass, slider, direction) {
            $(currGallery).find(navClass).click(function (e) {
                slider.resetInterval();
                var target = slider.getTarget(direction);
                slider.flexAnimate(target);
                slider.doAnimation(slider[0].parentNode, target);
                e.preventDefault();
            });
        }

        var flexslider = $(this.children[0]).flexslider(
        {
            animation: properites.at,
            itemWidth: parseInt(properites.iw),
            itemMargin: parseInt(properites.im),
            fittingType: parseInt(properites.ft),
            positionType: parseInt(properites.pt),
            minItems: 1,
            maxItems: 1,
            directionNav: false,
            controlNav: false,
            start: function (slider) {
                setNavigatorClick('.flex-nav-left', slider, 'prev');
                setNavigatorClick('.flex-nav-right', slider, 'next');
            }
        });
    });

    $('.galleryTextCaption .text_caption').each(function (index) {
        var orig;
        if ($(this).closest('.dataTypeGallery').length != 0) {
            orig = $(this).closest('.dataTypeGallery').find('.flex-caption')[0].innerHTML;
        }
        else {
            orig = $(this).closest('[data-type="gallery"]').find('.flex-caption')[0].innerHTML;
        }
        if (orig.indexOf('data-reference%3D') == -1) {
            try {
                decoded = decodeURI(orig);
            }
            catch (e) {
                decoded = unescape(orig);
            }
        }
        else {
            decoded = unescape(orig);
        }
        $(this.children[0]).html(decoded);
    });

    $('ul.slides').css('position', 'absolute');
    $('ul.slides').children().css('margin-left', '0').css('margin-top', '0').css('margin-bottom', '0').css('right', '0').css('left', '0').css('top', '0').css('bottom', '0');
    $('.gallery_arrow_left').click(function (e) {
        $(this.parentNode).find('a.flex-nav-left').click();
    });
    $('.gallery_arrow_right').click(function (e) {
        $(this.parentNode).find('a.flex-nav-right').click();
    });
}

function handleMatrixGallery() {

    $('.MatrixGallery').each(function (index) {

        var currGallery = this;

        var properites = {
            'i': '0',
            //i - index
            'nt': 4 //nt - NumberThumbs           
        };

        properties = GetParamsFromClassName(this, properites);

        var gallery = $('#thumbs' + properites.i).galleriffic(
        {
            delay: 3500,
            numThumbs: parseInt(properites.nt),
            preloadAhead: 10,
            enableTopPager: false,
            enableBottomPager: false,
            maxPagesToShow: 7,
            imageContainerSel: '#slideshow' + properites.i,
            controlsContainerSel: '#controls',
            captionContainerSel: '#caption',
            loadingContainerSel: '#loading',
            renderSSControls: true,
            renderNavControls: true,
            playLinkText: 'Play Slideshow',
            pauseLinkText: 'Pause Slideshow',
            enableHistory: false,
            autoStart: true,
            syncTransitions: true,
            defaultTransitionDuration: 900,
            enableKeyboardNavigation: false
        });

        gallery.find('a.left_arrow_page').click(function (e) {
            gallery.previousPage();
            e.preventDefault();
        });

        gallery.find('a.right_arrow_page').click(function (e) {
            gallery.nextPage();
            e.preventDefault();
        });
    });
}

function GetParamsFromClassName(elm, properites) {
    $($(elm).attr('class').split(' ')).each(function () {
        if (this !== '' && this.indexOf('_') > -1) {
            var nameValue = this.split('_');
            var prop = nameValue[0];
            var value = nameValue[1];
            if (prop && value) {
                properites[prop] = value;
            }
        }
    });
    return properites;
}

function FixTextRtlForIE() {
    var $textElements = $(".dataTypeText");
    if ($textElements.length == 0)
        $textElements = $("[data-type='text']");

    $textElements.each(function () {
        var $contentDiv = $(this).first();

        var divRtl = $contentDiv.find("div[dir='rtl']");
        if (divRtl.length > 0) {
            $contentDiv.attr("dir", "rtl");
        }
    });
}

function shapelinkto(ev, link, newTab) {
    /// <summary>Redirects to provided links for shapes that have "link to" (maybe other scenarios too?).</summary>
    /// <param name="newTab">Whether to open in a new tab. (20.9.2015) Is ignored for design-editor.com unless the link is to an external site.</param>
    if (!$(ev.target).hasClass('dataTypeShape') && ev.target.getAttribute('data-type') != "Shape" && $(ev.target).closest('.dataTypeShape').length == 0) {
        return;
    }
    var isWebydoCom = window.location.hostname.indexOf('www.design-editor.com') > -1; //don't use "design-editor.com" without "www" because this will catch sites like site9194353.91.design-editor.com

    if (newTab == "true" && (!isWebydoCom || link.indexOf('www.design-editor.com') < 0)) {
        //window.open('', '_new').location.href = link; //this open blank page in some mobile devices
        window.open(link, '_blank'); //open new tab
    }
    else {
        window.location.href = link; //open in same tab
    }
}

/***********************************************************************************************************************************************/
/****************************** S H A P E    B A C K G R O U N D    A T T A C H M E N T  -  F I X   P O S I T I O N ****************************/
/***********************************************************************************************************************************************/
var scrollTop;
var scrollLeft;
var prevScrollX = 0;
var prevScrollY = 0;
var scrollDeltaX = 0;
var scrollDeltaY = 0;
var backgroundAttachmentElements = [];

function SetBackgroundAttachment() {
    backgroundAttachmentElements.length = 0;
    $.each($('div.backgroundAttachmentFixed'), function (v, i) {
        backgroundAttachmentElements.push(CreateBackgroundAttachmentStructure(this));
    });
}

function CreateBackgroundAttachmentStructure(obj) {
    var struct = {};
    var img = new Image;
    img.src = $(obj).css('background-image').split(',')[0].replace(/url\("|url\(|"\)|\)$/ig, "");
    img.onload = function () {
        struct.width = $(obj).width();
        struct.height = $(obj).height();
        struct.bgWidth = img.width;
        struct.bgHeight = img.height;
        struct.obj = obj;
        img = null;
    };
    return struct;
}

function UpdatesizeForCoverContain(obj, backgroundSize) {
    if (obj.updatedForCoverContain) return;
    var ratio = obj.bgHeight / obj.bgWidth;
    obj.bgWidth = obj.width;
    obj.bgHeight = obj.width * ratio;

    if ((obj.bgHeight < obj.height && backgroundSize == "cover") || (obj.bgHeight > obj.height && backgroundSize == "contain")) {
        obj.bgHeight = obj.height;
        obj.bgWidth = obj.height / ratio;
    }
    obj.updatedForCoverContain = true;
}

function fixBackgroundPositionForAttachment() {
    scrollTop = $(window).scrollTop();
    scrollLeft = $(window).scrollLeft();

    scrollDeltaX = scrollLeft - prevScrollX;
    scrollDeltaY = scrollTop - prevScrollY;

    $.each(backgroundAttachmentElements, function (v, i) {
        var backgroundX = $(this.obj).css('background-position').split(',')[0].split(' ')[0];
        var backgroundY = $(this.obj).css('background-position').split(',')[0].split(' ')[1];
        var gradientBackground = $(this.obj).css('background-position').split(',')[1];
        var backgroundSize = $(this.obj).css('background-size');

        if ((/%$/).test(backgroundX)) {
            backgroundX = GetBackgroundPosition(this, backgroundX.split('%')[0], "X", backgroundSize);
        }
        else if ((/px$/).test(backgroundX)) {
            backgroundX = parseInt(backgroundX.replace("px", ""));
        }

        if ((/%$/).test(backgroundY)) {
            backgroundY = GetBackgroundPosition(this, backgroundY.split('%')[0], "Y", backgroundSize);
        }
        else if ((/px$/).test(backgroundY)) {
            backgroundY = parseInt(backgroundY.replace("px", ""));
        }
        if ($(this.obj).css('position') == 'fixed') {
            if (gradientBackground) {
                $(this.obj).css('background-position', (-scrollDeltaX + backgroundX) + 'px' + ' ' + (-scrollDeltaY + backgroundY) + 'px , ' + gradientBackground);
            }
            else {
                $(this.obj).css('background-position', (-scrollDeltaX + backgroundX) + 'px' + ' ' + (-scrollDeltaY + backgroundY) + 'px');
            }
        }
        else {
            if (gradientBackground) {
                $(this.obj).css('background-position', (scrollDeltaX + backgroundX) + 'px' + ' ' + (scrollDeltaY + backgroundY) + 'px , ' + gradientBackground);
            }
            else {
                $(this.obj).css('background-position', (scrollDeltaX + backgroundX) + 'px' + ' ' + (scrollDeltaY + backgroundY) + 'px');
            }
        }

        prevScrollX = scrollLeft;
        prevScrollY = scrollTop;
    });
}

function GetBackgroundPosition(obj, param, coord, backgroundSize) {
    switch (backgroundSize) {
        case "100% 100%":
            param = "0";
            break;
        case "cover":
        case "contain":
            UpdatesizeForCoverContain(obj, backgroundSize);
            break;
    }
    if (coord == "Y") {
        switch (param) {
            case "0":
                return 0;
            case "50":
                return (obj.height / 2 - obj.bgHeight / 2);
            case "100":
                return (obj.height - obj.bgHeight);
            default:
                return param;
        }
    }
    else if (coord == "X") {
        switch (param) {
            case "0":
                return 0;
            case "50":
                return (obj.width / 2 - obj.bgWidth / 2);
            case "100":
                return (obj.width - obj.bgWidth);
            default:
                return param;
        }
    }
}

/**
 * Setup Mobile Menu Pixel Perfect
 * @return {void}
 */
function fixMobilePixelPerfect(element) {
    /* Prevent Double Reduce */
    if ($(element).attr('data-perfect')) return;

    var parentWidth = $(element).closest('.menu').width();

    $(element).find('>li').each(function (index, li) {

        var borderWidth = 0;

        /* Appending Width */
        borderWidth = (borderWidth + parseInt($(li).css('border-left-width')));
        borderWidth = (borderWidth + parseInt($(li).css('border-right-width')));

        $(li).width($(li).width() - borderWidth);
    });

    $(element).attr('data-perfect', "1");

    /* Fix Empty Parents */
    $('.mobile-menu-children').each(function (index, element) {
        if ($(element).children().length == 0) console.log($(element).parent().find('button').remove());
    });
}

function getMobileMenuToggleByMenu(menuId) {
    var index = menuId.replace('mainMenu', '').replace('innerMenu', '')
    var mobileMenuToggle = $('.mobile-toggle').filter(function () {
        return $(this).attr('data-reference') == index
    })
    return mobileMenuToggle;
}
/**
 * Called when mobile menu toggle been tapped. 
 * @param {DOM#Event} event
 */
function mobileMenuToggle(event) {
    /* Check if mobile-toggle class exist */
    if ($(this).hasClass('mobile-toggle')) {
        var reference_id = $(this).attr('data-reference');
        /* Reference Menu */
        var key = ".innerMenu" + reference_id;

        /* Fill key with alternative key */
        if (!$(key).length) key = ".mainMenu" + reference_id;

        if ($(key).length) {
            /* Perfoming the toggling */
            if ($(key).css('display') == 'none') {
                $(key).show();
                fixMobilePixelPerfect($(key));
            }
            else {
                $(key).hide();
            }
        }
    }
}

/**
 * This method will open and close the submenu 
 * that related to current button 
 * @param {DOM#Event} event
 */
function mobileMenuExpand(event) {

    if ($(this).hasClass('open')) {
        /* Manipulate Padding Vs. Margin */
        var paddingBottom = parseInt($(this).attr('data-padding-tumb'));
        var currentMarginTop = parseInt($(this).parent().find('ul').first().css('margin-top'));

        /* Removing Padding Delta */
        $(this).parent().find('ul').first().css('margin-top', (currentMarginTop - paddingBottom) + 'px');

        $(this).parent().find('ul').first().slideUp(200);
        $(this).parent().animate(
        {
            paddingBottom: paddingBottom
        },
        {
            duration: 200
        });

        $(this).removeClass('open');
    }
    else {
        /* Manipulate Padding Vs. Margin */
        var paddingBottom = parseInt($(this).parent().css('padding-bottom'));
        var currentMarginTop = parseInt($(this).parent().find('ul').first().css('margin-top'));

        /* Adding Padding Delta */
        $(this).parent().find('ul').first().css('margin-top', (currentMarginTop + paddingBottom) + 'px');

        $(this).attr('data-padding-tumb', paddingBottom);

        $(this).parent().find('ul').first().slideDown(200);
        $(this).parent().animate(
        {
            paddingBottom: 0
        },
        {
            duration: 200
        });

        $(this).addClass('open');
    }

}

/***********************************************************************************************************************************************/
/*********************** E N D  -  S H A P E    B A C K G R O U N D    A T T A C H M E N T  -  F I X   P O S I T I O N  ************************/
/***********************************************************************************************************************************************/

function IsSubElement(id) {
    try {
        if ($("#" + id).parent().closest("[data-type='Repeater']").length > 0) return true;
        if ($("#" + id).parent().closest("[data-type='gallery']").length > 0) return true;
        if ($("#" + id).parent().closest("[data-type='Form']").length > 0) return true;
        if ($("#" + id).parent().closest("[data-type='Image']").length > 0) return true;
    }
    catch (e)
    { }
    return false;
}

/***********************************************************************************************************************************************/
/*********************** S T A R T  -  R E P E A T E R     F U N C T I O N S  ************************/
/***********************************************************************************************************************************************/

function GotoPrevPage(link) {
    var rep = $(link).parent().closest("[data-current-page]");
    rep.removeClass('page' + rep.attr("data-current-page")).addClass('page' + (parseInt(rep.attr("data-current-page")) - 1));
    rep.attr("data-current-page", parseInt(rep.attr("data-current-page")) - 1);
}

function GotoNextPage(link) {
    var rep = $(link).parent().closest("[data-current-page]");
    rep.removeClass('page' + rep.attr("data-current-page")).addClass('page' + (parseInt(rep.attr("data-current-page")) + 1));
    rep.attr("data-current-page", parseInt(rep.attr("data-current-page")) + 1);
}

function GotoPage(link, pageNum) {
    var rep = $(link).parent().closest("[data-current-page]");
    rep.removeClass('page' + rep.attr("data-current-page")).addClass('page' + pageNum);
    rep.attr("data-current-page", pageNum);
}

function SetDefaultRepeaterPage() {
    $("[data-current-page]").each(function () {
        $(this).removeClass('page' + $(this).attr("data-current-page")).addClass('page1').attr("data-current-page", 1);
    });
}

/***********************************************************************************************************************************************/
/*********************** E N D  -  R E P E A T E R    F U N C T I O N S  ************************/
/***********************************************************************************************************************************************/
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/***********************************************************************************************************************************************/
/*********************** S T A R T  -  P U S H E R    F U N C T I O N S  ************************/
/***********************************************************************************************************************************************/
var pushers = {};
function createPushEventListeners(afterResize) {
    var $main = $('main');
    var $mainContent = $main.find('[data-type="MainContent"]');
    $mainContent.children('[data-type]').each(function () {
        var self = this;
        $(window).on("doPush", function (e, pusher, prevBottom, delta) {
            if (self == pusher || delta == 0) {
                if (delta != 0) //update MainContent height
                {
                    $($mainContent).height($($mainContent).height() + delta);
                }
                return;
            }
            if (offsetTop(self) >= prevBottom) {
                $(self).addClass('pushedElement');
                $(self).css('top', offsetTop(self) + delta);

                if (pushers[self.id]) //update prevBottom of pusher that pushed
                {
                    pushers[self.id].prevBottom = offsetBottom(self);
                }
            }
        });
    });
    $mainContent.children('[data-pusher=true]:visible').each(function () {
        var self = this;
        var data_pusher_bp = getDataPusherBPvalue(self);
        if (!data_pusher_bp) return;
        pushers[self.id] = {};
        //pushers[self.id].initBottom = offsetTop(self) + data_pusher_bp;
        pushers[self.id].prevBottom = offsetTop(self) + data_pusher_bp;

        if (afterResize) {
            var prevBottom = pushers[self.id].prevBottom;
            $(self).css('height', '');
            var delta = offsetBottom(self) - prevBottom;
            pushers[self.id].prevBottom = offsetBottom(self);
            $(window).trigger("doPush", [self, prevBottom, delta]);
        }

        addResizeListener(self, function () {
            var prevBottom = pushers[self.id].prevBottom;
            var delta = offsetBottom(self) - prevBottom;
            pushers[self.id].prevBottom = offsetBottom(self);
            $(window).trigger("doPush", [self, prevBottom, delta]);
        });
    });

}

function resetPushEventListeners() {
    var $main = $('main');
    var $mainContent = $main.find('[data-type="MainContent"]');
    pushers = {};
    $mainContent.children('.pushedElement').each(function () {
        $(window).off("doPush");
        $(this).css('top', '').removeClass('pushedElement');
    });
    $mainContent.children('[data-pusher=true]').each(function () {
        removeResizeListener(this);
        var default_height = getDataPusherBPvalue(this);
        $(this).css('cssText', $(this).css('cssText') + 'height: ' + default_height + 'px !important');
    });
}

/*function reInitResizeListeners()
{
    var $main = $('main');
    var $mainContent = $main.find('[data-type="MainContent"]');
    $mainContent.children('[data-pusher=true]').each(function () {
        var self = this;
        removeResizeListener(self);
        addResizeListener(self, function () {
            var prevBottom = pushers[self.id].prevBottom;
            var delta = offsetBottom(self) - prevBottom;
            pushers[self.id].prevBottom = offsetBottom(self);            
            $(window).trigger("doPush", [self, prevBottom, delta]);
        });
    });
}*/

function getDataPusherBPvalue(elem) {
    var bps = { portrait: 0, landscape: 1, tablet: 2, pc: 3 };
    if ($(elem).attr("data-pusher-" + _currentBreakpoint)) {
        return parseInt($(elem).attr("data-pusher-" + _currentBreakpoint));
    }
    else {
        var currIndex = bps[_currentBreakpoint];
        for (var i = currIndex + 1; i < Object.keys(bps).length; i++) {
            var bpName = getKeyByValue(bps, i);
            if ($(elem).attr("data-pusher-" + bpName)) {
                return parseInt($(elem).attr("data-pusher-" + bpName));
            }
        }
    }
    return null;
}

function getKeyByValue(dict, value) {
    for (var prop in dict) {
        if (dict.hasOwnProperty(prop)) {
            if (dict[prop] === value)
                return prop;
        }
    }
}

function offsetTop(el) {
    if (window.getComputedStyle) {
        var computedStyle = getComputedStyle(el, null);
    } else {
        computedStyle = el.currentStyle;
    }

    return parseInt(computedStyle.getPropertyValue('top'));
}
function offsetBottom(el) {
    if (window.getComputedStyle) {
        var computedStyle = getComputedStyle(el, null);
    } else {
        computedStyle = el.currentStyle;
    }
    return parseInt(computedStyle.getPropertyValue('top')) + $(el).outerHeight(true);
}

/**
* Detect Element Resize
*
* https://github.com/sdecima/javascript-detect-element-resize
* Sebastian Decima
*
* version: 0.5.3
**/

(function () {
    var attachEvent = document.attachEvent,
		stylesCreated = false;

    if (!attachEvent) {
        var requestFrame = (function () {
            var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
								function (fn) { return window.setTimeout(fn, 20); };
            return function (fn) { return raf(fn); };
        })();

        var cancelFrame = (function () {
            var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
								   window.clearTimeout;
            return function (id) { return cancel(id); };
        })();

        function resetTriggers(element) {
            var triggers = element.__resizeTriggers__,
				expand = triggers.firstElementChild,
				contract = triggers.lastElementChild,
				expandChild = expand.firstElementChild;
            contract.scrollLeft = contract.scrollWidth;
            contract.scrollTop = contract.scrollHeight;
            expandChild.style.width = expand.offsetWidth + 1 + 'px';
            expandChild.style.height = expand.offsetHeight + 1 + 'px';
            expand.scrollLeft = expand.scrollWidth;
            expand.scrollTop = expand.scrollHeight;
        };

        function checkTriggers(element) {
            return element.offsetWidth != element.__resizeLast__.width ||
						 element.offsetHeight != element.__resizeLast__.height;
        }

        function scrollListener(e) {
            var element = this;
            resetTriggers(this);
            if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
            this.__resizeRAF__ = requestFrame(function () {
                if (checkTriggers(element)) {
                    element.__resizeLast__.width = element.offsetWidth;
                    element.__resizeLast__.height = element.offsetHeight;
                    element.__resizeListeners__.forEach(function (fn) {
                        fn.call(element, e);
                    });
                }
            });
        };

        /* Detect CSS Animations support to detect element display/re-attach */
        var animation = false,
			animationstring = 'animation',
			keyframeprefix = '',
			animationstartevent = 'animationstart',
			domPrefixes = 'Webkit Moz O ms'.split(' '),
			startEvents = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' '),
			pfx = '';
        {
            var elm = document.createElement('fakeelement');
            if (elm.style.animationName !== undefined) { animation = true; }

            if (animation === false) {
                for (var i = 0; i < domPrefixes.length; i++) {
                    if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
                        pfx = domPrefixes[i];
                        animationstring = pfx + 'Animation';
                        keyframeprefix = '-' + pfx.toLowerCase() + '-';
                        animationstartevent = startEvents[i];
                        animation = true;
                        break;
                    }
                }
            }
        }

        var animationName = 'resizeanim';
        var animationKeyframes = '@' + keyframeprefix + 'keyframes ' + animationName + ' { from { opacity: 0; } to { opacity: 0; } } ';
        var animationStyle = keyframeprefix + 'animation: 1ms ' + animationName + '; ';
    }

    function createStyles() {
        if (!stylesCreated) {
            //opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
            var css = (animationKeyframes ? animationKeyframes : '') +
					'.resize-triggers { ' + (animationStyle ? animationStyle : '') + 'visibility: hidden; opacity: 0; } ' +
					'.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: \" \"; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }',
				head = document.head || document.getElementsByTagName('head')[0],
				style = document.createElement('style');

            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            head.appendChild(style);
            stylesCreated = true;
        }
    }

    window.addResizeListener = function (element, fn) {
        if (attachEvent) element.attachEvent('onresize', fn);
        else {
            if (!element.__resizeTriggers__) {
                if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
                createStyles();
                element.__resizeLast__ = {};
                element.__resizeListeners__ = [];
                (element.__resizeTriggers__ = document.createElement('div')).className = 'resize-triggers';
                element.__resizeTriggers__.innerHTML = '<div class="expand-trigger"><div></div></div>' +
																						'<div class="contract-trigger"></div>';
                element.appendChild(element.__resizeTriggers__);
                resetTriggers(element);
                element.addEventListener('scroll', scrollListener, true);

                /* Listen for a css animation to detect element display/re-attach */
                animationstartevent && element.__resizeTriggers__.addEventListener(animationstartevent, function (e) {
                    if (e.animationName == animationName)
                        resetTriggers(element);
                });
            }
            element.__resizeListeners__.push(fn);
        }
    };

    window.removeResizeListener = function (element, fn) {
        if (attachEvent) element.detachEvent('onresize', fn);
        else {
            element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
            if (!element.__resizeListeners__.length) {
                element.removeEventListener('scroll', scrollListener);
                element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
            }
        }
    }
})();



/***********************************************************************************************************************************************/
/*********************** E N D  -  P U S H E R    F U N C T I O N S  ************************/
/***********************************************************************************************************************************************/
function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}