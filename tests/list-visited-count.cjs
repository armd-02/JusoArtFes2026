const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const label = {};
const visited = new Set(['node/1']);
const context = vm.createContext({
    document: { getElementById: id => id === 'listVisitedCount' ? label : null },
    Conf: { etc: { localSave: 'festival' } },
    poiStatusCont: {
        getStatusId: id => ({ 'WP/1': 'node/1', 'WP/2': 'node/1', 'WP/3': 'node/2' })[id] || id,
        getRecord: id => ({ visited: visited.has(id) })
    },
    glot: { get: () => '（訪問済み：{visited}件/{total}件）' }
});
vm.runInContext(fs.readFileSync('lib/listtable.js', 'utf8') + '\nthis.table = new ListTable();', context);
context.table.updateVisitedCount([['WP/1'], ['WP/2'], ['WP/3']]);
assert.equal(label.textContent, '（訪問済み：1件/2件）');
visited.add('node/2');
context.table.updateVisitedCount([['WP/1'], ['WP/3']]);
assert.equal(label.textContent, '（訪問済み：2件/2件）');
context.table.updateVisitedCount([]);
assert.equal(label.textContent, '（訪問済み：0件/0件）');
context.Conf.etc.localSave = '';
context.table.updateVisitedCount([['WP/1']]);
assert.equal(label.hidden, true);
console.log('PASS: visited count deduplicates facilities, reflects updates and hides without personal storage');
