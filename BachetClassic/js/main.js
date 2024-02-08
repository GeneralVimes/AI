window.onload=function(){
	console.log("Hello")
	let world = new BachetWorld();
	world.startTournament([BachetBot1, BachetBot2],100)
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
