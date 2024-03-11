class World {
	constructor(){
		this.bots=[]//боти для конкретної серії ігор
		this.allBots=[]//боти для великого турніру. Звідси будуть бартися боти по двоє і запускатися серія ігор
		this.allBotsResults=[];//бали ботів у великому турнірі, у такому ж порядку, як і їхні номери у списку this.allBots
		this.tournamentScores={}//асоційований об'єкт: бали ботів у турнірі по їх іменах
		this.tournamentScoresByBots={}//асоційований об'єкт: бали ботів у турнірі по їх посиланнях
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
		}
		let botsIdsInGames = this.listSelectionsOfMFromN(numBotsInOneGame,this.allBots.length);
		//визначаємо всі способи обрати по numBotsInOneGame серед всіх ботів
		for (let i=0; i<botsIdsInGames.length; i++){
			let usedBotsInThisGame=botsIdsInGames[i];
			this.bots=[];
			for (let j=0; j<usedBotsInThisGame.length; j++){
				this.bots.push(this.allBots[usedBotsInThisGame[j]]);
			}
			//обираємо ботів для поточної серіїї ігор з загального списку ботів
			for (let i=0; i<numGames; i++){
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
	buildCurrentGameSituation(){
		return {}
	}

	calculateGamePoints(currentBotId){
	
	}

	informBotsOfGameStart(){
		for (let i=0; i<this.bots.length; i++){
			let bot = this.bots[i];
			bot.getInformedOfGameStart();
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
	//якщо ні, є 2 варіанти дій: а) зробити допустимий хід, якомога ближче до того, який бажає бот
	//б) при некоректному ході зарахувати програш
	//гра продовжується, доки не настсне умова виграшу однієї за сторін
//після завершення гри оновлюємо результати ботів у турнірі
//після завершення турніру видаємо результати

class BachetWorld extends World{
	constructor(){
		super()
		console.log("BachetWorld created")

		this.N = 100;
	}

	isGameOver(){
		return this.N<=0;
	}

	//{n:1..3}
	makeBotMove(moveOb){
		this.N-=moveOb.n
	}
	//moveOb має бути {n:1..3}
	validateMove(moveOb){
		let res = true;
		if (moveOb["n"]){
			if (Math.floor(moveOb["n"])===moveOb["n"]){
				if (moveOb["n"]>=1 && moveOb["n"]<=3){
					if (moveOb["n"]<=this.N){
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

	buildCurrentGameSituation(){
		return {N:this.N}
	}	

	initNewGamePosition(){
		this.N = Math.floor(50+Math.random()*50)
	}	

	calculateGamePoints(currentBotId){
		this.giveVictoryToSingleBot(currentBotId)
	}

	stopGameAfterBotError(botId){
		//перемога всім іншим
		this.giveDefeatToSingleBot(botId)
	}	
}

class UniversalBachetWorld extends BachetWorld{
	constructor(movesAr=[1,2,3], isLastMoveWinner=true){
		super()
		this.allowedMoves=movesAr;
		this.isLastPlayerWinner=isLastMoveWinner;
	}
	validateMove(moveOb){
		let res=false;
		if (moveOb["n"]){
			if (this.allowedMoves.indexOf(moveOb.n)!=-1){//якщо зроблений гравцем хід є серед дозволених
				if (moveOb.n<=this.N){
					res=true;
				}
			}
		}
		return res;
	}
	//гра завершена, коли каміння залишилося менше, ніж найменший можливий хід
	isGameOver(){
		let res=true;
		for (let i=0; i<this.allowedMoves.length; i++){
			if (this.allowedMoves[i]<=this.N){
				res=false;
				break;
			}
		}

		return res;
	}	
	//ця функція викликається після ходу, яких завершує гру
	calculateGamePoints(currentBotId){
		//currentBotId - номер бота, який зробив останній хід
		if (this.isLastPlayerWinner){
			this.giveVictoryToSingleBot(currentBotId)
		}else{
			this.giveDefeatToSingleBot(currentBotId)
		}
	}
}

class UniversalBachetWorldWithNoRepeats extends UniversalBachetWorld{
	constructor(movesAr=[1,2,3], isLastMoveWinner=true, nunNonRepeats=1){
		super(movesAr,isLastMoveWinner)
		this.numForbiddenRepeats=nunNonRepeats;
		this.forbiddenMoves=[];
	}
	validateMove(moveOb){
		let res = super.validateMove(moveOb)
		if (res){
			if (this.forbiddenMoves.indexOf(moveOb["n"])!=-1){
				res=false;
			}		
		}
		return res;
	}
	initNewGamePosition(){
		super.initNewGamePosition();
		this.forbiddenMoves.length=0;
	}
	//{n:1..3}
	makeBotMove(moveOb){
		this.N-=moveOb.n
		this.forbiddenMoves.push(moveOb.n);
		if (this.forbiddenMoves.length>this.numForbiddenRepeats){
			this.forbiddenMoves.splice(0,1)
		}
	}
	buildCurrentGameSituation(){
		return {N:this.N, forbiddenMoves:this.forbiddenMoves.slice()}
	}		
	isGameOver(){	
		let minPossibleMove=NaN;
		for (let i=0; i<this.allowedMoves.length; i++){
			let val = this.allowedMoves[i];
			if (this.forbiddenMoves.indexOf(val)==-1){
				if ((isNaN(minPossibleMove))||(val<minPossibleMove)){
					minPossibleMove=val;
				}
			}
		}
		return (minPossibleMove>this.N)||(this.N<=0);
	}
}