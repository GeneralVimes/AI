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

//bot for a human player (shows a message with the current board situation and asks for the cell number for the move)
class TTTHumanBot extends Bot{
	makeMoveForSituation(gameDataOb){//
		var s = "Game Situation:\n"
		s+=gameDataOb.board.slice(0,3).toString()+"\n"
		s+=gameDataOb.board.slice(3,6).toString()+"\n"
		s+=gameDataOb.board.slice(6,9).toString()+"\n"
		s+="make your move, "+this.myName

		let moveId = prompt(s)*1;
		return {id:moveId}
	}
	getInformedOfVictory(){
		alert("You won the game, "+this.myName+"!!! :)")
	}

	getInformedOfDefeat(){
		alert("You lost the game, "+this.myName+" :(")
	}	
}

class TTTLearnerBot extends Bot{
	static memory={}
	constructor(nm){
		super(nm);
		this.myMoves=[];
	}

	makeMoveForSituation(gameDataOb){
		let posCode = gameDataOb.board.toString();
		if (!(posCode in TTTLearnerBot.memory)){
			let freeCells=[]
			let probs = []
			for (let i=0; i<gameDataOb.board.length; i++){
				if (gameDataOb.board[i]=="_"){
					freeCells.push(i)
					probs.push(3)
				}else{
					probs.push(0)
				}
			}
			TTTLearnerBot.memory[posCode] = {probs:probs, free:freeCells}
		}

		let memAr = TTTLearnerBot.memory[posCode].probs;
		let s = 0;
		let freeIds=[]
		for (let i=0; i<memAr.length; i++){
			if (gameDataOb.board[i]=="_"){
				s+=memAr[i];
				freeIds.push(i)
			}
		}
		let rnd = Math.random()*s;
		
		let moveId=-1;
		for (var i=0; i<freeIds.length; i++){
			let rid=freeIds[i];
			if (rnd>=memAr[rid]){
				rnd-=memAr[rid]
			}else{
				moveId = rid
				break;
			}
		}

		if (moveId==-1){
			moveId = freeIds[Math.floor(Math.random()*freeIds.length)]
		}

		this.myMoves.push({pos:posCode, id:moveId})

		return {id:moveId}						

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
			//{pos:posCode, id:moveId}
			let memAr = TTTLearnerBot.memory[moveOb.pos].probs
			memAr[moveOb.id]+=1;

			let s = 0;
			for (let i=0; i<memAr.length; i++){
				s+=memAr[i];
			}
			//to prevent the numbers in memory from growing too large, upon reaching a total of 100 tokens
			//we will divide all tokens in half
			if (s>=100){
				for (let i=0; i<memAr.length; i++){
					memAr[i] = Math.floor(memAr[i]/2)
				}				
			}
		}
	}

	getInformedOfDefeat(){
		//if we lost, we must go through the moves made
		//and decrease the probability of those moves that led us to defeat
		for (let i=0; i<this.myMoves.length; i++){
			let moveOb = this.myMoves[i];
			//information about the move made has the form of an object 
			//{pos:posCode, id:moveId}
			let memAr = TTTLearnerBot.memory[moveOb.pos].probs
			let freeCells = TTTLearnerBot.memory[moveOb.pos].free
			//probabilities can be decreased in two ways
			//for large numbers, we will immediately divide them in half
			if(memAr[moveOb.id]>100){
				memAr[moveOb.id]=Math.floor(memAr[moveOb.id]/2)
			}else{//and from smaller ones - subtract one
				memAr[moveOb.id]-=1;
				if (memAr[moveOb.id]<=0){
					memAr[moveOb.id]=0;
					//if we removed the last token, and the total of other tokens is less than a hundred,
					//we will add 1 token of each type
					let s = 0;
					for (let i=0; i<freeCells.length; i++){
						let id = freeCells[i]
						s+=memAr[id];
					}					
					if (s<10){
						for (let i=0; i<freeCells.length; i++){
							let id = freeCells[i]
							memAr[id]+=1
						}
					}
				}			
			}
		}		
	}	
}
//this bot makes a move into a random empty cell
class TTTRandomBot extends Bot{
	makeMoveForSituation(gameDataOb){
		var movId=-1;
		var numFree=0
		for (let i=0; i<gameDataOb.board.length; i++){
			if (gameDataOb.board[i]=="_"){
				numFree+=1
				if (Math.random()<1/numFree){
					movId=i;
				}
			}
		}
		return {id:movId}
	}
}
//Create bots for Tic-Tac-Toe
//1. Makes a move into the very first empty cell (very simple)
//2. Makes a move into a random empty cell (this is done)
//3. Tries to make a line of the same symbols (harder)
//4. Tries to make a line of its own symbols, and if that's not possible - prevents the opponent from making their line (even harder)

//Arrange a competition - a 1-game tournament between the bot you wrote and TTTHumanBot, which you will play as