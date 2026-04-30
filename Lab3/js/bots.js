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

class UniversalBot extends Bot{
	constructor(nm){
		super(nm)
		//array of analyzed game positions
		this.analysisOfpositions=[]
	}
	//the getInformedOfGameStart function is called at the beginning of each individual game
	//in it, the bot receives an object with the game rules, rulesOb
	//rulesOb has properties:
	/*	{
		allowedMoves:[1,2,3],//array of allowed moves
		isLastMoveWinner:true,//whether the one who makes the last move wins
		numPlayers:2//number of players in one game
	}
	*/	
	getInformedOfGameStart(rulesOb){
		//the bot copies the received rulesOb to this.currentGameRulesObject
		this.currentGameRulesObject=rulesOb
		//then it starts analyzing game positions and determining their type
		//initially, the type of all positions is undefined
		for (var i=0; i<=100; i++){
			this.analysisOfpositions[i] = "";
		}
		//we set the end-game position to "T" - for Target. After all, the main goal of the game is to leave the opponent with so few stones that they can no longer make a move.
		//When does the game end?
		//Firstly, when 0 stones remain.
		this.analysisOfpositions[0]="T"
		//But the game might not end at zero. For example, if taking 3, 5, or 6 stones is allowed, then when 1 or 2 stones remain in the pile - that is also the end of the game.
		//So, we need to find the minimum allowed move (it might not be 1).
		var minStep = this.currentGameRulesObject.allowedMoves[0]
		for (var i =0; i<this.currentGameRulesObject.allowedMoves.length; i++){
			if (this.currentGameRulesObject.allowedMoves[i]<minStep){
				minStep=this.currentGameRulesObject.allowedMoves[i]
			}
		}
		//now all positions less than the minimum allowed move are marked as "T" (Target)
		for (var i =0; i<minStep; i++){
			this.analysisOfpositions[i]="T"
		}
		//Next, we need to label all other positions.
		//Those positions from which one can reach a T or L in one move are marked as W (Winning).
		//Those positions from which all moves lead to W are L (Losing).
		//Repeat until everything is filled.
		for (var j=0; j<=this.analysisOfpositions.length; j++){//iterate through all positions
			if (this.analysisOfpositions[j]==""){//if the position is not yet defined
				//then we check all possible moves from it
				//if at least one move leads to an undefined position, we leave it undefined for now
				//if all moves lead to "W", we set it to "L" (i.e., if no matter how you move from here, the opponent wins, then you lose)
				//if at least one move leads to "L" or "T", then this is a "W" (if there is an opportunity to make the opponent lose, we make that move and win)
				
				//is there a move from this position to an undefined one?
				var hasUndefined=false;
				//is there a move from this position to a losing one (for the opponent)?
				var hasLoss = false;
				//iterate through all allowed moves from the rules
				for (var i = 0; i<this.currentGameRulesObject.allowedMoves.length; i++){
					//moveVal is the value of the allowed move
					var moveVal = this.currentGameRulesObject.allowedMoves[i];
					var newPos = j-moveVal;
					if (newPos>=0){
						if (this.analysisOfpositions[newPos]==""){
							hasUndefined=true
							break;
						}
						if (this.analysisOfpositions[newPos]=="T" || this.analysisOfpositions[newPos]=="L"){
							var hasLoss = true;
						}
					}
				}
				if (!hasUndefined){
					if (hasLoss){
						this.analysisOfpositions[j]="W" //Winning
					}else{
						this.analysisOfpositions[j]="L" //Losing
					}
				}
			}
		}
		// console.log("position analysis")
		// console.log(this.analysisOfpositions)			
	}

	
	makeMoveForSituation(gameDataOb){
		var selectedMoveVal = -1;
		//when the Universal bot makes a move, it iterates through all allowed moves
		for (var i=0; i<this.currentGameRulesObject.allowedMoves.length; i++){
			var moveVal = this.currentGameRulesObject.allowedMoves[i];
			var newPos = gameDataOb.N-moveVal;	
			if (newPos>=0){
				//if this move leads to a losing position (for the opponent), we must make it
				if (this.analysisOfpositions[newPos]=="T" || this.analysisOfpositions[newPos]=="L"){
					selectedMoveVal = moveVal;
					break;
				}else{
					//otherwise - choose a random move
					if (selectedMoveVal==-1 || Math.random()<1/(i+1)){
						selectedMoveVal = moveVal;
					}
				}
			}
		}
		return {n:selectedMoveVal}
	}	

}