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

}

//Зробити ботів для Хрестиків-Нуликів
//1. Робить хід у найпершу вільну клітинку (дуже просто)
//2. Робить хід у випадкову вільну клітинку (просто)
//3. Намагається робити ряд з однакових символів (складніше)
//4. Намагається робити ряд зі своїх символів, а якщо це неможливо - завадити супернику зробити свій ряд (ще складніше)

//Влаштуйте змагання - турнір з 1 партії між написаним вами ботом та TTTHumanBot, за якого гратимете ви

class BachetBot1 extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//бере 1 завжди
		return {n:1}
	}		
}


