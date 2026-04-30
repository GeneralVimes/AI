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

class UniversalBot extends Bot{
	constructor(nm){
		super(nm)
		//масив проаналізованих ігрових позицій
		this.analysisOfpositions=[]
	}
	//функція getInformedOfGameStart викликається на початку кожної окремої партії
	//у ній бот отримує об'єкт з правилами гри rulesOb
	//rulesOb має властивості:
	/*	{
		allowedMoves:[1,2,3],//масив дозволених ходів
		isLastMoveWinner:true,//чи виграє той, хто робить останній хід
		numPlayers:2//кількість гравців у одній партії
	}
	*/	
	getInformedOfGameStart(rulesOb){
		//бот копіює отриманий rulesOb собі this.currentGameRulesObject
		this.currentGameRulesObject=rulesOb
		//далі він починає аналізувати ігрові позиції та визначаємо їхній тип
		//спочатку тип усіх позицій - невизначений
		for (var i=0; i<=100; i++){
			this.analysisOfpositions[i] = "";
		}
		//у позицію кінця гри ставимо "Ц" - цільові. Адже основною метою гри є залишити супернику стільки камінців, щоб він вже не зміг зробити хід
		//коли наступає кінецб игр?
		//по-перше, коли залищається 0 камінців
		this.analysisOfpositions[0]="Ц"
		//але гра може закінчитися і не нулем. Наприклад, якщо дозволено брати 3, 5 або 6 камінців, то коли у купі залишається 1 або 2 камінці - це також кінець гри
		//отже, треба дізнатися мінімальний дозволений хід (він може бути і не 1)
		var minStep = this.currentGameRulesObject.allowedMoves[0]
		for (var i =0; i<this.currentGameRulesObject.allowedMoves.length; i++){
			if (this.currentGameRulesObject.allowedMoves[i]<minStep){
				minStep=this.currentGameRulesObject.allowedMoves[i]
			}
		}
		//тепер всі позиції що менше мінімального дозволеного ходу, позначаємо "Ц"
		for (var i =0; i<minStep; i++){
			this.analysisOfpositions[i]="Ц"
		}
		//Далі треба розмітити всі інші позиції
		//ті позиції, з яких одним ходом можна потрапити у Ц або П, ставимо В (виграш)
		//ті позиції, з яких всі ходи ведуть у В, це П
		//повторювати, поки не заповнимо все
		for (var j=0; j<=this.analysisOfpositions.length; j++){//пробігаємося по всіх позиціях
			if (this.analysisOfpositions[j]==""){//якщо позиція не визначена
				//то перебираємо всі можливі ходи з неї
				//якщо хоча б 1 хід веде у невизначену позицію, залишаємо її невизначено
				//якщо всі ходи ведуть у "В" то ставимо "П" (тобто, якщо як звідси не ходи, суперник виграє, то сам прораєш)
				//якщо хоча б 1 хід веде у "П" або "Ц", то це "В" (якщо є можливість зробити так, щоб суперник програв, то робимо такий хід і виграємо)
				
				//чи є з цієї позиції ходи у невизначені
				var hasUndefined=false;
				//чи є з цієї позиції ходи у програшні
				var hasLoss = false;
				//перебираємо всі дозволені ходи з правил
				for (var i = 0; i<this.currentGameRulesObject.allowedMoves.length; i++){
					//moveVal величина дозволеного ходу
					var moveVal = this.currentGameRulesObject.allowedMoves[i];
					var newPos = j-moveVal;
					if (newPos>=0){
						if (this.analysisOfpositions[newPos]==""){
							hasUndefined=true
							break;
						}
						if (this.analysisOfpositions[newPos]=="Ц" || this.analysisOfpositions[newPos]=="П"){
							var hasLoss = true;
						}
					}
				}
				if (!hasUndefined){
					if (hasLoss){
						this.analysisOfpositions[j]="В"
					}else{
						this.analysisOfpositions[j]="П"
					}
				}
			}
		}
		// console.log("аналіз позицій")
		// console.log(this.analysisOfpositions)			
	}

	
	makeMoveForSituation(gameDataOb){
		var selectedMoveVal = -1;
		//коли Універсальний бот робить хід, він перебирає всі дозволені правилами ходи
		for (var i=0; i<this.currentGameRulesObject.allowedMoves.length; i++){
			var moveVal = this.currentGameRulesObject.allowedMoves[i];
			var newPos = gameDataOb.N-moveVal;	
			if (newPos>=0){
				//якщо даний хід веде у програщну (для супротивника) позицію, маємо його зробити
				if (this.analysisOfpositions[newPos]=="Ц" || this.analysisOfpositions[newPos]=="П"){
					selectedMoveVal = moveVal;
					break;
				}else{
					//а інакше - обираємо випадковий хід
					if (selectedMoveVal==-1 || Math.random()<1/(i+1)){
						selectedMoveVal = moveVal;
					}
				}
			}
		}
		return {n:selectedMoveVal}
	}	

}