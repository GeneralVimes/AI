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

class BachetBot2 extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//always takes 2
		if (gameDataOb.N>=2){
			return {n:2}
		}
		return {n:1}
	}		
}

class BachetBot3 extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//always takes 3
		if (gameDataOb.N>=3){
			return {n:3}
		}
		return {n:gameDataOb.N}
	}		
}

class BachetBotRandom extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//takes 1, 2, or 3 at random
		if (gameDataOb.N>=3){
			return {n:1+Math.floor(Math.random()*3)}
		}
		return {n:this.randomNumberFromToIncl(1,gameDataOb.N)}
	}	
}

class BachetBot123Best extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//takes 1, 2, or 3 at random
		if (gameDataOb.N%4!=0){
			return {n:gameDataOb.N%4}
		}
		return {n:this.randomNumberFromToIncl(1,Math.min(3,gameDataOb.N))}
	}	
}

class BachetBot123Best2 extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//takes 1, 2, or 3 at random
		if (gameDataOb.N%4!=0){
			return {n:gameDataOb.N%4}
		}
		return {n:Math.min(2,gameDataOb.N)}
	}	
}

class BachetBot123BestWithMistakes extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//takes 1, 2, or 3 at random
		let prob = 0.7

		if (gameDataOb.N%4!=0){
			if (Math.random()<prob){
				return {n:gameDataOb.N%4}
			}
		}
		return {n:this.randomNumberFromToIncl(1,Math.min(3,gameDataOb.N))}
	}	
}


class myBot extends Bot{
	makeMoveForSituation(gameDataOb){//
		//gameDataOb.N - the current number of stones in the pile
		
		// return {n:__quantity of stones which the bot will attempt to take from the pile___}
	}	
}