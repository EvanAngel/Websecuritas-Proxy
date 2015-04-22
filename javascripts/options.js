// Chrome Proxy helper
// by zhouzhenster@gmail.com
// https://raw.github.com/henices/Chrome-proxy-helper/master/javascripts/options.js


function loadProxyData() {

  $(document).ready(function() {

      var proxySetting = JSON.parse(localStorage.proxySetting);

      $('#http-host').val(proxySetting['http_host'] || "");
      $('#http-port').val(proxySetting['http_port'] || "");
      $('#bypasslist').val(proxySetting['bypasslist'] || "");
      $('#username').val(proxySetting['auth']['user'] || "");
      $('#password').val(proxySetting['auth']['pass'] || "");

	  
	loadJson();
	  
  });

}

/**
 * load json and populate select
 */
function loadJson() {

var proxySetting = JSON.parse(localStorage.proxySetting);
$('#proxySelect').empty();
var jsonResult;

$.getJSON("http://www.websecuritas.com/proxies.json", function(jsonResult) {
//get the used proxy result
	var h = '';
	for (h = 0; h < jsonResult.proxies.length; h++) {
			if(proxySetting['http_host']==jsonResult.proxies[h].address){
				$('#proxySelect').append($('<option>').text(jsonResult.proxies[h].name).attr('value', jsonResult.proxies[h].address+":"+jsonResult.proxies[h].port));
			}
			else if(h==jsonResult.proxies.length){
				$('#proxySelect').append($('<option>').text("").attr('value',""));
			}
		}

//filling select with every result
	var i = '';
	for (i = 0; i < jsonResult.proxies.length; i++) {
			$('#proxySelect').append($('<option>').text(jsonResult.proxies[i].name).attr('value', jsonResult.proxies[i].address+":"+jsonResult.proxies[i].port));
		}
	});

}



/**
 * load old proxy info
 */
function loadOldInfo() {
    var mode, url, rules, proxyRule;
    var type, host, port;
    var ret;

    chrome.proxy.settings.get({'incognito': false},
    function(config) {

        mode = config["value"]["mode"];
        rules = config['value']['rules'];
		
		$('#proxy-rule').val(proxyRule);

        if (mode == "direct" ||
            mode == "system" ) {

            return;

        } else if (mode == "fixed_servers") {

            // we are in manual mode
            type = rules[proxyRule];
            host = rules[proxyRule]['host'];
            port = rules[proxyRule]['port'];
            bypassList = rules.bypassList;

            if (type == 'http') {
                $('#http-host').val(host);
                $('#http-port').val(port);
            }

            if (bypassList)
                $('#bypasslist').val(bypassList.join(','));
        }
    });

	loadJson();
    localStorage.firstime = 1;
}

/**
 * get chrome browser proxy settings 
 * and display on the options page
 *
 */
function getProxyInfo(callback) {

    var proxyInfo;
    var proxySetting = JSON.parse(localStorage.proxySetting);
    var mode, rules, proxyRule;

    chrome.proxy.settings.get({'incognito': false},
    function(config) {
        mode = config['value']['mode'];
        rules = config['value']['rules'];

        if (mode == 'direct' ||
            mode == 'system'  ) {
            proxyInfo = mode;
        } else if (mode == 'fixed_servers')
            proxyInfo = rules[proxyRule];

        localStorage.proxyInfo = proxyInfo;
        callback(proxyInfo);
    });
}

/**
 * get uniq array
 *
 */
function uniqueArray(arr) {
    var hash = {}, result = [];
    for (var i = 0, l = arr.length; i < l; ++i) {
        if (!hash.hasOwnProperty(arr[i])) {
            hash[arr[i]] = true;
            result.push(arr[i]);
        }
    }
    return result;
}

/**
 * @brief use proxy info to set proxy
 *
 */
function reloadProxy() {

    var type, arrayString;
    var proxy = {type: '', host: '', port: ''};
    var config = {
        mode: '',
        rules: {}
    };

    var proxySetting = JSON.parse(localStorage.proxySetting);

    getProxyInfo(function(info) {

        if (info == 'direct' || info == 'system' ) 
		{
            return;
        }

         else if (typeof info === 'undefined')
		 {

            switch(info) {

            case 'http':
                proxy.type = 'http';
                proxy.host = proxySetting['http_host'];
                proxy.port = parseInt(proxySetting['http_port']);
                break;
            }
            var bypasslist = proxySetting['bypasslist'];
            config.mode = "fixed_servers";
            config.rules.bypassList = uniqueArray(bypasslist.split(','));
            config.rules.singleProxy = {
                host: proxySetting['http_host'],
                port: parseInt(proxySetting['http_port'])
            };
        }

        chrome.proxy.settings.set({
            value: config,
            scope: 'regular'}, function() {})
    });

}

/**
 * set system proxy
 *
 */
function sysProxy() {

    var config = {
        mode: "system",
    };
    var icon = {
        path: "images/off.png",
    }

    chrome.proxy.settings.set(
            {value: config, scope: 'regular'},
            function() {});

    chrome.browserAction.setIcon(icon);
}

/**
 * button id save click handler
 *
 */
function save() {

  var proxySetting = JSON.parse(localStorage.proxySetting);
  proxySetting['http_host'] = $('#proxySelect').val().split(':')[0]  || "";
  proxySetting['http_port'] = $('#proxySelect').val().split(':')[1]  || "";
  proxySetting['bypasslist'] = $('#bypasslist').val() || "";
  proxySetting['auth']['user'] = $('#username').val() || "";
  proxySetting['auth']['pass'] = $('#password').val() || "";

  if ($('#use-pass').is(':checked'))
      proxySetting['auth']['enable'] = 'y';
  else
      proxySetting['auth']['enable'] = '';



  var settings = JSON.stringify(proxySetting);
  
  localStorage.proxySetting = settings;
  reloadProxy();
  loadProxyData();

  // sync settings to google cloud
  chrome.storage.sync.set({'proxySetting' : settings}, function() {});
}



document.addEventListener('DOMContentLoaded', function () {

    $('#btn-save').click(function() {
        save();
    });

    $('#btn-cancel').click(function() {
        location.reload();
    });

    $('#diagnosis').click(function() {
        chrome.tabs.create({url: 'chrome://net-internals/#proxy'});
    });

    $('input').change(
        function() { save(); });

    $('textarea').change(
        function() { save(); });
		
	$('#proxySelect').change(
        function() { save(); });

});



if (!localStorage.firstime){
    loadOldInfo();
	}
else{
    loadProxyData();
	}

getProxyInfo(function(info) {});
