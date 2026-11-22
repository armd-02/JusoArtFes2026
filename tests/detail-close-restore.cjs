const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('cmapmaker.js', 'utf8');
const method = source.slice(source.indexOf('    clearDatail('), source.indexOf('    getDirectionsUrl('));
const modes = [];
const elements = {
    'mini-map': { classList: { add() {} } },
    detailMenu: { classList: { add() {} } }
};
const context = vm.createContext({
    document: { getElementById: id => elements[id] || null },
    Conf: { etc: { localSave: '' } },
    winCont: { sidebarSize: 3, clearPoiStatusMarker() {}, setDetailHeaderMode() {}, setSidebar: mode => modes.push(mode) },
    btmWindow_title: {}, btmWindow_message: {}
});
vm.runInContext('this.cMapMaker = ({status:"initialize",' + method + '});', context);
context.cMapMaker.clearDatail(true);
assert.equal(modes.pop(), 'view', 'closing maximized details restores the map and normal list');
context.winCont.sidebarSize = 2;
context.cMapMaker.clearDatail(true);
assert.equal(modes.pop(), undefined, 'closing normal details preserves the existing behavior');
context.winCont.sidebarSize = 3;
context.cMapMaker.clearDatail();
assert.equal(modes.pop(), undefined, 'other detail-clearing paths keep their existing behavior');
assert.match(fs.readFileSync('index.html', 'utf8'), /changeMode\('list', true\)/);
console.log('PASS: closing maximized details restores normal size without changing other clear paths');
