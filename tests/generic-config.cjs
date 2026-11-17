const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const parse = name => vm.runInNewContext('(' + fs.readFileSync(name, 'utf8') + ')');
const Stub = class {};
const context = vm.createContext({
    window: { navigator: { language: 'ja' } },
    IndoorControl: Stub, Glottologist: Stub, Basic: Stub, PoiStatusCont: Stub,
    OverPassControl: Stub, Maplibre: Stub, GeoCont: Stub, ListTable: Stub,
    PoiCont: Stub, MapFeature3D: Stub, PlaygroundModelFactories: {},
    GoogleSpreadSheet: Stub, HistoricalNewsController: Stub, NewsTicker: Stub,
    ChangeController: Stub, AreaFeatureLinker: Stub, AreaSearchController: Stub,
    ListActionButtons: Stub
});
vm.runInContext(fs.readFileSync('cmapmaker.js', 'utf8') + '\nthis.maker = cMapMaker;', context);
const config = parse('data/config-user.jsonc');
const before = JSON.stringify(config);
context.Conf = structuredClone(config);
context.maker.prepareConfig();
const prepared = context.Conf;
assert.equal(JSON.stringify(config), before);
for (const key of Object.keys(config)) {
    assert.equal(JSON.stringify(prepared[key]), JSON.stringify(config[key]), `${key} is preserved`);
}
assert.equal(prepared.activity.url, config.activity.url);
assert.equal(prepared.activity.targetName, config.activity.targetName);
assert.equal(prepared.activity.authMode, 'basic', 'the festival uses its configured backend authentication');
assert.equal(prepared.etc.localSave, 'JusoArtFes2026', 'festival visit data retains its storage key');
assert.equal(prepared.static.use, true, 'festival browsing uses its static OSM data');
assert.equal(prepared.eventDateFilter.use, true, 'festival event dates remain enabled');
assert.ok(prepared.eventDateFilter.dates.length > 0);
assert.equal(parse('data/glot-custom.jsonc').site_title.ja, '十三アートフェスマップ2026');

// Defaults are tested using an empty configuration, independent of site settings.
context.Conf = {};
context.maker.prepareConfig();
assert.equal(context.Conf.activity.url, '');
assert.equal(context.Conf.activity.authMode, 'legacy');
assert.equal(context.Conf.activity.targetName, 'activity');
for (const name of ['news', 'changes', 'intro', 'siteUpdates', 'areaFeatureLinker', 'areaSearch',
    'discovery', 'listActions', 'feature3d', 'stampMarkers', 'directions', 'documentPreview', 'mapImageLinks']) {
    assert.equal(context.Conf[name].use, false, `${name} requires opt-in`);
}

// The application merges these files shallowly, in this order.
const loaded = Object.assign({}, ...[
    'data/config-user.jsonc', 'data/config-system.jsonc', 'data/config-activities.jsonc',
    'data/marker.jsonc', 'data/category-ja.jsonc', 'data/listtable.jsonc', 'data/overpass-system.jsonc'
].map(parse));
assert.equal(JSON.stringify(loaded.listTable), JSON.stringify(config.listTable),
    'loading list columns must preserve the complete user list settings');

// Explicit new settings take precedence over the legacy adapter and defaults.
context.Conf = structuredClone(config);
delete context.Conf.activity;
context.Conf.google.AppScript = 'https://script.google.com/macros/s/example/exec';
context.maker.prepareConfig();
assert.equal(context.Conf.activity.url, context.Conf.google.AppScript);
context.Conf.activity = { url: 'https://example.test/activities', authMode: 'basic', targetName: 'custom' };
context.Conf.areaFeatureLinker = { use: true, areaTargets: ['historic'] };
context.Conf.feature3d = { use: true, models: {}, rules: [] };
context.maker.prepareConfig();
assert.equal(context.Conf.activity.url, 'https://example.test/activities');
assert.equal(context.Conf.activity.authMode, 'basic');
assert.equal(context.Conf.activity.targetName, 'custom');
assert.equal(context.Conf.areaFeatureLinker.use, true);
assert.equal(context.Conf.feature3d.use, true);
console.log('PASS: generic Community Map Maker settings, legacy GAS compatibility, disabled dedicated services, and explicit opt-in');

context.Conf = {};
context.maker.prepareConfig();
assert.equal(context.Conf.documentPreview.use, false, 'document previews are opt-in');
assert.equal(context.Conf.directions.use, false, 'directions remain disabled when not configured');
context.Conf.documentPreview = { use: true, field: 'custom_document' };
context.maker.prepareConfig();
assert.equal(context.Conf.documentPreview.use, true);
assert.equal(context.Conf.documentPreview.field, 'custom_document');

assert.equal(context.Conf.mapImageLinks.use, false, "map image links are opt-in");
context.Conf.mapImageLinks = { use: true, items: [] };
context.maker.prepareConfig();
assert.equal(context.Conf.mapImageLinks.use, true);
