class Bot{
	constructor(nm){
		this.myName=nm
	}

	makeMoveForSituation(gameDataOb){
		return {}
	}
}

class BachetBot1{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//бере 1 завжди
		return {n:1}
	}	
}

class BachetBot2{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//бере 1, або 2 або 3 
		return {n:1+Math.floor(Math.random()*3)}
	}	
}