// Chrome Proxy helper
// popup.js
// https://raw.github.com/henices/Chrome-proxy-helper/master/javascripts/popup.js

/**
 * @fileoverview
 *
 * @author: zhouzhenster@gmail.com
 */

var proxySetting = JSON.parse(localStorage.proxySetting);
var bypasslist = proxySetting['bypasslist'];
var httpHost = proxySetting['http_host'];
var httpPort = proxySetting['http_port'];

bypasslist = bypasslist ? bypasslist.split(',') : ['<local>'];

/**
 * set help message for popup page
 *
 */
function add_li_title() {
    var _http, _socks;

    if (httpHost && httpPort) {
        _http = 'http://' + httpHost + ':' + httpPort;
        $('#http-proxy').attr('title', _http);
    }
}

/**
 * set popup page item blue color
 *
 */
function color_proxy_item() {
    var mode, rules, proxyRule;

    chrome.proxy.settings.get({'incognito': false},
      function(config) {
        mode = config['value']['mode'];
        rules = config['value']['rules'];

        proxyRule = 'singleProxy';

        if (mode == 'system') {
            $('#sys-proxy').addClass('selected');
        } else if (mode == 'direct') {
            $('#direct-proxy').addClass('selected');
        } else if (mode == 'fixed_servers') {
			$('#http-proxy').addClass('selected');
		}
    });
}

/**
 * set the icon on or off
 *
 */
function iconSet(str) {

    var icon = {
        path: 'images/on.png',
    }
    if (str == 'off') {
        icon['path'] = 'images/off.png';
    }
    chrome.browserAction.setIcon(icon);
}

function proxySelected(str) {
    var id = '#' + str;
    $('li').removeClass('selected');
    $(id).addClass('selected');
}


/**
 * set http proxy
 *
 */
function httpProxy() {

    var config = {
        mode: 'fixed_servers',
        rules: {
			singleProxy: {
			host: httpHost,
			port: parseInt(httpPort)
			},
            bypassList: bypasslist
        },
    };

    if (!httpHost) return;
						 
						 console.log(JSON.stringify(config));

    chrome.proxy.settings.set(
            {value: config, scope: 'regular'},
            function() {});

    iconSet('on');
    proxySelected('http-proxy');
}

/**
 * set direct proxy
 *
 */
function directProxy() {

    var config = {
        mode: 'direct',
    };

    chrome.proxy.settings.set(
            {value: config, scope: 'regular'},
            function() {});

    iconSet('off');
    proxySelected('direct-proxy');
}

/**
 * set system proxy
 *
 */
function sysProxy() {

    var config = {
        mode: 'system',
    };

    chrome.proxy.settings.set(
            {value: config, scope: 'regular'},
            function() {});

    iconSet('off');
    proxySelected('sys-proxy')
}



chrome.proxy.onProxyError.addListener(function(details) {
    console.log(details.error);
});


document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#http-proxy').addEventListener('click', httpProxy);
    document.querySelector('#sys-proxy').addEventListener('click', sysProxy);
    document.querySelector('#direct-proxy').addEventListener('click', directProxy);

    $('[data-i18n-content]').each(function() {
        var message = chrome.i18n.getMessage(this.getAttribute('data-i18n-content'));
        if (message)
            $(this).html(message);
    });

});

$(document).ready(function() {
    color_proxy_item();
    add_li_title();
});


