var frequencyInput = document.querySelector("input[frequency]");
var orderInput = document.querySelector("input[order]");
var waveformInput = document.getElementById("waveform").elements["waveform"];
var canvas = document.querySelector("canvas");
var context = canvas.getContext("2d");

var PI2 = Math.PI * 2.0;
var Scale = 64.0;
var time = 0.0;
var startTime = new Date().getTime();
var values = [];
var valuePointer = 0;
var x = 128.0,
		y = 128.0;

function fourier(order) {
		var phase = order * time * PI2;
		var radius = 4.0 / (order * Math.PI) * Scale;
		context.beginPath();
		context.lineWidth = 1.0;
		context.strokeStyle = "rgba(255,128,32,1.0)";
		context.arc(x, y, radius, 0, PI2);
		context.stroke();
		context.strokeStyle = "rgba(255,255,255,0.4)";
		context.moveTo(x, y);
		x += Math.cos(phase) * radius;
		y += Math.sin(phase) * radius;
		context.lineTo(x, y);
		context.stroke();
};

function connect() {
		context.beginPath();
		context.moveTo(x + 0.5, y + 0.5);
		context.lineTo(256 + 0.5, y + 0.5);
		context.strokeStyle = "rgba(255,255,32,1.0)";
		context.stroke();
};

function drawWave() {
		values[valuePointer++ & 255] = y;
		context.beginPath();
		context.strokeStyle = "rgba(0,255,0,1)";
		context.moveTo(256 + 0.5, y + 0.5);
		for (var i = 1; i < 256; ++i) {
				context.lineTo(256 + i + 0.5, values[(valuePointer - i) & 255] + 0.5);
		}
		context.stroke();
}

(function frame() {
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;
		x = 144.0;
		y = 128.0;
		switch (waveformInput.value) {
				case "square":
						for (var order = 0; order <= orderInput.value; order++) {
								fourier((order << 1) + 1);
						}
						break;
				case "sawtooth":
						for (var order = 1; order <= orderInput.value; order++) {
								fourier(order << 1);
						}
						break;
		}
		connect();
		drawWave();
		var now = new Date().getTime();
		time += (now - startTime) * Math.pow(10.0, frequencyInput.value);
		startTime = now;
		window.requestAnimationFrame(frame);
})();