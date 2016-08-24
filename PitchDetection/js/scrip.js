var stage;
var canvas;
var circles=[];
var rectangles=[];
var ys = [];
var pitches = [];
var click = null;
var clickNode = null;
var FPS = 120;
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

function yFromNote(canvas, note){
    return canvas.height - (note-54)*20;
}


var count = 0;
var step = 6;
function tick(event) {
    console.log(count);
    
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
			circles[i].x=canvas.width-20;
			circles[i].y=yFromNote(canvas, floatNoteFromPitch(pitch));//69)*12;
		}
		circles[i].x -= step;
        console.log("Circ");
		//circles[i].y = Math.sin(t)*(20+t/5)+canvas.height/2;
	}
    
    var iRect = rectangles.length;
    while (iRect--){
        if(rectangles[iRect].x < 0){
            stage.removeChild(rectangles[iRect]);
            rectangles.splice(iRect, 1);
        }
        else{
            rectangles[iRect].x -= step;
            console.log("Rect");
        }
    }
 
    if (!(count%(FPS/2))){
        rectangles.push(new createjs.Shape());
		var color  = createjs.Graphics.getHSL(230, 10, 55);
		rectangles[rectangles.length-1].graphics.beginFill(color).drawRect(0, 0, 2, Math.abs(yFromNote(canvas, 64)-yFromNote(canvas, 77)));
        rectangles[rectangles.length-1].x = canvas.width;
		rectangles[rectangles.length-1].y = yFromNote(canvas, 77);

		stage.addChild(rectangles[rectangles.length-1]);

        clickNode = audioContext.createBufferSource();
        clickNode.buffer = click;
        clickNode.loop = false;
        clickNode.connect( audioContext.destination );
        console.log("Yup");
        
        clickNode.start( 0 );
        count = 0;
    }
    count+=1;

    stage.update(event);
}

function init(){
	request = new XMLHttpRequest();
	request.open("GET", "../sounds/Click1.ogg", true);
	request.responseType = "arraybuffer";
	request.onload = function() {
	  audioContext.decodeAudioData( request.response, function(buffer) { 
	    	click = buffer;
		} );
	}
	request.send();

    stage = new createjs.Stage("demoCanvas");
	
	//var circles = [];
	canvas = document.getElementById("demoCanvas");
	
	//for(i = 0; i < 10; i++){
	for(var x = 0; x < canvas.width-20; x+=2){
		t = x;//(x+10*i);
		circles.push(new createjs.Shape());
		var color  = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
		circles[circles.length-1].graphics.beginFill(color).drawCircle(0, 0, 5);
		circles[circles.length-1].x = t;
		circles[circles.length-1].y = Math.sin(t/70)*100+canvas.height/2+Math.cos(t/10)*20;
		stage.addChild(circles[circles.length-1]);
	}
    
    
    var majCount = 0;    
	for(var i = 54; i < 94; i+=1){
		noteY = yFromNote(canvas, i);
		
		var line = new createjs.Shape();
        if(noteStrings[i%12].indexOf("#") > -1){
            line.graphics.setStrokeStyle(1);
            line.graphics.beginStroke(createjs.Graphics.getHSL(230, 30, 85));
        }
        else{
            if(majCount%2){
                if(i>63 && i<78){
                    line.graphics.setStrokeStyle(2);
                    line.graphics.beginStroke(createjs.Graphics.getHSL(2, 40, 0));
                }
                else{
                    line.graphics.setStrokeStyle(1);
                    line.graphics.beginStroke(createjs.Graphics.getHSL(230, 10, 55));
                }
            }
            else{
                line.graphics.setStrokeStyle(1);
                line.graphics.beginStroke(createjs.Graphics.getHSL(230, 10, 65));
            }
            majCount++;
        }
        line.graphics.moveTo(0, noteY);
		line.graphics.lineTo(canvas.width,noteY);
		line.graphics.endStroke();
		stage.addChild(line);
		
		var text = new createjs.Text(noteStrings[i%12], "12px Arial", "#ff7700");
		text.x = canvas.width-20;
		text.y = noteY - 6;
		stage.addChild(text);
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
	createjs.Ticker.setFPS(FPS);
}
