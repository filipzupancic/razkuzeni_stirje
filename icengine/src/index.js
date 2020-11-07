import m from "mithril";
import Home from "./home"

let show_text=false;

// m.mount(document.body, Home);

class Test {
	view() {
		return m('div.container', [
					m('h1', 'ICENGINE'),
						m('input', {type:'number'}),

						m('button.to-je-c', {
							onclick: e => {
							show_text=true;
						} 
				}, 'gumb'),

				show_text && m('p', 'to_e en text')
		])
	}
}

m.mount(document.body, Test);