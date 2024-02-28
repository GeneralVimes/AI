class World {
	constructor(){
		this.bots=[]//боти для конкретної серії ігор
		this.allBots=[]//боти для великого турніру. Звідси будуть бартися боти по двоє і запускатися серія ігор
		this.allBotsResults=[];//бали ботів у великому турнірі, у такому ж порядку, як і їхні номери у списку this.allBots
		this.tournamentScores={}//асоційований об'єкт: бали ботів у турнірі по їх іменах
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
		while(!this.isGameOver()){//ходи продовжуємо, поки гра триває
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
					//визначаємо, хто виграв, хто програв
					this.calculateGamePoints(currentBotId)
				}else{
					//якщо ні, визначаємо наступного гравця, який буде ходити
					currentBotId++;
					currentBotId%=this.bots.length
				}
			}else{
				//якщо хід не задовольняє правилам, то зупиняємо гру, зарахувавши боту програш
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