// ----------------------------------------
// | lit-rgb debugger console application |
// ----------------------------------------

const logUpdate = require('log-update');
const chalk = require('chalk');

const lit = require('./lit.js');

// LED pins
// R  G  B
// 22 23 24

const RED_PIN 	= 22;
const GREEN_PIN = 23;
const BLUE_PIN 	= 24;

const setLights = function(r, g, b){
	if (g >= 1 ){
		console.log('clipping!!!');
	}

	var rl = chalk.red(new Array(Math.ceil(r * 32)).join('=')) + new Array(Math.ceil((1 - r) * 32)).join('=');
	var gl = chalk.green(new Array(Math.ceil(g * 32)).join('=')) + new Array(Math.ceil((1 - g) * 32)).join('=');
	var bl = chalk.blue(new Array(Math.ceil(b * 32)).join('=')) + new Array(Math.ceil((1 - b) * 32)).join('=');

	logUpdate(`
	${chalk.red('R ') + rl}
	${chalk.green('G ') + gl}
	${chalk.blue('B ') + bl}
	`);
}

const lightStrip = lit({
	setLights,
	fps: 20
});

lightStrip.color('#FF0000')
	.color('hsv(100, 80, 99)')
	.preset.rainbow(6000)
	.mirror()
	.floor(.2)
	.ceil(.9)
