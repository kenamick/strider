////////////////////////////////////////////////////////////////////////////////////////////
//*--------------------------------------------------------------------------------------*//
//|   ______    ______    __    __    ______          __    ______    __        ______   |//
//|  /\  ___\  /\  __ \  /\ "-./  \  /\  ___\        /\ \  /\  __ \  /\ \      /\__  _\  |//
//|  \ \ \__ \ \ \  __ \ \ \ \-./\ \ \ \  __\       _\_\ \ \ \ \/\ \ \ \ \____ \/_/\ \/  |//
//|   \ \_____\ \ \_\ \_\ \ \_\ \ \_\ \ \_____\    /\_____\ \ \_____\ \ \_____\   \ \_\  |//
//|    \/_____/  \/_/\/_/  \/_/  \/_/  \/_____/    \/_____/  \/_____/  \/_____/    \/_/  |//
//|                                                                                      |//
//*--------------------------------------------------------------------------------------*//
////////////////////////////////////////////////////////////////////////////////////////////
//*--------------------------------------------------------------------------------------*//
//| Game Jolt API JS Library v0.4a (http://gamejolt.com)                                 |//
//*--------------------------------------------------------------------------------------*//
//| Special Thanks to:                                                                   |//
//|                                                                                      |//
//| David "CROS" DeCarmine, Bruno Assarisse, Jani "JNyknn" Nykänen,                      |//
//| Travis "Clonze" Miller, Garden Variety                                               |//
//*--------------------------------------------------------------------------------------*//
//| Copyright (c) 2014-2015 Martin Mauersics                                             |//
//|                                                                                      |//
//| This software is provided 'as-is', without any express or implied                    |//
//| warranty. In no event will the authors be held liable for any damages                |//
//| arising from the use of this software.                                               |//
//|                                                                                      |//
//| Permission is granted to anyone to use this software for any purpose,                |//
//| including commercial applications, and to alter it and redistribute it               |//
//| freely, subject to the following restrictions:                                       |//
//|                                                                                      |//
//|   1. The origin of this software must not be misrepresented; you must not            |//
//|   claim that you wrote the original software. If you use this software               |//
//|   in a product, an acknowledgment in the product documentation would be              |//
//|   appreciated but is not required.                                                   |//
//|                                                                                      |//
//|   2. Altered source versions must be plainly marked as such, and must not be         |//
//|   misrepresented as being the original software.                                     |//
//|                                                                                      |//
//|   3. This notice may not be removed or altered from any source                       |//
//|   distribution.                                                                      |//
//|                                                                                      |//
//|   4. This software may only be used within the terms of Game Jolt.                   |//
//|   (http://gamejolt.com/terms/)                                                       |//
//*--------------------------------------------------------------------------------------*//
////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
var GJAPI = {};

// TODO: add login-check + error-msg on user-data-store operations without current user ?


// ****************************************************************
// configuration attributes
GJAPI.iGameID=60063;GJAPI.sGameKey="dae58fa9ef90fa524e82b99ec2219340";GJAPI.bAutoLogin=true;
if(GJAPI.iGameID === 0 || GJAPI.sGameKey === "") alert("Game ID or Game Key missing!");

GJAPI.sAPI      = "http://gamejolt.com/api/game/v1";
GJAPI.sLogName  = "[Game Jolt API]";
GJAPI.iLogStack = 20;


// ****************************************************************
// utility functions
GJAPI.asQueryParam = function()
{
    var asOutput = {};
    var asList   = window.location.search.substring(1).split("&");

    // loop through all parameters
    for(var i = 0; i < asList.length; ++i)
    {
        // separate key from value
        var asPair = asList[i].split("=");

        // insert value into map
        if(typeof asOutput[asPair[0]] === "undefined")
            asOutput[asPair[0]] = asPair[1];                          // create new entry
        else if(typeof asOutput[asPair[0]] === "string")
            asOutput[asPair[0]] = [asOutput[asPair[0]], asPair[1]];   // extend into array
        else
            asOutput[asPair[0]].push(asPair[1]);                      // append to array
    }

    return asOutput;
}();

GJAPI.bOnGJ = window.location.hostname.match(/gamejolt/) ? true : false;

GJAPI.LogTrace = function(sMessage)
{
    // prevent flooding
    if(!(  GJAPI.iLogStack)) return;
    if(!(--GJAPI.iLogStack)) sMessage = "(╯°□°）╯︵ ┻━┻";
    
    // log message and stack trace
    console.warn(GJAPI.sLogName + " " + sMessage);
    console.trace();
};


