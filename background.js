

function setProxyIcon() {

    var icon = {
        path: "images/off.png",
    }

    chrome.proxy.settings.get(
                {'incognito': false},
        function(config) {
            if (config["value"]["mode"] == "system") {
                chrome.browserAction.setIcon(icon);
            } else if (config["value"]["mode"] == "direct") {
                chrome.browserAction.setIcon(icon);
            } else {
                icon["path"] = "images/on.png";
                chrome.browserAction.setIcon(icon);
            }
        }
    );
}

function gotoPage(url) {

    var fulurl = chrome.extension.getURL(url);
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
        for (var i in tabs) {
            tab = tabs[i];
            if (tab.url == fulurl) {
                chrome.tabs.update(tab.id, { selected: true });
                return;
            }
        }
        chrome.tabs.getSelected(null, function(tab) {
                    chrome.tabs.create({url: url,index: tab.index + 1});
        });
    });
}

function callbackFn(details) {
    var proxySetting = JSON.parse(localStorage.proxySetting);

    if (proxySetting){
        var auth = proxySetting['auth'];
        var username = auth['user'];
        var password = auth['pass'];
    }

    if (proxySetting['auth']['user'] == '' && 
        proxySetting['auth']['pass'] == '')
        return {};

    return details.isProxy === !0 ? {
        authCredentials: {
            username: username,
            password: password
        }
    } : {}
}

chrome.webRequest.onAuthRequired.addListener(
            callbackFn,
            {urls: ["<all_urls>"]},
            ['blocking'] );

var proxySetting = {
    'http_host'  : '',
    'http_port'  : '',
    'bypasslist' : '<local>,192.168.0.0/16,172.16.0.0/12,169.254.0.0/16,10.0.0.0/8',
    'auth'       : {'enable': '', 'user': '', 'pass': ''}
}

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install") {
        localStorage.proxySetting = JSON.stringify(proxySetting);
        gotoPage('options.html');
    }
    else if(details.reason == "update"){
        gotoPage('CHANGELOG');
    }
});


chrome.commands.onCommand.addListener(function(command) {
  if (command == 'open-option')
      gotoPage('options.html');
});

// sync extension settings from google cloud
chrome.storage.sync.get('proxySetting', function(val) {
    if (typeof val.proxySetting !== "undefined")
        localStorage.proxySetting = val.proxySetting;
});

setProxyIcon();


