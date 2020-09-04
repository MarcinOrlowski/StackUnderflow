// ==UserScript==
// @name         StackUnderflow
// @namespace    marcinorlowski.com/tampermonkey/stackunderflow
// @version      1.2.1
// @description  Brings user blacklisting, favouries and other goodies to StackOverflow.com
// @author       Marcin Orlowski
// @downloadURL  https://github.com/MarcinOrlowski/StackUnderflow/raw/master/stackunderflow.user.js
// @include      /^https?:\/\/(.*\.)?stackoverflow\.com/.*$/
// @include      /^https?:\/\/(.*\.)?serverfault\.com/.*$/
// @include      /^https?:\/\/(.*\.)?superuser\.com/.*$/
// @include      /^https?:\/\/(.*\.)?stackexchange\.com/.*$/
// @include      /^https?:\/\/stackapps\.com/.*$/
// @require      https://code.jquery.com/jquery-latest.js
// @require      https://raw.githubusercontent.com/rmm5t/jquery-timeago/master/jquery.timeago.js
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
// do you want this warning above the question (true), or just above response form (false, default)
var cfg_enableLowReputationWarningAboveQuestion = false;
var cfg_questionPosterReputationThreshold = 250;

// true/false: when true (default) you will see warning when you are reading a question asked by user you already blacklisted
var cfg_enablePostedByBlacklistedUserWarning = true;

// true/false: when true (default) you will see information when you are reading question asked by user you got on your favourite user list
var cfg_enablePostedByFavouriteUserWarning = true;

// true/false: when true (defaut) you will see notice when question you are reading was asked more than cfg_oldQuestionDayThreshold days ago
var cfg_enableOldQuestionWarning = true;
var cfg_oldQuestionDayThreshold = 30;

// true/false: when true (default) pages will be augmented with blacklist/favourite action buttons
var cfg_enableBlackAndFavouriteLists = true;

// If you want to change images for blacklist/favlist action buttons, here's the place. Mind the image size to not bloat the page.
var cfg_userBlacklistedOnUrl = "https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-blacklisted-on.png";
var cfg_userBlacklistedOffUrl = "https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-blacklisted-off.png";
var cfg_userFavouriteOnUrl = "https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-favourite-on.png";
var cfg_userFavouriteOffUrl = "https://raw.githubusercontent.com/MarcinOrlowski/StackUnderflow/master/img/user-favourite-off.png";

//--[ DO NOT ALTER ANYTHING BELOW ]---------------------------------------------------

var myId = 0;
var isSignedIn = ($("a.my-profile").length > 0);

if (isSignedIn) {
    myId = $("a.my-profile").attr("href").split("/")[2];
}

var wbn_bannersSet = false;
var wbn_postedByBlacklistedUserBannerSet = false;
var wbn_questionHasAcceptedAnswerBannerSet = false;
var wbn_lowReputationWarningBannerSet = false;
var wbn_postedByFavouriteUserBannerSet = false;
var wbn_oldQuestionBannerSet = false;

var wbn_blacklistedEntryPrefix = "blacklisted_";
var wbn_favouriteEntryPrefix = "favourite_";

//-----------------------------------------------------

addStyles();

var pageUrl = window.location.href.split("/");
if (pageUrl.length > 4) {
    // question details: https://stackoverflow.com/questions/ID/DESC
    if (pageUrl[3] == 'questions') {
        augmentQuestion();
    } else {
        // user profile: https://stackoverflow.com/users/ID/ALIAS
        if (pageUrl[3] == 'users') {
            augmentUserProfile(pageUrl[4]);
        }
    }
} else {
    augmentQuestionIndex();
}

//-----------------------------------------------------

function augmentUserProfile(userId) {
    // do not augment out own profile page
    if (userId == myId) {
        return;
    }

    updateUserProfileAugmentation(userId);
}

