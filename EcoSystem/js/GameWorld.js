class GameWorld{
	constructor(){
		this.grp = new Phaser.GameObjects.Container(window.main,0,0)
		window.main.add.existing(this.grp)

		this.isThorus=false
		this.isVisualizing = true
		this.gameSpeed=1
		this.numPlants = 10000
		this.numHerbivores = 100
		this.numPredators = 0
		this.plantDNA = {
			color:{r:0, g:255,b:0},
			abilities:{
				canMove:false,
				canGetEnergyFromLight:true,
				canEatPlants:false,
				canEatAnimals:false,
				canAttack:false,
				canDefend:false			
			},
			maxEnergy:1,
			maxHP:10,
			attack:2,
			defense:1
		}
		this.herbivoreDNA = {
			color:{r:0, g:0,b:255},
			abilities:{
				canMove:true,
				canGetEnergyFromLight:false,
				canEatPlants:true,
				canEatAnimals:false,
				canAttack:true,
				canDefend:true		
			},
			maxEnergy:15,
			maxHP:100,
			attack:10,
			defense:10
		}
		this.predatorDNA = {
			color:{r:255, g:0,b:0},
			abilities:{
				canMove:true,
				canGetEnergyFromLight:false,
				canEatPlants:false,
				canEatAnimals:true,
				canAttack:true,
				canDefend:true		
			},
			maxEnergy:40,
			maxHP:100,
			attack:50,
			defense:30
		}

		// let cl = new CellIm(100,100)
		// window.main.add.existing(cl)
		
		this.gridSide=5
		this.gridWidth=200
		this.gridHeight=200
		window.main.sizeManager.W0 = 0.5*this.gridWidth*this.gridSide
		window.main.sizeManager.H0 = 0.5*this.gridHeight*this.gridSide
		this.fieldColors=[]
		this.dirViewDeltas=[{dx:0, dy:-1},{dx:1, dy:-1},{dx:1, dy:0},{dx:1, dy:1},{dx:0, dy:1},{dx:-1, dy:1},{dx:-1, dy:0},{dx:-1, dy:-1}]
		
		this.infoOb2Creature={surroundingColors:[
								{r:0,g:0,b:0},
								{r:0,g:0,b:0},
								{r:0,g:0,b:0},
								{r:0,g:0,b:0},
								{r:0,g:0,b:0},
								{r:0,g:0,b:0},
								{r:0,g:0,b:0},
								{r:0,g:0,b:0}
							]}
		this.deltaMoves=[{dx:0, dy:0}, {dx:0, dy:-1},{dx:1, dy:0},{dx:0, dy:1},{dx:-1, dy:0}]	
		//moveDirs: 0-stay, 1-up, 2-right, 3-down,4-left
		//moveModes: 0-normal, 1-attack(and try to eat), 2-defensive (stays active for all next move)
		this.moveObFromCreature={moveDir:0, moveMode:0}
		this.outBorderColor={r:255, g:0, b:0}
		for (let i=0; i<this.gridWidth; i++){
			let ar=[];
			for (let j=0; j<this.gridHeight; j++){
				// let ob={r:Math.floor(Math.random()*256),g:Math.floor(Math.random()*256),b:Math.floor(Math.random()*256)}
				let ob={r:0,g:0,b:0}
				ar.push(ob)
			}
			this.fieldColors.push(ar);
		}

		this.fieldCells=[]
		for (let i=0; i<this.gridWidth; i++){
			let ar=[];
			for (let j=0; j<this.gridHeight; j++){
				let colorOb=this.fieldColors[i][j];
				//let cl = new CellIm((i+0.5)*this.gridSide, (j+0.5)*this.gridSide);
				//window.main.add.existing(cl);
				//cl.setColor(colorOb)
				//cl.setSide(this.gridSide-1)
				//ar.push(cl)
			}
			this.fieldCells.push(ar)
		}

		this.fieldCreatures=[]
		for (let i=0; i<this.gridWidth; i++){
			let ar=[];
			for (let j=0; j<this.gridHeight; j++){
				// let ob={r:Math.floor(Math.random()*256),g:Math.floor(Math.random()*256),b:Math.floor(Math.random()*256)}
				ar.push(null)
			}
			this.fieldCreatures.push(ar);
		}

		this.creatures=[]

		for (let i=0; i<this.numPlants; i++){
			let cx = Math.floor(Math.random()*this.gridWidth);
			let cy = Math.floor(Math.random()*this.gridHeight);
			if (!this.fieldCreatures[cx][cy]){
				this.createCreature(cx,cy,this.plantDNA,0)
			}
		}

		for (let i=0; i<this.numHerbivores; i++){
			let cx = Math.floor(Math.random()*this.gridWidth);
			let cy = Math.floor(Math.random()*this.gridHeight);
			if (!this.fieldCreatures[cx][cy]){
				this.createCreature(cx,cy,this.herbivoreDNA,0)
			}
		}

		for (let i=0; i<this.numPredators; i++){
			let cx = Math.floor(Math.random()*this.gridWidth);
			let cy = Math.floor(Math.random()*this.gridHeight);
			if (!this.fieldCreatures[cx][cy]){
				this.createCreature(cx,cy,this.predatorDNA,0)
			}
		}

		this.nextCreatureId2Move=0;
	}

	setVisualizing(b){
		this.isVisualizing = b;
		if (this.isVisualizing){
			for (let i=0; i<this.creatures.length; i++){
				if (!this.creatures[i].mustBFullyRemoved){
					this.creatures[i].createVisual()
				}
			}
		}
	}

	createCreature(cx, cy, dna,mutProb=0.1){
		let cr = new Creature(this,cx, cy,dna,mutProb)
		if (this.isVisualizing){
			if (cr.vis){
				this.grp.add(cr.vis)
			}		
		}

		
		this.creatures.push(cr)
		this.fieldCreatures[cx][cy] = cr;

		return cr
	}

	makeStep(){
		if (this.nextCreatureId2Move>=this.creatures.length){
			this.nextCreatureId2Move=0;
		}else{
			let cr = this.creatures[this.nextCreatureId2Move]
			if (cr.mustBFullyRemoved){//вважаємо, що з поля та екрану її вже прибрали
				this.creatures.splice(this.nextCreatureId2Move, 1)
			}else{
				this.updateInfoObject2SeeAround(cr.cell_x, cr.cell_y)//this.infoOb2Creature
				cr.decideNextActionFromInfo(this.infoOb2Creature, this.moveObFromCreature)
				this.performCreatureMove(cr, this.moveObFromCreature)
				this.nextCreatureId2Move++;
			}
		}
	}

	performCreatureMove(cr, moveOb){
		let moveDir = moveOb.moveDir;
		let moveMode = moveOb.moveMode;
		if (!cr.canMove){
			moveDir=0
		}
		if (moveMode==2 && !cr.canDefend){
			moveMode=0
		}
		if (moveMode==1 && !cr.canAttack){
			moveMode=0
		}

		let dx = this.deltaMoves[moveDir].dx
		let dy = this.deltaMoves[moveDir].dy

		this.moveCreatureByDelta(cr, dx, dy, moveMode)
	}

	moveCreatureByDelta(cr, dx, dy, moveMode){
		let energySpend=0;
		let hpDelta=0;
		let energyGain=0;
		let lightEnergyGain=0;
		/*витрати енергії на:
			просто на життя
			на рух (якщо клітина зайнята, то більше)
			на атаку
			на захист
			на відновлення хп

			отримання енергії з:
			фотосинтезу (за кількість вільних клітинок поруч)
			при успішній атаці та з'їданні когось
		*/

		if (cr.canGetEnergyFromLight){
			let numFreeCells = this.calculateFreeCellsAround(cr.cell_x, cr.cell_y)
			lightEnergyGain+=numFreeCells/4*0.001;
		}

		energySpend+=0.001
		if ((dx!=0)||(dy!=0)){
			energySpend+=0.003
			if (moveMode==1){
				energySpend+=0.003
			}
		}
		if (moveMode==2){
			energySpend+=0.001
		}

		if (cr.hp<cr.hpMax){
			if (cr.energy>0.25*cr.maxEnergy){
				let dhp = cr.hpMax-cr.hp;
				if (dhp>1){
					dhp=1
				}

				hpDelta=dhp
				energySpend+=0.005*hpDelta
			}
		}

		cr.isInDefenceMode = (moveMode==2)
		if ((dx!=0)||(dy!=0)){
			let wasMoveMade=true;
			if (this.isThorus){
				var cx2 = (cr.cell_x+dx+this.gridWidth)%this.gridWidth;
				var cy2 = (cr.cell_y+dy+this.gridHeight)%this.gridHeight;			
			}else{
				cx2 = cr.cell_x+dx
				cy2 = cr.cell_y+dy			
			}


			
			if ((cx2<0)||(cx2>=this.gridWidth)||(cy2<0)||(cy2>=this.gridHeight)){
				wasMoveMade=false;
			}
			else{

				let cr2 = this.fieldCreatures[cx2][cy2]
				if (cr2){
					wasMoveMade=false
					if (moveMode==1){
						let atVal = cr.attackVal;
						let defVal = cr2.defenceVal;
						if (cr2.isInDefenceMode){
							defVal*=3;
						}
						if (Math.random()<atVal/(atVal+defVal)){
							
							cr2.hp-=atVal

							if (cr2.hp<=0){//attacker eats defender
								
								if (cr.canEatPlants){
									energyGain+=cr2.energy*cr2.plantEnergyPercent
								}
								if (cr.canEatAnimals){
									energyGain+=cr2.energy*(1-cr2.plantEnergyPercent)
								}

								this.removeCreature(cr2)
								wasMoveMade=true

								cr.empowerNeuroNetworkOutput()
							}else{
								cr2.alterNeuroNetworkOutput()
							}
						}else{
							cr2.empowerNeuroNetworkOutput()
							cr.hp-=defVal;
							if (cr.hp<=0){//defender wins and can eat attacker (if can)
								if (cr2.canEatPlants){
									let en = cr.energy*cr.plantEnergyPercent
									cr2.plantEnergyPercent = (cr2.plantEnergyPercent*cr2.energy+en)/(cr2.energy+en)
									cr2.energy+=en
								}
								if (cr2.canEatAnimals){
									let en = cr.energy*(1-cr.plantEnergyPercent)
									cr2.plantEnergyPercent = (cr2.plantEnergyPercent*cr2.energy)/(cr2.energy+en)
									cr2.energy+=en
								}

								if (cr2.energy>cr2.maxEnergy){
									cr2.energy = cr2.maxEnergy;
								}

								this.removeCreature(cr)
								
							}else{
								cr.alterNeuroNetworkOutput()
							}
						}
					}
				}
			}
			if (wasMoveMade){
				this.fieldCreatures[cr.cell_x][cr.cell_y]=null;
				this.fieldCreatures[cx2][cy2]=cr;
				cr.cell_x = cx2;
				cr.cell_y = cy2;
				if (this.isVisualizing){
					if (cr.vis){
						cr.vis.x = this.gridSide*(0.5+cr.cell_x)
						cr.vis.y = this.gridSide*(0.5+cr.cell_y)				
					}				
				}
			}else{
				cr.alterNeuroNetworkOutput()
			}
		}
		if (!cr.mustBFullyRemoved){
			let oldEn = cr.energy
			let en = lightEnergyGain
			cr.plantEnergyPercent = (cr.plantEnergyPercent*cr.energy+en)/(cr.energy+en)
			cr.energy+=en				
			en = energyGain
			cr.plantEnergyPercent = (cr.plantEnergyPercent*cr.energy)/(cr.energy+en)
			cr.energy+=en
			cr.energy-=energySpend
			if (cr.energy>cr.maxEnergy){
				cr.energy=cr.maxEnergy
			}
			if (cr.energy<=0){
				this.removeCreature(cr)
			}
			if (cr.energy>=0.5*cr.maxEnergy){
				//give birth to new creature
				let id = this.getIdOfRandomFreeCellAround(cr.cell_x, cr.cell_y)
				if (id!=-1){
					//тут можна isThorus не враховувати, т.я. воно враховано всередині getIdOfRandomFreeCellAround
					let cx1 = (cr.cell_x+this.dirViewDeltas[id].dx+this.gridWidth)%this.gridWidth
					let cy1 = (cr.cell_y+this.dirViewDeltas[id].dy+this.gridHeight)%this.gridHeight

					let dna = cr.exportDNA()

					let cr3 = this.createCreature(cx1, cy1,dna)
					let perc = 0.5
					cr3.energy = perc*cr.energy;
					cr3.plantEnergyPercent = cr.plantEnergyPercent
					cr.energy = (1-perc)*cr.energy;
				}
			}

			if (energySpend>energyGain+lightEnergyGain){
				if (Math.floor(1000*oldEn/cr.maxEnergy)!=Math.floor(1000*cr.energy/cr.maxEnergy)){
					cr.alterNeuroNetworkOutput()
				}
			}
		}
	}

	getIdOfRandomFreeCellAround(cx, cy){
		let res=-1;
		let len = this.dirViewDeltas.length
		let id = Math.floor(Math.random()*len)
		let id0=id;
		while (true){
			let dx=this.dirViewDeltas[id].dx
			let dy=this.dirViewDeltas[id].dy
			if (this.isThorus){
				var cx2 = (cx+dx+this.gridWidth)%this.gridWidth;
				var cy2 = (cy+dy+this.gridHeight)%this.gridHeight;			
			}else{
				cx2 = cx+dx
				cy2 = cy+dy			
			}
			if ((cx2<0)||(cx2>=this.gridWidth)||(cy2<0)||(cy2>=this.gridHeight)){
				id+=1
				id%=len
				if (id==id0){
					break
				}			
			}else{
				if (this.fieldCreatures[cx2][cy2]){
					id+=1
					id%=len
					if (id==id0){
						break
					}
				}else{
					res=id;
					break;
				}			
			}


		}
		return res;
	}
	calculateFreeCellsAround(cx, cy){
		let res=0
		for (let i=0; i<this.dirViewDeltas.length; i++){
			let deltas = this.dirViewDeltas[i]

			if (this.isThorus){
				var cx2 = (cx+deltas.dx+this.gridWidth)%this.gridWidth;
				var cy2 = (cy+deltas.dy+this.gridHeight)%this.gridHeight;			
			}else{
				cx2 = cx+deltas.dx
				cy2 = cy+deltas.dy			
			}
			if ((cx2<0)||(cx2>=this.gridWidth)||(cy2<0)||(cy2>=this.gridHeight)){
			
			}else{
				if (!this.fieldCreatures[cx2][cy2]){
					res+=1
				}			
			}



		}
		return res;
	}

	removeCreature(cr){
		if (cr.vis){
			this.grp.remove(cr.vis)
			cr.vis.removeFromDisplayList()
		}
		
		this.fieldCreatures[cr.cell_x][cr.cell_y]=null;
		cr.mustBFullyRemoved=true;		
	}

	//які кольори бачитиме істота навколо клітини cx, cy
	updateInfoObject2SeeAround(cx, cy){
		for (let i=0; i<this.dirViewDeltas.length; i++){
			if (this.isThorus){
				var cx1 = (cx+this.dirViewDeltas[i].dx+this.gridWidth)%this.gridWidth
				var cy1 = (cy+this.dirViewDeltas[i].dy+this.gridHeight)%this.gridHeight		
			}else{
				cx1 = cx+this.dirViewDeltas[i].dx
				cy1 = cy+this.dirViewDeltas[i].dy	
			}
			if ((cx1<0)||(cx1>=this.gridWidth)||(cy1<0)||(cy1>=this.gridHeight)){
				var cl = this.outBorderColor;
				var cr = null
			}else{
				//якого кольору клітина, на яку дивимося
				cl = this.fieldColors[cx1][cy1];
				//чи є у ці клітині якась істота
				cr = this.fieldCreatures[cx1][cy1];				
			}	

			if (cr){
				let perc = 0.8//який відсоток клітини замає істота
				this.infoOb2Creature.surroundingColors[i].r = cl.r*(1-perc)+cr.colorOb.r*perc
				this.infoOb2Creature.surroundingColors[i].g = cl.g*(1-perc)+cr.colorOb.g*perc
				this.infoOb2Creature.surroundingColors[i].b = cl.b*(1-perc)+cr.colorOb.b*perc
			}else{
				this.infoOb2Creature.surroundingColors[i].r = cl.r
				this.infoOb2Creature.surroundingColors[i].g = cl.g
				this.infoOb2Creature.surroundingColors[i].b = cl.b			
			}
			
		}
	}

	createObjects(){

	}


    clearAllObjects (){
		console.log("clearAllObjects")

	}	

	update(t,dt){
		let len=0
		if (this.gameSpeed>0){
			len = this.creatures.length*this.gameSpeed
		}else{
			len = -this.gameSpeed
		}
		
		for (let i=0; i<len; i++){
			this.makeStep()
		}
	}

	handleMove(pointer, objectsClicked){
		// console.log("pointermove", pointer, objectsClicked)
		if (pointer.isDown){
			this.grp.x+=pointer.position.x-pointer.prevPosition.x
			this.grp.y+=pointer.position.y-pointer.prevPosition.y		
		}

	}
	handleDown(pointer, objectsClicked){
		console.log("pointerdown", pointer, objectsClicked)
		let cx = (pointer.downX-this.grp.x)/this.grp.scaleX
		let cy = (pointer.downY-this.grp.y)/this.grp.scaleY

		cx = Math.floor(cx/this.gridSide)
		cy = Math.floor(cy/this.gridSide)

		if ((cx>=0)&&(cx<this.gridWidth)&&(cy>=0)&&(cy<this.gridHeight)){
			console.log(this.fieldCreatures[cx][cy])
		}
	}

	handleKeyDown(evt){
		// console.log("keydown", evt)
		switch (evt.code){
			case "ArrowLeft":{
				this.grp.x-=5
				break;
			}
			case "ArrowRight":{
				this.grp.x+=5
				break;
			}
			case "ArrowUp":{
				this.grp.y-=5
				break;
			}
			case "ArrowDown":{
				this.grp.y+=5
				break;
			}
			case "Minus":{
				this.grp.scale = this.grp.scaleX*0.95
				break;
			}
			case "Equal":{
				this.grp.scale = this.grp.scaleX*1.05
				break;
			}
			case "Space":{
				this.gameSpeed=0
				break;
			}
			case "KeyQ":{
				this.gameSpeed-=1
				break;
			}
			case "KeyW":{
				this.gameSpeed+=1
				break;
			}
		}
	}

	handleWheel(evt){
		// console.log("wheel", evt)
		if (evt.deltaY<0){
			this.grp.scale = this.grp.scaleX*0.95
		}
		if (evt.deltaY>0){
			this.grp.scale = this.grp.scaleX*1.05
		}
	}

	react2Resize(){
	
	}

}