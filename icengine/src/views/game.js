import m from 'mithril';

var climber;
let isAlive;
var ice;

class Game {
	oncreate(){
		climber = document.getElementById("climber");
		ice = document.getElementById("ice");

		isAlive = setInterval(function(){
			
			let climberLeft = parseInt(
				window.getComputedStyle(climber).getPropertyValue("left")
				);
			let iceBottom = parseInt(
				window.getComputedStyle(ice).getPropertyValue("bottom")
			);
			console.log(iceBottom);

			if(iceBottom < -50 && iceBottom > -80 && climberLeft == 75){
				alert("Approximately 10 percent of the Earth is covered by glaciers; during the last Ice Age, they covered one-third of the Earth’s surface.");
				ice = document.getElementById("ice");
			}

		}, 10);

		document.onkeydown = e => {
    		console.log("test");
    		if (e.keyCode == 39){ 
    			this.moveRight();
    			// alert("desna")
    		}
    		else if(e.keyCode == 37){
    			this.moveLeft();
    			// alert("leva")
    		}
    	}
	}

	
	moveRight() {
		if(climber.classList != "moveRight"){
			climber.classList.add("moveRight");
			setTimeout(function(){
				climber.classList.remove("moveRight");
			}, 300);
		}
	}

	moveLeft(){
		if(climber.classList != "moveLeft"){
			climber.classList.add("moveLeft");
			setTimeout(function(){
				climber.classList.remove("moveLeft");
			}, 300);
		}
	}

	climbing() {
		if(climber.classList != "climbing"){
			climber.classList.add("climbing");
		}
	}

    view() {
        return m('div.game', [
        	m('div.climbing', {id: "climber"}),
        	m('div', {id: "ice"}),
        ]);
    }
}

export default Game;