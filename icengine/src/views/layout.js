// src/views/Layout.js
import Game from "./game"

var m = require("mithril")

class Layout {
    view() {
        return m("div.body", [
            m('p.title', "ICENGINE"),
            m(''),
            m(Game)
        ])
    }
}

export default Layout;