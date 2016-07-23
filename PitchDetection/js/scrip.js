var stage;
var canvas;
var circles=[];
var ys = [];
var pitches = [];

/////////
//START//
/////////

// get the context from the canvas to draw on

// create a temp canvas we use for copying
var tempCanvas = document.createElement("canvas");
var tempCtx = tempCanvas.getContext("2d");
	tempCanvas.width=800;
	tempCanvas.height=512;

// used for color distribution
var hot = chroma.scale(
                       ['#000000', '#ff0000', '#ffff00', '#ffffff'], // colors
                       [0, .25, .75, 1]  // positions
                      )
                       .domain([0, 300]);

/*
var hot = new chroma.ColorScale({
    colors:['#000000', '#ff0000', '#ffff00', '#ffffff'],
    positions:[0, .25, .75, 1],
    mode:'rgb',
    limits:[0, 300]
});
*/

function drawSpectrogram(array) {

    // copy the current canvas onto the temp canvas
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    tempCtx.drawImage(canvas, 0, 0, 800, 512);

    // iterate over the elements from the array
    for (var i = 0; i < array.length; i++) {
        // draw each pixel with the specific color
        var value = array[i];
        ctx.fillStyle = hot(value).hex();

        // draw the line at the right side of the canvas
        ctx.fillRect(800 - 1, 512 - i, 1, 1);
    }

    // set translate on the canvas
    ctx.translate(-1, 0);
    // draw the copied image
    ctx.drawImage(tempCanvas, 0, 0, 800, 512, 0, 0, 800, 512);

    // reset the transformation matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);

}
///////
//END//
///////




function tick(event) {
	// we use information from the analyzer node
	// to draw the volume
	// get the average for the first channel
	if (analyser){
		var array = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(array);
		
		// draw the spectrogram
		
		//if (sourceNode.playbackState == sourceNode.PLAYING_STATE) {
		if (array){
		    drawSpectrogram(array);
		}
	}	

	pitch = updatePitch();
	console.log(pitch);
	/*
	if(pitches.length >= circles.length){
		pitches.shift();
		pitches.push(pitch);
	}
	else{
		pitches.push(pitch);
	}
	*/
	
	for(i = 0; i < circles.length; i++){
		if(circles[i].x < 0){
			circles[i].x=canvas.width;
			circles[i].y=(noteFromPitch(pitch)-69)*12;
		}
		circles[i].x -= 2;
		//circles[i].y = Math.sin(t)*(20+t/5)+canvas.height/2;
	}
	stage.update(event);
}

function init(){
	 stage = new createjs.Stage("demoCanvas");
	
	//var circles = [];
	canvas = document.getElementById("demoCanvas");
	
	//for(i = 0; i < 10; i++){
	for(x = 0; x < canvas.width; x+=2){
		t = x;//(x+10*i);
		circles.push(new createjs.Shape());
		var color  = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
		circles[circles.length-1].graphics.beginFill(color).drawCircle(0, 0, 3);
		circles[circles.length-1].x = t;
		circles[circles.length-1].y = Math.sin(t/70)*100+canvas.height/2+Math.cos(t/10)*20;
		stage.addChild(circles[circles.length-1]);
	}
	//}
	/*
	circle = new createjs.Shape();
	circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 10);
	circle.x = 100;
	circle.y = 100;
	stage.addChild(circle);
	*/
	stage.update();
	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(60);
}
