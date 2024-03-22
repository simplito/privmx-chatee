"use strict";
function loadBindings() {
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
        console.log("in worker - load bindings with loadScripts");
        importScripts('bindings.js');
    }
    else {
        console.log("in main thread.. do nothing");
    }
}
loadBindings();
//# sourceMappingURL=loader.js.map