'use strict';

describe('ResponsiveRouter', function(){
	var ResponsiveRouter
	,	Backbone = window.Backbone;

	describe('normal mode', function () {
		beforeEach(function () {
			ResponsiveRouter = new Backbone.ResponsiveRouter();
		});

		it('set media by default', function(){
			expect(ResponsiveRouter.media).toBeTruthy();
		});

		it('have some default breakpoints', function(){
			expect(ResponsiveRouter.breakpoints).toBeTruthy();
			expect(ResponsiveRouter.breakpoints.mobile.start).toEqual(0);
			expect(ResponsiveRouter.breakpoints.mobile.end).toEqual(480);
			expect(ResponsiveRouter.breakpoints.tablet.start).toEqual(481);
			expect(ResponsiveRouter.breakpoints.tablet.end).toEqual(768);
			expect(ResponsiveRouter.breakpoints.laptop.start).toEqual(769);
			expect(ResponsiveRouter.breakpoints.laptop.end).toEqual(1170);
			expect(ResponsiveRouter.breakpoints.desktop.start).toEqual(1171);
			expect(ResponsiveRouter.breakpoints.desktop.end).toBeUndefined();
		});

		it('should be able to override breakpoints through options', function(){
			var temprouter = new Backbone.ResponsiveRouter({
				breakpoints: {
					mobile: {
						start: 1,
						end: 2
					}
				}
			});
			expect(temprouter.breakpoints.mobile.start).toEqual(1);
			expect(temprouter.breakpoints.mobile.end).toEqual(2);
			expect(temprouter.breakpoints.tablet.start).toEqual(481);
			expect(temprouter.breakpoints.tablet.end).toEqual(768);
			expect(temprouter.breakpoints.laptop.start).toEqual(769);
			expect(temprouter.breakpoints.laptop.end).toEqual(1170);
			expect(temprouter.breakpoints.desktop.start).toEqual(1171);
			expect(temprouter.breakpoints.desktop.end).toBeUndefined();
		});

		it('should create proper query string from breakpoint', function(){
			expect(ResponsiveRouter._createQueryString({start: 1, end: 2})).toEqual('(min-width: 1px) and (max-width: 2px)');
			expect(ResponsiveRouter._createQueryString({start: 1})).toEqual('(min-width: 1px)');
			expect(ResponsiveRouter._createQueryString({end: 2})).toEqual('(max-width: 2px)');
		});

		it('should match correct media', function(){
			spyOn(window, 'matchMedia').andReturn({matches: true});
			expect(ResponsiveRouter._matchMedia('mobile')).toBe(true);
			expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 0px) and (max-width: 480px)');
			window.matchMedia.reset();
		});

		it('should throw an error if you pass bad breakpoint', function(){
			var exception;
			try {
				ResponsiveRouter._matchMedia('foo');
			} catch (e) {
				exception = e;
			}
			expect(exception).toBeTruthy();
		});
	});

	xdescribe('watch mode', function () {
		it('should watch default breakpoints in watch mode', function(){
			spyOn(window, 'matchMedia').andCallFake(function(media) {
				if(media === '(min-width: 481px) and (max-width: 768px)') {
					return {
						matches: true,
						addListener: function () {}
					};
				} else if (media === '(min-width: 0px) and (max-width: 480px)') {
					return {
						matches: false,
						addListener: function () {}
					};
				} else {
					return {
						matches: false,
						addListener: function () {}
					};
				}
			});
			var temprouter = new Backbone.ResponsiveRouter();
			expect(temprouter.media).toEqual('tablet');
			expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 0px) and (max-width: 480px)');
			expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 481px) and (max-width: 768px)');
			expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 769px) and (max-width: 1170px)');
			expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1171px)');
			window.matchMedia.reset();
		});
	});

});