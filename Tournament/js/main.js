window.onload=function(){
	console.log("Hello")
	//we can create the game world with specific rules
	//classic game with the possible moves of 1, 2 and 3, and the last player to move is the winner
	window.world = new BachetWorld();
	//possible moves are 1, 3 and 4, and the last player to move loses
	//window.world = new UniversalBachetWorld([1,3,4],false);
	//possible moves are 1, 3 and 5, and the last player to move wins
	//window.world = new UniversalBachetWorld([1,3,5],true);
	//possible moves are 1, 2, 3, but it's forbiddent to repeat the last opponent's move
	//window.world = new UniversalBachetWorldWithNoRepeats([1,2,3],true,1);	
}
