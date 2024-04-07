window.onload=function(){
class SizeManager{
        constructor(){
            this.W0 = 800;						//під який розмір проектується гра
            this.H0 = 600;						//розмір висоти на екрані - гарантійний
            this.sideField = 0;					//наскільки внутрішню частину відступаємо зліва
		    this.topField = 0;					//на скільки внутрішню частину відступаємо зверху (начебто, цього не потрібно)
		    this.fitterWidth = 0;				//У вертикальних частин усередині альбомного екрану

		    this.screenW = 720;					//Реальний розмір екрану пристрою
		    this.screenH = 720

            this.game2ScreenCoef=1;				//скільки ігрових пікселів в екранному (браузерному)

		    this.gameWidth = 0;					//а це - скільки буде в наших пікселях
		    this.gameHeight = 0;

		    this.deviceDiag = 5;				//діагональ у дюймах, будемо обчислювати виходячи з dpi
		    this.oldGameWidth = 0;				//а це - скільки буде в наших пікселях
		    this.oldGameHeight = 0;
		    this.ratio = 1.3333;				//співвідношення між висотою та шириною, зміниться при ініціалізації
		    this.screenPixelsInGameRatio = 1;	//скільки екранних пікселів в ігровому
		    this.isPortrait = true;                   
        }
        initGameSizes(w1, h1, w, h){
			this.oldGameWidth = this.gameWidth
			this.oldGameHeight = this.gameHeight
            this.gameWidth=w1;
            this.gameHeight=h1;
            this.fitterWidth = Math.min(this.W0, this.gameWidth)
            this.sideField = (this.gameWidth-this.fitterWidth)/2

            this.screenW=w;
            this.screenH=h;

            this.game2ScreenCoef = this.gameWidth/this.screenW;
        }
}


class Example extends Phaser.Scene
    {
        preload ()
        {
            //this.load.setBaseURL('https://labs.phaser.io');
			//завантажуємо зображення, вказуючи їм їх коди для подальшого звернення
            this.load.image('TX_SQUARE', 'assets/square.png');
            this.load.image('TX_CIRCLE', 'assets/circle.png');
            // this.load.image('TX_LOGO', 'assets/phaser3-logo.png');
            // this.load.image('TX_RED', 'assets/red.png');
        }


        create ()
        {
			window.main = this;
			this.sizeManager = new SizeManager();


			this.world = new GameWorld();
			this.world.createObjects();

			this.input.on('pointerdown',(pointer, objectsClicked)=>{
				this.world.handleDown(pointer, objectsClicked)
			})

			this.input.on('pointermove',(pointer, objectsClicked)=>{
				this.world.handleMove(pointer, objectsClicked)
			})

			this.input.keyboard.on('keydown', (evt) => {
				this.world.handleKeyDown(evt)
			})

			window.addEventListener("wheel",(evt) => {
				this.world.handleWheel(evt)
            })	

			this.handleResize(window.innerWidth, window.innerHeight);	
        }

		update(t,dt){
			this.world.update(t,dt)
		}
        handleResize(w, h){ 
            if (w === undefined) { w = config.width; }
            if (h === undefined) { h = config.height; }
            
            var w0 = this.sizeManager.W0;
            var h0 = this.sizeManager.H0;

            if ((w >= 50) && (h >= 50)) {
                var frac = h / w;
                var w1 = w0
                var h1 = h0
                if (frac > h0 / w0) {
                    w1 = w0;
                    h1 = w0 * frac
					if(window.game){
						game.scale.setGameSize(w1, h1);
						game.scale.displaySize.resize(w, w * frac);					
					}
                } else {
                    w1 = h0 / frac;
                    h1 = h0
					if(window.game){
						game.scale.setGameSize(w1, h1);
						game.scale.displaySize.resize(h / frac, h); 					
					}
                }
                this.sizeManager.initGameSizes(w1, h1, w, h);

                if (this.world) {
                    this.world.react2Resize()
                }
            }               
        }				
    }

	//параметри створюваної у Phaser сцени
    const config = {
        type: Phaser.AUTO,
        roundPixels:false,
        scale: {
            mode: Phaser.Scale.FIT,
            parent: "thegame",
            width: 800,
            height: 600            
        },
        scene: Example,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 200 }
            }
        }
    };

    window.game = new Phaser.Game(config);    
    window.addEventListener('resize', function (event) {
        if (window.main) {
            window.main.handleResize(window.innerWidth, window.innerHeight);
        }
    }, false); 

	//  обробка максимізації цілого вікна бразуера
    window.manualSizeChecker = {
        lastW: 0,//window.innerWidth,
        lastH: window.innerHeight,
        timer: setInterval(function () {
            if ((window.innerWidth != window.manualSizeChecker.lastW) || (window.innerHeight != window.manualSizeChecker.lastH)) {
				if (window.main) {
                    window.main.handleResize(window.innerWidth, window.innerHeight);
                    window.manualSizeChecker.lastW = window.innerWidth;
                    window.manualSizeChecker.lastH = window.innerHeight;
                }
            }
        }, 100)
    }
}