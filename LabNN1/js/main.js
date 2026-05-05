window.onload=function(){
	console.log("Hello")
	// Let's create a neural network and train it to compare numbers.
	// The network will receive two numbers as input: a, b 
	// There can be two comparison results: the first number is greater than the second, or the first number is less than the second (we will not consider the case of equality for now)
	// Therefore, the network will have 2 inputs and 2 outputs
	// Inside, we will add 1 more layer with 5 neurons (later, you can experiment with the internal structure of the network)
	
	// Block 1. Creating the neural network
	let num_inputs = 2
	let num_outputs = 2
	window.network = new NeuroNet()
	window.network.createIntroLayer(num_inputs)
	window.network.createLayer(5);
	window.network.createLayer(num_outputs);
	
	// Now we will formulate the training sample. That is, we will show the network a pair of numbers and immediately indicate how it should react to them
	
	// First, let's write a utility function. It will take an array of two numbers and return the index of the neuron that should be activated 
	// For example, if the input is the array [5, 3], then neuron number 0 should be activated
	// And if the input is the array [4, 8], then neuron number 1 should be activated

	// Block 2. Building the function that determines the correct activation of a neuron in the network
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
	// We are building the training sample. This will be an array of objects
	// Each object will have 3 elements:
	// input_arr - input numbers
	// We will generate the input numbers in the range from -10 to 10
	// correct_neuron_id - which neuron should be activated for the given input data
	// out_arr - the activation of the output layer for an ideally trained neural network (an array of 0s and 1s)
	// For example:
	// { input_arr:[3,4], correct_neuron_id:1, out_arr:[0,1] }
	
	// Block 3. Building the training sample
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
	window.learningData=learningData
	// Now we run this training sample through the neural network
	
	// Block 4. Training the neural network  
	for (let i=0; i<learningData.length; i++){
		let dataOb = learningData[i];
		
		let input_arr = dataOb.input_arr
		let correctActivation = dataOb.out_arr

		window.network.calculateOutsForInputs(input_arr)
		window.network.calculateErrors(correctActivation);
		window.network.adjustParams(0.1)
	}

	// Now we need to check how well the network has learned. We are building a test sample
	// It is built in the same way as the training sample. But the data range can be expanded to check if the network learned 
	// to generalize the information from the training
	// Specifically, for training we took random numbers from -10 to 10, 
	// but for the proficiency check we take numbers from -1000 to 1000
	
	// Block 5. Preparation of test data
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
	window.testingData=testingData
	// We provide the test data to the input of the network and determine if the "correct" neuron is the most activated one
	
	// Block 6. Checking the training status of the neural network
	let numCorrectAnswers=0;
	let numErrors=0;
	for (let i=0; i<testingData.length; i++){
		let dataOb = testingData[i];
		
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
	// As a result, we show the percentage of correct answers
	console.log("correct percentage:",numCorrectAnswers/(numCorrectAnswers+numErrors))
	
}