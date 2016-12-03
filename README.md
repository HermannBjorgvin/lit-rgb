
![Lit](lit.png "Lit")

## What is Lit?
Lit is a node RGB light animation library

## What is lit not?
Lit is not a PWM module that controls LED lights, you must provide that functionality
yourself and pass a function that sets the LED lights to the library.

Lit only handles animations.

## Shit that's left
Finish writing the default functions and filter array for the library.
Refactor the presets from the old library to the new one.
Refine and shit for release.

## Example code...

```Javascript
const lit = require('./lit.js');

/*
  For the library to work you must provide a 'set lights' function.
  This function gets passed r, g, and b values between 0 and 1, you
  must then have your own PWM module or what have you to set the actual
  lights on your thing.
  
  TL:DR; Lit handles animation and you then set the lights with this function 60 times a second
*/
const setLights = function(r, g, b){
	// You custom code here
}

// You initialize a new lightStrip for example with the setLights function that you pass to the library
const lightStrip = lit({
	setLights,
	fps: 30
});

// After that you can use the library with all the built in functionality
lightStrip.color('#FF0000').color('hsv(100, 80, 99)').duration(800).mirror().fps(20);

```
