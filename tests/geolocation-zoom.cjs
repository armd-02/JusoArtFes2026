const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

let control;
const moves = [];
let refreshes = 0;
class GeolocateControl {
    constructor(options) { this.options = options; this.events = {}; control = this; }
    on(name, callback) { this.events[name] = callback; }
}
const context = vm.createContext({
    maplibregl: { GeolocateControl, AttributionControl: class {}, NavigationControl: class {} },
    listTable: { refreshDerivedValues() { refreshes++; } }
});
vm.runInContext(fs.readFileSync('lib/maplib.js', 'utf8') + '\nthis.mapController = new Maplibre();', context);
context.mapController.map = { addControl() {}, easeTo(options, eventData) { moves.push({options, eventData}); } };
context.mapController.addNavigation('top-right');
assert.equal(control.options.trackUserLocation, true);
control._updateCamera({coords: {longitude: 135.48, latitude: 34.72}});
assert.deepEqual(Array.from(moves[0].options.center), [135.48, 34.72]);
assert.equal('zoom' in moves[0].options, false, 'location updates preserve the current zoom');
assert.equal(moves[0].eventData.geolocateSource, true, 'location updates retain tracking');
control.events.geolocate({coords: {longitude: 135.48, latitude: 34.72}});
assert.deepEqual(Array.from(context.mapController.getUserLocation()), [135.48, 34.72]);
assert.equal(refreshes, 1);
console.log('PASS: location tracking preserves zoom and updates the location list');
