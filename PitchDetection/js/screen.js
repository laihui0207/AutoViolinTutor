var renderer = null;
var stage = null;
var container = null;
var underlay = null;
var click = null;
var clickNode = null;

function init(){
    renderer = PIXI.autoDetectRenderer(1000, 800,{backgroundColor : 0XFBFBFF});
    document.body.appendChild(renderer.view);

    // create the root of the scene graph
    stage = new PIXI.Container();

    container = new PIXI.Container();
    underlay = new PIXI.Container();

    stage.addChild(underlay);
    stage.addChild(container);

    // move container to the (200, 150) 
    container.position.x = 0;
    container.position.y = 0;
    // (93, 98.5) is center of center bunny sprite in local container coordinates
    // we want it to be in (200, 150) of global coords
    
    request = new XMLHttpRequest();
	request.open("GET", "../sounds/Click1.ogg", true);
	request.responseType = "arraybuffer";
	request.onload = function() {
	  audioContext.decodeAudioData( request.response, function(buffer) { 
	    	click = buffer;
		} );
	}
	request.send();


    var majCount = 0;    
	for(var i = 54; i < 94; i+=1){
		noteY = yFromNote(renderer, i);
		
		var line = new PIXI.Graphics();
        if(noteStrings[i%12].indexOf("#") > -1){
            line.lineStyle(1, 0XCCCCCC, 1);
        }
        else{
            if(majCount%2){
                if(i>63 && i<78){
                    line.lineStyle(2, 0X1A0000, 1);
                }
                else{
                    line.lineStyle(1, 0X8C8C8C, 1);
                }
            }
            else{
                line.lineStyle(1, 0XA6A6A6, 1);
            }
            majCount++;
        }
        line.moveTo(0, noteY);
		line.lineTo(renderer.width,noteY);
		underlay.addChild(line);
		
		var text = new PIXI.Text(noteStrings[i%12], {font:"12px Arial", fill:"#ff7700"});
		text.position.x = renderer.width-20;
		text.position.y = noteY - 6;
		underlay.addChild(text);
	}
    // start animating
    animate();
}

var FPS = 60;
var lastTime = Date.now();
var curTime = Date.now(); 
var count = 0;

function animate() {
    requestAnimationFrame(animate);
    curTime = Date.now();
    var deltaT = curTime-lastTime;
    if(deltaT > 1000/FPS){
        lastTime += 1000/FPS;
        count+=1;
        container.position.x -= 3;
        if (!(count%4)) {
            var pitch = updatePitch();
            if (pitch[0] > 1 && pitch[1] > 0.2) {
                var circ = new PIXI.Graphics();
                circ.lineStyle(0);
                var fNote = floatNoteFromPitch(pitch[0]);
                var noteY = yFromNote(renderer, fNote);
                var off = Math.min(1, 3*Math.min(fNote-Math.floor(fNote), Math.ceil(fNote)-fNote));
                circ.beginFill(
                        PIXI.utils.rgb2hex([0.1+0.9*off,0.1+0.9*(1-off),0.25]), 
                        pitch[1]*pitch[1]*pitch[1]
                );
                circ.drawCircle(0, 0, 6);
                circ.endFill();
                circ.position.x = renderer.width-container.position.x; 
                circ.position.y = noteY; 
                container.addChild(circ);
            }
        }
        if (! ( count % 30 ) ){
            clickNode = audioContext.createBufferSource();
            clickNode.buffer = click;
            clickNode.loop = false;
            clickNode.connect( audioContext.destination );
            clickNode.start( 0 );
           
            var bar = new PIXI.Graphics();
            bar.lineStyle(1, 0XA6A6A6, 1);
            bar.moveTo(0, yFromNote(renderer, 77));
            bar.lineTo(0, yFromNote(renderer, 64));
            bar.position.x = renderer.width-container.position.x; 
            bar.position.y = 0;
            container.addChild(bar);
        }
    }
    //rotate the container!
    //container.rotation -= 0.01;

    // render the root container
    renderer.render(stage);
}

function yFromNote(canvas, note){
    return canvas.height - (note-54)*20;
}
