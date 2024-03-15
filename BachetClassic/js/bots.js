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

class Bot123 extends Bot{
	makeMoveForSituation(gameDataOb){//
		if (gameDataOb.N%4==0){
			return {n:1+Math.floor(Math.random()*2)}
		}else{
			return {n:gameDataOb.N%4}
		}
		
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
			if (memOb[moveOb.n]>=1000){
				memOb[1]=Math.floor(memOb[1]/2)
				memOb[2]=Math.floor(memOb[2]/2)
				memOb[3]=Math.floor(memOb[3]/2)		
			}
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
			if(memOb[moveOb.n]>1000){
				memOb[moveOb.n]=Math.floor(memOb[moveOb.n]/2)
			}else{
				memOb[moveOb.n]-=1;
				if (memOb[moveOb.n]==0){
					let s=memOb[1]+memOb[2]+memOb[3];
					if (s<100){
						memOb[1]+=1;
						memOb[2]+=1;
						memOb[3]+=1;
					}
					
				}			
			}

		}		
	}	
}
//бот, що вміє еволюціонувати
class EvoBot extends Bot{
	constructor(nm, b1, b2){
		super(nm)
		//може бути свторений просто так, а можуть бути вказані 1 чи 2 батьківських ботів
		//масив правид, "ДНК" бота, що визначає його поведінку
		this.rules=[]
		if (b1){
			if (b2){
				//якщо задані обидва батьківських боти, то масив правил визначається з батьківських правил схрещуванням
				let rulesDiv2 = this.randomNumberFromToIncl(Math.floor(b2.rules.length*0.2), Math.floor(b2.rules.length*0.8));
				let rulesDiv1 = this.randomNumberFromToIncl(Math.floor(b1.rules.length*0.2), Math.floor(b1.rules.length*0.8));
				if (Math.random()<0.5){
					for (let i=0; i<rulesDiv1; i++){
						this.createNewRule(b1.rules[i])
					}
					for (let i=rulesDiv2; i<b2.rules.length; i++){
						this.createNewRule(b2.rules[i])
					}
				}else{
					for (let i=0; i<rulesDiv2; i++){
						this.createNewRule(b2.rules[i])
					}
					for (let i=rulesDiv1; i<b1.rules.length; i++){
						this.createNewRule(b1.rules[i])
					}				
				}
			}else{
				//якщо батьківський бот один, то кипіюємо правила з нього, а потім робимо випадкову мутацію
				for (let i=0; i<b1.rules.length; i++){
					this.createNewRule(b1.rules[i])
				}

				let mutationId = this.randomNumberFromToIncl(0,5);
				switch (mutationId){
					case 0:{//міняємо а у випадковому правилі
						let rid = Math.floor(Math.random()*this.rules.length);
						this.rules[rid].a = 2+Math.floor(Math.random()*8);
						break;
					}
					case 1:{//міняємо b у випадковому правилі
						let rid = Math.floor(Math.random()*this.rules.length);
						this.rules[rid].b = Math.floor(Math.random()*this.rules[rid].a);
						break;
					}
					case 2:{//міняємо c у випадковому правилі
						let rid = Math.floor(Math.random()*this.rules.length);
						this.rules[rid].c = [1,2,3][Math.floor(Math.random()*3)]
						break;
					}
					case 3:{//видаляємо випадкове правило
						let rid = Math.floor(Math.random()*this.rules.length);
						this.rules.splice(rid,1)
						break;
					}
					case 4:{//створюємо нове випадкове правило
						this.createNewRule()
						break;
					}
					case 5:{//міняємо 2 правила місцями
						let rid1 = Math.floor(Math.random()*this.rules.length);
						let rid2 = Math.floor(Math.random()*this.rules.length);
						let t = this.rules[rid1]
						this.rules[rid1] = this.rules[rid2]
						this.rules[rid2] = t
						break;
					}
				}

			}
		}else{
			//усі правила виглядають так: якщо N%a==b, взяти c
			for (let i=0; i<10; i++){
				this.createNewRule();
			}		
		}
	}

	createNewRule(r){
		let a = 2+Math.floor(Math.random()*8);
		let b = Math.floor(Math.random()*a);
		let c = [1,2,3][Math.floor(Math.random()*3)]	
		if (r){
			a = r.a;
			b = r.b;
			c = r.c;
		}

		this.rules.push({a:a,b:b,c:c});	
	}
	//бот перебирає наявні правила, якщо знайде підходяще - виконає його, а якщо ні - зробить випадковий хід
	makeMoveForSituation(gameDataOb){
		let res = 1+Math.floor(Math.random()*3);
		for (let i=0; i<this.rules.length; i++){
			if (gameDataOb.N%this.rules[i].a==this.rules[i].b){
				res = this.rules[i].c;
				break;
			}
		}
		return {n:res};
	}
}

