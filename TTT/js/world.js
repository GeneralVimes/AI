class World {
	constructor(){
		this.bots=[]//bots for a specific series of games
		this.allBots=[]//bots for a grand tournament. Bots will be taken from here in pairs to start a series of games
		this.allBotsResults=[];//scores of bots in the grand tournament, in the same order as their indices in the this.allBots list
		this.tournamentScores={}//associative object: bot scores in the tournament by their names
		this.tournamentScoresByBots=new Map()//associative object: bot scores in the tournament by their references
	}
	//utility function - selects m numbers from the unselected array into the selected array
	recursivelySelect(res, m, selected, unselected){
		if (m==0){
			res.push(selected);
			return;
		}
		for (let i=0; i<=unselected.length-m; i++){
			let a = unselected[i];
            let newSelected = selected.slice()
            newSelected.push(a)
			this.recursivelySelect(res, m-1, newSelected, unselected.slice(i+1))
		}
	}

	findRandomIdFromWeightedAr(ar, forbiddenId=-1){
		let res=-1
		let sum = 0;
		for (let i=0; i<ar.length; i++){
			if (i!=forbiddenId){
				sum+=ar[i]
			}
		}
		let rnd = Math.random()*sum;
		let rid=0;
		while((rid==forbiddenId) || (ar[rid]<=rnd)){
			if (rid!=forbiddenId){
				rnd-=ar[rid];
			}
			rid++;
		}
		res=rid;
		return res;
	}

	//utility function - list all ways to choose m numbers from n
	listSelectionsOfMFromN(m, n){
		let res=[];
		let ar2Select=[];
		for (let i=0; i<n; i++){
			ar2Select.push(i);
		}
		this.recursivelySelect(res,m,[],ar2Select)
		return res;
	}
	/**
	 * 
	 * @param {*} bots // which bots will participate in the grand tournament
	 * @param {*} numGames //how many games to play between each subgroup of bots
	 * @param {*} numBotsInOneGame //how many bots to select from the general list to play a series of games
	 * @param {*} showLog //whether to display the log
	 */
	startTournamentBetweenBots(bots, numGames, numBotsInOneGame=2, showLog=false){
		this.allBots = bots;
		this.allBotsResults=[];
		this.tournamentScores={}
		this.tournamentScoresByBots=new Map();
		for (let i=0; i<this.allBots.length; i++){
			this.allBotsResults.push(0);
			this.tournamentScores[this.allBots[i].myName]=0
			this.tournamentScoresByBots.set(this.allBots[i],0);
		}
		//determine all ways to choose numBotsInOneGame from all bots
		let botsIdsInGames = this.listSelectionsOfMFromN(numBotsInOneGame,this.allBots.length);
		
		//shuffle the individual matches in random order
		for (let i=0; i<botsIdsInGames.length; i++){
			for (let j=i+1; j<botsIdsInGames.length; j++){
				if (Math.random()<0.5){
					let tmp = botsIdsInGames[i];
					botsIdsInGames[i]=botsIdsInGames[j]
					botsIdsInGames[j]=tmp
				}
			}
		}

		//start the matches between bots
		for (let k=0; k<numGames; k++){
			//iterate through all possible groups of bots from the general list for a game
			for (let i=0; i<botsIdsInGames.length; i++){
				let usedBotsInThisGame=botsIdsInGames[i];
				//console.log(usedBotsInThisGame)
				this.bots=[];
				for (let j=0; j<usedBotsInThisGame.length; j++){
					this.bots.push(this.allBots[usedBotsInThisGame[j]]);
				}
				this.startGame(showLog)
			}			
		}
		//display the tournament results
		console.log("Bots Tournament results:",this.allBotsResults);
		console.log("Tournament results:", this.tournamentScores)
	}
	//a simpler tournament for comparing the behavior of bot classes
	startTournament(botsClasses, numGames, showLog=false){
		this.bots.length=0;
		//create bots for the tournament
		for (let i=0; i<botsClasses.length; i++){
			let b = new botsClasses[i](botsClasses[i].name+"_"+i);
			this.bots.push(b)
		}
		this.tournamentScores={}
		this.tournamentScoresByBots.clear()

		for (let i=0; i<numGames; i++){
			this.startGame(showLog)
		}
		console.log("Tournament results:", this.tournamentScores)
	}

	startGame(showLog=true){
		//bots already exist
		this.initNewGamePosition();

		this.randomizeMoveOrder();

		this.informBotsOfGameStart()

		//as long as the game is not over, make moves
		let currentBotId = 0;
		while(true){//we continue making moves while the game lasts
			//build the situation to show to the bot
			let ob = this.buildCurrentGameSituation()
			if (showLog)console.log("Situation ",ob)
			//which bot is currently moving
			if (showLog)console.log("Bot ",currentBotId,this.bots[currentBotId].myName , "moves")
			let bot = this.bots[currentBotId]
			//show the situation to the bot and get a move from it
			let botMove = bot.makeMoveForSituation(ob)
			if (showLog)console.log("Bot Move: ",botMove)
			//if the move satisfies the rules
			if (this.validateMove(botMove)){
				//execute this move
				this.makeBotMove(botMove);
				//if the move led to the end of the game
				if (this.isGameOver()){
					if (showLog)console.log("GAME OVER! Calculating points...")
					//determine who won and who lost
					this.calculateGamePoints(currentBotId)
					break;
				}else{
					//if not, determine the next player to move
					currentBotId++;
					currentBotId%=this.bots.length
				}
			}else{
				//if the move does not satisfy the rules, stop the game, counting it as a loss for the bot
				if (showLog)console.log("BOT ERROR! Calculating points...")
				this.stopGameAfterBotError(currentBotId);
				break;
			}
		}
	}

	initNewGamePosition(){
	
	}
	//set a random move order
	randomizeMoveOrder(){
		for (let i=0; i<this.bots.length-1; i++){
			//iterate through all elements of the array
			//and swap with a random element from the current one (inclusive) to the end
			let j = i+Math.floor(Math.random()*(this.bots.length-i))
			let t = this.bots[i]
			this.bots[i]=this.bots[j]
			this.bots[j]=t
		}		
	}

	isGameOver(){
		return false;
	}
	makeBotMove(moveOb){
	
	}
	stopGameAfterBotError(botId){
	
	}
	validateMove(moveOb){
		return true
	}

	buildCurrentRulesObject(){
		return {}
	}

	buildCurrentGameSituation(){
		return {}
	}

	calculateGamePoints(currentBotId){
	
	}

	informBotsOfGameStart(){
		for (let i=0; i<this.bots.length; i++){
			let bot = this.bots[i];
			let currentRulesOb = this.buildCurrentRulesObject()
			bot.getInformedOfGameStart(currentRulesOb);
		}
	}
	//give victory in the game to the bot with index botId
	giveVictoryToSingleBot(botId){
		for (let i=0; i<this.bots.length; i++){
			let bot = this.bots[i];
			if (i==botId){
				if (this.tournamentScores[bot.myName]){
					this.tournamentScores[bot.myName]++
				}else{
					this.tournamentScores[bot.myName]=1
				}
				if (this.tournamentScoresByBots.has(bot)){
					this.tournamentScoresByBots.set(bot,this.tournamentScoresByBots.get(bot)+1)
				}else{
					this.tournamentScoresByBots.set(bot,1)
				}

				let bid = this.allBots.indexOf(bot)
				if (bid!=-1){
					this.allBotsResults[bid]+=1
				}
				
				bot.getInformedOfVictory()
			}else{
				bot.getInformedOfDefeat()
			}
		}
	}
	//give victory in the game to all bots except the bot with index botId
	giveDefeatToSingleBot(botId){
		for (let i=0; i<this.bots.length; i++){
			let bot = this.bots[i];
			if (i!=botId){
				if (this.tournamentScores[bot.myName]){
					this.tournamentScores[bot.myName]++
				}else{
					this.tournamentScores[bot.myName]=1
				}	
				if (this.tournamentScoresByBots.has(bot)){
					this.tournamentScoresByBots.set(bot,this.tournamentScoresByBots.get(bot)+1)
				}else{
					this.tournamentScoresByBots.set(bot,1)
				}	
				
				let bid = this.allBots.indexOf(bot)
				if (bid!=-1){
					this.allBotsResults[bid]+=1
				}

				bot.getInformedOfVictory()	
			}else{
				bot.getInformedOfDefeat()
			}
		}	
	}

	//based on tournament results, remove all bots of botClass that are not in the top K
	keepNoMoreThanKBestBotsOfClass(botClass, K=10){
		//bots that do not belong to botClass remain
		let otherBots=[]
		//bots belonging to botClass remain if they are in the top K
		let bots2Keep=[];
		let botsScores2Keep=[];
		for (let i=0; i<this.allBots.length; i++){
			let bot = this.allBots[i];
			if (bot instanceof botClass){
				let score = this.findLastTournamentScoreOfBot(bot)
				let needsSorting=false;
				if (bots2Keep.length<K){
					bots2Keep.push(bot)
					botsScores2Keep.push(score)
					needsSorting=true;
				}else{
					if (botsScores2Keep[botsScores2Keep.length-1]<score){
						botsScores2Keep[botsScores2Keep.length-1]=score;
						bots2Keep[bots2Keep.length-1]=bot;
						needsSorting=true
					}
				}
				if (needsSorting){
					for (let j=botsScores2Keep.length-1; j>=1; j--){
						if (botsScores2Keep[j-1]<botsScores2Keep[j]){
							let t = botsScores2Keep[j-1];
							botsScores2Keep[j-1]=botsScores2Keep[j]
							botsScores2Keep[j]=t

							let b = bots2Keep[j-1];
							bots2Keep[j-1]=bots2Keep[j]
							bots2Keep[j]=b;
						}
					}
				}
			}else{
				otherBots.push(bot)
			}
		}

		this.allBots=otherBots;
		for (let i=0; i<bots2Keep.length; i++){
			this.allBots.push(bots2Keep[i]);
		}
	}

	createDescendantsOfBotsOfClass(botClass, nameStart="A"){
		let len = this.allBots.length
		for (let i=0; i<len; i++){
			let b1 = this.allBots[i];
			if (b1 instanceof botClass){
				let b = new botClass(nameStart+"_"+i, b1)
				this.allBots.push(b)
				for (let j=i+1; j<len; j++){
					let b2 = this.allBots[j];
					if (b2 instanceof botClass){
						let b = new botClass(nameStart+"_"+i+"_"+j, b1, b2)
						this.allBots.push(b)
					}
				}
			}
		}
	}

	createOnlyKDescendantsOfBestBotsOfClass(botClass, K=10, nameStart="A"){
		let len = this.allBots.length
		let parentsPool=[];
		let parentsWeights=[]
		
		for (let i=0; i<len; i++){
			let b1 = this.allBots[i];
			if (b1 instanceof botClass){
				parentsPool.push(b1);
				parentsWeights.push(this.findLastTournamentScoreOfBot(b1))
			}
		}

		let minParWeight=-1;
		let maxParWeight=-1;
		for (let i=0; i<parentsWeights.length; i++){			
			//sumOfParWeights+=parentsWeights[i];
			if ((minParWeight==-1) || (minParWeight>parentsWeights[i])){
				minParWeight=parentsWeights[i]
			}
			if ((maxParWeight==-1) || (maxParWeight<parentsWeights[i])){
				maxParWeight=parentsWeights[i]
			}
		}

		let coef=1;
		if (maxParWeight!=minParWeight){
			coef = 1/(maxParWeight-minParWeight)
		}

		for (let i=0; i<parentsWeights.length; i++){	
			parentsWeights[i] = Math.exp((parentsWeights[i]-minParWeight)*coef);
		}


		for (let i=0; i<K; i++){
			let usePairOfBots = Math.random()<0.8;
			if (parentsPool.length<2){
				usePairOfBots=false;
			}
			if (usePairOfBots){
				let id1 = this.findRandomIdFromWeightedAr(parentsWeights)
				let id2 = this.findRandomIdFromWeightedAr(parentsWeights,id1)
				let b = new botClass(nameStart+"_"+id1+"_"+id2, parentsPool[id1], parentsPool[id2])
				this.allBots.push(b)
			}else{
				let id1 = this.findRandomIdFromWeightedAr(parentsWeights)
				let b = new botClass(nameStart+"_"+i, parentsPool[id1])
				this.allBots.push(b)
			}
		}		
	}


	findLastTournamentScoreOfBot(bot){
		if (this.tournamentScoresByBots.has(bot)){
			return this.tournamentScoresByBots.get(bot)
		}else{
			return 0;
		}
	}

	createKNewBotsOfClass(botClass,K,  nameStart="A"){
		let len = this.allBots.length
		for (let i=0; i<K; i++){
			let b = new botClass(nameStart+"_"+(len+i))
			this.allBots.push(b)
		}
	}

	findBestTournamentResultOfBotsOfClass(botClass){
		let res=0;
		let len = this.allBots.length
		for (let i=0; i<len; i++){
			let b = this.allBots[i];
			if (b instanceof botClass){
				res = Math.max(res, this.findLastTournamentScoreOfBot(b))
			}
		}
		return res;
	}

	findAverageTournamentResultOfBotsOfClass(botClass){
		let sum=0;
		let num=0
		let len = this.allBots.length
		for (let i=0; i<len; i++){
			let b = this.allBots[i];
			if (b instanceof botClass){
				sum += this.findLastTournamentScoreOfBot(b)
				num+=1
			}
		}
		if (num==0){
			return 0
		}else{
			return sum/num
		}
	}
}

