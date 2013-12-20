Backbone.ResponsiveRouter
=========================

Maintaind by [Richard Wålander](http://www.richardwalander.com)

Extends the normal [Backbone.js](http://backbonejs.org) Router to include some responsive features to execute different logic based on route and viewport size.

Depends on [Underscore](http://underscorejs.org), [Backbone](http://backbonejs.org), and [jQuery](http://jquery.com). You can swap out the dependencies with a custom configuration.

Background
==========
Today responsive design is considered best practice when you build a webpage and achieved through using CSS3 @media-queries. Using these technologies allow you to scale and adjust your content based on your users viewport size. Sometimes you might even hide or show parts of your page based on if it's a small or big screen. I think this is fine if you build a fairly static page that just display some content. But what about when you develop a web-based application that need to adjust to screen size.

For applications I don't think just scaling, hiding or showing the same view/page is not enough. Especially if it mean rendering a lot of different views that the user won't even see. We all want to have good performance in our applications. If you have to render 2-3 different views so that you can hide/show them with CSS depending on viewport size, that would be quite bad from a performance perspective.

So what options do you have if you want the experience to be different on different viewport sizes? There are various methods of finding out viewport size or what type of device the user is using and then you could serve different views depending on device or screen size. I will not list all here just use Google! ;-) But that is breaking the philosophy of responsive design.

The problem with a non-responsive-desing solution is that you often end up with many different projects/code-bases for different devices and in the end maintenance hell! Another problem is that some of the views work 100% for all sizes and then you don't want to re-implement that in all your versions of your web app.

The solution
============

So how can we still use the power of media queries but now for our JavaScript code? To solve this issue especially for `Backbone.js` applications I extended the normal `Backbone.Router` with some responsive features for your to use in your routes to handle different media query break points. With this you can write custom logic or even render completely different views based on viewport size.

How does it work?
=================
The `ResponsiveRouter` uses `window.matchMedia` to match any breakpoints you define for your application. In this way you can use the same breakpoints for responsive CSS3 functionality as well as responsive JavaScript functionality. `window.matchMedia` has fairly good browser support (Chrome since m10, Firefox since 6, and Safari since 5.1, IE10), but the `ResponsiveRouter` includes [polyfills](https://github.com/paulirish/matchMedia.js/) for legacy browsers and IE6-9.

When you create a new instance of the `ResponsiveRouter` it will come with some pre-defined breakpoints and it will automatically see witch one is matched. Because I use [Twitter Bootstrap](http://getbootstrap.com) a lot in my applications the default breakpoints try to follow their grid system breakpoints. These are the default breakpoints:

 ```javascript
breakpoints: {
	'mobile': { //(min-width: 0px) and (max-width: 480px)
		'start': 0,
		'end': 480
	},
	'tablet': { //(min-width: 481px) and (max-width: 768px)
		'start': 481,
		'end': 768
	},
	'laptop': { //(min-width: 769px) and (max-width: 1170px)
		'start': 769,
		'end': 1170
	},
	'desktop': { //(min-width: 1171px)
	'start': 1171
	}
},
 ```
### Installation
If you wish to just get ResponsiveRouter in your project, you need at the minimum Backbone, Underscore, and jQuery. Your HTML should look something like this:

```html
<!-- Dependencies. -->
<script src="jquery.js"></script>
<script src="underscore.js"></script>
<script src="backbone.js"></script>

<!-- LayoutManager. -->
<script src="backbone.layoutmanager.js"></script>
```
If you want to use a dependency manager like RequireJS.

Make sure your configuration looks very similar to this:

```javascript
require.config({
  // Ensure that RequireJS knows the paths to your dependencies.
  paths: {
    jquery: "/path/to/jquery",
    backbone: "/path/to/backbone",
    underscore: "/path/to/underscore",
    responsiverouter: "/path/to/backbone.responsiverouter"
  },

  // Help RequireJS load Backbone with shim.
  shim: {
    backbone: {
      deps: ["jquery", "underscore"],
      exports: "Backbone"
    }
  }
});
```

Then you can require it and use it.

```javascript
define(function (require) {
	var ResponsiveRouter = require('responsiverouter');
	
	var Router = ResponsiveRouter.extend({
		...
	});
	
	return Router;
});
```

### Basic usage
```javascript
var Router = Backbone.ResponsiveRouter.extend({
...
	breakpoints: {
		'mobile': { //(min-width: 0px) and (max-width: 480px)
			'start': 0,
			'end': 480
		},
		'tablet': { //(min-width: 481px) and (max-width: 768px)
			'start': 481,
			'end': 768
		},
		'laptop': { //(min-width: 769px) and (max-width: 1170px)
			'start': 769,
			'end': 1170
		},
		'desktop': { //(min-width: 1171px)
		'start': 1171
		}
	},

	routes: {
		"":                 "index",
		"search/:query":        "search",
	},
	
	index: function () {
		if(this.media == 'mobile') {
			new MobileView();
		} else {
			new NormalView();
		}
	},
...
});

var router = new Router();

Backbone.history.start();
```

### Advanced usage
Read [the documentation here](https://github.com/ricwa230/backbone.responsiverouter/wiki)

### Issues and bugs
If you find some issue or think some functionality is missing please let me know by [creating and issue here](https://github.com/ricwa230/backbone.responsiverouter/issues). To help me as much as possible it would be nice if you could create a basic simplified [jsFiddle](http://jsfiddle.net) that illustrates the issue and attach that in the issue description.