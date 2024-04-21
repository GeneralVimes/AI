window.onload=function(){

	console.log("Hello")
	let canvas = document.getElementById("myCanvas");
	window.ctx = canvas.getContext("2d", {willReadFrequently:true});
	window.isPointerDownNow = false
	canvas.addEventListener("pointerdown", onCanvasPointerDown)
	canvas.addEventListener("pointermove", onCanvasPointerMove)
	canvas.addEventListener("pointerup", onCanvasPointerUp)

	window.network = new NeuroNet()
	window.network.createIntroLayer(28*28);

	window.network.createLayer(300,"sigmoid");
	window.network.createLayer(2,"sigmoid");

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

		window.network.calculateOutsForInputs(neuronInputs);
		let corAr=[0,0]
		corAr[pictureTypeId]=1;
		window.network.calculateErrors(corAr)
		window.network.adjustParams(0.01)

		
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


}

function drawHorizontalLine(){
	window.ctx.fillStyle="#000000"
	window.ctx.fillRect(0,0,28,28)


}

//Коли зробите розпізнавання ліній, додайте розпізнавання діагональних ліній, нахилених право та вліво
//(що займають дорівнюють від половини до повної діагоналі всього поля
//та зробіть нейромережу, яка б розрізняла всі 4 форми
//Коли зробите розпізнавання ліній, додайте ще 2 функції: малювання випадковго квадрата (зі стороною від 14 до 28 пікселів)
//та малювання випадкового кола: (з радіусом від 14 до 28 пікселів)
//та зробіть нейромережу, яка б розрізняла всі 6 форм
//придумайте ще форми, які можна малювати та навчити мережу відрізняти

function getNeuroInputsFromCanvas(){
	let imageData = window.ctx.getImageData(0, 0, 28, 28);
	return loadImage2Array(imageData)//ось це подамо на вхід нейромережі
}

function checkNeuronNetRecognition(){

}


var reportingStep=100;
var numCorrects=0

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