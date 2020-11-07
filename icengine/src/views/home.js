import m from 'mithril';
import Game from "./game"

let api_feed = []

let loading = false;
let loading_image = false;
let typeahead_timeout = null;

let img_url = '';

class Home {
	get_list(query) {
		loading = true;
		m.redraw();
		m.request({
		    method: "GET",
		    url: "https://api.locationiq.com/v1/autocomplete.php?key=pk.1ed6dcd41c46f8b43a05ed505ea0d088&q="+encodeURI(query),
		})
		.then(function(list) {
			loading = false;
		    console.log(list)
		    api_feed = list
		})
	}

	get_img(loc) {
		let bb = loc.boundingbox;
		img_url = 'https://tojesamentest-api.herokuapp.com/get_img?coord='+ bb[2] +'|' + bb[0] + '|' + bb[3]  + '|' + bb[1]  + '&res=50&date_from=2020-4-1&date_to=2020-4-30';
		m.redraw();
		// loading_image = true;
		// m.redraw();
		// m.request({
		//     method: "GET",
		//     url: "https://api.locationiq.com/v1/autocomplete.php?key=pk.1ed6dcd41c46f8b43a05ed505ea0d088&q="+encodeURI(query),
		// })
		// .then(function(list) {
		// 	loading_image = false;
		//     console.log(list)
		//     api_feed = list
		// })
	}

    view() {
        return m('div.body', {style: 'display:flex'}, [
        	m('div', [
	        	m('input', {
	        		onkeyup: e => {
	        			let val = e.target.value; 
	        			clearTimeout(typeahead_timeout);
	        			if (val.length > 0) {
	        				typeahead_timeout = setTimeout(e => this.get_list(val), 500);
	        			}
	        		}
	        	}),

	        	loading &&
	        	m('p', 'Loading...'),

	        	api_feed.map(loc => {
	        		return m('p', {
	        			style: 'cursor: pointer',
	        			onclick: e => {
	        				this.get_img(loc)
	        			}
	        		}, loc.display_name)
	        	}),


        	]),
        	m('div', [
	        	m('img', {
	        		src: img_url
	        	})
        	]),
        	m(Game)
        ]);
    }
}

export default Home;