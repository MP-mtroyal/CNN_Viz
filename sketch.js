

//Model based on this TFjs tutorial
//https://www.tensorflow.org/js/tutorials/training/handwritten_digit_cnn

let clearButton, predictButton;

let drawingPad;
let modelDisplay;

let timer = 15;

function setup(){
	createCanvas(1400, 850);

  let padWidth  = 250;
  let padHeight = 800 / 2 - 250 / 2;
  
  drawingPad = new DrawingPad(createVector(25, padHeight));
  modelDisplay = new ModelDisplay(createVector(1400 - 150, 50), drawingPad);
  
  clearButton = createButton('Clear');
  clearButton.position(25, padHeight - 25);
  clearButton.mousePressed(clearCanvas);
  background(150, 135, 150);
}

function draw(){
  if (timer > 60){ // && timer % 15 == 0){
    
    modelPredict();
    drawingPad.show();
    modelDisplay.show();
  }
  timer++;
}

function clearCanvas(){
  drawingPad.clear();
}

function modelPredict(){
  const xTensor = tf.tensor([drawingPad.getData()], [1, 28, 28, 1]);
  modelDisplay.updatePrediction(xTensor);
  xTensor.dispose();
}

function mousePressed(){
  drawingPad.click(mouseX, mouseY);
}

function mouseDragged(){
  drawingPad.click(mouseX, mouseY);
}
