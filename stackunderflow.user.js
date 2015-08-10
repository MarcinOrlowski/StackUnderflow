// ==UserScript==
// @name         StackUnderflow
// @namespace    http://webnetmobile.com/
// @version      0.1
// @description  Brings user blacklisting, favouries and other goodies to StackOverflow.com
// @author       Marcin Orlowski
// @downloadURL  https://github.com/MarcinOrlowski/StackUnderflow/raw/master/stackunderflow.user.js
// @match        https://stackoverflow.com/questions/*
// @require      https://code.jquery.com/jquery-latest.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==
// The @grant GM_addStyle directive is needed to work around a major design change introduced in GM 1.0, restores the sandbox.

//--[ THIS IS CONFIG. CHANGE AS YOU WANT ]---------------------------------------------------

// true/false: when true (default) you will see banner on top of the screen when question you are reading is already answered and answer is accepted by OP
var cfg_enableAcceptedAnswerWarning = true;

// true/false: when true (default) accepted answer (if any) will be additionally highlighted
var cfg_highlightAcceptedAnswer = true;

// true/false: when true (default) you will seel warning if question you are reading is asked by user with reputation lower than cfg_questionPosterReputationThreshold value
var cfg_enableLowReputationWarning = true;
var cfg_questionPosterReputationThreshold = 250;

// true/false: when true (default) you will see warning when you are reading a question asked by user you already blacklisted
var cfg_enablePostedByBlacklistedUserWarning = true;

// true/false: when true (default) yo uwill see information when you are reading question asked by user you got on your favourite user list
var cfg_enablePostedByFavouriteUserWarning = true;

var cfg_userBlacklistedOnUrl = "https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-blacklisted-on.png";
var cfg_userBlacklistedOffUrl = "https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-blacklisted-off.png";
var cfg_userFavouriteOnUrl = "https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-favourite-on.png";
var cfg_userFavouriteOffUrl = "https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-favourite-off.png";


//--[ DO NOT ALTER ANYTHING BELOW ]---------------------------------------------------

var wbn_postedByBlacklistedUserBannerSet = false;
var wbn_questionHasAcceptedAnswerBannerSet = false;
var wbn_lowReputationWarningBannerSet = false;
var wbn_postedByFavouriteUserBannerSet = false;

var wbn_blacklistedEntryPrefix = "blacklisted_";
var wbn_favouriteEntryPrefix = "favourite_";

//-----------------------------------------------------

var myId = $(".topbar-links > a").attr("href").split("/")[2];

var posterRoot = $(".post-signature.owner");
var posterName = posterRoot.find(".user-details > a").text();
var posterId = posterRoot.find(".user-details > a").attr("href").split("/")[2];

var posterReputation = posterRoot.find(".reputation-score").attr("title").split(" ")[2];
// poster reputation missing in title of for some questions (most likely SO bug):
// https://stackoverflow.com/questions/31902812/  https://stackoverflow.com/questions/5937121/
if (posterReputation == "") {
    posterReputation = posterRoot.find(".reputation-score").text().replace(" ","").replace(",", "");
    // check if we got only digits here. If not, we we assume we have "k" suffix
    var reg = new RegExp("[0-9]");
    if (!reg.test(posterReputation)) {
        posterReputation = posterReputation.replace("k","") * 1000;
    }
}

//$('body').append('<div id="SOINFO">myId: ' + myId + "<br/>pName: " + posterName + "<br/>pId: " + posterId + "<br/>pRep: " + posterReputation + "<br/>");
//$("#SOINFO").css("position", "fixed").css("background", "red").css("top", 0).css("left", 0);

addStyles();
updateDisplay();

//-----------------------------------------------------

function clickToggleBlacklist(event) {
    blacklistToggle(event.data.userId);
    updateDisplay();
}

function clickToggleFavourite(event) {
    favouriteToggle(event.data.userId);
    updateDisplay();
}