class TTTWorld extends World{
	constructor(){
		super()
		console.log("TTTWorld created")
		this.board = ["_","_","_","_","_","_","_","_","_"]
		//this.N = 100;
	}	

	initNewGamePosition(){
		for (let i=0; i<9; i++){
			this.board[i]="_";
		}
		//this.board="X,_,_,_,O,_,_,_,X".split(",")
	}

	buildCurrentGameSituation(){
		return{
			board:this.board.slice()
		}
	}
	//get moveOb from bot, must be {id:0..8}
	//check that the number is an integer from 0 to 8, and that the cell is free
	validateMove(moveOb){
		let res = true;
		if ("id" in moveOb){
			if (Math.floor(moveOb["id"])===moveOb["id"]){
				if (moveOb["id"]>=0 && moveOb["id"]<=8){
					if (this.board[moveOb["id"]]=="_"){
						res=true;
					}else{
						res=false;
					}
				}else{
					res=false;
				}
			}else{
				res=false;
			}
		}else{
			res=false;
		}

		return res		
	}
	//moveOb must be {id:0..8}
	makeBotMove(moveOb){
		let numX = 0;
		let numO = 0;
		//count how many X's and O's are on the board
		for (let i=0; i<=8; i++){
			if (this.board[i]=="X"){
				numX++
			}
			if (this.board[i]=="O"){
				numO++
			}
		}
		//if the number of X's is equal to the number of O's, it's X's turn, otherwise - it's O's turn
		if (numX==numO){
			this.board[moveOb["id"]]="X"
		}else{
			this.board[moveOb["id"]]="O"
		}
	}
	//possible options:
	//game continues //-1
	//game ended in a draw //0
	//game ended with the last player winning //1
	//game ended with the last player losing //2
	defineGameEnding(){
		//first, let's look for a line of identical symbols
		let possibleStarts=[0,3,6,0,1,2,0,2];
		let possibleSteps=[1,1,1,3,3,3,4,2];
		var hasLine = false;
		for (let i=0; i<possibleStarts.length; i++){
			let start = possibleStarts[i]
			let step = possibleSteps[i]
			if (this.board[start]!="_"){
				if (this.board[start+step]==this.board[start]){
					if (this.board[start+2*step]==this.board[start]){
						hasLine = true;
						break;
					}
				}
			}
		}
		//if a line is found
		if (hasLine){
			return 1
		}
		var canBeDraw=true
		for (let i=0; i<this.board.length; i++){
			if (this.board[i]=="_"){
				canBeDraw=false;
				break;
			}
		}
		if (canBeDraw){
			return 0//draw
		}else{
			return -1//game continues
		}
	}

