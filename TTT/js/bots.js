class Bot{
	constructor(nm){
		this.myName=nm
		this.currentGameRulesObject=null
	}

	makeMoveForSituation(gameDataOb){
		return {}
	}
	//функції бота, що викликаються грою та дають змогу боту навчитися
	getInformedOfGameStart(rulesOb){
		this.currentGameRulesObject=rulesOb
	}

	getInformedOfVictory(){
	
	}

	getInformedOfDefeat(){
	
	}
	//службова функція для визначення випадкового числа
	randomNumberFromToIncl(a,b){
		return a+Math.floor(Math.random()*(b-a+1));
	}
}

//бот для гравця-людини (показує повідомлення про поточну ситуацію на полі та питає номер клітинки для ходу)
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
	//функції бота, що викликаються грою та дають змогу боту навчитися
	getInformedOfGameStart(rulesOb){
		super.getInformedOfGameStart(rulesOb)
		this.myMoves.length=0;
	}

	getInformedOfVictory(){
		//якщо ми перемогли, ми маємо пройти по зроблених ходах
		//та більшити імовірніть тих ходів, що привели нас до виграшу
		for (let i=0; i<this.myMoves.length; i++){
			let moveOb = this.myMoves[i];
			//інформація про зроблений хід має вигляд об'єкту 
			//{pos:posCode, id:moveId}
			let memAr = TTTLearnerBot.memory[moveOb.pos].probs
			memAr[moveOb.id]+=1;

			let s = 0;
			for (let i=0; i<memAr.length; i++){
				s+=memAr[i];
			}
			//щоб числа у пам'яті не зростали сильно, ми, при досягненні кількості 1000 фішок
			//поділимо всі фишки навпіл
			if (s>=100){
				for (let i=0; i<memAr.length; i++){
					memAr[i] = Math.floor(memAr[i]/2)
				}				
			}
		}
	}

	getInformedOfDefeat(){
		//якщо ми програли, ми маємо пройти по зроблених ходах
		//та зменшити імовірніть тих ходів, що привели нас до програшу
		for (let i=0; i<this.myMoves.length; i++){
			let moveOb = this.myMoves[i];
			//інформація про зроблений хід має вигляд об'єкту 
			//{pos:posCode, id:moveId}
			let memAr = TTTLearnerBot.memory[moveOb.pos].probs
			let freeCells = TTTLearnerBot.memory[moveOb.pos].free
			//зменшувати імовірності можна двома способами
			//для великих чисел будемо одразу ділити їх навпіл
			if(memAr[moveOb.id]>100){
				memAr[moveOb.id]=Math.floor(memAr[moveOb.id]/2)
			}else{//а від менших - віднімати одиницю
				memAr[moveOb.id]-=1;
				if (memAr[moveOb.id]<=0){
					memAr[moveOb.id]=0;
					//якщо ми забрали останню фішку, а інших фішок загалом менше сотні,
					//то додамо по 1 фішці кожного виду
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
//цей бот робить хід у випадкову вільну клитину
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
//Зробити ботів для Хрестиків-Нуликів
//1. Робить хід у найпершу вільну клітинку (дуже просто)
//2. Робить хід у випадкову вільну клітинку (це зроблено)
//3. Намагається робити ряд з однакових символів (складніше)
//4. Намагається робити ряд зі своїх символів, а якщо це неможливо - завадити супернику зробити свій ряд (ще складніше)

//Влаштуйте змагання - турнір з 1 партії між написаним вами ботом та TTTHumanBot, за якого гратимете ви