function updateUserProfileAugmentation(userId) {

    var isUserFavourite = isFavourite(userId);
    var isUserBlacklisted = isBlacklisted(userId);

    if (!wbn_bannersSet) {
        var banner = '<div class="wbn_banners">'
                     + '<div class="wbn_postedByBlacklistedUserBanner wbn_banner wbn_blacklistedBanner wbn_hidden"><img class="wbn_userProfileActionIcon" src="' + cfg_userBlacklistedOnUrl + '"> User is on your blacklist</div>'
                     + '<div class="wbn_postedByFavouriteUserBanner wbn_banner wbn_favouriteBanner wbn_hidden"><img class="wbn_userProfileActionIcon" src="' + cfg_userFavouriteOnUrl + '"> Your starred user</div>'
                     + '</div>';
        $(banner).insertBefore("#main-content > #user-card > .row");

        wbn_bannersSet = true;
    }

    // show/hide banners
    if (cfg_enablePostedByBlacklistedUserWarning) {
        var blBanner = $(".wbn_postedByBlacklistedUserBanner");
        if (isUserBlacklisted) {
            blBanner.fadeIn(500);
//            $("#avatar-card").addClass("wbn_blacklistedUserCard");
        } else {
            blBanner.hide();
//            $("#avatar-card").removeClass("wbn_blacklistedUserCard");
        }
    }

    if (cfg_enablePostedByFavouriteUserWarning) {
        var favBanner = $(".wbn_postedByFavouriteUserBanner");
        if (isUserFavourite) {
            favBanner.fadeIn(500);
//            $("#avatar-card").addClass("wbn_favouriteUserCard");
        } else {
            favBanner.hide();
 //           $("#avatar-card").removeClass("wbn_favouriteUserCard");
        }
    }

    // action buttons (FIXME refactor!)
    if (cfg_enableBlackAndFavouriteLists) {
        var index = 0;
        var element = $("#avatar-card > .badges")[0];

        var actionId = "wbn_action_user_" + userId + "_" + index;
        $("#avatar-card").append('<div id="' + actionId + '"></div>');

        // blacklist
        var blacklistId = "wbn_blacklist_" + userId + "_" + index;
        var blLabel = isUserBlacklisted ? "Click to remove this user from blacklist" : "Click to blacklist this user";
        var blIconUrl = isUserBlacklisted ? cfg_userBlacklistedOnUrl : cfg_userBlacklistedOffUrl;

        if ($("#" + blacklistId).length) {
            var blIcon = $("#" + blacklistId + " > img");
            blIcon.attr("src", blIconUrl);
            blIcon.attr("alt", blLabel);
            blIcon.attr("title", blLabel);
        } else {
            $("#" + actionId).append('<a id="' + blacklistId + '"><img class="wbn_userProfileActionIcon" title="' + blLabel + '" alt="' + blLabel + '" src="' + blIconUrl + '"></a>');
            $("#" + blacklistId).click({userId: userId}, clickUserProfileToggleBlacklist);
        }

        var blContainer = $("#" + blacklistId);
        if (!isUserFavourite) {
            blContainer.css("visibility", "visible");
        } else {
            blContainer.css("visibility", "hidden");
        }

        // favourite
        var favId = "wbn_favourite_" + userId + "_" + index;
        var favLabel = isUserFavourite ? "Click to remove from favourites" : "Click to mark user as your favourite";
        var favIconUrl = isUserFavourite ? cfg_userFavouriteOnUrl : cfg_userFavouriteOffUrl;
        if ($("#" + favId).length) {
            var favIcon = $("#" + favId + " > img");
            favIcon.attr("src", favIconUrl);
            favIcon.attr("alt", favLabel);
            favIcon.attr("title", favLabel);
        } else {
            $("#" + actionId).append('<a id="' + favId + '"><img class="wbn_userProfileActionIcon" title="' + favLabel + '" alt="' + favLabel + '" src="' + favIconUrl + '"></a>');
            $("#" + favId).click({userId: userId}, clickUserProfileToggleFavourite);
        }

        var favContainer = $("#" + favId);
        if (!isUserBlacklisted) {
            favContainer.css("visibility", "visible");
        } else {
            favContainer.css("visibility", "hidden");
        }
    }
}

function clickUserProfileToggleBlacklist(event) {
    blacklistToggle(event.data.userId);
    updateUserProfileAugmentation(event.data.userId);
}

function clickUserProfileToggleFavourite(event) {
    favouriteToggle(event.data.userId);
    updateUserProfileAugmentation(event.data.userId);
}

//-----------------------------------------------------

function augmentQuestionIndex() {
    $("div.started").each(function(index){updateQuestionUserIndexLinksRaw(index,$(this));});
}

function updateQuestionUserIndexLinksRaw(index, element) {
    var userId = (element.find("a")[1] + "").split("/")[4];
    if (userId !== undefined) {
        if (isBlacklisted(userId)) {
            element.find("a.started-link").after('<img class="wbn_userActionIconSmall" width="14" height="14" src="' + cfg_userBlacklistedOnUrl + '">');
        } else if (isFavourite(userId)) {
            element.find("a.started-link").after('<img class="wbn_userActionIconSmall" width="14" height="14" src="' + cfg_userFavouriteOnUrl + '">');
        }
    }
}

//-----------------------------------------------------

var posterRoot;
var posterName;
var posterId;
var postedDateMillis;
var posterReputation;