//аналогічний бот, що вміє еволюціонувати
class EvoBot2 extends Bot{
	constructor(nm, b1, b2){
		super(nm)
		//правила тут - масив зі 100 чисел, що містить ходи, які треба робити з усіх N
		this.rules=[]
		if (b1){
			if (b2){
				let rulesDiv = this.randomNumberFromToIncl(Math.floor(b2.rules.length*0.2), Math.floor(b2.rules.length*0.8));
				if (Math.random()<0.5){
					for (let i=0; i<rulesDiv; i++){
						this.rules.push(b1.rules[i])
					}
					for (let i=rulesDiv; i<b2.rules.length; i++){
						this.rules.push(b2.rules[i])
					}
				}else{
					for (let i=0; i<rulesDiv; i++){
						this.rules.push(b2.rules[i])
					}
					for (let i=rulesDiv; i<b1.rules.length; i++){
						this.rules.push(b1.rules[i])
					}				
				}
			}else{
				this.rules=b1.rules.slice();
				let rid = this.randomNumberFromToIncl(1,100)
				this.rules[rid]=this.randomNumberFromToIncl(1,3);
			}
		}else{
			for (let i=0; i<=100; i++){
				this.rules.push(this.randomNumberFromToIncl(1,3))
			}
		}
	}
	
	makeMoveForSituation(gameDataOb){
		return {n:this.rules[gameDataOb.N]};
	}	
}

//бот для світу без потовріх ходів. Завжди робить мінімальний дозволений правилами хід
class BotNoRepeatsMinimal123 extends Bot{
	//об'єкт gameDataOb, який він отримує від світу, мість 2 поля:
	//N - поточну кількість камінців та forbiddenMoves - масив заборонених на даний момент  ходів
	makeMoveForSituation(gameDataOb){
		let allMoves=[1,2,3]
		let move = allMoves[0]
		for (let i=0; i<allMoves.length; i++){
			move = allMoves[i];
			if (gameDataOb.forbiddenMoves.indexOf(move)==-1){
				break;
			}
		}
		return {n:move}
	}
}

//бот для світу без потовріх ходів. Завжди робить максимальний дозволений правилами хід
class BotNoRepeatsMaximall123 extends Bot{
	//об'єкт gameDataOb, який він отримує від світу, мість 2 поля:
	//N - поточну кількість камінців та forbiddenMoves - масив заборонених на даний момент  ходів
	makeMoveForSituation(gameDataOb){
		let allMoves=[1,2,3]
		let move = allMoves[allMoves.length-1]
		for (let i=allMoves.length-1; i>=0; i--){
			move = allMoves[i];
			if (move<=gameDataOb.N){
				if (gameDataOb.forbiddenMoves.indexOf(move)==-1){
					break;
				}			
			}

		}
		return {n:move}
	}
}
//бот для світу без потовріх ходів. Завжди робить випадковий дозволений правилами хід
class BotNoRepeatsRandom123 extends Bot{
	//об'єкт gameDataOb, який він отримує від світу, мість 2 поля:
	//N - поточну кількість камінців та forbiddenMoves - масив заборонених на даний момент  ходів
	makeMoveForSituation(gameDataOb){
		let allMoves=[1,2,3]
		let move = 1;
		allMoves = allMoves.filter((value)=>gameDataOb.forbiddenMoves.indexOf(value)==-1);
		if (allMoves.length>0){
			move = allMoves[Math.floor(Math.random()*allMoves.length)]
		}
		return {n:move}
	}
}

class BachetNoRepeatsLearnerBot extends Bot{
	static memory={};//статичне поле, до якого мають доступ всі екземпляри класу
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
		let posCode=""+gameDataOb.N+"|"+gameDataOb.forbiddenMoves.join("_")
		if (!BachetNoRepeatsLearnerBot.memory[posCode]){
			BachetNoRepeatsLearnerBot.memory[posCode] = {1:3, 2:3, 3:3}
		}
		

		let memOb = BachetNoRepeatsLearnerBot.memory[posCode];
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
		this.myMoves.push({pos:posCode, n:madeMove})

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
			//{pos:15|2, n:3}//з позиції 15 камінців та забороненого ходу 2 було взято 3 камінці
			let memOb = BachetNoRepeatsLearnerBot.memory[moveOb.pos]
			memOb[moveOb.n]+=1;
			if (memOb[moveOb.n]>=1000){
				memOb[1]=Math.floor(memOb[1]/2)
				memOb[2]=Math.floor(memOb[2]/2)
				memOb[3]=Math.floor(memOb[3]/2)		
			}
		}
	}

	getInformedOfDefeat(){
		//якщо ми програмли, ми маємо пройти по зроблених ходах
		//та зменшити імовірніть тих ходів, що привели нас до програшу
		for (let i=0; i<this.myMoves.length; i++){
			let moveOb = this.myMoves[i];
			//інформація про зроблений хід має вигляд об'єкту 
			//{pos:15|2, n:3}//з позиції 15 камінців та забороненого ходу 2 було взято 3 камінці
			let memOb = BachetNoRepeatsLearnerBot.memory[moveOb.pos]
			if(memOb[moveOb.n]>1000){
				memOb[moveOb.n]=Math.floor(memOb[moveOb.n]/2)
			}else{
				memOb[moveOb.n]-=1;
				if (memOb[moveOb.n]==0){
					let s=memOb[1]+memOb[2]+memOb[3];
					if (s<100){
						memOb[1]+=1;
						memOb[2]+=1;
						memOb[3]+=1;
					}
					
				}			
			}

		}		
	}	
}