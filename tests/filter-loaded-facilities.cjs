const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const countNode = {};
const pois = {
    geojson: [{ id: 'node/1' }, { id: 'node/1' }, { id: 'way/2' }, { id: 'way/3' }],
    targets: [['shop'], ['shop'], ['activity'], ['road']]
};
const context = vm.createContext({
    Conf: { areaSearch: { use: false }, activity: { authMode: 'basic' } },
    document: { getElementById: id => id === 'poiFilterPreviewCount' ? countNode : null },
    clearTimeout() {}, glot: { get: key => key },
    poiCont: { getPois: () => pois, isPoiListVisible: targets => targets.includes('shop'),
        getActlistByOsmid: id => id === 'way/2' ? [{ id: 'WP/1' }, { id: 'WP/2' }] : [] }
});
vm.runInContext(fs.readFileSync('lib/areasearchcontroller.js', 'utf8') + '\nthis.controller = new AreaSearchController({});', context);
(async () => {
    await context.controller.updatePreviewCount();
    assert.equal(countNode.textContent, '読み込み済みの施設：2件', 'distinct facilities are counted once; unrelated data is excluded');
    let searched = false;
    context.controller.apply = () => { searched = true; };
    context.controller.searchBbox = () => '135,34,136,35';
    context.controller.searchFromForm();
    assert.equal(searched, false, 'disabled area search cannot hide loaded facilities');
    console.log('PASS: disabled area search counts distinct loaded facilities and cannot start remote filtering');
})().catch(error => { console.error(error); process.exitCode = 1; });