// ****************************************************************
// main functions
GJAPI.SEND_USER    = true;
GJAPI.SEND_GENERAL = false;

GJAPI.SendRequest = function(sURL, bSendUser, pCallback)
{
    // forward call to extended function
    GJAPI.SendRequestEx(sURL, bSendUser, "json", "", pCallback);
}

GJAPI.SendRequestEx = function(sURL, bSendUser, sFormat, sBodyData, pCallback)
{
    // add main URL, game ID and format type
    sURL = GJAPI.sAPI + encodeURI(sURL)              +
           ((sURL.indexOf("/?") === -1) ? '?' : '&') +
           "game_id=" + GJAPI.iGameID                +
           "&format=" + sFormat;

    // add credentials of current user (for user-related operations)
    if(GJAPI.bActive && (bSendUser === GJAPI.SEND_USER))
    {
        sURL += "&username="   + GJAPI.sUserName +
                "&user_token=" + GJAPI.sUserToken
    }

    // generate MD5 signature
    sURL += "&signature=" + hex_md5(sURL + GJAPI.sGameKey);

    // send off the request
    __CreateAjax(sURL, sBodyData, function(sResponse)
    {
        console.info(GJAPI.sLogName + " <" + sURL + "> " + sResponse);
        if((sResponse === "") || (typeof pCallback !== "function")) return;

        switch(sFormat) 
        {
        case "json":
            pCallback(eval("(" + sResponse + ")").response);
            break;
            
        case "dump":
            var iLineBreakIndex = sResponse.indexOf("\n");
            var sResult = sResponse.substr(0, iLineBreakIndex - 1);
            var sData   = sResponse.substr(iLineBreakIndex + 1);
        
            pCallback
            ({
                success: sResult === "SUCCESS",
                data:    sData
            });
            break;
        
        default:
            pCallback(sResponse);
            break;
        }
    });
};

// automatically retrieve and log in current user on Game Jolt 
GJAPI.bActive    = (GJAPI.bAutoLogin && GJAPI.asQueryParam["gjapi_username"] && GJAPI.asQueryParam["gjapi_token"]) ? true : false;
GJAPI.sUserName  = GJAPI.bActive ? GJAPI.asQueryParam["gjapi_username"] : "";
GJAPI.sUserToken = GJAPI.bActive ? GJAPI.asQueryParam["gjapi_token"]    : "";

// send some information to the console
console.info(GJAPI.asQueryParam);
console.info(GJAPI.sLogName + (GJAPI.bOnGJ   ? " E" : " Not e") + "mbedded on Game Jolt <" + window.location.origin + window.location.pathname + ">");
console.info(GJAPI.sLogName + (GJAPI.bActive ? " U" : " No u")  + "ser recognized <"       + GJAPI.sUserName + ">");
if(!window.location.hostname) console.warn(GJAPI.sLogName + " XMLHttpRequest may not work properly on a local environment");


// ****************************************************************
// session functions
GJAPI.bSessionActive = true;

GJAPI.SessionOpen = function()
{
    if(!GJAPI.bActive) {GJAPI.LogTrace("SessionOpen() failed: no user logged in"); return;}
    
    // check for already open session
    if(GJAPI.iSessionHandle) return;

    // send open-session request
    GJAPI.SendRequest("/sessions/open/", GJAPI.SEND_USER,
    function(pResponse)
    {
        // check for success
        if(pResponse.success)
        {
            // add automatic session ping and close
            GJAPI.iSessionHandle = window.setInterval(GJAPI.SessionPing, 30000);
            window.addEventListener("beforeunload", GJAPI.SessionClose, false);
        }
    });
};

GJAPI.SessionPing = function()
{
    if(!GJAPI.bActive) {GJAPI.LogTrace("SessionPing() failed: no user logged in"); return;}

    // send ping-session request
    GJAPI.SendRequest("/sessions/ping/?status=" + (GJAPI.bSessionActive ? "active" : "idle"), GJAPI.SEND_USER);
};

GJAPI.SessionClose = function()
{
    if(!GJAPI.bActive) {GJAPI.LogTrace("SessionClose() failed: no user logged in"); return;}

    if(GJAPI.iSessionHandle)
    {
        // remove automatic session ping and close
        window.clearInterval(GJAPI.iSessionHandle);
        window.removeEventListener("beforeunload", GJAPI.SessionClose);
        
        GJAPI.iSessionHandle = 0;
    }
    
    // send close-session request
    GJAPI.SendRequest("/sessions/close/", GJAPI.SEND_USER);
};