	startGame(showLog=true){
		//bots already exist
		this.initNewGamePosition();

		this.randomizeMoveOrder();

		this.informBotsOfGameStart()

		//as long as the game is not over, make moves
		let currentBotId = 0;
		while(true){//we continue making moves while the game lasts
			//build the situation to show to the bot
			let ob = this.buildCurrentGameSituation()
			if (showLog)console.log("Situation ",ob)
			//which bot is currently moving
			if (showLog)console.log("Bot ",currentBotId,this.bots[currentBotId].myName , "moves")
			let bot = this.bots[currentBotId]
			//show the situation to the bot and get a move from it
			let botMove = bot.makeMoveForSituation(ob)
			if (showLog)console.log("Bot Move: ",botMove)
			//if the move satisfies the rules
			if (this.validateMove(botMove)){
				//execute this move
				this.makeBotMove(botMove);
				//does the game continue after the move?
				let gameNextDo = this.defineGameEnding()
				if (gameNextDo==1){
					if (showLog)console.log("GAME OVER with victory! Calculating points...")
					//we will give 3 points for a win
					this.giveVictoryToSingleBot(currentBotId)
					this.giveVictoryToSingleBot(currentBotId)
					this.giveVictoryToSingleBot(currentBotId)
					break;
				}
				if (gameNextDo==0){//for a draw, we give both players 1 point each
					if (showLog)console.log("GAME OVER with DRAW! Calculating points...")
					// this.calculateGamePoints(currentBotId,1)
					// this.calculateGamePoints(1-currentBotId,1)
					//to avoid writing a new function, we will use the one
					//that gives points to all bots except bot -1 (i.e., a non-existent one)
					this.giveDefeatToSingleBot(-1)
					break;
				}
				if (gameNextDo==-1){
					currentBotId++;
					currentBotId%=this.bots.length					
				}
			}else{
				//if the move does not satisfy the rules, stop the game, counting it as a loss for the bot
				if (showLog)console.log("BOT ERROR! Calculating points...")
				this.giveDefeatToSingleBot(currentBotId);
				break;
			}
		}
	}		
}

//what should the game world be able to do?
//- organize a tournament between bots
//- a tournament consists of several games
//	- each game consists of:
//	- a random initial state is generated
//	- bots are initialized, a random turn order is set for them
//	- according to the turn order, bots are informed of the current game situation
//	- to which the bot responds with the move it wants to make
//	- the world checks if the move follows the game rules
//	- if so, the move is made, the game situation changes, and the turn passes to the next bot
//	- if not, count an incorrect move as a loss
//	- the game continues until a win condition for one of the sides is met
//- after the game ends, we update the bot results in the tournament
//- after the tournament ends, we issue the results