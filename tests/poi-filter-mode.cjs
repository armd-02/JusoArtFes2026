const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Stub = class {};
const context = vm.createContext({
    console: { log() {} }, window: { navigator: { language: 'ja' } },
    IndoorControl: Stub, Glottologist: Stub, Basic: Stub, PoiStatusCont: Stub,
    OverPassControl: Stub, Maplibre: Stub, GeoCont: Stub, ListTable: Stub, PoiCont: Stub,
    MapFeature3D: Stub, PlaygroundModelFactories: {}, GoogleSpreadSheet: Stub,
    HistoricalNewsController: Stub, NewsTicker: Stub, ChangeController: Stub,
    AreaFeatureLinker: Stub, AreaSearchController: Stub, ListActionButtons: Stub
});
vm.runInContext(fs.readFileSync('cmapmaker.js', 'utf8') +
    '\nthis.fixture = { maker: cMapMaker, poi: poiCont, list: listTable, map: mapLibre };', context);
const { maker, poi, list, map } = context.fixture;
context.Conf = { poiView: { poiZoom: { activity: 8, shop: 16 }, editZoom: {} },
    osm: { shop: { expression: { poiView: true } } },
    activity: { targetName: 'activity' }, etc: { editMode: false } };
poi.getTargets = () => ['shop', 'activity'];
map.getZoom = () => 17;
maker.getPoiZoom = target => context.Conf.poiView.poiZoom[target];
const rows = [['WP/729']];
let selected = ['お店・施設・メニュー'], markerRows = rows;
list.getSelCategory = () => selected;
list.getMarkerList = () => markerRows;
const calls = [];
poi.setPoi = (rows, actonly) => calls.push([rows, actonly]);
for (const mode of [undefined, 'filter', 'all']) {
    context.Conf.poiView.poiFilter = mode;
    for (const category of [['お店・施設・メニュー'], ['shop'], ['tags', 'shop.books'], ['-'], ['']]) {
        selected = category;
        maker.viewPoi(category);
        assert.deepEqual(calls.pop(), [mode === 'all' ? undefined : rows, false],
            `${mode}: category ${category} uses the selected marker policy`);
        markerRows = [];
        maker.viewPoi(category);
        assert.deepEqual(calls.pop(), [mode === 'all' ? undefined : markerRows, false],
            `${mode}: empty results only clear icons in filter mode`);
        markerRows = rows;
    }
}
assert.equal(calls.length, 0, 'each update renders markers once');
console.log('PASS: all/filter/default marker policies for activity, target, tag and automatic categories');
