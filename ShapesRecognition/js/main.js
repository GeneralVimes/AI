window.onload=function(){

	console.log("Hello")
	let canvas = document.getElementById("myCanvas");
	window.ctx = canvas.getContext("2d", {willReadFrequently:true});
	
	canvas.addEventListener("pointerdown", onCanvasPointerDown)
	canvas.addEventListener("pointermove", onCanvasPointerMove)
	canvas.addEventListener("pointerup", onCanvasPointerUp)

	window.network = new NeuroNet()
	window.network.createIntroLayer(28*28);

	window.network.createLayer(300,"leakyrelu");
	window.network.createLayer(2,"softmax");

	for (let k=0; k<1000; k++){
		let pictureTypeId=Math.floor(Math.random()*2)
		let corAnswers=[0,0]
		corAnswers[pictureTypeId]=1;

		switch (pictureTypeId){
			case 0:{
				drawVerticalLine();
				break;
			}
			case 1:{
				drawHorizontalLine();
				break;
			}
		}

		let neuronInputs = getNeuroInputsFromCanvas()
		trainNetworkWithData(neuronInputs,pictureTypeId)
		if (window.network.findIdOfMostActivatedOutNeuron()==pictureTypeId){
			numCorrects++
		}
		if (k%reportingStep==0){
			console.log(k, pictureTypeId, window.network.getOutputs(),numCorrects/reportingStep)
			numCorrects=0
		}
	}

}


//Щоб навчити мережу відрізняти вертикальну лінію від горизонтальної, треба:
/*
0. визначаємо, якого типу лінію малювати (вертикальну чи горизонтальну)
1. малюємо на ctx лінію (вертикальну чи шгорищонтальну) - товщини 1-5 пікс, відхилення від перпендикіляру - до 10%
2. довжина лінії - не менше 14 пікс
3. значення колькорів з канвасу подамо на вхід мережі
4. навчаємо мережу
*/

//малювання випадкової вертикальної лінії
function drawVerticalLine(){
	window.ctx.fillStyle="#000000"
	window.ctx.fillRect(0,0,28,28)

	//напишіть функцію для малювання випадкової вертикальної лінії
	//довжина лінії - від 14 до 28
	//має бути розташована у випадковому місці квадрату 28х28
	//нахил лінії - до 25% вліво чи вправо
	//твощина лінії від 1 до 5 пікселів
}

function drawHorizontalLine(){
	window.ctx.fillStyle="#000000"
	window.ctx.fillRect(0,0,28,28)
	//напишіть функцію для малювання випадкової горизонтальної лінії
	//довжина лінії - від 14 до 28
	//має бути розташована у випадковому місці квадрату 28х28
	//нахил лінії - до 25% вліво чи вправо
	//товщина лінії від 1 до 5 пікселів	
}
//ви зможете малювати форми та перевірити, як мережа їх визначає
//малювання здійснюється із зажатою клавішею Alt, стирання Alt+Click

//Коли зробите розпізнавання ліній, додайте 2 функції: малювання випадковго квадрата (зі стороною від 14 до 28 пікселів)
//та малювання випадкового кола: (з радіусом від 14 до 28 пікселів)
//та зробіть нейромережу, яка б розрізняла всі 4 форми

function trainNetworkWithData(ar, cor_res){
	window.network.calculateOutsForInputs(ar);
	let corAr=[0,0,0,0,0,0,0,0,0,0]
	corAr[cor_res]=1;
	window.network.calculateErrors(corAr)
	window.network.adjustParams(0.01)
}

function getNeuroInputsFromCanvas(){
	let imageData = window.ctx.getImageData(0, 0, 28, 28);
	return loadImage2Array(imageData)//ось це подамо на вхід нейромережі
}

function checkNeuronNetRecognition(){

}


var image = new Image();
var image2 = new Image();
// var training_files_nums=[5923, 6742, 5958, 6131,5842,5421,5918,6265,5851,5949]//скільки яких картинок
var training_files_nums=[980, 1135, 1032, 1010,982,892,958,1028,974,1009]//скільки яких картинок


var trainingRound=0;
var maxRounds=1000000;
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
		res.push(imageData.data[i*4])
	}
	return res;
}

function recognizeImageFromCanvas(){
	window.network.calculateOutsForInputs(getNeuroInputsFromCanvas())
	console.log(window.network.getOutputs())
}

function onCanvasPointerDown(evt){
	// console.log("onCanvasPointerDown",evt)
	if (evt.altKey){
		window.ctx.fillStyle="#000000"
		window.ctx.fillRect(0,0,28,28)
	}
}

function onCanvasPointerMove(evt){
	// console.log("onCanvasPointerMove",evt)
	if (evt.altKey){
		window.ctx.fillStyle="#ffffff"
		window.ctx.fillRect(evt.offsetX,evt.offsetY,1,1)
	}
}

function onCanvasPointerUp(evt){
	// console.log("onCanvasPointerUp",evt)
}