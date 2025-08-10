class Bot{
	constructor(nm){
		this.myName=nm
		this.currentGameRulesObject=null
	}

	makeMoveForSituation(gameDataOb){
		return {}
	}
	//bot functions that are called by the game and allow the bot to learn
	getInformedOfGameStart(rulesOb){
		this.currentGameRulesObject=rulesOb
	}

	getInformedOfVictory(){
	
	}

	getInformedOfDefeat(){
	
	}
	//utility function for determining a random number
	randomNumberFromToIncl(a,b){
		return a+Math.floor(Math.random()*(b-a+1));
	}
}

class BachetBot1 extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//always takes 1
		return {n:1}
	}		
}

class BachetBotRandom extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//takes 1, 2, or 3 at random
		return {n:1+Math.floor(Math.random()*3)}
	}	
}


class myBot extends Bot{
	makeMoveForSituation(gameDataOb){//
		//gameDataOb.N - the current number of stones in the pile
		
		// return {n:__quantity of stones which the bot will attempt to take from the pile___}
	}	
}