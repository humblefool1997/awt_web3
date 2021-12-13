let c = document.getElementById("ft");
let ctx = c.getContext("2d");

let waveDimensionWidth = 1000;
let waveDimensionHeight = 100;

let decomposedStripsMax = 7;

c.height = (decomposedStripsMax + 2) * waveDimensionHeight;
c.width = waveDimensionWidth;

let count = 0;
let angleCount = 270;

let totalSine = 0;
const TO_RADIANS = 1 / 180 * Math.PI;


//Combine a bunch of sines together to create a complicated waveform.
//Try adding different numbers of sine waves to see how the Fourier analysis changes...
function makeComplexSine(samples, sampleLength){
	for(let x = 0; x < sampleLength; x++) {
		totalSine  = Math.sin((x * (3+count)) * TO_RADIANS);    // Frequency change of a high frequency wave.
		totalSine += Math.sin((x + (count * 50)) * TO_RADIANS); // Phase change of a low frequency wave.
		
		//totalSine  = Math.sin((x * count) * TO_RADIANS);
		//totalSine += Math.sin(((x + count) * (count / 2)) * TO_RADIANS);
		//totalSine += Math.sin((x * (count / 3)) * TO_RADIANS);
		samples[x] = totalSine;
	}
}

//Draw the complicated and scaled sinewave in the top box.
function drawSine(samples, ctx) {
  let scH = waveDimensionHeight / 2;
  let sampleLength = samples.length;
  ctx.strokeStyle = "#ff0000";
  let normaliseScale = Math.max(Math.abs(Math.min(...samples)), Math.max(...samples));
  normaliseScale *= 1.3;
  let y = scH + (scH * ((samples[0] / normaliseScale)));
  ctx.beginPath();
  ctx.moveTo(0, y);
  for(let x = 1; x < sampleLength; x++) {	
    y = scH + (scH * ((samples[x] / normaliseScale)));
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

//Calculate the fourier array of real and imag numbers.
//Push calculated magnitude and phases into their own array (for multiple uses later).
function createFourier(samples, fourierOutput, magnitudes, phases) {
	let sampleLength = samples.length;
	let bSi = 0.9 / sampleLength;
	for(let k = 0; k < 325; k++ ) {
		let real = 0;
		let imag = 0;
		for(let n = 0; n < 1000; n++ ) {
			real += samples[n] * Math.cos(-2 * Math.PI * k * n / sampleLength);
			imag += samples[n] * Math.sin(-2 * Math.PI * k * n / sampleLength);
		}
		fourierOutput.push( [ real, imag ] );
		magnitudes.push(bSi * Math.sqrt( (real * real) + (imag * imag)));
		phases.push(90 + Math.atan2(imag, real));
	}
}

//Draw the Fourier transformed result as a bar graph in the top box.
function drawFourier(magnitudes, ctx) {
	let sampleLength = magnitudes.length;
	ctx.strokeStyle = "#004000";
	ctx.fillStyle = "#004000";
	for(let v = 0; v < sampleLength; v++)
		ctx.fillRect(v*3, waveDimensionHeight, 2, -(magnitudes[v] * waveDimensionHeight));
}

//Draw the frame, and background colors for everything to be drawn in.
function readyDisplayLayout(usedDeconstructedBars, ctx) {
	ctx.strokeStyle = "#000000";
	for(let stripes = 1; stripes < waveDimensionHeight; stripes++){
		let y = waveDimensionHeight * stripes + 0.5;
		if(stripes==1){
			ctx.fillStyle = "#f0fff0";
		}else if(stripes==2){
			ctx.fillStyle = "#fff0f0";
		}else if(stripes > 2 && stripes < usedDeconstructedBars + 3){
			ctx.fillStyle = "#f0f0ff";
		}else{
      ctx.fillStyle = "#c0c0cc";
    }
		ctx.fillRect(0, y - waveDimensionHeight, ctx.canvas.width, y);
		ctx.beginPath();	
		ctx.moveTo(0, y );
		ctx.lineTo(waveDimensionWidth, y );
		ctx.stroke();
	}
}

//Look through the magnitudes, and skim the highest ones to be stored together with
//their phase, and frequency.
function getDecomposedSines(magnitudes, deconstructedSines) {
	let len = magnitudes.length;
	for(let v = 0; v < len; v++) {
		if(magnitudes[v] >= 0.287) {
			deconstructedSines.push({magnitude: magnitudes[v], frequency: v, phase: phases[v]});
		}
	}
}

//In box 3 onwards (whatever we have space for) - draw the simple sign waves we skimmed off earlier.
function drawDeconstructedSines(deconstructedSines, ctx) {
  ctx.strokeStyle = "#ff0000";
  let breakdownCount = deconstructedSines.length;
  if(breakdownCount > decomposedStripsMax) breakdownCount = decomposedStripsMax;
  for(let currentStripe = 0; currentStripe < breakdownCount; currentStripe++) {
    let magnitude = deconstructedSines[currentStripe].magnitude;
    let frequency = deconstructedSines[currentStripe].frequency;
    let phase = deconstructedSines[currentStripe].phase;

    magnitude *= 70;
    frequency /= 3;

    let offsetY = ((currentStripe + 2) * waveDimensionHeight) + (waveDimensionHeight >> 1);
    ctx.beginPath();
    let y = offsetY + (Math.sin(phase) * magnitude);
    ctx.moveTo(0, y);
    for(let v = 0; v < waveDimensionWidth; v++) {
      let y = offsetY + (Math.sin(phase + (v * TO_RADIANS * frequency)) * magnitude);
      ctx.lineTo(v, y);
    }
    ctx.stroke();
  }
}

//In the second box down, draw a combination of all of the skimmed off sinewaves.
//This should be a fairly good approximation of the input signal.
function drawCombinedSines(deconstructedSines, ctx) {
  ctx.strokeStyle = "#ff00ff";
  let breakdownCount = deconstructedSines.length;
  let sineWaves = [];
  let offsetY = waveDimensionHeight + (waveDimensionHeight >> 1);
  let combinedSines = 0;
  for(let currentSine = 0; currentSine < deconstructedSines.length; currentSine++)
    combinedSines += (Math.sin(deconstructedSines[0].phase) * deconstructedSines[0].magnitude * 50);
  ctx.beginPath();
  ctx.moveTo(0, offsetY + combinedSines);
  for(let v = 0; v < waveDimensionWidth; v++) {
    let combinedSines = 0;
    //let oldY = y;
    for(let currentSine = 0; currentSine < deconstructedSines.length; currentSine++){
      let magnitude = deconstructedSines[currentSine].magnitude;
      let frequency = deconstructedSines[currentSine].frequency;
      let phase = deconstructedSines[currentSine].phase;
      magnitude *= 50;
      frequency /= 3;
      combinedSines += (Math.sin(phase + (v * TO_RADIANS * frequency))) * magnitude;
    }
    y = offsetY + combinedSines;
    ctx.lineTo(v, y);
  }  
  ctx.stroke();
}


let samples = [];
let fourierOutput = [];
let sampleLength = 1000;
let deconstructedSines = [];
let magnitudes = [];
let phases = [];

//The animation loop
function loop() {

	//A counter from 0 to 10, that changes 'velocity' based on a simple sinewave.
	//Used to animate the sine waves input.
	count = 10 * ((1 + Math.sin(angleCount * TO_RADIANS)) / 2);
	angleCount += 1;
	if(angleCount >= 360) angleCount -= 360;

	//Clear out all the arrays we use.
	magnitudes.length = 0;
	phases.length = 0;
	fourierOutput.length = 0;
	deconstructedSines.length = 0;
	
	//The steps to make the input signal, the fourier analysis, the basic outputs, and combined output.
  makeComplexSine(samples, sampleLength);
	createFourier(samples, fourierOutput, magnitudes, phases);
  getDecomposedSines(magnitudes, deconstructedSines);
	
  readyDisplayLayout(deconstructedSines.length, ctx);
  
  drawSine(samples, ctx);
  drawFourier(magnitudes, ctx);
	drawDeconstructedSines(deconstructedSines, ctx);
	drawCombinedSines(deconstructedSines, ctx)
	
	requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

//sqrt(re^2 + im^2) tells you the amplitude
//atan2(im, re) tells you the relative phase