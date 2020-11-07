// src/views/Layout.js
var m = require("mithril")

let api_feed = []

let loading = false;
let loading_image = false;
let typeahead_timeout = null;

let img_url = '';

let by_years = false;

let years = {
	'2017': [20, 30, 20, 10, 40, 5, 7, 1, 10, 20, 30, 33],
	'2018': [40, 3, 2, 5, 40, 5, 7, 9, 13, 20, 30, 33],
	'2019': [20, 10, 40, 20, 30, 1, 10, 5, 7, 20, 30, 33],
	'2020': [20, 90, 2, 10, 40, 5, 7, 1, 10, 20, 30, 33],
}


// let byYears = {
// 	'year': [20, 30, 20, 10, 40, 5, 7, 1, 10, 20, 30, 33],
// 	'2018': [40, 3, 2, 5, 40, 5, 7, 9, 13, 20, 30, 33],
// 	'2019': [20, 10, 40, 20, 30, 1, 10, 5, 7, 20, 30, 33],
// 	'2020': [20, 30, 20, 10, 40, 5, 7, 1, 10, 20, 30, 33],
// }

class Chart {
	oncreate(vnode) {
		// var ctx = vnode.dom.querySelector('canvas').getContext('2d');
		// this.ctx = ctx;

		var y_data = Object.keys(years).map(year => {
        	return [year].concat(years[year]);
        });

        var y_types = {};

        Object.keys(years).forEach(year => {
        	y_types[year] = 'bar';
        });

		// console.log(y_types);

		// if (!by_years) {
		var chart = c3.generate({
		    bindto: '#chart',
		    data: {
		        columns: y_data,
		        types: y_types,
		    },
	        axis: {
		        y: {
		            max: 100,
		            min: 10,
		        },
		        x: {
			        type: 'category',
			        categories: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
			    }
		    }
		});
		// } 

		var y_data_by_year = [];
		var y_labels_by_year = Object.keys(years);

		Object.keys(years).forEach(year => {
        	y_data_by_year.push(Math.round((years[year].reduce((t, n) => t+n, 0)/years[year].length)*100) / 100);
        });

		// console.log(y_data_by_year);
		// console.log(['year'].concat(y_data_by_year),);

		// if (by_years) {
		var chartByYears = c3.generate({
		    bindto: '#chartByYears',
		    data: {
		        columns: [['year'].concat(y_data_by_year)],
		        types: {
		        	year: 'bar'
		        },
		    },
	        axis: {
		        y: {
		            max: 100,
		            min: 10,
		        },
		        x: {
			        type: 'category',
			        categories: y_labels_by_year
			    }
		    }
		});
		// }
	}

	view() {
		return m('div.graph-box', [
			m('div.select-graph-type', [
				m('div' + (!by_years ? '.selected' : ''), {
					onclick: e => {
						by_years = false;
						m.redraw();
					},
				}, 'Over year'),

				m('div' + (by_years ? '.selected' : ''), {
					onclick: e => {
						by_years = true;
						m.redraw();
					}
				}, 'All years')
			]),

			m('div', {style: 'display: ' + (!by_years ? 'block;' : 'none;') }, [
				m('div#chart'),
			]),
			m('div', {style: 'display: ' + (by_years ? 'block;' : 'none;') }, [
				m('div#chartByYears'),
			])
			// m('btn', {
			// 	onclick: e => this.init_graph()
			// }, 'ee')
		])
	}
}

class Layout {
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
		img_url = 'https://tojesamentest-api.herokuapp.com/get_img?coord='+ bb[2] +'|' + bb[0] + '|' + bb[3]  + '|' + bb[1]  + '&res=50&date_from=2020-4-1&date_to=2020-4-30'
		m.redraw();
	}
    view() {
        return m("section.u-align-center.u-clearfix.u-image.u-section-1#carousel_5496", [
        	m("div.u-align-center-xs.u-sheet.u-sheet-1", [
        		m("h3.u-align-center-xs.u-text.u-text-1", "SNOW"),
        		m("p.u-text.u-text-2", "OBSERVATION PLATFORM"),
        		
	        ]),	
	        m("div.divider", [
	        	m('div.search', [
	        		m('p', 'Search for location'),
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
	        	m('div.image_container', [
		        	m('img', {
		        		src: img_url
		        	})
	        	])
	        ]),
	        m(Chart)
	    ])
    }
}

export default Layout;