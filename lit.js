/*jshint esversion: 6 */

(function(){
	"use strict";

	function construct(
		p
	){
		// -----------
		// | Globals |
		// -----------

		/*
			User supplied setLights function for whatever the user is using
			to set the light levels. Don't fuck with this.

			Given input is always three numbers between and including 0 and 1
		*/
		var setLights = p.setLights || ((r, g, b) => {});

		// Default curve is linear 0-1 times color
		var curve = p.curve || ((x) => { return {r: x * color.r, g: x * color.g, b: x * color.b}; });

		// color if specified
		var color = p.color || {r: 0, g: 0, b: 0};

		// Loop variables
		var paused = false;
		var timePos = 0;
		var duration = p.duration || 1000;
		var fps = p.fps || 60;

		// -----------------
		// | API and Queue |
		// -----------------

		// Lit API
		const lit = {};

		// Preset property
		lit.preset = {};

		// -----------
		// | Filters |
		// -----------

		const filters = [];

		function add_filter(funk){
			filter.push(funk);
		}

		// ---------------------------
		// | Light floor and ceiling |
		// ---------------------------

		var floor = 0;
		var ceiling = 1;

		lit.floor = function(n){
			floor = n;

			return this;
		};

		lit.ceil = function(n){
			ceiling = n;

			return this;
		};

		// ----------------------------
		// | Static utility functions |
		// ----------------------------

		// Must be a six string hex
		function hex_to_rgb(hex) {
		    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

		    return result ? {
		        r: (parseInt(result[1], 16)/255).toFixed(4),
		        g: (parseInt(result[2], 16)/255).toFixed(4),
		        b: (parseInt(result[3], 16)/255).toFixed(4)
		    } : null;
		}

		// Takes input h 0-360, s 0-100, v 0-100
		function hsv_to_rgb(hp, sp, vp) {
			var h = hp/360;
			var s = sp/100;
			var v = vp/100;

		    var r, g, b, i, f, p, q, t;

		    if (arguments.length === 1) {
		        s = h.s, v = h.v, h = h.h;
		    }

		    i = Math.floor(h * 6);
		    f = h * 6 - i;
		    p = v * (1 - s);
		    q = v * (1 - f * s);
		    t = v * (1 - (1 - f) * s);

		    switch (i % 6) {
		        case 0: r = v, g = t, b = p; break;
		        case 1: r = q, g = v, b = p; break;
		        case 2: r = p, g = v, b = t; break;
		        case 3: r = p, g = q, b = v; break;
		        case 4: r = t, g = p, b = v; break;
		        case 5: r = v, g = p, b = q; break;
		    }

		    return {
		        r: r,
		        g: g,
		        b: b
		    };
		}

		// ------------------------------------
		// | Object base properties functions |
		// ------------------------------------

		lit.curve = function(funk){
			curve = funk;

			return this;
		}

		//#F0A41A
		//rgb(0,240,10)
		//hsv(360, 100, 100)
		lit.color = function(colorString){
			var HexRe = /^#(?:[0-9a-f]{3}){1,2}$/i;
			var RgbRe = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
			var HsvRe = /hsv\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;

			if (colorString.match(HexRe) !== null) {
				let parts = colorString.match(HexRe);

				color = hex_to_rgb(parts[0]);
			}
			else if(colorString.match(RgbRe) !== null) {
				let parts = colorString.match(RgbRe);

				color = {
					r: parts[1]/255,
					g: parts[2]/255,
					b: parts[3]/255
				};
			}
			else if(colorString.match(HsvRe) !== null) {
				let parts = colorString.match(HsvRe);

				color = hsv_to_rgb(parts[1], parts[2], parts[3]);
			}

			return this;
		};

		// Bad practice? Yes. User friendly? Absolutely!
		lit.white = function(){
			color = {
				r: 1,
				g: 1,
				b: 1
			};

			return this;
		};

		lit.black = function(){
			color = {
				r: 0,
				g: 0,
				b: 0
			};

			return this;
		};

		lit.duration = function(t){
			duration = t;
		
			return this;
		};

		lit.fps = function(n){
			fps = n;
		
			return this;
		};

		// --------------------
		// | Timing functions |
		// --------------------

		lit.play = function(){
			paused = false;

			return this;
		};

		lit.pause = function(){
			paused = true;

			return this;
		};

		lit.togglePlay = function(){
			paused = !paused;

			return this;
		};

		lit.mirror = function(){
			var oldCurve = curve;
			var newCurve = (x) => {
				var dx = 1-x;
				if (x > 0.5) {
					return oldCurve(dx * 2);
				} else{
					return oldCurve(x * 2);
				}
			};

			duration *= 2;
			curve = newCurve;

			return this;
		};

		lit.delay = function(t){
			// This is more complex than I first thought... check back later

			return this;
		};

		// --------------------------------------
		// | Presets 						    |
		// | I'll add more of these later	    |
		// | but you get the idea			    |
		// | Also supports user defined presets |
		// --------------------------------------

		lit.loadPresets = function(presets){
			for (preset in presets) {
				lit.preset[preset] = presets[preset];
			};

			return this;
		};

		lit.preset.rainbow = function(time){
			lit.duration(time);

			curve = function(x){
				return hsv_to_rgb(x*360, 1*100, 1*100);
			}

			return lit;
		}

		// ---------------
		// | Master loop |
		// ---------------

		// Change to setTimeout
		const loop = function(){
			setTimeout(loop, 1000/fps);

			if (paused) return;

			timePos += 1000/fps;
			timePos %= duration;

			var x = timePos/duration;

			setLights(
				curve(x).r * (ceiling - floor) + floor,
				curve(x).g * (ceiling - floor) + floor,
				curve(x).b * (ceiling - floor) + floor
			);
		}
		loop();

		return lit;
	}

	module.exports = construct;

})();