function augmentQuestion() {
    posterRoot = $(".post-signature.owner");
    posterName = posterRoot.find(".user-details > a").text();
    posterId = posterRoot.find(".user-details > a").attr("href").split("/")[2];
    postedDateMillis = Date.parse(posterRoot.find(".user-info > .user-action-time > .relativetime").attr("title"));

    posterReputation = posterRoot.find(".reputation-score").attr("title").split(" ")[2];
    // poster reputation missing in title of for some questions (most likely SO bug):
    // https://stackoverflow.com/questions/31902812/  https://stackoverflow.com/questions/5937121/
    if (posterReputation === "") {
        posterReputation = posterRoot.find(".reputation-score").text().replace(" ","").replace(",", "");
        // check if we got only digits here. If not, we we assume we have "k" suffix
        var reg = new RegExp("[0-9]");
        if (!reg.test(posterReputation)) {
            posterReputation = posterReputation.replace("k","") * 1000;
        }
    }

    $("#sidebar").prepend('<div><table><tr><td><p class="label-key">enchanced by</p></td><td style="padding-left: 10px; vertical-align: top;"><b><a target="_blank" href="https://github.com/MarcinOrlowski/StackUnderflow">StackUnderflow</a></b></td></tr></table></div>');

    updateQuestionAugmentation();
}

//-----------------------------------------------------

function clickToggleBlacklist(event) {
    blacklistToggle(event.data.userId);
    updateQuestionAugmentation();
}

function clickToggleFavourite(event) {
    favouriteToggle(event.data.userId);
    updateQuestionAugmentation();
}

function updateQuestionAugmentation() {

    var isPosterFavourite = isFavourite(posterId);
    var isPosterBlacklisted = isBlacklisted(posterId);

    // update banners
    var hasAcceptedAnswer = ($("#answers .answer.accepted-answer").length > 0);

    // plant banners
    if (cfg_enableOldQuestionWarning && !wbn_oldQuestionBannerSet) {
        var daysOld = Math.round((new Date().getTime() - postedDateMillis) / 86400000);
        if (daysOld > cfg_oldQuestionDayThreshold) {
            var oldAnswerBanner = '<div id="wbn_oldAnswer" class="wbn_banner wbn_tooOldBanner">Question was asked ' + jQuery.timeago(postedDateMillis) + '</div>';
            if (!hasAcceptedAnswer) {
                $(oldAnswerBanner).insertBefore("#question-header");
            }
            $(oldAnswerBanner).insertBefore("#post-editor");
        }

        wbn_oldQuestionBannerSet = true;
    }

    if (!wbn_questionHasAcceptedAnswerBannerSet) {
        if (hasAcceptedAnswer) {
            if (cfg_enableAcceptedAnswerWarning)
            {
                var hasAnswerBanner = '<div id="wbn_questionHasAcceptedAnswer" class="wbn_banner wbn_okBanner">Question has accepted answer</div>';
                $(hasAnswerBanner).insertBefore("#question-header");
                $(hasAnswerBanner).insertBefore("#post-editor");
            }
            
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
        if (cfg_enableLowReputationWarningAboveQuestion) {
            $(posterReputationLow).insertBefore("#question-header");
        }
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
    if (cfg_enableBlackAndFavouriteLists) {
        $("td.post-signature > .user-info").each(function(index){updateUserLinksRaw(index,$(this));});
    }

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
            if ($("#" + blacklistId).length) {
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
            if ($("#" + favId).length) {
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
        background: #E9FCF6 !important;
        color: black !important;
    }

    .wbn_warningBanner {
        background: #CB5555 !important;
        color: white !important;
    }

    .wbn_tooOldBanner {
        background: #FFA394 !important;
        color: black !important;
    }

    .wbn_favouriteBanner {
        background: #FFDD00 !important;
        color: black !important;
    }

    .wbn_blacklistedBanner {
        background: #333333 !important;
        color: white !important;
    }

    .wbn_acceptedAnswerHighlight {
        background: #0D694C !important;
        color: black !important;
    }

    .wbn_blacklistLink {
        background: black !important;
        color: white !important;
    }

    .wbn_favouriteLink {
        background: #FFDD00 !important;
        color: black !important;
    }

    .wbn_userActionIcon {
        width: 18px;
        height: 18px;
        border: 0;
        padding: 2px;
        vertical-align: middle;
    }

    .wbn_userProfileActionIcon {
        border: 0;
        padding: 2px;
        vertical-align: middle;
    }

    .wbn_userActionIconSmall {
        border: 0;
        padding: 0px;
        vertical-align: middle;
    }

    .wbn_banners {
        margin: 0px 0px 10px 0px;
    }

    .wbn_favouriteUserCard {
        background: #FFDD00 !important;
    }

    .wbn_blacklistedUserCard {
        background: #333333 !important;
    }

*/} ) );
}
