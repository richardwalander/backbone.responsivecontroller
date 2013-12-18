(function (root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery', 'underscore', 'backbone'], factory);
	} else {
		// Browser globals
		root.amdWeb = factory(root.$, root._, root.Backbone);
	}
}(this, function ($, _, Backbone) {
	'use strict';
	//use b in some fashion.

	// Just return a value to define the module export.
	// This example returns an object, but the module
	// can return a function as the exported value.
	if(!$) throw 'This script need jQuery';
	if(!_) throw 'This script need Underscore';
	if(!Backbone) throw 'This script need Backbone';

	//matchMedia pollyfill
	window.matchMedia = window.matchMedia || function () {
		var bool
		,	doc = window.document
		,	docElem = doc.documentElement
		,	refNode = docElem.firstElementChild || docElem.firstChild
		// fakeBody required for <FF4 when executed in <head>
		,	fakeBody = doc.createElement( 'body' )
		,	div = doc.createElement( 'div' );

		div.id = 'mq-test-1';
		div.style.cssText = 'position:absolute;top:-100em';
		fakeBody.style.background = 'none';
		fakeBody.appendChild(div);

		return function(q){

			div.innerHTML = '&shy;<style media=\"' + q + '\"> #mq-test-1 { width: 42px; }</style>';

			docElem.insertBefore( fakeBody, refNode );
			bool = div.offsetWidth === 42;
			docElem.removeChild( fakeBody );

			return {
				matches: bool,
				media: q
			};

		};
	};

	// monkeypatch unsupported addListener/removeListener with polling
	if( !window.matchMedia( '' ).addListener ){
		var oldMM = window.matchMedia;

		window.matchMedia = function( q ){
			var ret = oldMM( q ),
				listeners = [],
				last = false,
				timer,
				check = function(){
					var list = oldMM( q ),
						unmatchToMatch = list.matches && !last,
						matchToUnmatch = !list.matches && last;
                                                
                                        //fire callbacks only if transitioning to or from matched state
					if( unmatchToMatch || matchToUnmatch ){
						for( var i =0, il = listeners.length; i< il; i++ ){
							listeners[ i ].call( ret, list );
						}
					}
					last = list.matches;
				};

			ret.addListener = function( cb ){
				listeners.push( cb );
				if( !timer ){
					timer = setInterval( check, 1000 );
				}
			};

			ret.removeListener = function( cb ){
				for( var i =0, il = listeners.length; i< il; i++ ){
					if( listeners[ i ] === cb ){
						listeners.splice( i, 1 );
					}
				}
				if( !listeners.length && timer ){
					clearInterval( timer );
				}
			};

			return ret;
		};
	}

	// var ResponsiveRouter = Backbone.Router.extend({});

	var ResponsiveRouter = function (options) {
		options = options || {};
		// options || (options = {});
		if (options.routes) this.routes = options.routes;
		if (options.breakpoints) _.extend(this.breakpoints, options.breakpoints);
		if (options.watch) this._watchBreakPoints();
		this._bindRoutes();
		this.media = this.getMatchedMedia();
		this.initialize.apply(this, arguments);
	};

	// Making it possible to extend the ResponsiveRouter further
	_.extend(ResponsiveRouter, Backbone.Router);

	// Extending the prototype with custom responsive features
	_.extend(ResponsiveRouter.prototype, Backbone.Router.prototype, {
		
		breakpoints: {
			'mobile': {
				'start': 0,
				'end': 480
			},
			'tablet': {
				'start': 481,
				'end': 768
			},
			'laptop': {
				'start': 769,
				'end': 1170
			},
			'desktop': {
				'start': 1171
			}
		},

		_createQueryString: function (point) {
			if(_.isUndefined(point.start)) {
				return '(max-width: '+point.end+'px)';
			} else if (_.isUndefined(point.end)) {
				return '(min-width: '+point.start+'px)';
			} else {
				return '(min-width: '+point.start+'px) and (max-width: '+point.end+'px)';
			}
		},

		_matchMedia: function (bp) {
			if(_.isUndefined(this.breakpoints)) throw 'You need to set some breakpoints!';
			var breakpoint = this.breakpoints[bp];
			if(_.isUndefined(breakpoint) || (_.isUndefined(breakpoint.start) && _.isUndefined(breakpoint.end))) throw 'You do not have a breakpoint called '+bp+' with proper start and end';
			if(window.matchMedia(this._createQueryString(breakpoint)).matches) return true;
			return false;
		},

		_watchBreakPoints: function () {
			_.each(this.breakpoints, function (point, name) {
				var _self = this;
				window.matchMedia(this._createQueryString(point)).addListener(function (e) {
					if(e.matches) {
						_self.media = name;
						var fragment = Backbone.history.fragment;
						Backbone.history.loadUrl(fragment);
					}
				});
			}, this);
		},

		getMatchedMedia: function () {
			var ret;
			_.each(this.breakpoints, function (val, key) {
				if(this._matchMedia(key)) ret = key;
			}, this);
			return ret || false;
		},

		isMedia: function (media) {
			return this._matchMedia(media);
		},

		isMobile: function () {
			return this._matchMedia('mobile');
		},
		
		isTablet: function () {
			return this._matchMedia('tablet');
		},
		
		isLaptop: function () {
			return this._matchMedia('laptop');
		},
		
		isDesktop: function () {
			return this._matchMedia('desktop');
		}

	});

	Backbone.ResponsiveRouter = ResponsiveRouter;

	return ResponsiveRouter;
}));