// automatically start player session
if(GJAPI.bActive) GJAPI.SessionOpen();


// ****************************************************************
// user functions
GJAPI.UserLoginManual = function(sUserName, sUserToken, pCallback)
{
    if(GJAPI.bActive) {GJAPI.LogTrace("UserLoginManual(" + sUserName + ", " + sUserToken + ") failed: user " + GJAPI.sUserName + " already logged in"); return;}

    // send authentication request
    GJAPI.SendRequest("/users/auth/"             +
                      "?username="   + sUserName +
                      "&user_token=" + sUserToken,
                      GJAPI.SEND_GENERAL,
    function(pResponse)
    {
        // check for success
        if(pResponse.success)
        {
            // save login properties
            GJAPI.bActive    = true;
            GJAPI.sUserName  = sUserName;
            GJAPI.sUserToken = sUserToken;
            
            // open session
            GJAPI.SessionOpen();
        }
        
        // execute nested callback
        if(typeof pCallback === "function")
            pCallback(pResponse);
    },
    false);
};

GJAPI.UserLogout = function()
{
    if(!GJAPI.bActive) {GJAPI.LogTrace("UserLogout() failed: no user logged in"); return;}
    
    // close session
    GJAPI.SessionClose();
    
    // reset login properties
    GJAPI.bActive    = false;
    GJAPI.sUserName  = "";
    GJAPI.sUserToken = "";
    
    // reset trophy cache
    GJAPI.abTrophyCache = {};
};

GJAPI.UserFetchID = function(iUserID, pCallback)
{
    // send fetch-user request
    GJAPI.SendRequest("/users/?user_id=" + iUserID, GJAPI.SEND_GENERAL, pCallback);
};

GJAPI.UserFetchName = function(sUserName, pCallback)
{
    // send fetch-user request
    GJAPI.SendRequest("/users/?username=" + sUserName, GJAPI.SEND_GENERAL, pCallback);
};

GJAPI.UserFetchCurrent = function(pCallback)
{
    if(!GJAPI.bActive) {GJAPI.LogTrace("UserFetchCurrent() failed: no user logged in"); return;}

    // send fetch-user request
    GJAPI.UserFetchName(GJAPI.sUserName, pCallback);
};


// ****************************************************************
// trophy functions
GJAPI.abTrophyCache = {};

GJAPI.TROPHY_ONLY_ACHIEVED    =  1;
GJAPI.TROPHY_ONLY_NOTACHIEVED = -1;
GJAPI.TROPHY_ALL              =  0;

GJAPI.TrophyAchieve = function(iTrophyID, pCallback)
{
    if(!GJAPI.bActive) {GJAPI.LogTrace("TrophyAchieve(" + iTrophyID + ") failed: no user logged in"); return;}

    // check for already achieved trophy
    if(GJAPI.abTrophyCache[iTrophyID]) return;

    // send achieve-trophy request
    GJAPI.SendRequest("/trophies/add-achieved/?trophy_id=" + iTrophyID, GJAPI.SEND_USER,
    function(pResponse)
    {
        // check for success
        if(pResponse.success)
        {
            // save status
            GJAPI.abTrophyCache[iTrophyID] = true;
        }
        
        // execute nested callback
        if(typeof pCallback === "function") 
            pCallback(pResponse);
    });
};

GJAPI.TrophyFetch = function(iAchieved, pCallback)
{
    if(!GJAPI.bActive) {GJAPI.LogTrace("TrophyFetch(" + iAchieved + ") failed: no user logged in"); return;}

    // only trophies with the requested status
    var sTrophyData = (iAchieved === GJAPI.TROPHY_ALL) ? "" :
                      "?achieved=" + ((iAchieved >= GJAPI.TROPHY_ONLY_ACHIEVED) ? "true" : "false");

    // send fetch-trophy request
    GJAPI.SendRequest("/trophies/" + sTrophyData, GJAPI.SEND_USER, pCallback);
};

GJAPI.TrophyFetchSingle = function(iTrophyID, pCallback)
{
    if(!GJAPI.bActive) {GJAPI.LogTrace("TrophyFetchSingle(" + iTrophyID + ") failed: no user logged in"); return;}

    // send fetch-trophy request
    GJAPI.SendRequest("/trophies/?trophy_id=" + iTrophyID, GJAPI.SEND_USER, pCallback);
};


