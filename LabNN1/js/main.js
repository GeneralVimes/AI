window.onload=function(){
	console.log("Hello")
	//створимо нейромережу та навчимо її порівнювати числа.
	//на вхід мережа буде приймати два числа: a, b 
	//результата порівнян може бути два: преше число більше другого або перше число меншще другого (випадок рівності розглядати поки не будемо)
	//отже, в мережі буде 2 входи та 2 виходи
	//всередині додамо ще 1 слой у 5 нейронів (потім з внутрішнім наповненням мережі можна буде поекспериментувати)
	
	//Блок 1. Створення нейромережі
	let num_inputs = 2
	let num_outputs = 2
	window.network = new NeuroNet()
	window.network.createIntroLayer(num_inputs)
	window.network.createLayer(5);
	window.network.createLayer(num_outputs);
	
	//Тепер сформулюємо навчальну вибірку. Тобто будемо показувати мережі пару чисел і одразу вказувати, як вона має на них реагувати
	
	//Спочатку напишемо службову функцію. Вона прийматиме масив з двох чисел та повертатиме номер того нейрона, який має бути активований 
	//Наприклад, якщо на вході масив [5,3], то активуватися має нейрон номер 0
	//А якщо на вході масив [4,8], то активуватися має нейрон номер 1

	//Блок 2. Побудова функції, яка визначає коректну активацію нейрона в мережі
	function findCorrectActivation(input_arr){
		let x = input_arr[0]
		let y = input_arr[1]
		if (x>=y){
			return 0
		}else{
			return 1
		}
	}
	window.findCorrectActivation=findCorrectActivation
	//будуємо навчальну вибірку. Це буде масив об'єктів
	//У кожного об'єкта буде 3 елементи:
	//input_arr - вхідні числа
	//генерувати вхідні числа будемо в діапазоні від -10 до 10
	//correct_neuron_id - який нейрон повинен бути активованим для даних вхідних чисел
	//out_arr - активація вихідного шару для ідеально навченої нейромережі (масив з 0 та 1)
	//Наприклад:
	//{	input_arr:[3,4], correct_neuron_id:4, out_arr:[0,1]	}
	//Блок 3. Побудова навчальної вибірки
	var learningData=[];
	for (let i=0; i<100000; i++){
		
		let x = Math.random()*20-10
		let y = Math.random()*20-10
		let input_arr = [x,y];
		let correct_neuron_id = findCorrectActivation(input_arr)
		let out_arr=[]
		for (let j=0; j<num_outputs; j++){
			out_arr.push(0)
		}
		out_arr[correct_neuron_id] = 1
		
		let ob={
			input_arr:input_arr, correct_neuron_id:correct_neuron_id, out_arr:out_arr
		}

		learningData.push(ob)
	}

	//тепер проганяємо цю навчальну вибірку по нейромережі
	//Блок 4. Навчання нейромережі  
	for (let i=0; i<learningData.length; i++){
		let dataOb = learningData[i];
		
		let input_arr = dataOb.input_arr
		let correctActivation = dataOb.out_arr

		window.network.calculateOutsForInputs(input_arr)
		window.network.calculateErrors(correctActivation);
		window.network.adjustParams(0.1)
	}

	//тепер треба перевірити, як мережа навчилася. Будуємо тестову вибірку
	//вона будується так само, як і навчальна. Але діапазон даних можна розширити, щоб перевірити, чи навчилася мережа 
	//узагальнити інформацію з навчання
	//так, для навчання ми брали випадкові числа від -10 до 10, 
	//а для перевірки навченості беремо числа від -1000 до 1000
	//Блок 5. Підготовка тестових даних
	var testingData=[];
	for (let i=0; i<10000; i++){
		let x = Math.random()*2000-1000
		let y = Math.random()*2000-1000
		let input_arr = [x,y];
		let correct_neuron_id = findCorrectActivation(input_arr)
		let out_arr=[]
		for (let i=0; i<num_outputs; i++){
			out_arr.push(0)
		}
		out_arr[correct_neuron_id] = 1
		
		let ob={
			input_arr:input_arr, correct_neuron_id:correct_neuron_id, out_arr:out_arr
		}

		testingData.push(ob)
	}
	//Подаємо тестові дані на вхід мережі і визначаємо, чи є найбільш активованим "правильний" нейрон
	//Блок 6. Перевірка наченості нейромережі
	let numCorrectAnswers=0;
	let numErrors=0;
	for (let i=0; i<testingData.length; i++){
		let dataOb = learningData[i];
		
		let input_arr = dataOb.input_arr
		let answerNeuron = dataOb.correct_neuron_id
		
		window.network.calculateOutsForInputs(input_arr)
		let networkAnswer = window.network.findIdOfMostActivatedOutNeuron();

		if (answerNeuron==networkAnswer){
			numCorrectAnswers++
		}else{
			numErrors++
		}
	}
	//в результаті показуємо процент правилдьних відповідей
	console.log("correct percentage:",numCorrectAnswers/(numCorrectAnswers+numErrors))
	
}
