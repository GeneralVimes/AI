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

//бот, що вміє еволюціонувати
class EvoBotSimple extends Bot{
	constructor(nm, b1, b2){
		super(nm)
		//правила тут - масив зі 100 чисел, що містить ходи, які треба робити з усіх N
		this.rules=[]
		//якщо визначені обидва батьківських екземплари, виконуємо кроссовер
		//беремо части масиву з одного з них, частину - з іншого
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
			}else{//якщо визначений лише один з батьківських ботів, то створюємо мутацію на його основі
				this.rules = b1.rules.slice()
				//визначаємо число, яке будемо випадково змінювати
				let rid = this.randomNumberFromToIncl(1,100)
				//визначаємо нове значення цього числа з дозволених ходів
				this.rules[rid]=window.world.allowedMoves[Math.floor(Math.random()*window.world.allowedMoves.length)]
			}
		}else{
			//якщо ж створюємо бота з нуля, то заповнюємо його масив хаодів випадковими числами з числа дозволених ходів
			for (let i=0; i<=100; i++){
				this.rules.push(
					window.world.allowedMoves[Math.floor(Math.random()*window.world.allowedMoves.length)]
				)
			}
		}
	}
	
	makeMoveForSituation(gameDataOb){
		return {n:this.rules[gameDataOb.N]};
	}	
}

//еволюційний бот з ДНК, що побудована на правилах подільності
class EvoBotDiv extends Bot{
	constructor(nm, b1, b2){
		super(nm)
		//може бути свторений просто так, а можуть бути вказані 1 чи 2 батьківських ботів
		//масив правил, "ДНК" бота, що визначає його поведінку
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
						this.rules[rid].c = window.world.allowedMoves[Math.floor(Math.random()*window.world.allowedMoves.length)]
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
			//усі правила кодуються тріками чисел a, b, c і виглядають так: якщо N%a==b, взяти c
			for (let i=0; i<10; i++){
				this.createNewRule();
			}		
		}
	}

	createNewRule(r){
		let a = 2+Math.floor(Math.random()*8);
		let b = Math.floor(Math.random()*a);
		let c = window.world.allowedMoves[Math.floor(Math.random()*window.world.allowedMoves.length)]
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
