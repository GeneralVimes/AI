window.onload=function(){
	console.log("Hello")
	//створимо нейромережу та навчимо її визначати номер координатної чверті точки, що задаватиметься прою координат, х,у
	//у мережі має бути 2 входи (на один подаватимемо х, на другий у)
	//та 4 виходи (маэ активуватися нейрон, що выдповідатиме номеру чверті)
	let num_inputs = 2
	let num_outputs = 4
	window.network = new NeuroNet()
	window.network.createIntroLayer(num_inputs)
	window.network.createLayer(10);
	window.network.createLayer(num_outputs);

	//тепер сформулюємо навчальну вибірку. Це будуть пари координат та число - правильний номер чверті
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
	//якщо на вході мережі буде масив чисел input_arr, то який за номером вихіднй нейрон має бути активований?
	function findCorrectActivation(input_arr){
		let x = input_arr[0]
		let y = input_arr[1]
		return findQuarterNumber(x,y)-1
	}

	//будуємо навчальну вибірку. Це буде масив масивів
	//елементи масиву у вхіній вибірці - це числа, що подаються на входи мережі, а також номер того нейрона, що має активуватися
	//Приклади даний, які будуть у цій вибірці:
	//[2,3,0] - тому що точка 2,3 наледить першому квадранту координатної площини, а першому квадранту відповідає нульовий нейрон
	//[-5,-3,2] - тому що точка -5,-3 належить третьому квадранту координатної площини, а третьому квадранту відповідає другий нейрон
	//[1,-3,3] - тому що точка 1,-3 належить IV квадранту координатної площини, а IV квадранту відповідає третій нейрон
	let learningData=[];
	for (let i=0; i<100000; i++){
		let x = Math.random()*20-10
		let y = Math.random()*20-10
		let input_arr = [x,y];
		let correct_neuron_id = findCorrectActivation(input_arr)
		input_arr.push(correct_neuron_id)
		learningData.push(input_arr)
	}

	//тепер проганяємо цю навчальну вибірку по нейромережі 
	for (let i=0; i<learningData.length; i++){
		let dataAr = learningData[i];
		let input_arr = dataAr.slice(0,dataAr.length-1)
		let answer = dataAr[dataAr.length-1];
		window.network.calculateOutsForInputs(input_arr)
		let networkAnswer = window.network.findIdOfMostActivatedOutNeuron();
		let correctActivation = []
			for (let k=0; k<num_outputs; k++){
				correctActivation.push(0)
			}
		correctActivation[answer] = 1;
		window.network.calculateErrors(correctActivation);
		window.network.adjustParams(0.1)
	}

	//тепер треба перевірити, як мережа навчилася. Будуємо тестову вибірку
	//вона будується так само, як і навчальна. Але діапазон даних можна розширити, щоб перевірити, чи навчилася мережа 
	//узагальнити інформацію з навчання
	//так, для навчання визначення координатної чверті, ми брали випадкові числа від -10 до 10, 
	//а для перевірки навченості беремо числа від -1000 до 1000
	let testingData=[];
	for (let i=0; i<10000; i++){
		let x = Math.random()*2000-1000
		let y = Math.random()*2000-1000
		let input_arr = [x,y];
		let correct_neuron_id = findCorrectActivation(input_arr)
		input_arr.push(correct_neuron_id)
		testingData.push(input_arr)
	}

	let numCorrectAnswers=0;
	let numErrors=0;
	for (let i=0; i<testingData.length; i++){
		let dataAr = learningData[i];
		let input_arr = dataAr.slice(0,dataAr.length-1)
		let answer = dataAr[dataAr.length-1];
		window.network.calculateOutsForInputs(input_arr)
		let networkAnswer = window.network.findIdOfMostActivatedOutNeuron();

		if (answer==networkAnswer){
			numCorrectAnswers++
		}else{
			numErrors++
		}
	}
	console.log("correct percentage:",numCorrectAnswers/(numCorrectAnswers+numErrors))
}
