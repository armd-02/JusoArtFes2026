const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const callbacks = [];
const context = vm.createContext({
    Conf: { activities: {}, etc: { loadingUrl: 'loading.png' }, eventDateFilter: {} },
    basic: { htmlspecialchars: value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;') },
    glot: { get: key => ({ facility_activity_all: '全{count}件', facility_activity_details: '詳しく見る' })[key] },
    PhotoMarkerController: { firstImage: ([activity]) => activity.image || '' },
    ActivityThumbnails: { forSource: (activity, image) => image },
    requestAnimationFrame: callback => callbacks.push(callback)
});
vm.runInContext(fs.readFileSync('detail/activities.js', 'utf8') + '\nthis.activities = new Activities();', context);
const entries = [
    { id: 'WP/1', title: '展示 <作品>', image: 'File:example.jpg', eventdate: '11/22', memo: '催しの概要' },
    { id: 'WP/2', title: '写真なし', memo: '別の概要' }
];
const list = context.activities.makeActivityList(entries);
assert.match(list, /facility-list-WP1/);
assert.match(list, /展示 &lt;作品>/);
assert.match(list, /11\/22/);
assert.match(list, /催しの概要/);
assert.match(list, /別の概要/);
assert.match(list, /data-activity-id="WP2"/);
const single = context.activities.makeActivityList([entries[0]]);
assert.match(single, /facility-activity-list/);
assert.match(single, /data-activity-id="WP1"/);
assert.equal(context.activities.makeActivityList([]), '');
assert.equal(callbacks.length, 2, 'Commons image is requested for each rendered list');
let release;
const actions = [];
const target = { getBoundingClientRect: () => ({ top: 420 }) };
const scroller = { scrollTop: 100, scrollTo: options => actions.push(['scroll', options.top, options.behavior]) };
const header = { getBoundingClientRect: () => ({ bottom: 80 }) };
context.document = { getElementById: id => ({ WP1: target, btmHeader: scroller, detailHeader: header })[id] || null };
let portrait = true;
context.window = { matchMedia: () => ({ matches: portrait }) };
context.winCont = { setSidebar: mode => { actions.push(['resize', mode]); return new Promise(resolve => { release = resolve; }); } };
(async () => {
    const pending = context.activities.moveTo('WP1');
    assert.deepEqual(actions, [['resize', 'viewMax']]);
    release();
    await pending;
    assert.deepEqual(actions, [['resize', 'viewMax'], ['scroll', 432, 'smooth']], 'title remains below the sticky header');
    actions.length = 0;
    portrait = false;
    await context.activities.moveTo('WP1');
    assert.deepEqual(actions, [['scroll', 432, 'smooth']], 'landscape keeps its current size and scrolls to the title');
    await context.activities.moveTo('missing');
    assert.equal(actions.length, 1, 'missing targets do not resize the sidebar');
    console.log('PASS: activity list maximizes in portrait only and scrolls to the title');
})().catch(error => { console.error(error); process.exitCode = 1; });
