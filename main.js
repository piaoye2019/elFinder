"use strict";
(function(){
	var i18nFolderMsgs = {},
		rootPath = './demo',
		// jQuery and jQueryUI version
		jqver = '3.2.1',
		uiver = '1.12.1',
		// Detect language (optional)
		lang = (function() {
			var locq = window.location.search,
				fullLang, locm, lang;
			if (locq && (locm = locq.match(/lang=([a-zA-Z_-]+)/))) {
				// detection by url query (?lang=xx)
				fullLang = locm[1];
			} else {
				// detection by browser language
				fullLang = (navigator.browserLanguage || navigator.language || navigator.userLanguage);
			}
			lang = fullLang.substr(0,2);
			if (lang === 'ja') lang = 'jp';
			else if (lang === 'pt') lang = 'pt_BR';
			else if (lang === 'ug') lang = 'ug_CN';
			else if (lang === 'zh') lang = (fullLang.substr(0,5).toLowerCase() === 'zh-tw')? 'zh_TW' : 'zh_CN';
			return lang;
		})(),
		
		// elFinder options (REQUIRED)
		// Documentation for client options:
		// https://github.com/Studio-42/elFinder/wiki/Client-configuration-options
		opts = {
			url : '//hypweb.net/elFinder-nightly/demo/2.1/php/connector.minimal.php',
			soundPath: './demo/sounds',
			sync: 5000,
			ui	: ['toolbar', 'places', 'tree', 'path', 'stat'],
			commandsOptions : {
				edit : {
					extraOptions : {
						creativeCloudApiKey : '6e62687b643a413cbb6aedf72ced95e3',
						managerUrl : 'manager.html'
					}
				},
				quicklook : {
					googleDocsMimes : ['application/pdf', 'image/tiff', 'application/vnd.ms-office', 'application/msword', 'application/vnd.ms-word', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
				}
			},
			lang: lang
		},
		
		// Start elFinder (REQUIRED)
		start = function(elFinder, editors, i18nfmsg, extOpts) {
			// load jQueryUI CSS
			elFinder.prototype.loadCss('//cdnjs.cloudflare.com/ajax/libs/jqueryui/'+uiver+'/themes/smoothness/jquery-ui.css');
			
			$(function() {
				// Optional for Japanese decoder "extras/encoding-japanese.min"
				if (window.Encoding && Encoding.convert) {
					elFinder.prototype._options.rawStringDecoder = function(s) {
						return Encoding.convert(s,{to:'UNICODE',type:'string'});
					};
				}
				
				// editors marges to opts.commandOptions.edit
				opts.commandsOptions.edit.editors = (opts.commandsOptions.edit.editors || []).concat(editors);
				
				Object.assign(opts, extOpts);
				
				i18nFolderMsgs = i18nfmsg;
				
				// Make elFinder (REQUIRED)
				$('#elfinder').elfinder(opts, function(fm, extraObj) {
					// `init` event callback function
					fm.bind('init', function() {
						$.extend(fm.messages, i18nFolderMsgs.en, i18nFolderMsgs[fm.lang] || {});
						// Optional for Japanese decoder "extras/encoding-japanese.min"
						delete fm.options.rawStringDecoder;
						if (fm.lang === 'jp') {
							require(
								[ 'extras/encoding-japanese.min' ],
								function(Encoding) {
									if (Encoding.convert) {
										fm.options.rawStringDecoder = function(s) {
											return Encoding.convert(s,{to:'UNICODE',type:'string'});
										};
									}
								}
							);
						}
						fm.getUI().css('background-image', 'none');
					});
					// for example set document.title dynamically.
					var title = document.title;
					fm.bind('open', function() {
						var path = '',
							cwd  = fm.cwd();
						if (cwd) {
							path = fm.path(cwd.hash) || null;
						}
						document.title = path? path + ':' + title : title;
					}).bind('destroy', function() {
						document.title = title;
					});
				});
			});
		},
		
		// JavaScript loader (REQUIRED)
		load = function() {
			require(
				[
					'elfinder'
					, 'extras/editors.default'
					, 'i18nfmsg'
					, 'extOpts'
					, 'extras/quicklook.googledocs'                    // optional GoogleDocs preview
					, 'elfinderBasicAuth'
					, xdr
				],
				start,
				function(error) {
					alert(error.message);
				}
			);
		},
		
		// is IE8? for determine the jQuery version to use (optional)
		ie8 = (typeof window.addEventListener === 'undefined' && typeof document.getElementsByClassName === 'undefined'),
		xhr, xdr = null;

	// load jquery.xdr.js for old IE
	if (typeof document.uniqueID != 'undefined') {
		var xhr = new XMLHttpRequest();
		if (!('withCredentials' in xhr)) {
			xdr = 'jquery.xdr';
		}
		xhr = null;
	}

	// config of RequireJS (REQUIRED)
	require.config({
		baseUrl : rootPath+'/js',
		paths : {
			'jquery'   : '//cdnjs.cloudflare.com/ajax/libs/jquery/'+(ie8? '1.12.4' : jqver)+'/jquery.min',
			'jquery-ui': '//cdnjs.cloudflare.com/ajax/libs/jqueryui/'+uiver+'/jquery-ui.min',
			'elfinder' : 'elfinder.min',
			'i18nfmsg' : '../../i18nFolderMsgs',
			'jquery.xdr': '../xdr/jquery.xdr'
		},
		shim : {
			'jquery.xdr': {
				deps: ['jquery']
			}
		},
		waitSeconds : 10 // optional
	});

	// load JavaScripts (REQUIRED)
	load();

})();