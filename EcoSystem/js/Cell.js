class CellIm extends Phaser.GameObjects.Image{
	constructor(x,y){
		super(window.main,x,y,"TX_SQUARE")
	}

	setColor(colorOb){
		this.tint = (colorOb.r<<16)|(colorOb.g<<8)|(colorOb.b)
	}

	setSide(sd){
		this.scale = sd/this.width
	}
}