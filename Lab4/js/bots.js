class Bot{
	constructor(nm){
		this.myName=nm
		this.currentGameRulesObject=null
	}

	makeMoveForSituation(gameDataOb){
		return {}
	}
	//bot functions that are called by the game and allow the bot to learn
	getInformedOfGameStart(rulesOb){
		this.currentGameRulesObject=rulesOb
	}

	getInformedOfVictory(){
	
	}

	getInformedOfDefeat(){
	
	}
	//utility function for determining a random number
	randomNumberFromToIncl(a,b){
		return a+Math.floor(Math.random()*(b-a+1));
	}
}

class BachetBot1 extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//always takes 1
		return {n:1}
	}		
}


class BachetBot2Smart extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//always takes 2, but takes 1 if there is only 1 stone in the pile
		if (gameDataOb.N==1){
			return {n:1}
		}else{
			return {n:2}
		}
		
	}		
}

class BachetBot3Smart extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//takes 3 stones, but not more than the number of stones available in the pile
		return {n:Math.min(gameDataOb.N, 3)}
	}		
}

class BachetBotRandomSmart extends Bot{
	//gameDataOb {N:100}
	makeMoveForSituation(gameDataOb){//takes 1, 2, or 3, but does not try to take more than what is in the pile
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

//implements the winning strategy for Bachet's Game with allowed moves 1, 2, 3 and the case where the last stone must be taken to win
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

//a bot that can evolve
class EvoBotSimple extends Bot{
	constructor(nm, b1, b2){
		super(nm)
		//the rules here are an array of 100 numbers, containing the moves to be made for each N
		this.rules=[]
		//if both parent instances are defined, perform crossover
		//we take part of the array from one of them, and part from the other
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
			}else{//if only one parent bot is defined, we create a mutation based on it
				this.rules = b1.rules.slice()
				//determine the number to be randomly changed
				let rid = this.randomNumberFromToIncl(1,100)
				//determine the new value of this number from the allowed moves
				this.rules[rid]=window.world.allowedMoves[Math.floor(Math.random()*window.world.allowedMoves.length)]
			}
		}else{
			//if we are creating a bot from scratch, we fill its move array with random numbers from the allowed moves
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

//an evolutionary bot with DNA based on divisibility rules
class EvoBotDiv extends Bot{
	constructor(nm, b1, b2){
		super(nm)
		//can be created just like that, or one or two parent bots can be specified
		//array of rules, the "DNA" of the bot that determines its behavior
		this.rules=[]
		if (b1){
			if (b2){
				//if both parent bots are specified, the rules array is determined by crossing the parent rules
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
				//if there is only one parent bot, copy the rules from it, and then perform a random mutation
				for (let i=0; i<b1.rules.length; i++){
					this.createNewRule(b1.rules[i])
				}

				let mutationId = this.randomNumberFromToIncl(0,5);
				switch (mutationId){
					case 0:{//change 'a' in a random rule
						let rid = Math.floor(Math.random()*this.rules.length);
						this.rules[rid].a = 2+Math.floor(Math.random()*8);
						break;
					}
					case 1:{//change 'b' in a random rule
						let rid = Math.floor(Math.random()*this.rules.length);
						this.rules[rid].b = Math.floor(Math.random()*this.rules[rid].a);
						break;
					}
					case 2:{//change 'c' in a random rule
						let rid = Math.floor(Math.random()*this.rules.length);
						this.rules[rid].c = window.world.allowedMoves[Math.floor(Math.random()*window.world.allowedMoves.length)]
						break;
					}
					case 3:{//delete a random rule
						let rid = Math.floor(Math.random()*this.rules.length);
						this.rules.splice(rid,1)
						break;
					}
					case 4:{//create a new random rule
						this.createNewRule()
						break;
					}
					case 5:{//swap 2 rules
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
			//all rules are encoded by triplets of numbers a, b, c and look like this: if N%a==b, take c
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
	//the bot iterates through the existing rules, if it finds a suitable one - it will execute it, otherwise - it will make a random move
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