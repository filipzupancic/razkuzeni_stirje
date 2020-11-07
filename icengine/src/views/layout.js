// src/views/Layout.js
var m = require("mithril")

class Layout {
    view() {
        return m("div.body", [
            m('p.title', "ICENGINE"),
            m('')
        ])
    }
}

export default Layout;