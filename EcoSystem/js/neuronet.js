class Neuron{
	constructor(nwrk, lid, id, numWeights){
		this.myNetwork = nwrk
		this.myLayerId = lid
		this.idInLayer = id
		this.entryWeights=[]
		this.bias = Math.random()*2-1
		this.calculatedZ = 0;
		this.calculatedOutput=0;

		for (let i=0; i<numWeights; i++){
			this.entryWeights.push((Math.random()*2-1)/numWeights);
		}

		this.dcda=0
		this.dcdz=0
		this.dcdb=0
		this.dcdw=[]
		for (let i=0; i<numWeights; i++){
			this.dcdw.push(0);
		}
	}

	calculateErrors(targetVal, prevLayer, nextLayer){
		if (!nextLayer){
			this.dcda = this.calculatedOutput-targetVal;
		}else{
			this.dcda = 0;
			for (let i=0; i<nextLayer.length; i++){
				this.dcda+=nextLayer[i].entryWeights[this.idInLayer]*nextLayer[i].dcdz;
			}
		}
		
		this.dcdz = this.dcda*this.activationFunctionPrime(this.calculatedZ);
		this.dcdb = 1*this.dcdz;
		for (let i=0; i<this.dcdw.length; i++){
			this.dcdw[i] = prevLayer[i].calculatedOutput*this.dcdz;
		}
	}

	adjustParams(step=0.1){
		for (let i=0; i<this.entryWeights.length; i++){
			this.entryWeights[i]-=this.dcdw[i]*step;
		}
		this.bias-=this.dcdb*step
	}

	activationFunction(val){
		return 1/(1+Math.exp(-val))
	}

	activationFunctionPrime(val){
		return this.activationFunction(val)*(1-this.activationFunction(val))
	}

	setOutputDirectly(val){
		this.calculatedOutput=val;
	}
	calculateOutFromInput(prevLayer){
		this.calculatedZ = this.bias;
		for (let i=0; i<prevLayer.length; i++){
			this.calculatedZ+=prevLayer[i].calculatedOutput*this.entryWeights[i]
		}
		this.calculatedOutput = this.activationFunction(this.calculatedZ)
	}

	export2Object(){
		return{
			bias:this.bias,
			weights:this.entryWeights.slice()
		}
	}

	initFromObject(ob){
		this.bias = ob.bias;
		let m = Math.min(this.entryWeights.length, ob.weights)
		for (let i=0; i<m; i++){
			this.entryWeights[i] = ob.weights[i]
		}
	}
}

class  NeuroNet{
	constructor(){
		this.introLayer=[]
		this.layers=[];
	}
	createIntroLayer(n){
		this.introLayer.length=n;
		for (let i=0; i<n; i++){
			this.introLayer[i]=new Neuron(this,-1,i,0);
		}
	}
	createLayer(n){
		this.layers.push([]);
		let leayerId = this.layers.length-1
		let ar = this.layers[leayerId];
		let lastNumOuts = this.introLayer.length
		if (this.layers.length>1){
			lastNumOuts = this.layers[leayerId-1].length;
		}

		for (let i=0; i<n; i++){
			let nrn = new Neuron(this, leayerId, i, lastNumOuts)
			ar.push(nrn);
		}
	}
	calculateOutsForInputs(ar){
		let mx = Math.max(ar.length, this.introLayer.length)
		for (let i=0; i<mx; i++){
			if (i<this.introLayer.length){
				if (i<ar.length){
					this.introLayer[i].setOutputDirectly(ar[i])
				}else{
					this.introLayer[i].setOutputDirectly(0);
				}
			}
		}

		for (let lid=0; lid<this.layers.length; lid++){
			let lyrAr = this.layers[lid];
			let prevLayer = this.introLayer
			if (lid>0){
				prevLayer = this.layers[lid-1]
			}	

			for (let i=0; i<lyrAr.length; i++){
				let nrn = lyrAr[i];
				nrn.calculateOutFromInput(prevLayer)
			}
		}
	}

	logOutputs(){
		let res=[];
		let lastLayer = this.layers[this.layers.length-1]
		for (let i=0; i<lastLayer.length; i++){
			res.push(lastLayer[i].calculatedOutput)
		}
		console.log(res)
	}
	getOutputs(){
		let res=[];
		let lastLayer = this.layers[this.layers.length-1]
		for (let i=0; i<lastLayer.length; i++){
			res.push(lastLayer[i].calculatedOutput)
		}
		return res
	}