// ****************************************************************
// score functions
GJAPI.SCORE_ONLY_USER = true;
GJAPI.SCORE_ALL       = false;

GJAPI.ScoreAdd = function(iScoreTableID, iScoreValue, sScoreText, sExtraData, pCallback)
{
    if(!GJAPI.bActive) {GJAPI.LogTrace("ScoreAdd(" + iScoreTableID + ", " + iScoreValue + ", " + sScoreText + ") failed: no user logged in"); return;}

    // send add-score request
    GJAPI.ScoreAddGuest(iScoreTableID, iScoreValue, sScoreText, "", sExtraData, pCallback);
};

GJAPI.ScoreAddGuest = function(iScoreTableID, iScoreValue, sScoreText, sGuestName, sExtraData, pCallback)
{
    // use current user data or guest name
    var bIsGuest = (sGuestName && sGuestName.length) ? true : false;

    // send add-score request
    GJAPI.SendRequest("/scores/add/"                                          +
                      "?sort="  + iScoreValue                                 +
                      "&score=" + sScoreText                                  +
                      (bIsGuest      ? ("&guest="      + sGuestName)    : "") +
                      (iScoreTableID ? ("&table_id="   + iScoreTableID) : "") +
                      (sExtraData    ? ("&extra_data=" + sExtraData)    : ""),
                      (bIsGuest ? GJAPI.SEND_GENERAL : GJAPI.SEND_USER), pCallback);
};

GJAPI.ScoreFetch = function(iScoreTableID, bOnlyUser, iLimit, pCallback)
{
    if(!GJAPI.bActive && bOnlyUser) {GJAPI.LogTrace("ScoreFetch(" + iScoreTableID + ", " + bOnlyUser + ", " + iLimit + ") failed: no user logged in"); return;}

    // only scores from the current user or all scores
    var bFetchAll = (bOnlyUser === GJAPI.SCORE_ONLY_USER) ? false : true;
    
    // send fetch-score request
    GJAPI.SendRequest("/scores/"         +
                      "?limit=" + iLimit +
                      (iScoreTableID ? ("&table_id=" + iScoreTableID) : ""),
                      (bFetchAll ? GJAPI.SEND_GENERAL : GJAPI.SEND_USER), pCallback);
};


// ****************************************************************
// data store functions
GJAPI.DATA_STORE_USER   = 0;
GJAPI.DATA_STORE_GLOBAL = 1;

GJAPI.DataStoreSet = function(iStore, sKey, sData, pCallback)
{
    // send set-data request
    GJAPI.SendRequestEx("/data-store/set/?key=" + sKey, (iStore === GJAPI.DATA_STORE_USER), "json", "data=" + sData, pCallback);
};

GJAPI.DataStoreFetch = function(iStore, sKey, pCallback)
{
    // send fetch-data request
    GJAPI.SendRequestEx("/data-store/?key=" + sKey, (iStore === GJAPI.DATA_STORE_USER), "dump", "", pCallback);
};

GJAPI.DataStoreUpdate = function(iStore, sKey, sOperation, sValue, pCallback)
{
    // send update-data request
    GJAPI.SendRequest("/data-store/update/"      +
                      "?key="       + sKey       +
                      "&operation=" + sOperation +
                      "&value="     + sValue, 
                      (iStore === GJAPI.DATA_STORE_USER), pCallback);
};

GJAPI.DataStoreRemove = function(iStore, sKey, pCallback)
{
    // send remove-data request
    GJAPI.SendRequest("/data-store/remove/?key=" + sKey, (iStore === GJAPI.DATA_STORE_USER), pCallback);
};

GJAPI.DataStoreGetKeys = function(iStore, pCallback)
{
    // send get-keys request
    GJAPI.SendRequest("/data-store/get-keys/", (iStore === GJAPI.DATA_STORE_USER), pCallback);
};

// ****************************************************************
// create asynchronous request
function __CreateAjax(sUrl, sBodyData, pCallback)
{
    if(typeof sBodyData !== "string") sBodyData = "";
    
    if(window.XMLHttpRequest)
    {
        var pRequest = new XMLHttpRequest();

        // bind callback function
        pRequest.onreadystatechange = function()
        {
            if(pRequest.readyState === 4)
                pCallback(pRequest.responseText);
        };

        // send off the request
        if(sBodyData !== "")
        {
            pRequest.open("POST", sUrl);
            pRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            pRequest.send(sBodyData);
        }
        else
        {
            pRequest.open("GET", sUrl);
            pRequest.send();
        }
    }
    else console.error(GJAPI.sLogName + " XMLHttpRequest not supported");
}


