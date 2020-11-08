// src/views/Layout.js
import Game from "./game"

var m = require("mithril")

let api_feed = [];

let loading = false;
let loading_image = false;
let typeahead_timeout = null;

let img_url = '';

let by_years = false;

let show_graphs = false;

let is_getting_snow = false;
let has_game = false;

let current_year = 2019;
let min_year = 2017;

// let years = {
// 	'2017': [20, 30, 20, 10, 40, 5, 7, 1, 10, 20, 30, 33],
// 	'2018': [40, 3, 2, 5, 40, 5, 7, 9, 13, 20, 30, 33],
// 	'2019': [20, 10, 40, 20, 30, 1, 10, 5, 7, 20, 30, 33],
// 	'2020': [20, 90, 2, 10, 40, 5, 7, 1, 10, 20, 30, 33],
// }

let years = {};

// let current_bb = []; 
let loc_name = '';

let current_lat = 0;
let current_lon = 0;


// let byYears = {
// 	'year': [20, 30, 20, 10, 40, 5, 7, 1, 10, 20, 30, 33],
// 	'2018': [40, 3, 2, 5, 40, 5, 7, 9, 13, 20, 30, 33],
// 	'2019': [20, 10, 40, 20, 30, 1, 10, 5, 7, 20, 30, 33],
// 	'2020': [20, 30, 20, 10, 40, 5, 7, 1, 10, 20, 30, 33],
// }

class IMap {
	oncreate(vnode) {
	 	let osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		});

		let baseUrl = "https://services.sentinel-hub.com/ogc/wms/029532b4-5518-4e61-8186-32d2b9ca99bc";
		let sentinelHub = L.tileLayer.wms(baseUrl, {
		    tileSize: 512,
		    attribution: '&copy; <a href="http://www.sentinel-hub.com/" target="_blank">Sentinel Hub</a>',
		    	 	 	 	urlProcessingApi:"https://services.sentinel-hub.com/ogc/wms/aeafc74a-c894-440b-a85b-964c7b26e471", 
		 	 	 	 	maxcc:20, 
		 	 	 	 	minZoom:6, 
		 	 	 	 	maxZoom:16, 
		 	 	 	 	// preset:"NDVI", 
		 	 	 	 	layers:"TRUE_COLOR", 
		 	 	 	 	time:"2020-05-01/2020-11-08", 

		});

		let baseMaps = {
		    'OpenStreetMap': osm
		};
		let overlayMaps = {
		    'Sentinel Hub WMS': sentinelHub
		}

		let map = L.map('map', {
		    center: [current_lat, current_lon], // lat/lng in EPSG:4326
		    zoom: 11,
		    layers: [osm, sentinelHub]
		});

		var marker = L.marker([current_lat, current_lon]).addTo(map);

		L.control.layers(baseMaps, overlayMaps).addTo(map);
	}

	view() {
		return m('div#map');
	}
}

class Chart {
	oncreate(vnode) {

		var y_data = Object.keys(years).map(year => {
        	return [year].concat(years[year]);
        });

        var y_types = {};

        Object.keys(years).forEach(year => {
        	y_types[year] = 'bar';
        });

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
		        columns: [['Precent of snowy region'].concat(y_data_by_year)],
		        type: 'bar',
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
		return m('div.graph-box', {style: 'display: ' + (show_graphs ? 'block;' : 'none;') }, [
			m('.graph-title', 'Percent of region: ' + loc_name + ' covered in snow'),
			m('div.select-graph-type', [
				m('div' + (!by_years ? '.selected' : ''), {
					onclick: e => {
						by_years = false;
						m.redraw();
					},
				}, 'Monthly'),

				m('div' + (by_years ? '.selected' : ''), {
					onclick: e => {
						by_years = true;
						m.redraw();
					}
				}, 'Yearly')
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
		    url: "https://api.locationiq.com/v1/autocomplete.php?key=pk.d87ac3e0a4f66c6028e249ba71e676dc&q="+encodeURI(query),
		})
		.then(function(list) {
			loading = false;
		    // console.log(list)
		    api_feed = list
		})
	}

	get_img(loc, year, get_img) {
		let bb = loc.boundingbox;
		// current_bb = bb;
		current_lat = loc.lat;
		current_lon = loc.lon;
		// console.log(loc);
		img_url = 'https://icengineapp-api.herokuapp.com/get_snow_data?coord='+ bb[2] +'|' + bb[0] + '|' + bb[3]  + '|' + bb[1]  + '&res=100&year=' + year;
		// m.redraw();

		// let get_img = this.get_img;

		is_getting_snow = true;
		has_game = true;
		m.redraw();
		m.request({
		    method: "GET",
		    url: img_url,
		})
		.then(function(data) {
			// loading = false;
		    // console.log(data);
		    // console.log(Object.values(data));
		    years[year] = Object.values(data).map(v => v*100);
		 //    api_feed = list
		 	current_year = current_year - 1;
		 	if (current_year < min_year) {
		 		current_year = 2019;
		 		is_getting_snow = false;
		 		show_graphs = true;
		 		has_game = false;
		 	} else {
		 		get_img(loc, current_year, get_img);
		 	}
		})
	}

    view() {
        return m("section.u-align-center.u-clearfix.u-image.u-section-1#carousel_5496", [
        	m('.bg'),

        	has_game&&
        	m('.dim'),

        	m("div.u-align-center-xs.u-sheet.u-sheet-1", [
        		m("h3.u-align-center-xs.u-text.u-text-1", "SNOW"),
        		m("p.u-text.u-text-2", "OBSERVATION PLATFORM"),

	        ]),	

	        !show_graphs &&
	        m("div.divider", [
	        	m('div.search_container', [
	        		m('p', 'Search for location'),
		        	m('input', {
		        		onkeyup: e => {
		        			let val = e.target.value;
		        			clearTimeout(typeahead_timeout);
		        			if (val.length > 0) {
		        				typeahead_timeout = setTimeout(e => this.get_list(val), 500);
		        			}
		        		},
		        		placeholder: 'Ljubljana'
		        	}),

		        	m("div.suggestions", [
		        		loading &&
		        		m('p', 'Loading...'),
			        	api_feed.map(loc => {
			        		// console.log(loc);
			        		return m('div', {
			        			style: 'cursor: pointer',
			        			onclick: e => {
			        				api_feed = [];
			        				years = {};
			        				loc_name = loc.address.name;
			        				this.get_img(loc, current_year, this.get_img)
			        			}
			        		}, loc.display_name)
			        	}),
			        ])
	        	]),
	        	// m('div.image_container', [
		        // 	m('img', {
		        // 		src: img_url
		        // 	})
	        	// ])
	        ]),

	        show_graphs &&
	        m(IMap),

	        show_graphs &&
	        m(Chart),

	        show_graphs &&
	        m('.start-again-btn', {
	        	onclick: e => {
	        		by_years = false;
					show_graphs = false;
					is_getting_snow = false;
					has_game = false;
					current_year = 2019;
					// current_bb = [];
					current_lat = 0;
					current_lon = 0;
					loc_name = '';
	        	}
	        }, 'Search another location'),

	        has_game&&
            m(Game)
	    ])
    }
}

export default Layout;