	findIdOfRandomWeightedOutNeuronBetween(id0, id1){
		let sum=0;
		let lastLayer = this.layers[this.layers.length-1]
		for (let i=id0; i<=Math.min(id1,lastLayer.length-1); i++){
			sum+=lastLayer[i].calculatedOutput;
		}
		if (sum>0){
			let r = Math.random()*sum;
			let id=id0
			while (r>=lastLayer[id].calculatedOutput){
				r-=lastLayer[id].calculatedOutput;
				id++
			}
			return id
		}else{
			return id0
		}
	}
	findIdOfMostActivatedOutNeuronBetween(id0, id1){
		let lastLayer = this.layers[this.layers.length-1]
		let res=id0;
		let maxOut = lastLayer[id0].calculatedOutput;

		for (let i=id0+1; i<=Math.min(id1,lastLayer.length-1); i++){
			if (lastLayer[i].calculatedOutput>maxOut){
				maxOut = lastLayer[i].calculatedOutput;
				res=i;
			}
		}
		return res;		
	}
	findIdOfMostActivatedOutNeuron(){
		let lastLayer = this.layers[this.layers.length-1]
		let res=0;
		let maxOut = lastLayer[0].calculatedOutput;

		for (let i=1; i<lastLayer.length; i++){
			if (lastLayer[i].calculatedOutput>maxOut){
				maxOut = lastLayer[i].calculatedOutput;
				res=i;
			}
		}
		return res;
	}

	calculateErrors(targetOuts){
		//backpropagation
		for (let lyrId = this.layers.length-1; lyrId>=0; lyrId--){
			let layer = this.layers[lyrId];
			let nextLayer = null;
			let prevLayer = null;
			if (lyrId<this.layers.length-1){
				nextLayer = this.layers[lyrId+1];
			}
			if (lyrId>0){
				prevLayer = this.layers[lyrId-1];
			}else{
				prevLayer = this.introLayer;
			}

			for (let i=0; i<layer.length; i++){
				layer[i].calculateErrors(targetOuts[i],prevLayer, nextLayer)
			}			
		}
	}

	adjustParams(step=0.1){
		for (let lyrId = this.layers.length-1; lyrId>=0; lyrId--){
			let layer = this.layers[lyrId];
			for (let i=0; i<layer.length; i++){
				layer[i].adjustParams(step);
			}			
		}
	}
	export2Text(){
		let res=""
		let resAr=[];
		//weights, bias, z, a
		let tableWidth = this.layers.length*6+3
		let tableHeight = this.introLayer.length*3+2;
		let prevLen = this.introLayer.length;
		for (let i=0; i<this.layers.length; i++){
			tableHeight = Math.max(tableHeight, this.layers[i].length*(prevLen+3));
			prevLen = this.layers[i].length;
		}
		tableHeight+=2;

		for (let i=0; i<=tableHeight; i++){
			let ar=[];
			for (let j=0; j<=tableWidth; j++){
				ar.push("")
			}
			resAr.push(ar)
		}
		resAr[0][0]="Inputs"
		for (let i=0; i<this.introLayer.length; i++){
			resAr[2+i*3][0] = this.introLayer[i].calculatedOutput.toString()
		}

		for (let i=0; i<this.layers.length; i++){
			
			let r0 = 2;
			let c0 = 2+5*i;
			resAr[0][c0]="Layer_"+i.toString();
			if (i==this.layers.length){
				resAr[0][c0]="Output";
			}
			for (let j=0; j<this.layers[i].length; j++){
				resAr[r0][c0]="Neuron_"+j.toString()
				resAr[r0+1][c0]="weights"
				resAr[r0+1][c0+1]="bias"
				resAr[r0+1][c0+2]="z"
				resAr[r0+1][c0+3]="output"
				let nr = this.layers[i][j];
				resAr[r0+2][c0+1]=nr.bias
				resAr[r0+2][c0+2]=nr.calculatedZ
				resAr[r0+2][c0+3]=nr.calculatedOutput		
				for (let k=0; k<nr.entryWeights.length; k++){
					resAr[r0+2+k][c0]=nr.entryWeights[k].toString()
				}
				r0 = r0+3+nr.entryWeights.length;
			}
		}
		let resLines = []
		for (let i=0; i<resAr.length; i++){
			resLines.push(resAr[i].join("	"))
		}
		res = resLines.join("\n")
		// return JSON.stringify(res);
		return res;
		// return resLines;
	}

	export2Object(){
		let res={}

		res.numInputs=this.introLayer.length;
		res.layers=[]

		for (let i=0; i<this.layers.length; i++){
			let ar=[]
			for (let j=0; j<this.layers[i].length; j++){
				ar.push(this.layers[i][j].export2Object())
			}
			res.layers.push(ar)
		}

		return res;
	}

	buildFromObject(ob){
		this.createIntroLayer(ob.numInputs)
		for (let i=0; i<ob.layers.length;i++){
			this.createLayer(ob.layers[i].length)
			for (let j=0; j<ob.layers[i].length; j++){
				this.layers[i][j].initFromObject(ob.layers[i][j])
			}
		}
	}
}

function convertNtoBits(N, len=7){
    let bitAr=[]
		while (N>0){
			bitAr.push(N%2)
			N = Math.floor(N/2)
		}
		while (bitAr.length<len){
			bitAr.push(0);
		}
	return bitAr
}