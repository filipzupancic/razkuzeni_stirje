import m from 'mithril';

class Game {

    view() {
        return m('div.game', [
        	m('div', {id: "climber"}),
        	m('div', {id: "ice"}),
        ]);
    }
}

export default Game;