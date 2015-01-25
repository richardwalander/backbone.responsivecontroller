(function(root, factory) {

  // Set up Backbone.Controller appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone', 'exports'], function(_, Backbone, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone.Controller = factory(root, exports, _, Backbone);
      return root.Backbone.Controller;
    });

  // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore'),
        Backbone = require('backbone');
    module.exports = factory(root, exports, _, Backbone);

  // Finally, as a browser global.
  } else {
    root.Backbone.ResponsiveController = factory(root, {}, root._, root.Backbone);
  }

}(this, function(root, exports, _, Backbone) {
  'use strict';
  //use b in some fashion.

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  // if(!$) throw 'This script need jQuery';
  if(!_) throw 'This script need Underscore';
  if(!Backbone) throw 'This script need Backbone';

  //matchMedia pollyfill
  window.matchMedia = window.matchMedia || function () {
    var bool
    , doc = window.document
    , docElem = doc.documentElement
    , refNode = docElem.firstElementChild || docElem.firstChild
    // fakeBody required for <FF4 when executed in <head>
    , fakeBody = doc.createElement( 'body' )
    , div = doc.createElement( 'div' );

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

  var bindRoutes = function(Router) {
    for (var url in this.routes) {
      // Using default Backbone.js route method.
      // Same URLs from different controllers are not allowed.
      // Last controller with same URL will be used.
      Router.route(url, url, _.bind(onRoute, this, url));
    }
  },
  onRoute = function() {
    var self = this,
        args = _.toArray(arguments),
        url = args[0],
        methodName = this.routes[url],
        params = args.slice(1),
        triggerRouteAndAfterRoute = function() {
          // Call route method with routing parameters like :id, *path etc
          if (_.isFunction(self[methodName])) {
            self[methodName].apply(self, params);
          } else {
            _(self.queries).find(function(query, name) {
              if (window.matchMedia(query).matches) {
                if (_.isFunction(self[methodName][name])) {
                  self[methodName][name].apply(self, params);
                } else {
                  if (_.isFunction(self[methodName]['default'])) self[methodName]['default'].apply(self, params);
                }
              }
            }, self);
          }

          // Call onAfterRoute after route
          if ( _.isFunction(self.onAfterRoute)) {
            self.onAfterRoute.apply(self, args);
          }
        },
        beforeRouteResult, isPromiseObj;

    // Call remove if router goes to another controller
    if (cachedController && cachedController !== this &&
      typeof cachedController.remove === 'function') {

      cachedController.remove.apply(cachedController);
    }
    cachedController = this;

    // Call onBeforeRoute before route
    if ( _.isFunction(this.onBeforeRoute) ) {
      beforeRouteResult = this.onBeforeRoute.apply(this, args);
    }

    if (beforeRouteResult === false || beforeRouteResult === null) return this;
    isPromiseObj = beforeRouteResult && beforeRouteResult.done && _.isFunction(beforeRouteResult.done);

    if (isPromiseObj) {
      beforeRouteResult.done(triggerRouteAndAfterRoute);
    } else {
      triggerRouteAndAfterRoute();
    }
  },
  queries = {
    'mobile': '(min-width: 0px) and (max-width: 480px)',
    'tablet': '(min-width: 481px) and (max-width: 768px)',
    'laptop': '(min-width: 769px) and (max-width: 1170px)',
    'desktop': '(min-width: 1171px)'
  },
  cachedRouter,
  cachedController;

  Backbone.ResponsiveController = function(options){
    this.options = options || {};
    this.queries = this.options.queries || queries;
    if (_.isFunction(this.initialize)){
      this.initialize(this.options);
    }
    if (this.options.router === true) {
      // Save/get to/from closure router instance for binding routes
      cachedRouter = cachedRouter || new Backbone.Router();
      this.options.router = cachedRouter;
    }
    if (this.options.router) {
      cachedRouter = this.options.router;
      bindRoutes.call(this, this.options.router);
    }
  };

  // Method uses cached Backbone Router and allows navigate to another route
  Backbone.ResponsiveController.prototype.navigate = function() {
    var params = _.toArray(arguments).slice(0);
    cachedRouter.navigate.apply(this, params);
  };
  
  Backbone.ResponsiveController.extend = Backbone.Router.extend;
  
  // Supporting default Backbone events like on, off, trigger, listenTo etc
  // Provides remove method which can be called on ResponsiveController removal.
  _.extend(Backbone.ResponsiveController.prototype, Backbone.Events, {
    remove: function() {
      this.stopListening();
    }
  });

  return Backbone.ResponsiveController;
}));