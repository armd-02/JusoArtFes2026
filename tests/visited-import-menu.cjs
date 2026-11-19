const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const calls = [];
const saved = new Map();
const context = vm.createContext({
    console, Conf: { etc: { localSave: 'festival' }, menu: { visited: [] } },
    glot: { get: key => key },
    cMapMaker: { changeMode: mode => calls.push(['mode', mode]) },
    mapLibre: { viewMiniMap: value => calls.push(['minimap', value]) },
    winCont: { setSidebar: mode => calls.push(['sidebar', mode]),
        makeDetail: options => calls.push(['detail', options]), addDetailMessage() {} },
    localStorage: { setItem: (key, value) => saved.set(key, value) },
    csvInput: { files: [{}] },
    FileReader: class { readAsText() {} set onload(callback) { callback({ target: { result:
        'key,category,name,visited,favorite,memo\nfestival.node/1,cafe,Example,true,false,note' } }); } },
    PoiStatusCsvIndex: { KEY: 0, VISITED: 3, FAVORITE: 4, MEMO: 5 },
    PoiStatusCsvIndexOld: { KEY: 0, VISITED: 3, MEMO: 4 },
    setTimeout: callback => callback()
});
vm.runInContext(fs.readFileSync('lib/poistatuslib.js', 'utf8') + '\nthis.status = new PoiStatusCont();', context);
context.status.import();
assert.deepEqual(calls.slice(0, 3), [['mode', 'map'], ['sidebar', 'view'], ['minimap', false]],
    'open the detail panel even when the list is active and no facility is selected');
assert.match(calls[3][1].message, /id="csvInput"/);
context.status.import_load();
assert.equal(saved.get('festival.node/1'), 'true,false,note');
assert.equal(calls.at(-1)[1].message, 'file_loaded');
console.log('PASS: import menu opens without a selected facility and imports a CSV');