function updateDisplay() {

    var isPosterFavourite = isFavourite(posterId);
    var isPosterBlacklisted = isBlacklisted(posterId);

    // update banners
    var hasAcceptedAnswer = $("#answers .answer.accepted-answer")[0];

    // plant banners
    if (!wbn_questionHasAcceptedAnswerBannerSet) {
        if (hasAcceptedAnswer) {
            var hasAnswerBanner = '<div id="wbn_questionHasAcceptedAnswer" class="wbn_banner wbn_okBanner">Question has accepted answer</div>';
            $(hasAnswerBanner).insertBefore("#question-header");
            $(hasAnswerBanner).insertBefore("#post-editor"); 
        
            if (cfg_highlightAcceptedAnswer) {
                $("#answers .answer.accepted-answer").addClass("wbn_acceptedAnswerHighlight");
            }

            wbn_questionHasAcceptedAnswerBannerSet = true;
        }
    }

    if (!wbn_postedByBlacklistedUserBannerSet) {
        var blacklistedUserPostBanner = '<div class="wbn_postedByBlacklistedUserBanner wbn_banner wbn_blacklistedBanner wbn_hidden"><img class="wbn_userActionIcon" src="' + cfg_userBlacklistedOnUrl + '"> Question asked by blacklisted user</div>';
        $(blacklistedUserPostBanner).insertBefore("#question-header");
        $(blacklistedUserPostBanner).insertBefore("#post-editor"); 

        wbn_postedByBlacklistedUserBannerSet = true;
    }

    if (!wbn_postedByFavouriteUserBannerSet) {
        var favouriteUserPostBanner = '<div class="wbn_postedByFavouriteUserBanner wbn_banner wbn_favouriteBanner wbn_hidden"><img class="wbn_userActionIcon" src="' + cfg_userFavouriteOnUrl + '"> Question asked by starred user</div>';
        $(favouriteUserPostBanner).insertBefore("#question-header");

        wbn_postedByFavouriteUserBannerSet = true;
    }

    if (!wbn_lowReputationWarningBannerSet) {
        var posterReputationLow = '<div class="wbn_lowReputationBanner wbn_banner wbn_warningBanner wbn_hidden">Poster reputation score is below ' + cfg_questionPosterReputationThreshold + ' points</div>';
        $(posterReputationLow).insertBefore("#question-header");
        $(posterReputationLow).insertBefore("#post-editor"); 
        
        wbn_lowReputationWarningBannerSet = true;
    }
    
    // show/hide banners
    if (cfg_enablePostedByBlacklistedUserWarning) {
        var blBanner = $(".wbn_postedByBlacklistedUserBanner");
        if (isPosterBlacklisted) {
            blBanner.fadeIn(500);
        } else {
            blBanner.hide();
        }
    }
    
    if (cfg_enablePostedByFavouriteUserWarning) {
        var favBanner = $(".wbn_postedByFavouriteUserBanner");
        if (isPosterFavourite) {
            favBanner.fadeIn(500);
        } else {
            favBanner.hide();
        }
    }

    if ((!isPosterFavourite) && (!isPosterBlacklisted)) {
        if ((!hasAcceptedAnswer) && (cfg_enableLowReputationWarning) && (posterReputation < cfg_questionPosterReputationThreshold)) {
            $(".wbn_lowReputationBanner").fadeIn(500);
        }
    } else {
        $(".wbn_lowReputationBanner").hide();
    }
        

    
    // update links
    $("td.post-signature > .user-info").each(function(index){updateUserLinksRaw(index,$(this));});
    
}

