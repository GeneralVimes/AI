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


class BachetBot2Smart extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//always takes 2, but takes 1 if there is only 1 stone in the pile
		if (gameDataOb.N==1){
			return {n:1}
		}else{
			return {n:2}
		}
		
	}		
}

class BachetBot3Smart extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//takes 3 stones, but not more than the number of stones available in the pile
		return {n:Math.min(gameDataOb.N, 3)}
	}		
}

class BachetBotRandomSmart extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//takes 1, 2, or 3, but does not try to take more than what is in the pile
		if (gameDataOb.N==1){
			return {n:1}
		}else{
			if (gameDataOb.N==2){
				return {n:1+Math.floor(Math.random()*2)}
			}else{
				return {n:1+Math.floor(Math.random()*3)}
			}
		}
	}	
}

//implements the winning strategy for Bachet's Game with allowed moves 1, 2, 3 and the case where the last stone must be taken to win
class BachetBot123Best extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){
		if (gameDataOb.N%4==0){
			return {n:1+Math.floor(Math.random()*3)}
		}else{
			return {n:gameDataOb.N%4}
		}
	}		
}

class BachetLearnerBot extends Bot{
	static memory=[];//static field accessible by all instances of the class
	/*
	 The i-th element of the memory array shows the probabilities of taking a certain
	 number of stones from a pile of N=i stones.
	 This array will be initialized with objects:
	 {1:3, 2:3, 3:3}
	 //meaning the chances of taking 1, 2, or 3 are equal
	*/


	constructor(nm){
		super(nm);
		this.myMoves=[];
	}

	makeMoveForSituation(gameDataOb){
		//gameDataOb.N is how many stones are in the pile from which we need to make a move
		//if the requested situation is not yet in memory, we extend the memory
		while (BachetLearnerBot.memory.length<=gameDataOb.N){
			BachetLearnerBot.memory.push({1:3, 2:3, 3:3})
		}

		let memOb = BachetLearnerBot.memory[gameDataOb.N];
		//find out how many tokens with possible moves are in the cell
		let numMoves = memOb[1]+memOb[2]+memOb[3];
		//select a random token
		let randId = Math.floor(Math.random()*numMoves)//
		let madeMove = 3;
		//and calculate whether this token is a 1, a 2, or a 3
		if (randId<memOb[1]){
			madeMove = 1;
		}else{
			if (randId<memOb[1]+memOb[2]){
				madeMove = 2;
			}
		}
		//we remember which move we made from which position
		this.myMoves.push({N:gameDataOb.N, n:madeMove})

		return {n:madeMove}
	}
	//bot functions that are called by the game and allow the bot to learn
	getInformedOfGameStart(rulesOb){
		super.getInformedOfGameStart(rulesOb)
		this.myMoves.length=0;
	}

	getInformedOfVictory(){
		//if we won, we must go through the moves made
		//and increase the probability of those moves that led us to victory
		for (let i=0; i<this.myMoves.length; i++){
			let moveOb = this.myMoves[i];
			//information about the move made has the form of an object 
			//{N:57, n:3}
			let memOb = BachetLearnerBot.memory[moveOb.N]
			memOb[moveOb.n]+=1;
			//to prevent the numbers in memory from growing too large, upon reaching 1000 tokens,
			//we will divide all tokens in half
			if (memOb[moveOb.n]>=1000){
				memOb[1]=Math.floor(memOb[1]/2)
				memOb[2]=Math.floor(memOb[2]/2)
				memOb[3]=Math.floor(memOb[3]/2)		
			}
		}
	}

	getInformedOfDefeat(){
		//if we lost, we must go through the moves made
		//and decrease the probability of those moves that led us to defeat
		for (let i=0; i<this.myMoves.length; i++){
			let moveOb = this.myMoves[i];
			//information about the move made has the form of an object 
			//{N:57, n:3}
			let memOb = BachetLearnerBot.memory[moveOb.N]
			//probabilities can be decreased in two ways
			//for large numbers, we will immediately divide them in half
			if(memOb[moveOb.n]>1000){
				memOb[moveOb.n]=Math.floor(memOb[moveOb.n]/2)
			}else{//and from smaller ones - subtract one
				memOb[moveOb.n]-=1;
				if (memOb[moveOb.n]<=0){
					memOb[moveOb.n]=0;
					//if we removed the last token, and the total of other tokens is less than a hundred,
					//we will add 1 token of each type
					if (memOb[1]+memOb[2]+memOb[3]<100){
						memOb[1]+=1;
						memOb[2]+=1;
						memOb[3]+=1;
					}
					
				}			
			}

		}		
	}	
}