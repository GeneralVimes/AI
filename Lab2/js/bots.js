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

class BachetBot1 extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//бере 1 завжди
		return {n:1}
	}		
}


class BachetBot2Smart extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//бере 2 завжди, але бере 1, якщо у купі є лише 1 камінь
		if (gameDataOb.N==1){
			return {n:1}
		}else{
			return {n:2}
		}
		
	}		
}

class BachetBot3Smart extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//бере 3 каменя, але не більше, ніж наявних камінців у купі
		return {n:Math.min(gameDataOb.N, 3)}
	}		
}

class BachetBotRandomSmart extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//бере 1, або 2 або 3, але не намагається взяти більше, ніж є у купі
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

//реалізує виграшну стратегію для гри Баше з допустимими ходами 1, 2, 3 та випадком колои треба забрати останній камінь
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
		//і вираховуємо, чи ця фішка з цифрою 1, чи з цифрою 2, чи з цифрою 3
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
			//{N:57, n:3}
			let memOb = BachetLearnerBot.memory[moveOb.N]
			memOb[moveOb.n]+=1;
			//щоб числа у пам'яті не зростали сильно, ми, при досягненні кількості 1000 фішок
			//поділимо всі фишки навпіл
			if (memOb[moveOb.n]>=1000){
				memOb[1]=Math.floor(memOb[1]/2)
				memOb[2]=Math.floor(memOb[2]/2)
				memOb[3]=Math.floor(memOb[3]/2)		
			}
		}
	}

	getInformedOfDefeat(){
		//якщо ми програли, ми маємо пройти по зроблених ходах
		//та зменшити імовірніть тих ходів, що привели нас до програшу
		for (let i=0; i<this.myMoves.length; i++){
			let moveOb = this.myMoves[i];
			//інформація про зроблений хід має вигляд об'єкту 
			//{N:57, n:3}
			let memOb = BachetLearnerBot.memory[moveOb.N]
			//зменшувати імовірності можна двома способами
			//для великих чисел будемо одразу ділити їх навпіл
			if(memOb[moveOb.n]>1000){
				memOb[moveOb.n]=Math.floor(memOb[moveOb.n]/2)
			}else{//а від менших - віднімати одиницю
				memOb[moveOb.n]-=1;
				if (memOb[moveOb.n]<=0){
					memOb[moveOb.n]=0;
					//якщо ми забрали останню фішку, а інших фішок загалом менше сотні,
					//то додамо по 1 фішці кожного виду
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

