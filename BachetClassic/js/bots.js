class Bot{
	constructor(nm){
		this.myName=nm
	}

	makeMoveForSituation(gameDataOb){
		return {}
	}
	//функції бота, що викликаються грою та дають змогу боту навчитися
	getInformedOfGameStart(){
	
	}

	getInformedOfVictory(){
	
	}

	getInformedOfDefeat(){
	
	}
}

class BachetBot1 extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//бере 1 завжди
		return {n:1}
	}	
}

class BachetBotRandom extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//бере 1, або 2 або 3 
		return {n:1+Math.floor(Math.random()*3)}
	}	
}

class BachetBotRandomFixed extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//бере 1, або 2 або 3 
		if (gameDataOb.N==1){
			return {n:1}
		}
		
		if (gameDataOb.N==2){
			return {n:1+Math.floor(Math.random()*2)}
		}

		return {n:1+Math.floor(Math.random()*3)}
	}	
}

class myBot extends Bot{
	makeMoveForSituation(gameDataOb){//
		//gameDataOb.N - поточне число камінців у купі
		
		// return {n:_якесь число яке бот має взяти з купи___}
	}	
}

class BachetLearnerBot extends Bot{
	static memory=[];//статичне поле, до якого мають доступ всі екземпляри класу
	/*
	 i-й елемент масиву memory показує, які будуть імовірності взяти деяку кількість камінців з купи у N=i штук
	Ініціалузуватися цей масив буде об'єктами:
	{1:3, 2:3, 3:3}
	//тобто шанси взяти 1, 2 чи 3 будуть рівними
	
	*/


	constructor(nm){
		super(nm);
		this.myMoves=[];
	}

	makeMoveForSituation(gameDataOb){
		//gameDataOb.N - це скільки камінців у купі, з якої нам треба зробити хід
		//якщо запитаної ситуації ще нема у пам'яті, то добудовуємо пам'ять
		while (BachetLearnerBot.memory.length<=gameDataOb.N){
			BachetLearnerBot.memory.push({1:3, 2:3, 3:3})
		}

		let memOb = BachetLearnerBot.memory[gameDataOb.N];
		//дізнаємося, скільки у комірці лежить фішок з можливими ходами
		let numMoves = memOb[1]+memOb[2]+memOb[3];
		//обираємо випадкову фішку
		let randId = Math.floor(Math.random()*numMoves)//
		let madeMove = 3;
		if (randId<memOb[1]){
			madeMove = 1;
		}else{
			if (randId<memOb[1]+memOb[2]){
				madeMove = 2;
			}
		}
		//запам'ятовуємо, з якої позиції який хід ми зробили
		this.myMoves.push({N:gameDataOb.N, n:madeMove})

		return {n:madeMove}
	}
	//функції бота, що викликаються грою та дають змогу боту навчитися
	getInformedOfGameStart(){
		this.myMoves.length=0;
	}

	getInformedOfVictory(){
		//якщо ми перемогли, ми маємо пройти по зроблених ходах
		//та більшити імовірніть тих ходів, що привели нас до виграшу
		for (let i=0; i<this.myMoves.length; i++){
			let moveOb = this.myMoves[i];
			//інформація про зроблений хід має вигляд об'єкту 
			//{N:57, n:3}
			let memOb = BachetLearnerBot.memory[moveOb.N]
			memOb[moveOb.n]+=1;
		}
	}

	getInformedOfDefeat(){
		//якщо ми програмли, ми маємо пройти по зроблених ходах
		//та зменшити імовірніть тих ходів, що привели нас до програшу
		for (let i=0; i<this.myMoves.length; i++){
			let moveOb = this.myMoves[i];
			//інформація про зроблений хід має вигляд об'єкту 
			//{N:57, n:3}
			let memOb = BachetLearnerBot.memory[moveOb.N]
			memOb[moveOb.n]-=1;
			if (memOb[moveOb.n]==0){
				memOb[1]+=1;
				memOb[2]+=1;
				memOb[3]+=1;
			}
		}		
	}	
}