function updateUserLinksRaw(index, element) {
    var userId = element.find(".user-details > a").attr("href");//.split("/")[2];
    if (userId !== undefined) {
        userId = userId.split("/")[2];
        if (userId != myId ) {
            var isFav = isFavourite(userId);
            var isBl = isBlacklisted(userId);
            
            var actionId = "wbn_action_user_" + userId + "_" + index;
            element.after('<div id="' + actionId + '"></div>');

            // blacklist
            var blacklistId = "wbn_blacklist_" + userId + "_" + index;
            var blLabel = isBl ? "Click to remove this user from blacklist" : "Click to blacklist this user";
            var blIconUrl = isBl ? cfg_userBlacklistedOnUrl : cfg_userBlacklistedOffUrl;
            if ($("#" + blacklistId)[0]) {
                var blIcon = $("#" + blacklistId + " > img");
                blIcon.attr("src", blIconUrl);
                blIcon.attr("alt", blLabel);
                blIcon.attr("title", blLabel);
            } else {
                $("#" + actionId).append('<a id="' + blacklistId + '"><img class="wbn_userActionIcon" title="' + blLabel + '" alt="' + blLabel + '" src="' + blIconUrl + '"></a>');
                $("#" + blacklistId).click({userId: userId}, clickToggleBlacklist);
            }

            var blContainer = $("#" + blacklistId);
            if (!isFav) {
                blContainer.css("visibility", "visible");
            } else {
                blContainer.css("visibility", "hidden");
            }

                        // favourite
            var favId = "wbn_favourite_" + userId + "_" + index;
            var favLabel = isFav ? "Click to remove from favourites" : "Click to mark user as your favourite";
            var favIconUrl = isFav ? cfg_userFavouriteOnUrl : cfg_userFavouriteOffUrl;
            if ($("#" + favId)[0]) {
                var favIcon = $("#" + favId + " > img");
                favIcon.attr("src", favIconUrl);
                favIcon.attr("alt", favLabel);
                favIcon.attr("title", favLabel);
            } else {
                $("#" + actionId).append('<a id="' + favId + '"><img class="wbn_userActionIcon" title="' + favLabel + '" alt="' + favLabel + '" src="' + favIconUrl + '"></a>');
                $("#" + favId).click({userId: userId}, clickToggleFavourite);
            }
            
            var favContainer = $("#" + favId);
            if (!isBl) {
                favContainer.css("visibility", "visible");
            } else {
                favContainer.css("visibility", "hidden");
            }

        }
    }
}

// ----------------------------------------------------------------------

function isBlacklisted(userId) {
    return GM_getValue(wbn_blacklistedEntryPrefix + userId, false);
}
function blacklistToggle(userId) {
    toggleUserFlag(wbn_blacklistedEntryPrefix + userId);
}

function isFavourite(userId) {
    return GM_getValue(wbn_favouriteEntryPrefix + userId, false);
}
function favouriteToggle(userId) {
    toggleUserFlag(wbn_favouriteEntryPrefix + userId);
}

function toggleUserFlag(key) {
    var current = GM_getValue(key, false);
    GM_deleteValue(key);
    GM_setValue(key, (!current));
}

function multilineStr (dummyFunc) {
    var str = dummyFunc.toString ();
    str     = str.replace (/^[^\/]+\/\*!?/, '') // Strip function () { /*!
            .replace (/\s*\*\/\s*\}\s*$/, '')   // Strip */ }
            .replace (/\/\/.+$/gm, '') // Double-slash comments wreck CSS. Strip them.
            ;
    return str;
}

//--- Style our newly added elements using CSS.
function addStyles() {
GM_addStyle ( multilineStr ( function () {/*!
    .wbn_hidden {
        display: none;
    }
    
    .wbn_banner {
        padding: 10px;
        text-align: center;
        font-size: 16px;
    }

    .wbn_okBanner {
        background: #E9FCF6;
        color: black;
    }
    
    .wbn_warningBanner {
        background: #CB5555;
        color: white;
    }
    
    .wbn_favouriteBanner {
        background: #FFDD00;
        color: black;
    }

    .wbn_blacklistedBanner {
        background: #333333;
        color: white;
    }

    .wbn_acceptedAnswerHighlight {
        background: #E9FCF6;
    }
    
    .wbn_blacklistLink {
        background: #000000;
        color: white;
    }
    
    .wbn_favouriteLink {
        background: #FFDD00;
        color: black;
    }
    
    .wbn_userActionIcon {
        width: 18px;
        height: 18px;
        border: 0;
        padding: 2px;
        vertical-align: middle;
    }

*/} ) );
}
