window.onload=function(){
	console.log("Hello")
	//дозволяється брати 1, 3 або 5 каменів, той, хто зробить останній хід, виграє
	window.world = new UniversalBachetWorld([1,3,5],true);
	//дозволяється брати 1, 3 або 6 каменів, той, хто зробить останній хід, програє
	//window.world = new UniversalBachetWorld([1,3,6],true);
	//дозволяється брати 1, 2 або 3 каменя, але не можна повторювати попередній хід суперника. Той, хто зробить останній дозволений хід, віиграє
	//window.world = new UniversalBachetWorldWithNoRepeats([1,2,3],true,1);
	////дозволяється брати 1, 2 або 3 каменя, хто зробить останній хід, виграє
	//для цього світу запустимо турнір, у якому гравці змагатимуться не парами, а трійками
	//window.world = new UniversalBachetWorld([1,2,3],true);

}
