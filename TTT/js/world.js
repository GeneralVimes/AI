class World {
	constructor(){
		this.bots=[]//боти для конкретної серії ігор
		this.allBots=[]//боти для великого турніру. Звідси будуть бартися боти по двоє і запускатися серія ігор
		this.allBotsResults=[];//бали ботів у великому турнірі, у такому ж порядку, як і їхні номери у списку this.allBots
		this.tournamentScores={}//асоційований об'єкт: бали ботів у турнірі по їх іменах
		this.tournamentScoresByBots=new Map()//асоційований об'єкт: бали ботів у турнірі по їх посиланнях
	}
	//службова функція - вибір m чисел з масиву unselected до масиву selected
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

	//службова функція - перерахувати усі способи вибору m чисел з m
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
	 * @param {*} bots // які боти будуть брати участь у великому турнірі
	 * @param {*} numGames //скільки ігор проводити між кожною підгрупою ботів
	 * @param {*} numBotsInOneGame //по скільки ботів з загального списку обирати, щоб провести серію ігор
	 * @param {*} showLog //чи виводити лог
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
		//визначаємо всі способи обрати по numBotsInOneGame серед всіх ботів
		let botsIdsInGames = this.listSelectionsOfMFromN(numBotsInOneGame,this.allBots.length);
		
		//перемішуємо індивідуальні партії у випадковому порядку
		for (let i=0; i<botsIdsInGames.length; i++){
			for (let j=i+1; j<botsIdsInGames.length; j++){
				if (Math.random()<0.5){
					let tmp = botsIdsInGames[i];
					botsIdsInGames[i]=botsIdsInGames[j]
					botsIdsInGames[j]=tmp
				}
			}
		}

		//запускаємо партії між ботами
		for (let k=0; k<numGames; k++){
			//пробігаємо по всіх можливих групах ботів з загального списку для гри
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
		//виводимо результати турніру
		console.log("Bots Tournament results:",this.allBotsResults);
		console.log("Tournament results:", this.tournamentScores)
	}
	//простіший турнір для порівняння поведінки класів ботів
	startTournament(botsClasses, numGames, showLog=false){
		this.bots.length=0;
		//створюємо ботів для турніра
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
		//боти вже є
		this.initNewGamePosition();

		this.randomizeMoveOrder();

		this.informBotsOfGameStart()

		//доки гра не закінчена, робимо ходи
		let currentBotId = 0;
		while(true){//ходи продовжуємо, поки гра триває
			//будуємо ситуація для показу боту
			let ob = this.buildCurrentGameSituation()
			if (showLog)console.log("Situation ",ob)
			//який бот зараз ходить
			if (showLog)console.log("Bot ",currentBotId,this.bots[currentBotId].myName , "moves")
			let bot = this.bots[currentBotId]
			//показуємо боту ситуація та отримуємо від нього хід
			let botMove = bot.makeMoveForSituation(ob)
			if (showLog)console.log("Bot Move: ",botMove)
			//якщо хід задовольняє правилам
			if (this.validateMove(botMove)){
				//виконуємо цей хід
				this.makeBotMove(botMove);
				//якщо хід привів до завершення гри
				if (this.isGameOver()){
					if (showLog)console.log("GAME OVER! Calculating points...")
					//визначаємо, хто виграв, хто програв
					this.calculateGamePoints(currentBotId)
					break;
				}else{
					//якщо ні, визначаємо наступного гравця, який буде ходити
					currentBotId++;
					currentBotId%=this.bots.length
				}
			}else{
				//якщо хід не задовольняє правилам, то зупиняємо гру, зарахувавши боту програш
				if (showLog)console.log("BOT ERROR! Calculating points...")
				this.stopGameAfterBotError(currentBotId);
				break;
			}
		}
	}

	initNewGamePosition(){
	
	}
	//задаємо випадкову чергу ходів
	randomizeMoveOrder(){
		for (let i=0; i<this.bots.length-1; i++){
			//пробігаємо по свсіх елементах масиву
			//та міняємо місцями з випадковим елементом від даного (включаючи) до кінця
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
	//дати перемогу у грі боту з індексом botId
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
	//дати перемогу у грі усім ботам окрім бота з індексом botId
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

	//за результатами турніру видаляємо усіх ботів класу botClass, які не потрапили у K кращих
	keepNoMoreThanKBestBotsOfClass(botClass, K=10){
		//боти, що не відносяться до класу botClass залишаються
		let otherBots=[]
		//боти, що відносяться до класу botClass залишаються якщо потрапляють у К кращих
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
	//отримаємо від бота moveOb має бути {id:0..8}
	//перевіряємо, щоб число було цілим від 0 до 8, і щоб клітинка була вільна
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
	//moveOb має бути {id:0..8}
	makeBotMove(moveOb){
		let numX = 0;
		let numO = 0;
		//разуємо, скільки на дошці хрестиків та нуликів
		for (let i=0; i<=8; i++){
			if (this.board[i]=="X"){
				numX++
			}
			if (this.board[i]=="O"){
				numO++
			}
		}
		//якщо хрестиків однаково з нуліками, це хід хрестика, інакше - хід нулика
		if (numX==numO){
			this.board[moveOb["id"]]="X"
		}else{
			this.board[moveOb["id"]]="O"
		}
	}
	//можуть бути варіанти:
	//гра іде далі //-1
	//гра завершилася внічию //0
	//гра завершилася виграшем останнього гравця //1
	//гра завершилася програшем останнього гравця //2
	defineGameEnding(){
		//спочатку пошукаємо ряд з однакових символів
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
		//якщо лінію знайдено
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
			return 0//нічия
		}else{
			return -1//гра продовжується
		}
	}

	startGame(showLog=true){
		//боти вже є
		this.initNewGamePosition();

		this.randomizeMoveOrder();

		this.informBotsOfGameStart()

		//доки гра не закінчена, робимо ходи
		let currentBotId = 0;
		while(true){//ходи продовжуємо, поки гра триває
			//будуємо ситуація для показу боту
			let ob = this.buildCurrentGameSituation()
			if (showLog)console.log("Situation ",ob)
			//який бот зараз ходить
			if (showLog)console.log("Bot ",currentBotId,this.bots[currentBotId].myName , "moves")
			let bot = this.bots[currentBotId]
			//показуємо боту ситуація та отримуємо від нього хід
			let botMove = bot.makeMoveForSituation(ob)
			if (showLog)console.log("Bot Move: ",botMove)
			//якщо хід задовольняє правилам
			if (this.validateMove(botMove)){
				//виконуємо цей хід
				this.makeBotMove(botMove);
				//чи продовжується гра після ходу?
				let gameNextDo = this.defineGameEnding()
				if (gameNextDo==1){
					if (showLog)console.log("GAME OVER with victory! Calculating points...")
					//за виграш будемо давати 3 бали
					this.giveVictoryToSingleBot(currentBotId)
					this.giveVictoryToSingleBot(currentBotId)
					this.giveVictoryToSingleBot(currentBotId)
					break;
				}
				if (gameNextDo==0){//за нічию даємо обом гравцям по 1 балу
					if (showLog)console.log("GAME OVER with DRAW! Calculating points...")
					// this.calculateGamePoints(currentBotId,1)
					// this.calculateGamePoints(1-currentBotId,1)
					//щоб не писати нову функцію, будемо використовувати ту, 
					// яка дає бали усім ботам окрім бота -1 (тобто неіснуючого)
					this.giveDefeatToSingleBot(-1)
					break;
				}
				if (gameNextDo==-1){
					currentBotId++;
					currentBotId%=this.bots.length					
				}
			}else{
				//якщо хід не задовольняє правилам, то зупиняємо гру, зарахувавши боту програш
				if (showLog)console.log("BOT ERROR! Calculating points...")
				this.giveDefeatToSingleBot(currentBotId);
				break;
			}
		}
	}		
}

//що має вміти ігровий світ?
//влаштовувати турнір між ботами
//турнір складаєть з кількох ігор
	//кожна гра складається з:
	//генерується випадкове початкове число
	//ініцалізуються боти, їх задається випадкова черга ходу
	//відповідно черги ходу ботам повідомляється поточна ігрова ситуація 
	//на яку бот відповідає ходом, який хоче зробити
	//світ перевіряє, чи підпадає хід під правила гри
	//якщо так, то хід робиться, змінюється ігрова ситуація та хід переходить до наступного боту
	//якщо ні то, при некоректному ході зарахувати програш
	//гра продовжується, доки не настсне умова виграшу однієї за сторін
//після завершення гри оновлюємо результати ботів у турнірі
//після завершення турніру видаємо результати