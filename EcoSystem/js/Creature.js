class Creature {
	constructor(wrld, cx, cy, dnaOb){
		
		this.myWorld = wrld;
		this.cell_x = cx;
		this.cell_y = cy;



		this.mustBFullyRemoved=false;

		//що будет робити істота на кожному кроці?
		//Вона отримує список з 24 чисел - RGB кольори навколишніх клітин
		//Вирішує, чи буде вона кудись рухатися
		//І яким чиином рухатися - просто так, атакуючи чи у захисному режимі
		//простий рух можливий лише до пустої клітини
		//атакуючий рух наносить урон хп істоти у клітині
		//при зниженні хп до 0 нападник істоту може з'їсти
		//защитний режим залишається активним до наступного такту
		//при атаці на істоту у захисному режимі нападник може зазнати поразки

		//Кожен такт істота втрачає енергію, а при використанні особливих режимів втрати більші
		//відновлення енергії можливо:
		// саме по собі (для рослин та істот зі здібністю "фотосинтез")
		// при з'їданні інших істот
		//при цьому істота може вміти або не вміти перетравлювати рослинну та тваринну енергію
		//оскільки правила дозволяють мати істот, що можуть як їсти, так і виконувати фотосинтез
		//то у істоти є показник this.plantEnergyPercent - яский відсоток її енергії "рослинний"
		this.isInDefenceMode=false
		
		

		this.plantEnergyPercent = 0.5

		this.inAr=[]
		for (let i=0; i<24+3; i++){
			this.inAr.push(0)
		}

		// dnaOb.color
		// dnaOb.abilities
		// dnaOb.network
		this.mutateDNAOb(dnaOb)

		
		this.attackVal=dnaOb.attack
		this.defenceVal=dnaOb.defense

		this.hpMax=dnaOb.maxHP;
		this.hp=this.hpMax
		this.maxEnergy = dnaOb.maxEnergy;
		this.energy = 0.4*this.maxEnergy		

		this.neuronet = new NeuroNet()
		if (dnaOb.network){
			this.neuronet.buildFromObject(dnaOb.network)
		}else{
			this.neuronet.createIntroLayer(this.inAr.length)
			this.neuronet.createLayer(15)
			this.neuronet.createLayer(8)//5 move directions and 3 states		
		}


		// this.colorOb = {r:0, g:255, b:0};
		this.colorOb = {r:dnaOb.color.r, g:dnaOb.color.g, b:dnaOb.color.b}
		if (this.myWorld.isVisualizing){
			this.createVisual()	
		}		
		
		this.canMove=dnaOb.abilities.canMove
		this.canGetEnergyFromLight=dnaOb.abilities.canGetEnergyFromLight
		this.canEatPlants=dnaOb.abilities.canEatPlants
		this.canEatAnimals=dnaOb.abilities.canEatAnimals
		this.canAttack=dnaOb.abilities.canAttack
		this.canDefend=dnaOb.abilities.canDefend

		this.lastMoveDir=0;
		this.lastMoveMode=0;
	}

	createVisual(){
		if (!this.vis){
			this.vis = new Phaser.GameObjects.Image(window.main,0,0,"TX_CIRCLE")
			this.myWorld.grp.add(this.vis)
		}
		this.vis.x = this.myWorld.gridSide*(0.5+this.cell_x)
		this.vis.y = this.myWorld.gridSide*(0.5+this.cell_y)
		this.vis.scale = this.myWorld.gridSide/(this.vis.width+2)	
		this.vis.tint = (this.colorOb.r<<16) | (this.colorOb.g<<8) | this.colorOb.b			
	}

	exportDNA(){
		return {
			color:{
				r:this.colorOb.r,
				g:this.colorOb.g,
				b:this.colorOb.b
			},
			abilities:{
				canMove:this.canMove,
				canGetEnergyFromLight:this.canGetEnergyFromLight,
				canEatPlants:this.canEatPlants,
				canEatAnimals:this.canEatAnimals,
				canAttack:this.canAttack,
				canDefend:this.canDefend
			},
			network:this.neuronet.export2Object(),
			maxEnergy:this.maxEnergy,
			maxHP:this.hpMax,
			attack:this.attackVal,
			defense:this.defenceVal
		}
	}

	mutateDNAOb(dnaOb){
		if (Math.random()<0.1){
			let clCode=["r", "g", "b"][Math.floor(Math.random()*3)]
			dnaOb.color[clCode] = Math.floor(dnaOb.color[clCode]+10-Math.random()*20)
			dnaOb.color[clCode] = Math.max(0,Math.min(255,dnaOb.color[clCode]))

			if (dnaOb.network){
				for (let i=0; i<dnaOb.network.layers.length; i++){
					for (let j=0; j<dnaOb.network.layers[i].length; j++){
						let ob = dnaOb.network.layers[i][j]
						if (Math.random()<0.1){
							ob.bias *= (Math.random()*4-2)
						}
						for (let k=0; k<ob.weights.length; k++){
							ob.weights[k]*=(Math.random()*4-2)
						}
					}
				}
			}
		}
	}
	export2Ob(){
		res={}
		res.cell_x=this.cell_x
		res.cell_y=this.cell_y
		res.isInDefenceMode = this.isInDefenceMode
		res.plantEnergyPercent=this.plantEnergyPercent
		res.hp=this.hp
		res.energy=this.energy
		res.lastMoveDir = this.lastMoveDir
		res.lastMoveMode=this.lastMoveMode
		res.dna = this.exportDNA()
		return res	
	}
	decideNextActionFromInfo(infoOb, decisionOb){
		if (!this.canMove && !this.canDefend){
			decisionOb.moveDir=0
			decisionOb.moveMode=0
			return
		}
		for (let i=0; i<infoOb.surroundingColors.length; i++){
			this.inAr[3*i] = infoOb.surroundingColors[i].r
			this.inAr[3*i+1] = infoOb.surroundingColors[i].g
			this.inAr[3*i+2] = infoOb.surroundingColors[i].b
		}
		this.inAr[this.inAr.length-3] = Math.random()*100
		this.inAr[this.inAr.length-2] = this.hp/this.hpMax*100
		this.inAr[this.inAr.length-1] = this.energy/this.maxEnergy*100

		this.neuronet.calculateOutsForInputs(this.inAr)

		// decisionOb.moveDir = Math.floor(5)//0 -stay, 1234-up, right, down, left
		// this.lastMoveDir = this.neuronet.findIdOfRandomWeightedOutNeuronBetween(0,4)
		this.lastMoveDir = this.neuronet.findIdOfMostActivatedOutNeuronBetween(0,4)
		decisionOb.moveDir = this.lastMoveDir
		// decisionOb.moveDir = Math.floor(Math.random()*5)//0 -stay, 1234-up, right, down, left
		// decisionOb.moveMove = Math.floor(Math.random()*3)//0 - normal, 1 - attack, 2 - defend
		// this.lastMoveMode = this.neuronet.findIdOfRandomWeightedOutNeuronBetween(5,7)-5
		this.lastMoveMode = this.neuronet.findIdOfMostActivatedOutNeuronBetween(5,7)-5
		decisionOb.moveMode = this.lastMoveMode;
	}
	alterNeuroNetworkOutput(coef=1.5){
		let dirNeuronId = this.lastMoveDir//this.neuronet.findIdOfMostActivatedOutNeuronBetween(0,4)
		let modeNeuronId = this.lastMoveMode+5//this.neuronet.findIdOfMostActivatedOutNeuronBetween(5,7)
		let corAr = this.neuronet.getOutputs()
		for (let i=0; i<corAr.length; i++){
			if ((i==dirNeuronId)||(i==modeNeuronId)){
				corAr[i]/=coef
			}else{
				corAr[i]*=coef*(1+Math.random())
			}
		}
		this.neuronet.calculateErrors(corAr)
		this.neuronet.adjustParams(0.1)
	}
	empowerNeuroNetworkOutput(coef=2){
		let dirNeuronId = this.lastMoveDir//this.neuronet.findIdOfMostActivatedOutNeuronBetween(0,4)
		let modeNeuronId = this.lastMoveMode+5//this.neuronet.findIdOfMostActivatedOutNeuronBetween(5,7)
		let corAr = this.neuronet.getOutputs()
		for (let i=0; i<corAr.length; i++){
			if ((i==dirNeuronId)||(i==modeNeuronId)){
				corAr[i]*=(coef*(1+Math.random()))
			}else{
				corAr[i]/=coef
			}
		}
		this.neuronet.calculateErrors(corAr)
		this.neuronet.adjustParams(0.5)		
	}
}