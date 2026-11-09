const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const calls = [];
const stub = class {};
const context = { console, Date, window: {navigator:{language:'ja'}},
    Conf: {}, document:{getElementById:()=>null},
    IndoorControl:stub, Glottologist:stub, Basic:stub, PoiStatusCont:stub,
    OverPassControl:stub, Maplibre:stub, GeoCont:stub, PoiCont:stub,
    GoogleSpreadSheet:stub, NewsTicker:stub, HistoricalNewsController:stub,
    ChangeController:stub, AreaFeatureLinker:stub, ListActionButtons:stub,
    PlaygroundModelFactories: {}, MapFeature3D:class{sync(){calls.push(['models']);}},
    AreaSearchController:class{renderSummary(){calls.push(['summary']);}},
    ListTable:class{
        makeList(render){calls.push(['list',render]);}
        filterByPoiStatus(visit,favorite,render){calls.push(['filter',visit,favorite,render]);}
        renderList(){calls.push(['render']);}
        getSelCategory(){return ['tags','amenity.bench'];}
    }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('cmapmaker.js','utf8')+'\nthis.maker=cMapMaker;',context);
context.Conf={thumbnail:{use:true}};
const maker=context.maker;
maker.updateView=()=>{throw new Error('Personal filter must not fetch');};
maker.makeImages=()=>calls.push(['images']);maker.viewArea=()=>calls.push(['areas']);
maker.viewPoi=targets=>calls.push(['markers',...targets]);
maker.setVisitedFilter('unvisited');
assert.equal(maker.visitedFilterStatus,'unvisited');
assert.equal(calls.filter(call=>call[0]==='render').length,1);
assert.deepEqual(calls.find(call=>call[0]==='markers'),['markers','tags','amenity.bench']);
calls.length=0;maker.toggleFavoriteFilter(true);
assert.equal(maker.favoriteFilter,true);
assert.deepEqual(calls.find(call=>call[0]==='filter'),['filter','unvisited',true,false]);
assert.equal(calls.filter(call=>call[0]==='render').length,1);
console.log('PASS: personal filters redraw existing data once without updateView/network');

// Searching restores only the minimized list, preserving other selected sizes.
vm.runInContext('this.searchList = listTable; this.searchArea = areaSearchController;', context);
const queued = [], resized = [], searched = [];
context.setTimeout = callback => queued.push(callback);
context.winCont = { sidebarSize: 1, setSidebar: mode => resized.push(mode) };
context.searchList.filterKeyword = keyword => searched.push(keyword);
context.searchArea.renderDisplayStatus = () => {};
maker.changeMode = mode => assert.equal(mode, 'list');
for (const size of [1, 2, 3]) {
    context.winCont.sidebarSize = size;
    resized.length = 0;
    maker.searchKeyword('キッズゲルニカ');
    assert.deepEqual(resized, size === 1 ? ['list'] : [], 'only minimized lists return to normal size');
    assert.equal(queued.length, 1);
    queued.shift()();
    assert.equal(searched.at(-1), 'キッズゲルニカ');
}
const count = searched.length;
maker.searchKeyword(null);
assert.equal(queued.length, 0);
assert.equal(searched.length, count);
console.log('PASS: keyword search restores minimized lists and preserves normal/maximized sizes');
