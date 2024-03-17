window.onload=function(){
	console.log("Hello")
	// window.world = new BachetWorld();
	// world.startTournament([BachetBot1, BachetBot2],100)
	// window.world.startTournament([BachetBotRandom, BachetBotRandomFixed],1000)
	//window.world = new UniversalBachetWorld([1,2,3],true);
	// window.world.startTournament([BachetBotRandom, BachetBotRandomFixed],1, true)
	// window.world.startTournamentBetweenBots([new BachetBotRandom("A"), new BachetBotRandomFixed("B"), new BachetBotRandomFixed("C")],1000,2,false)
	//провести турнір між ботами із заданою поведінкою та еволюційними ботами
	//window.world.startTournamentBetweenBots([new BachetBot1("BOT1"), new BachetBotRandom("RND1"),  new BachetBotRandomFixed("RND2"), new Bot123("BEST"), new BachetLearnerBot("LEARN"), new EvoBot("A1"), new EvoBot("A2"),new EvoBot("A3"),new EvoBot("A4"),new EvoBot("A5")],1000,2,false)
	//залишити лише 5 еволюційних ботів з кращими результатами
	//window.world.keepNoMoreThanKBestBotsOfClass(EvoBot,10)
	//створити нових еволюційних ботів на основі тих, що пройшли відбір
	// window.world.createDescendantsOfBotsOfClass(EvoBot,"B")
	//тепер треба повторити турнір
	//window.world.startTournamentBetweenBots(window.world.allBots,100,2,false)
	//та подивитися, чи нові еволюційні боти дадуть кращий результат
	//створено світ, у якому можна брати 1, 2, 3, виграє той, хто роюбить останній хід, і не можна повторювати 1 попередній хід
	//window.world = new UniversalBachetWorldWithNoRepeats([1,2,3],true,1);
	//у цьому світі проводимо турнір з 4 ботів (див. опис ботів у bots.js)

/*
	let obs={}
	for (let i=0; i<1000000; i++){
		let ar=[1,2,3]
		mashAr(ar)
		let s=ar.join(",");
		if (obs[s]){
			obs[s]++
		}else{
			obs[s]=1
		}
	}

	console.log(obs)

	function mashAr(ar){
		
		ar.sort(()=> Math.random()-0.5)
		//алгоритм рівномірного тасування масиву, який видає усі можливі перестановки з однаковою імовірністю
	//	for (let i=0; i<ar.length-1; i++){
	//		//пробігаємо по свсіх елементах масиву
	//		//та міняємо місцями з випадковим елементом від даного (включаючи) до кінця
	//		let j = i+Math.floor(Math.random()*(ar.length-i))
	//		let t = ar[i]
	//		ar[i]=ar[j]
	//		ar[j]=t
	//	}
	}
	*/
}
