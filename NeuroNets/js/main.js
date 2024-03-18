window.onload=function(){
	console.log("Hello")
	//створимо нейромережу та навчимо її визначати номер координатної чверті точки, що задаватиметься прою координат, х,у
	//у мережі має бути 2 входи (на один подаватимемо х, на другий у)
	//та 4 виходи (маэ активуватися нейрон, що выдповідатиме номеру чверті)
	window.network = new NeuroNet()
	window.network.createIntroLayer(2)
	window.network.createLayer(10);
	window.network.createLayer(4);

	//тепер сформулюємо начальну вибірку. Це будуть пари координат та число - правильний номер чверті
	//оскільки таку задачу можна вирішити суто математично, напишемо таку функцію для контролю
	function findQuarterNumber(x,y){
		if (x>=0){
			if (y>=0){
				return 1
			}else{
				return 4
			}
		}else{
			if (y>=0){
				return 2
			}else{
				return 3
			}		
		}
	}

	//будуємо навчальну вибірку
	let learningData=[];
	for (let i=0; i<10000; i++){
		let x = Math.random()*2-1
		let y = Math.random()*2-1
		learningData.push([x,y,findQuarterNumber(x,y)-1])
	}

	//тепер проганяємо цю навчальну вибірку по нейромережі 
	for (let i=0; i<learningData.length; i++){
		let dataAr = learningData[i];
		let x = dataAr[0];
		let y = dataAr[1];
		let answer = dataAr[2];
		window.network.calculateOutsForInputs([x,y])
		let networkAnswer = window.network.findIdOfMostActivatedOutNeuron();
		let correctActivation = [0,0,0,0];
		correctActivation[answer] = 1;
		window.network.calculateErrors(correctActivation);
		window.network.adjustParams(0.1)
	}

	//тепер треба перевірити, як мереда навчилася. Будуємо тестову вибірку
	let testingData=[];
	for (let i=0; i<10000; i++){
		let x = Math.random()*2-1
		let y = Math.random()*2-1
		testingData.push([x,y,findQuarterNumber(x,y)-1])
	}

	let numCorrectAnswers=0;
	let numErrors=0;
	for (let i=0; i<testingData.length; i++){
		let dataAr = testingData[i];
		let x = dataAr[0];
		let y = dataAr[1];
		let answer = dataAr[2];
		window.network.calculateOutsForInputs([x,y])
		let networkAnswer = window.network.findIdOfMostActivatedOutNeuron();

		if (answer==networkAnswer){
			numCorrectAnswers++
		}else{
			numErrors++
		}
	}
	console.log("correct percentage:",numCorrectAnswers/(numCorrectAnswers+numErrors))
}
