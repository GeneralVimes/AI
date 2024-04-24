window.onload=function(){

	console.log("Hello")
	let canvas = document.getElementById("myCanvas");
	window.ctx = canvas.getContext("2d", {willReadFrequently:true});
	window.isPointerDownNow = false
	canvas.addEventListener("pointerdown", onCanvasPointerDown)
	canvas.addEventListener("pointermove", onCanvasPointerMove)
	canvas.addEventListener("pointerup", onCanvasPointerUp)		

	image.onload = () => {
	Promise.all([
		// Cut out two sprites from the sprite sheet
		createImageBitmap(image, 0, 0, 28, 28)
	]).then((sprites) => {
		window.sprites=sprites
		// Draw each sprite onto the canvas
		window.ctx.drawImage(sprites[0], 0, 0);
		// console.log(sprites)
		const imageData = window.ctx.getImageData(0, 0, 28, 28);
		// console.log(imageData)
		let neuronInputs = loadImage2Array(imageData)//ось це подамо на вхід нейромережі
		// console.log(loadImage2Array(imageData))
		trainNetworkWithData(neuronInputs,current_digit)
		if (window.network.findIdOfMostActivatedOutNeuron()==current_digit){
			numCorrects++
		}

		if (trainingRound%reportingStep==0){
			console.log(trainingRound, current_digit, window.network.findIdOfMostActivatedOutNeuron(),numCorrects/reportingStep)
			numCorrects=0
		}
		if (trainingRound<maxRounds){
			loadNextImage();

		}
	});
	};

	loadNextImage();

	// image.src = "mnist/testing/0/test_0_1.png"
}
window.network = new NeuroNet()
window.network.createIntroLayer(28*28);
// window.network.createLayer(30);
window.network.createLayer(300,"relu");
window.network.createLayer(10,"softmax");

function trainNetworkWithData(ar, cor_res){
	window.network.calculateOutsForInputs(ar);
	let corAr=[0,0,0,0,0,0,0,0,0,0]
	corAr[cor_res]=1;
	window.network.calculateErrors(corAr)
	window.network.adjustParams(0.1)
}

function checkNeuronNetRecognition(){

}


var image = new Image();
var image2 = new Image();
// var training_files_nums=[5923, 6742, 5958, 6131,5842,5421,5918,6265,5851,5949]//скільки яких картинок
var training_files_nums=[980, 1135, 1032, 1010,982,892,958,1028,974,1009]//скільки яких картинок


var trainingRound=0;
var maxRounds=30000;
var reportingStep=100;
var numCorrects=0

var current_digit=0
var current_image_id=0
function loadNextImage(){
	current_digit = Math.floor(Math.random()*10);
	current_image_id = Math.floor(Math.random()*training_files_nums[current_digit]);

	// let str="mnist/training/"+current_digit+"/"+"train_"+current_digit+"_"+(current_image_id+1)+".png"
	let str="mnist/testing/"+current_digit+"/"+"test_"+current_digit+"_"+(current_image_id+1)+".png"
	image.src = str;
	trainingRound++;
}

function loadImage2Array(imageData){
	let res=[];
	for (let i=0; i<28*28; i++){
		res.push(imageData.data[i*4]/255)
	}
	return res;
}

function getNeuroInputsFromCanvas(){
	let imageData = window.ctx.getImageData(0, 0, 28, 28);
	return loadImage2Array(imageData)//ось це подамо на вхід нейромережі
}

function recognizeImageFromCanvas(){
	window.network.calculateOutsForInputs(getNeuroInputsFromCanvas())
	console.log(window.network.getOutputs())
}

function onCanvasPointerDown(evt){
	window.isPointerDownNow = true
	// console.log("onCanvasPointerDown",evt)
	if (evt.altKey){
		window.ctx.fillStyle="#000000"
		window.ctx.fillRect(0,0,28,28)
	}
}

function onCanvasPointerMove(evt){
	// console.log("onCanvasPointerMove",evt)
	if (window.isPointerDownNow){
		if (evt.shiftKey){
			window.ctx.fillStyle="#000000"
		}else{
			window.ctx.fillStyle="#ffffff"
		}
		
		let w = 1;
		if (evt.ctrlKey){
			w=2
		}
		window.ctx.fillRect(evt.offsetX-w*0.5,evt.offsetY-w*0.5,w,w)
	}
}

function onCanvasPointerUp(evt){
	// console.log("onCanvasPointerUp",evt)
	window.isPointerDownNow = false
}