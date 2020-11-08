import m from 'mithril';

var climber;
let isAlive;
var ice;
let game_stopped = false;

let facts = [
	"In 1988, a scientist found two identical snow crystals. They came from a storm in Wisconsin.",
	"Indonesia will move its capital city as its current one is sinking due to sea level rise",
	"According to the IPCC 2007 report, sea levels will rise by 7-23 inches by the end of this century due to global warming.",
	"The Montana Glacier National Park has only 25 glaciers instead of 150 that were there in the year 1910",
	"Sea levels have risen about 7 inches in the last 100 years, which is more than the previous 2000 years combined. The rising sea levels due to global warming could threaten the lives of people living along with the coastal areas.",
	"Global warming is causing colder areas of the world to become hotter, thereby becoming more vulnerable to diseases.",
	"Global warming can lead to massive food and water shortages and has a life-threatening impact on wildlife.",
	"The average temperature of the Earth is determined by the greenhouse effect"
];

let ice_falling = false;

let fact_index = 0;

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
			// console.log(iceBottom);

			if(iceBottom < -35 && iceBottom > -80 && climberLeft == 75 && !game_stopped){
				// alert("Approximately 10 percent of the Earth is covered by glaciers; during the last Ice Age, they covered one-third of the Earth’s surface.");
				// ice = document.getElementById("ice").classList.remove('.moving');
				game_stopped = true;
				fact_index = Math.floor((Math.random() * facts.length));

				m.redraw();
			}

		}, 10);

		document.onkeydown = e => {
    		// console.log("test");
    		if (e.keyCode == 39){ 
    			this.moveRight();
    			// alert("desna")
    		}
    		else if(e.keyCode == 37){
    			this.moveLeft();
    			// alert("leva")
    		}
    		// if (e.keyCode == 13){ 
    		// 	game_stopped = false;
    		// }
    	}
	}

	
	moveRight() {
		if(climber.classList != "moveRight"){
			climber.classList.add("moveRight");
			setTimeout(function(){
				climber.classList.remove("moveRight");
			}, 350);
		}
	}

	moveLeft(){
		if(climber.classList != "moveLeft"){
			climber.classList.add("moveLeft");
			setTimeout(function(){
				climber.classList.remove("moveLeft");
			}, 350);
		}
	}

	climbing() {
		if(climber.classList != "climbing"){
			climber.classList.add("climbing");
		}
	}

    view() {
        return m('.game-over', [
        	m('.fact-container' + (!game_stopped ? '.hidden' : ''), {
        		onclick: e => {
        			game_stopped = false;
        		}
        	}, [
        		m('.fact', facts[fact_index]),
        		m('.continue', 'Continue...')
        	]),

	        m('.game-container' + (game_stopped ? '.hidden' : ''), [
	        	m('p.u-text.u-text-2', 'Your request is being proccessed...'),
	        	m('.game', [
		        	m('div.climbing', {id: "climber"}),
		        	m('div' + (!game_stopped ? '.ice-moving' : ''), {id: "ice"}),
	        	])
	        ])
        ]);
    }
}

export default Game;