/*
* A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
* Digest Algorithm, as defined in RFC 1321.
* Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
* Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
* Distributed under the BSD License
* See http://pajhome.org.uk/crypt/md5 for more info.
*/
var hexcase=0;function hex_md5(a){return rstr2hex(rstr_md5(str2rstr_utf8(a)))}function hex_hmac_md5(a,b){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a),str2rstr_utf8(b)))}function md5_vm_test(){return hex_md5("abc").toLowerCase()=="900150983cd24fb0d6963f7d28e17f72"}function rstr_md5(a){return binl2rstr(binl_md5(rstr2binl(a),a.length*8))}function rstr_hmac_md5(c,f){var e=rstr2binl(c);if(e.length>16){e=binl_md5(e,c.length*8)}var a=Array(16),d=Array(16);for(var b=0;b<16;b++){a[b]=e[b]^909522486;d[b]=e[b]^1549556828}var g=binl_md5(a.concat(rstr2binl(f)),512+f.length*8);return binl2rstr(binl_md5(d.concat(g),512+128))}function rstr2hex(c){try{hexcase}catch(g){hexcase=0}var f=hexcase?"0123456789ABCDEF":"0123456789abcdef";var b="";var a;for(var d=0;d<c.length;d++){a=c.charCodeAt(d);b+=f.charAt((a>>>4)&15)+f.charAt(a&15)}return b}function str2rstr_utf8(c){var b="";var d=-1;var a,e;while(++d<c.length){a=c.charCodeAt(d);e=d+1<c.length?c.charCodeAt(d+1):0;if(55296<=a&&a<=56319&&56320<=e&&e<=57343){a=65536+((a&1023)<<10)+(e&1023);d++}if(a<=127){b+=String.fromCharCode(a)}else{if(a<=2047){b+=String.fromCharCode(192|((a>>>6)&31),128|(a&63))}else{if(a<=65535){b+=String.fromCharCode(224|((a>>>12)&15),128|((a>>>6)&63),128|(a&63))}else{if(a<=2097151){b+=String.fromCharCode(240|((a>>>18)&7),128|((a>>>12)&63),128|((a>>>6)&63),128|(a&63))}}}}}return b}function rstr2binl(b){var a=Array(b.length>>2);for(var c=0;c<a.length;c++){a[c]=0}for(var c=0;c<b.length*8;c+=8){a[c>>5]|=(b.charCodeAt(c/8)&255)<<(c%32)}return a}function binl2rstr(b){var a="";for(var c=0;c<b.length*32;c+=8){a+=String.fromCharCode((b[c>>5]>>>(c%32))&255)}return a}function binl_md5(p,k){p[k>>5]|=128<<((k)%32);p[(((k+64)>>>9)<<4)+14]=k;var o=1732584193;var n=-271733879;var m=-1732584194;var l=271733878;for(var g=0;g<p.length;g+=16){var j=o;var h=n;var f=m;var e=l;o=md5_ff(o,n,m,l,p[g+0],7,-680876936);l=md5_ff(l,o,n,m,p[g+1],12,-389564586);m=md5_ff(m,l,o,n,p[g+2],17,606105819);n=md5_ff(n,m,l,o,p[g+3],22,-1044525330);o=md5_ff(o,n,m,l,p[g+4],7,-176418897);l=md5_ff(l,o,n,m,p[g+5],12,1200080426);m=md5_ff(m,l,o,n,p[g+6],17,-1473231341);n=md5_ff(n,m,l,o,p[g+7],22,-45705983);o=md5_ff(o,n,m,l,p[g+8],7,1770035416);l=md5_ff(l,o,n,m,p[g+9],12,-1958414417);m=md5_ff(m,l,o,n,p[g+10],17,-42063);n=md5_ff(n,m,l,o,p[g+11],22,-1990404162);o=md5_ff(o,n,m,l,p[g+12],7,1804603682);l=md5_ff(l,o,n,m,p[g+13],12,-40341101);m=md5_ff(m,l,o,n,p[g+14],17,-1502002290);n=md5_ff(n,m,l,o,p[g+15],22,1236535329);o=md5_gg(o,n,m,l,p[g+1],5,-165796510);l=md5_gg(l,o,n,m,p[g+6],9,-1069501632);m=md5_gg(m,l,o,n,p[g+11],14,643717713);n=md5_gg(n,m,l,o,p[g+0],20,-373897302);o=md5_gg(o,n,m,l,p[g+5],5,-701558691);l=md5_gg(l,o,n,m,p[g+10],9,38016083);m=md5_gg(m,l,o,n,p[g+15],14,-660478335);n=md5_gg(n,m,l,o,p[g+4],20,-405537848);o=md5_gg(o,n,m,l,p[g+9],5,568446438);l=md5_gg(l,o,n,m,p[g+14],9,-1019803690);m=md5_gg(m,l,o,n,p[g+3],14,-187363961);n=md5_gg(n,m,l,o,p[g+8],20,1163531501);o=md5_gg(o,n,m,l,p[g+13],5,-1444681467);l=md5_gg(l,o,n,m,p[g+2],9,-51403784);m=md5_gg(m,l,o,n,p[g+7],14,1735328473);n=md5_gg(n,m,l,o,p[g+12],20,-1926607734);o=md5_hh(o,n,m,l,p[g+5],4,-378558);l=md5_hh(l,o,n,m,p[g+8],11,-2022574463);m=md5_hh(m,l,o,n,p[g+11],16,1839030562);n=md5_hh(n,m,l,o,p[g+14],23,-35309556);o=md5_hh(o,n,m,l,p[g+1],4,-1530992060);l=md5_hh(l,o,n,m,p[g+4],11,1272893353);m=md5_hh(m,l,o,n,p[g+7],16,-155497632);n=md5_hh(n,m,l,o,p[g+10],23,-1094730640);o=md5_hh(o,n,m,l,p[g+13],4,681279174);l=md5_hh(l,o,n,m,p[g+0],11,-358537222);m=md5_hh(m,l,o,n,p[g+3],16,-722521979);n=md5_hh(n,m,l,o,p[g+6],23,76029189);o=md5_hh(o,n,m,l,p[g+9],4,-640364487);l=md5_hh(l,o,n,m,p[g+12],11,-421815835);m=md5_hh(m,l,o,n,p[g+15],16,530742520);n=md5_hh(n,m,l,o,p[g+2],23,-995338651);o=md5_ii(o,n,m,l,p[g+0],6,-198630844);l=md5_ii(l,o,n,m,p[g+7],10,1126891415);m=md5_ii(m,l,o,n,p[g+14],15,-1416354905);n=md5_ii(n,m,l,o,p[g+5],21,-57434055);o=md5_ii(o,n,m,l,p[g+12],6,1700485571);l=md5_ii(l,o,n,m,p[g+3],10,-1894986606);m=md5_ii(m,l,o,n,p[g+10],15,-1051523);n=md5_ii(n,m,l,o,p[g+1],21,-2054922799);o=md5_ii(o,n,m,l,p[g+8],6,1873313359);l=md5_ii(l,o,n,m,p[g+15],10,-30611744);m=md5_ii(m,l,o,n,p[g+6],15,-1560198380);n=md5_ii(n,m,l,o,p[g+13],21,1309151649);o=md5_ii(o,n,m,l,p[g+4],6,-145523070);l=md5_ii(l,o,n,m,p[g+11],10,-1120210379);m=md5_ii(m,l,o,n,p[g+2],15,718787259);n=md5_ii(n,m,l,o,p[g+9],21,-343485551);o=safe_add(o,j);n=safe_add(n,h);m=safe_add(m,f);l=safe_add(l,e)}return Array(o,n,m,l)}function md5_cmn(h,e,d,c,g,f){return safe_add(bit_rol(safe_add(safe_add(e,h),safe_add(c,f)),g),d)}function md5_ff(g,f,k,j,e,i,h){return md5_cmn((f&k)|((~f)&j),g,f,e,i,h)}function md5_gg(g,f,k,j,e,i,h){return md5_cmn((f&j)|(k&(~j)),g,f,e,i,h)}function md5_hh(g,f,k,j,e,i,h){return md5_cmn(f^k^j,g,f,e,i,h)}function md5_ii(g,f,k,j,e,i,h){return md5_cmn(k^(f|(~j)),g,f,e,i,h)}function safe_add(a,d){var c=(a&65535)+(d&65535);var b=(a>>16)+(d>>16)+(c>>16);return(b<<16)|(c&65535)}function bit_rol(a,b){return(a<<b)|(a>>>(32-b))};
