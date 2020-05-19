//=============================================//
//fANDI: focusable elements ANDI (default mode)//
//Created By Social Security Administration	   //
//=============================================//
function init_module() {

    var xfandiVersionNumber = "7.0.0";

    //create xfANDI instance
    var xfANDI = new AndiModule(xfandiVersionNumber, "x");

    AndiModule.initActiveActionButtons({
        tabOrder: false,
        titleAttributes: false,
        labelTags: false
    });

    //This function will analyze the test page for focusable element related markup relating to accessibility
    xfANDI.analyze = function () {

        xfANDI.accesskeys = new AndiAccesskeys();

        //Loop through every visible element and run tests
        $(TestPageData.allVisibleElements).each(function () {
            // DJB	console.log(this);
            if ($(this).is(":focusable,canvas")) {//If element is focusable, search for accessibility components.
                andiData = new AndiData(this);

                andiCheck.commonFocusableElementChecks(andiData, $(this));
                andiCheck.lookForCanvasFallback(this);
                if (andiData.accesskey)
                    xfANDI.accesskeys.push(this, andiData.accesskey, andiData.andiElementIndex);
                testPageData.firstLaunchedModulePrep(this, andiData);
                AndiData.attachDataToElement(this);
            }
            else {
                testPageData.firstLaunchedModulePrep(this);
                andiCheck.isThisElementDisabled(this);
            }
        });

        andiCheck.areLabelForValid();
        andiCheck.areThereDisabledElements("elements");
    };

    function AndiAccesskeys() {
        //Raw accesskey values will be stored here and checked against
        var duplicateComparator = "";

        //Stores HTML to display the accesskeys
        var list = "";

        this.getListHtml = function () {
            return list;
        };

        this.push = function (element, accesskey, index) {
            if (accesskey) {
                //Is accesskey value more than one character?
                if (accesskey.length > 1) { //TODO: could be a non-issue if browsers are supporting space delimited accesskey lists
                    andiAlerter.throwAlert(alert_0052, [accesskey]);
                    addToList(accesskey, alert_0052);
                }
                else {
                    //Check for duplicate accesskey
                    if (duplicateComparator.includes(accesskey)) {
                        if ($(element).is("button,input:submit,input:button,input:reset,input:image")) {
                            //duplicate accesskey found on button
                            andiAlerter.throwAlert(alert_0054, [accesskey]);
                            addToList(accesskey, alert_0054);
                        }
                        else if ($(element).is("a[href]")) {
                            //duplicate accesskey found on link
                            andiAlerter.throwAlert(alert_0056, [accesskey]);
                            addToList(accesskey, alert_0056);
                        }
                        else {
                            //duplicate accesskey found
                            andiAlerter.throwAlert(alert_0055, [accesskey]);
                            addToList(accesskey, alert_0055);
                        }
                    }
                    else {
                        addToList(accesskey);
                        duplicateComparator += accesskey;
                    }
                }
            }

            function addToList(accesskey, alertObject) {
                var addClass = "";
                var titleText = "";
                if (alertObject) {
                    addClass = "class='ANDI508-display-" + alertObject.level + "'";
                    titleText = alertObject.level + ": " + alertObject.message + accesskey;
                }
                else
                    titleText = "AccessKey " + accesskey + " found, focus on element";

                if (index === 0)
                    list += "<span tabindex='0' " + addClass + " title='" + titleText + "'>" + accesskey + "</span> ";
                else
                    list += "<a href='#' data-andi508-relatedindex='" + index + "' title='" + titleText + "'><span " + addClass + ">" + accesskey + "</span></a> ";
            }
        };
    }

    //This function adds the finishing touches and functionality to ANDI's display once it's done scanning the page.
    //Inserts some counter totals, displays the accesskey list
    xfANDI.results = function () {

        //        andiBar.updateResultsSummary("Focusable Elements Found: "+testPageData.andiElementIndex);

        //Are There Focusable Elements?
        if (testPageData.andiElementIndex > 0) {
            //Yes, Focusable Elements were found

            //Accesskeys List:
            if (xfANDI.accesskeys.getListHtml()) {
                $("#ANDI508-additionalPageResults").append("<p id='ANDI508-accesskeysFound'>AccessKeys: " + "{ " + xfANDI.accesskeys.getListHtml() + "}</p>");
                $("#ANDI508-accesskeysFound").find("a").each(function () {
                    andiFocuser.addFocusClick($(this));
                    $(this).on("mouseover", andiLaser.drawAlertLaser);
                    $(this).on("click", andiLaser.eraseLaser);
                    $(this).on("mouseleave", andiLaser.eraseLaser);
                });
                $("#ANDI508-accesskeysFound").show();
            }

            // Tab Order button
            // var moduleActionButtons = "<button id='ANDI508-tabOrder-button' aria-label='Tab Order Indicators' aria-pressed='false'>tab order"+overlayIcon+"</button>";
            // if(TestPageData.page_using_titleAttr)
            //     moduleActionButtons += "<button id='ANDI508-titleAttributes-button' aria-label='Title Attributes' aria-pressed='false'>title attributes"+overlayIcon+"</button>";
            // if(testPageData.page_using_label)
            //     moduleActionButtons += "<button id='ANDI508-labelTags-button' aria-label='Label Tags' aria-pressed='false'>label tags"+overlayIcon+"</button>";

            // $("#ANDI508-module-actions").append(moduleActionButtons);

            //Define tabOrder button functionality
            $("#ANDI508-tabOrder-button").click(function () {
                if ($(this).attr("aria-pressed") == "false") {
                    andiOverlay.overlayButton_on("overlay", $(this));
                    andiOverlay.overlayTabOrder();
                    AndiModule.activeActionButtons.tabOrder = true;
                }
                else {
                    andiOverlay.overlayButton_off("overlay", $(this));
                    andiOverlay.removeOverlay("ANDI508-overlay-tabSequence");
                    AndiModule.activeActionButtons.tabOrder = false;
                }
                andiResetter.resizeHeights();
                return false;
            });

            //Define titleAttributes button functionality
            $("#ANDI508-titleAttributes-button").click(function () {
                if ($(this).attr("aria-pressed") == "false") {
                    andiOverlay.overlayButton_on("overlay", $(this));
                    andiOverlay.overlayTitleAttributes();
                    AndiModule.activeActionButtons.titleAttributes = true;
                }
                else {
                    andiOverlay.overlayButton_off("overlay", $(this));
                    andiOverlay.removeOverlay("ANDI508-overlay-titleAttributes");
                    AndiModule.activeActionButtons.titleAttributes = false;
                }
                andiResetter.resizeHeights();
                return false;
            });

            //Define titleAttributes button functionality
            $("#ANDI508-labelTags-button").click(function () {
                if ($(this).attr("aria-pressed") == "false") {
                    andiOverlay.overlayButton_on("overlay", $(this));
                    andiOverlay.overlayLabelTags();
                    AndiModule.activeActionButtons.labelTags = true;
                }
                else {
                    andiOverlay.overlayButton_off("overlay", $(this));
                    andiOverlay.removeOverlay("ANDI508-overlay-labelTags");
                    AndiModule.activeActionButtons.labelTags = false;
                }
                andiResetter.resizeHeights();
                return false;
            });

            //           andiBar.focusIsOnInspectableElement();
            //           andiBar.showElementControls();
            andiBar.showStartUpSummary("Run all modules over entire page as well as all linked pages. (Eventually)", true);
        }
        else {
            //No Focusable Elements were found
            andiBar.hideElementControls();
            andiBar.showStartUpSummary("No focusable elements were found on this page.");
        }

        andiAlerter.updateAlertList();

        //     AndiModule.engageActiveActionButtons([
        //         "tabOrder",
        //         "titleAttributes",
        //         "labelTags"
        //     ]);

        //     $("#ANDI508").focus();
    };

    //This function will overlay the tab order sequence.
    //It will take into account, tabindexes that are greater than zero and less than zero
    AndiOverlay.prototype.overlayTabOrder = function () {
        var tabindex;
        var tabSequence = 0;
        var overlayObject;
        //PASS 1: Get tabindexes greater than 0:
        var greaterThanZeroArray = []; //Will store elements with tabindex greater than 0
        $("#ANDI508-testPage [tabindex].ANDI508-element").each(function () {
            tabindex = $(this).attr("tabindex");
            if (tabindex > 0)//tab index is greater than 0
                greaterThanZeroArray.push(this); //Add to the array
        });
        //loop through the greater than zero array until all elements have been addressed
        var i = 1;
        var z = greaterThanZeroArray.length;
        while (z > 0) {
            for (var x = 0; x < greaterThanZeroArray.length; x++) {
                if ($(greaterThanZeroArray[x]).attr("tabindex") == i) {
                    tabSequence++;
                    overlayObject = andiOverlay.createOverlay("ANDI508-overlay-tabSequence ANDI508-overlay-tabSequence-greaterThanZero", tabSequence, "tabIndex=" + i, i);
                    andiOverlay.insertAssociatedOverlay($(greaterThanZeroArray[x]), overlayObject, true);
                    z--;
                }
            }
            i++;
        }

        //PASS 2: Get tabindex=0 and natively tabbable:
        var titleText;
        var lastRadioGroupName;
        $("#ANDI508-testPage .ANDI508-element").each(function () {
            tabindex = $(this).attr("tabindex");
            if (tabindex < 0) {
                //tab index is negative
                overlayObject = andiOverlay.createOverlay("ANDI508-overlay-alert ANDI508-overlay-tabSequence", "X", "not in tab order", 0);
                andiOverlay.insertAssociatedOverlay(this, overlayObject, true);
            }
            else if (tabindex == 0 || ($(this).is(":tabbable") && !(tabindex > 0))) {
                //tabindex is 0 or natively tabbable and tabindex is not greater than zero

                if ($(this).is("input[type=radio][name]")) {
                    if (lastRadioGroupName !== undefined && lastRadioGroupName === $(this).attr("name"))
                        return; //this is a subsequent radio button, don't add overlay
                    else
                        lastRadioGroupName = $(this).attr("name");
                }
                tabSequence++;
                titleText = (tabindex == 0) ? "tabIndex=0" : "natively tabbable";
                overlayObject = andiOverlay.createOverlay("ANDI508-overlay-tabSequence", tabSequence, titleText, 0);
                andiOverlay.insertAssociatedOverlay(this, overlayObject, true);
            }
        });
    };

    //This function will overlay the label elements.
    AndiOverlay.prototype.overlayLabelTags = function () {
        var labelText, labelFor, overlayClasses, overlayObject, titleText;
        $("#ANDI508-testPage label").filter(":visible").each(function () {
            labelText = "&lt;label";
            overlayClasses = "ANDI508-overlay-labelTags";
            titleText = "";
            labelFor = $(this).attr("for");

            if (labelFor) {
                labelText += " for=" + labelFor;
                if (!document.getElementById(labelFor)) { //id that matches for cannot be found
                    overlayClasses += " ANDI508-overlay-alert";
                    titleText += "no matching [id]";
                }
            }
            else
                titleText += "no [for] attribute";
            labelText += "&gt;";

            overlayObject = andiOverlay.createOverlay(overlayClasses, labelText, titleText, 0);
            andiOverlay.insertAssociatedOverlay(this, overlayObject, true);
            $(this).after(andiOverlay.createOverlay(overlayClasses, "&lt;/label&gt;", "", 0));
        });

    };

    //This function will update the info in the Active Element Inspection.
    //Should be called after the mouse hover or focus in event.
    AndiModule.inspect = function (element) {
        andiBar.prepareActiveElementInspection(element);

        var elementData = $(element).data("andi508");
        var addOnProps = AndiData.getAddOnProps(element, elementData);

        andiBar.displayOutput(elementData, element, addOnProps);
        andiBar.displayTable(elementData, element, addOnProps);
    };

    xfANDI.analyze();
    xfANDI.results();

//}//end init

//==========================================//
//gANDI: graphics ANDI 						//
//Created By Social Security Administration //
//==========================================//
// function init_module(){

    // var xgandiVersionNumber = "6.0.2";
    
    //TODO: add <video>
    
    //create xgANDI instance
    var xgANDI = new AndiModule(xgandiVersionNumber,"x");
    
    //This function removes markup in the test page that was added by this module
    AndiModule.cleanup = function(testPage, element){
        if(element)
            $(element).removeClass("gANDI508-background gANDI508-fontIcon");
        else
            $(testPage).find(".gANDI508-decorative").removeClass("gANDI508-decorative");
    };
    
    //Stores the total number of image types found
    var totals = {
        inline: 0, 		//inline images
        background: 0,	//elements with background images
        decorative: 0,	//images explicetly declared as decorative
        fontIcon: 0,	//font icons
        imageLink: 0,	//images contained in links
        imageButton: 0	//images contained in buttons
    };
    
    AndiModule.initActiveActionButtons({
        fadeInlineImages:false,
        highlightDecorativeImages:false,
        removeBackgroundImages:false,
        highlightBackgroundImages:false,
        highlightFontIcons:false
    });
    
    //This function will analyze the test page for graphics/image related markup relating to accessibility
    xgANDI.analyze = function(){
        
        var isImageContainedByInteractiveWidget; //boolean if image is contained by link or button
        
        //Loop through every visible element
        $(TestPageData.allVisibleElements).each(function(){
            
            var closestWidgetParent;
            //Determine if the image is contained by an interactive widget (link, button)
            isImageContainedByInteractiveWidget = false; //reset boolean
            if($(this).not("[tabindex]").is("img,[role=img]")){
                //Is Image contained by a link or button?
                closestWidgetParent = $(this).closest("a,button,[role=button],[role=link]");
                if($(closestWidgetParent).length){
                    if($(closestWidgetParent).isSemantically("[role=link]","a"))
                        totals.imageLink++;
                    else if($(closestWidgetParent).isSemantically("[role=button]","button"))
                        totals.imageButton++;
                    totals.inline++;
                    isImageContainedByInteractiveWidget = true;
                }
            }
            
            if(isImageContainedByInteractiveWidget || $(this).is("[role=img],[role=image],img,input[type=image],svg,canvas,area,marquee,blink")){
                
                if(isImageContainedByInteractiveWidget){
                    //Check if parent already has been evaluated (when more than one image is in a link)
                    if(!$(closestWidgetParent).hasClass("ANDI508-element")){
                        //Image is contained by <a> or <button>
                        andiData = new AndiData(closestWidgetParent[0]);
                        andiCheck.commonFocusableElementChecks(andiData, $(closestWidgetParent));
                        AndiData.attachDataToElement(closestWidgetParent);
                    }
                }
                else{//not contained by interactive widget
                    andiData = new AndiData(this);
                }
                
                //Check for conditions based on semantics
                if($(this).is("marquee")){
                    totals.inline++;
                    andiAlerter.throwAlert(alert_0171);
                    AndiData.attachDataToElement(this);
                }
                else if($(this).is("blink")){
                    totals.inline++;
                    andiAlerter.throwAlert(alert_0172);
                    AndiData.attachDataToElement(this);
                }
                else if($(this).is("canvas")){
                    totals.inline++;
                    andiCheck.commonNonFocusableElementChecks(andiData, $(this), true);
                    AndiData.attachDataToElement(this);
                }
                else if($(this).is("input:image")){
                    totals.inline++;
                    andiCheck.commonFocusableElementChecks(andiData, $(this));
                    altTextAnalysis($.trim($(this).attr("alt")));
                    AndiData.attachDataToElement(this);
                }
                //Check for server side image map
                else if($(this).is("img") && $(this).attr("ismap")){//Code is written this way to prevent bug in IE8
                    totals.inline++;
                    andiAlerter.throwAlert(alert_0173);
                    AndiData.attachDataToElement(this);
                }
                else if(!isImageContainedByInteractiveWidget && $(this).is("img,svg,[role=img]")){ //an image used by an image map is handled by the <area>
                    totals.inline++;
                    if(isElementDecorative(this, andiData)){
                        totals.decorative++;
                        $(this).addClass("gANDI508-decorative");
    
                        if($(this).prop("tabIndex") >= 0)
                            //Decorative image is in the tab order
                            andiAlerter.throwAlert(alert_0126);
                    }
                    else{//This image has not been declared decorative
                        if(andiData.tabbable)
                            andiCheck.commonFocusableElementChecks(andiData,$(this));
                        else
                            andiCheck.commonNonFocusableElementChecks(andiData, $(this), true);
                        altTextAnalysis($.trim($(this).attr("alt")));
                    }
                    
                    AndiData.attachDataToElement(this);
                }
                else if($(this).is("area")){
                    totals.inline++;
                    var map = $(this).closest("map");
                    if($(map).length){
                        //<area> is contained in <map>
                        var mapName = "#"+$(map).attr("name");
                        if($("#ANDI508-testPage img[usemap='"+mapName+"']").length){
                            //<map> references existing <img>
                            andiCheck.commonFocusableElementChecks(andiData, $(this));
                            altTextAnalysis($.trim($(this).attr("alt")));
                            AndiData.attachDataToElement(this);
                        }
                        else{//Image referenced by image map not found
                            //TODO: throw this message only once for all area tags that it relates to
                            andiAlerter.throwAlert(alert_006A,["&ltmap name="+mapName+"&gt;"],0);
                        }
                    }
                    else //Area tag not contained in map
                        andiAlerter.throwAlert(alert_0178,alert_0178.message,0);
                }
                else if($(this).is("[role=image]")){
                    //totals.inline++;
                    andiAlerter.throwAlert(alert_0183);
                    AndiData.attachDataToElement(this);
                }
            }
            else if($(this).css("background-image").includes("url(")){
                totals.background++;
                $(this).addClass("gANDI508-background");
            }
            
            //Check for common font icon classes
            if( !$(this).is("[role=img],img") &&
                (
                $(this).hasClass("fa") || //font awesome
                $(this).hasClass("glyphicon") || //glyphicon
                $(this).hasClass("material-icons") || //google material icons
                $(this).is("[data-icon]") ||//common usage of the data-* attribute for icons
                lookForPrivateUseUnicode(this)
                )
            )
            {
                if(!$(this).hasClass("ANDI508-element")){
                    andiData = new AndiData(this);
                    AndiData.attachDataToElement(this);
                }
                totals.fontIcon++;
                $(this).addClass("gANDI508-fontIcon");
            }
        });
        
        if(totals.background > 0) //Page has background images
            andiAlerter.throwAlert(alert_0177,alert_0177.message,0);
            
        //This returns true if the image is decorative.
        function isElementDecorative(element, elementData){
            if($(element).attr("aria-hidden") === "true"){
                return true;
            }
            //TODO: this logic may need to change if screen readers support spec that says aria-label
            //		should override role=presentation, thus making it not decorative
            else{
                if(elementData.role === "presentation" || elementData.role === "none"){ //role is presentation or none
                    return true;
                }
                else if($(element).is("img") && elementData.empty && elementData.empty.alt){ //<img> and empty alt
                    return true;
                }
            }
            return false;
        }
        
        //This function looks at the CSS content psuedo elements looking for unicode in the private use range which usually means font icon
        function lookForPrivateUseUnicode(element){
            return ( hasPrivateUseUnicode("before") || hasPrivateUseUnicode("after") );
            
            function hasPrivateUseUnicode(psuedo){
                var content = (oldIE) ? "" : window.getComputedStyle(element, ":"+psuedo).content;
                if(content !== "none" && content !== "normal" && content !== "counter" && content !== "\"\""){//content is not none or empty string
                    var unicode;
                    //starts at 1 and end at length-1 to ignore the starting and ending double quotes
                    for(var i=1; i<content.length-1; i++){
                        unicode = content.charCodeAt(i);
                        if(unicode >= 57344 && unicode <= 63743){
                            //unicode is in the private use range
                            return true;
                        }
                    }
                }
                return false;
            }
        }
    };
    
    //This function adds the finishing touches and functionality to ANDI's display once it's done scanning the page.
    xgANDI.results = function(){
        
        var imagesCount = totals.inline + totals.background + totals.fontIcon;
        
        andiBar.updateResultsSummary("Images Found: "+imagesCount);
    
        //Are There Images?
        if(imagesCount > 0){
            //Yes, images were found
            
            //Create Image contained by html (number of image links and image buttons)
            var resultsDetails = "";
            if(totals.inline > 0)
                resultsDetails += totals.inline + " inline images, ";
            if(totals.imageLink > 0)
                resultsDetails += totals.imageLink + " image links, ";
            if(totals.imageButton > 0)
                resultsDetails += totals.imageButton + " image buttons, ";
            if(totals.fontIcon > 0)
                resultsDetails += totals.fontIcon + " font icons, ";
            if(totals.background > 0)
                resultsDetails += totals.background+ " background-images, ";
            if(resultsDetails)
                resultsDetails = resultsDetails.slice(0, -2);//Slice off last two characters: the comma and space: ", "
            
            $("#ANDI508-additionalPageResults").append("<p tabindex='0'>"+resultsDetails+"</p>");
            
            //Add Module Mode Buttons
            var moduleActionButtons = "";
            if(totals.inline > 0){
                moduleActionButtons += "<button id='ANDI508-fadeInlineImages-button' aria-label='Hide "+totals.inline+" Inline Images' aria-pressed='false'>hide "+totals.inline+" inline</button>";
                if(totals.decorative > 0)
                    moduleActionButtons += "<button id='ANDI508-highlightDecorativeImages-button' aria-label='Highlight "+totals.decorative+" Decorative Inline Images' aria-pressed='false'>"+totals.decorative+" decorative inline"+findIcon+"</button>";
            }
            if(totals.background > 0){
                if(totals.inline > 0)
                    moduleActionButtons += "<span class='ANDI508-module-actions-spacer'>|</span> ";
                moduleActionButtons += "<button id='ANDI508-removeBackgroundImages-button' aria-label='Hide "+totals.background+" Background Images' aria-pressed='false'>hide "+totals.background+" background</button>";
                moduleActionButtons += "<button id='ANDI508-highlightBackgroundImages-button' aria-label='Highlight "+totals.background+" Background Images' aria-pressed='false'>find "+totals.background+" background"+findIcon+"</button>";
            }
            if(totals.fontIcon > 0){
                if(totals.inline > 0 || totals.background > 0)
                    moduleActionButtons += "<span class='ANDI508-module-actions-spacer'>|</span> ";
                moduleActionButtons += "<button id='ANDI508-highlightFontIcons-button' aria-label='Find "+totals.fontIcon+" Font Icons' aria-pressed='false'>"+totals.fontIcon+" font icons</button>";
            }
            
            $("#ANDI508-module-actions").html(moduleActionButtons);
        
            //Define fadeInlineImages button
            $("#ANDI508-fadeInlineImages-button").click(function(){
                //This button will change the image's opacity to almost zero
                if($(this).attr("aria-pressed")=="false"){
                    $(this).attr("aria-pressed","true").addClass("ANDI508-module-action-active");
                    $("#ANDI508-testPage").addClass("gANDI508-fadeInline");
                    AndiModule.activeActionButtons.fadeInlineImages = true;
                }
                else{
                    $(this).attr("aria-pressed","false").removeClass("ANDI508-module-action-active");
                    $("#ANDI508-testPage").removeClass("gANDI508-fadeInline");
                    AndiModule.activeActionButtons.fadeInlineImages = false;
                }
                andiResetter.resizeHeights();
                return false;
            });
            
            //Define Remove removeBackgroundImages button
            $("#ANDI508-removeBackgroundImages-button").click(function(){
                if($(this).attr("aria-pressed")=="false"){
                    $(this).attr("aria-pressed","true").addClass("ANDI508-module-action-active");
                    $("#ANDI508-testPage").addClass("gANDI508-hideBackground");
                    AndiModule.activeActionButtons.removeBackgroundImages = true;
                }
                else{
                    $(this).attr("aria-pressed","false").removeClass("ANDI508-module-action-active");
                    $("#ANDI508-testPage").removeClass("gANDI508-hideBackground");
                    AndiModule.activeActionButtons.removeBackgroundImages = false;
                }
                andiResetter.resizeHeights();
                return false;
            });
            
            //Define highlightBackgroundImages button
            $("#ANDI508-highlightBackgroundImages-button").click(function(){
                if($(this).attr("aria-pressed")=="false"){
                    andiOverlay.overlayButton_on("find",$(this));
                    $("#ANDI508-testPage").addClass("gANDI508-highlightBackground");
                    AndiModule.activeActionButtons.highlightBackgroundImages = true;
                }
                else{
                    andiOverlay.overlayButton_off("find",$(this));
                    $("#ANDI508-testPage").removeClass("gANDI508-highlightBackground");
                    AndiModule.activeActionButtons.highlightBackgroundImages = false;
                }
                andiResetter.resizeHeights();
                return false;
            });
            
            //Define highlightDecorativeImages button
            $("#ANDI508-highlightDecorativeImages-button").click(function(){
                if($(this).attr("aria-pressed")=="false"){
                    andiOverlay.overlayButton_on("find",$(this));
                    $("#ANDI508-testPage").addClass("gANDI508-highlightDecorative");
                    AndiModule.activeActionButtons.highlightDecorativeImages = true;
                }
                else{
                    andiOverlay.overlayButton_off("find",$(this));
                    $("#ANDI508-testPage").removeClass("gANDI508-highlightDecorative");
                    AndiModule.activeActionButtons.highlightDecorativeImages = false;
                }
                andiResetter.resizeHeights();
                return false;
            });
            
            //Define highlightFontIcons button
            $("#ANDI508-highlightFontIcons-button").click(function(){
                if($(this).attr("aria-pressed")=="false"){
                    andiOverlay.overlayButton_on("find",$(this));
                    $("#ANDI508-testPage").addClass("gANDI508-highlightFontIcon");
                    AndiModule.activeActionButtons.highlightFontIcons = true;
                }
                else{
                    andiOverlay.overlayButton_off("find",$(this));
                    $("#ANDI508-testPage").removeClass("gANDI508-highlightFontIcon");
                    AndiModule.activeActionButtons.highlightFontIcons = false;
                }
                andiResetter.resizeHeights();
                return false;
            });
            
            var startupSummaryText = "";
            if((totals.inline + totals.fontIcon) > 0){
                andiBar.showElementControls();
                if(!andiBar.focusIsOnInspectableElement())
                    startupSummaryText += "Discover accessibility markup for inline <span class='ANDI508-module-name-g'>graphics/images</span> by hovering over the highlighted elements or pressing the next/previous element buttons. ";
            }
            else{
                andiBar.hideElementControls();
            }
            startupSummaryText += "Ensure that every meaningful/non-decorative image has a text equivalent.";
            andiBar.showStartUpSummary(startupSummaryText, true);
            
            AndiModule.engageActiveActionButtons([
                "fadeInlineImages",
                "removeBackgroundImages",
                "highlightBackgroundImages",
                "highlightDecorativeImages",
                "highlightFontIcons"
            ]);
        }
        else{
            //No Graphics were found
            andiBar.hideElementControls();
            andiBar.showStartUpSummary("No <span class='ANDI508-module-name-g'>graphics/images</span> were found on this page.");
        }
        
        andiAlerter.updateAlertList();
        
        $("#ANDI508").focus();
    };
    
    //This function will update the info in the Active Element Inspection.
    //Should be called after the mouse hover or focus in event.
    AndiModule.inspect = function(element){
        if($(element).hasClass("ANDI508-element")){
            andiBar.prepareActiveElementInspection(element);
            
            //format background-image
            var bgImgUrl = $(element).css("background-image");
            if(bgImgUrl.slice(0, 4) === "url(")
                bgImgUrl = bgImgUrl.slice(5, -2); //remove 'url("' and '")'
            else
                bgImgUrl = "";
            
            var elementData = $(element).data("andi508");
            var addOnProps = AndiData.getAddOnProps(element, elementData,
                [
                    "longdesc",
                    "ismap",
                    "usemap",
                    ["background-image", bgImgUrl]
                ]);
    
            andiBar.displayOutput(elementData, element, addOnProps);
            andiBar.displayTable(elementData, element, addOnProps);
        }
    };
    
    //This function will analyze the alt text
    function altTextAnalysis(altText){
        var regEx_redundantPhrase = /(image of|photo of|picture of|graphic of|photograph of)/g;
        var regEx_fileTypeExt = /\.(png|jpg|jpeg|gif|pdf|doc|docx|svg)$/g;
        var regEx_nonDescAlt = /^(photo|photograph|picture|graphic|logo|icon|graph|image)$/g;
        
        if(altText !== ""){
            altText = altText.toLowerCase();
            //check for redundant phrase in alt text
            if(regEx_redundantPhrase.test(altText)){
                //redundant phrase in alt text
                andiAlerter.throwAlert(alert_0174);
            }
            //Check for filename in alt text
            else if(regEx_fileTypeExt.test(altText)){
                //file name in alt text
                andiAlerter.throwAlert(alert_0175);
            }
            //Check for non-descriptive alt text
            else if(regEx_nonDescAlt.test(altText)){
                //non-descriptive alt text
                andiAlerter.throwAlert(alert_0176);
            }
        }
    }
    
    xgANDI.analyze();
    xgANDI.results();
    
    }//end init
    
