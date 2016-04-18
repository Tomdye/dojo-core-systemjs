(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './global'], factory);
    }
})(function (require, exports) {
    "use strict";
    const global_1 = require('./global');
    exports.cache = Object.create(null);
    exports.testFunctions = Object.create(null);
    /**
     * Conditional loading of AMD modules based on a has feature test value.
     *
     * @param resourceId Gives the resolved module id to load.
     * @param require The loader require function with respect to the module that contained the plugin resource in it's dependency list.
     * @param load Callback to loader that consumes result of plugin demand.
     */
    function load(resourceId, require, load, config) {
        if (resourceId) {
            require([resourceId], load);
        }
        else {
            load();
        }
    }
    exports.load = load;
    /**
     * Resolves resourceId into a module id based on possibly-nested tenary expression that branches on has feature test value(s).
     *
     * @param resourceId The id of the module
     * @param normalize Resolves a relative module id into an absolute module id
     */
    function normalize(resourceId, normalize) {
        const tokens = resourceId.match(/[\?:]|[^:\?]*/g);
        let i = 0;
        function get(skip) {
            const term = tokens[i++];
            if (term === ':') {
                // empty string module name, resolves to null
                return null;
            }
            else {
                // postfixed with a ? means it is a feature to branch on, the term is the name of the feature
                if (tokens[i++] === '?') {
                    if (!skip && has(term)) {
                        // matched the feature, get the first value from the options
                        return get();
                    }
                    else {
                        // did not match, get the second value, passing over the first
                        get(true);
                        return get(skip);
                    }
                }
                // a module
                return term;
            }
        }
        resourceId = get();
        return resourceId && normalize(resourceId);
    }
    exports.normalize = normalize;
    /**
     * Check if a feature has already been registered
     *
     * @param feature the name of the feature
     * @return if the feature has been registered
     */
    function exists(feature) {
        return feature in exports.cache || feature in exports.testFunctions;
    }
    exports.exists = exists;
    /**
     * Register a new test for a named feature.
     *
     * @example
     * has.add('dom-addeventlistener', !!document.addEventListener);
     *
     * @example
     * has.add('touch-events', function () {
     *    return 'ontouchstart' in document
     * });
     *
     * @param feature the name of the feature
     * @param value the value reported of the feature, or a function that will be executed once on first test
     * @param overwrite if an existing value should be overwritten. Defaults to false.
     * @return if the feature test was successfully added
     */
    function add(feature, value, overwrite = false) {
        if (exists(feature) && !overwrite) {
            return false;
        }
        if (typeof value === 'function') {
            exports.testFunctions[feature] = value;
        }
        else {
            exports.cache[feature] = value;
            // Ensure we don't have stale tests sitting around that could overwrite a cache value being set
            delete exports.testFunctions[feature];
        }
        return true;
    }
    exports.add = add;
    /**
     * Return the current value of a named feature.
     *
     * @param feature The name (if a string) or identifier (if an integer) of the feature to test.
     * @return The value of a given feature test
     */
    function has(feature) {
        let result;
        if (exports.testFunctions[feature]) {
            result = exports.cache[feature] = exports.testFunctions[feature].call(null);
            exports.testFunctions[feature] = null;
        }
        else {
            result = exports.cache[feature];
        }
        return result;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = has;
    /*
     * OOTB feature tests
     */
    add('host-browser', typeof document !== 'undefined' && typeof location !== 'undefined');
    add('host-node', function () {
        if (typeof process === 'object' && process.versions && process.versions.node) {
            return process.versions.node;
        }
    });
    add('float32array', 'Float32Array' in global_1.default);
    add('setimmediate', typeof global_1.default.setImmediate !== 'undefined');
    add('dom-mutationobserver', function () {
        return has('host-browser') && Boolean(global_1.default.MutationObserver || global_1.default.WebKitMutationObserver);
    });
    add('microtasks', function () {
        return has('promise') || has('host-node') || has('dom-mutationobserver');
    });
    add('object-assign', typeof Object.assign === 'function');
    add('object-observe', typeof Object.observe === 'function');
    add('postmessage', typeof postMessage === 'function');
    add('promise', typeof global_1.default.Promise !== 'undefined');
    add('raf', typeof requestAnimationFrame === 'function');
    add('weakmap', function () {
        if (typeof global_1.default.WeakMap !== 'undefined') {
            const key1 = {};
            const key2 = {};
            const map = new global_1.default.WeakMap([[key1, 1]]);
            return map.get(key1) === 1 && map.set(key2, 2) === map;
        }
        return false;
    });
    add('arraybuffer', typeof global_1.default.ArrayBuffer !== 'undefined');
    add('formdata', typeof global_1.default.FormData !== 'undefined');
    add('xhr', typeof global_1.default.XMLHttpRequest !== 'undefined');
    add('xhr2', has('xhr') && 'responseType' in global_1.default.XMLHttpRequest.prototype);
    add('xhr2-blob', function () {
        if (!has('xhr2')) {
            return false;
        }
        const request = new XMLHttpRequest();
        request.open('GET', '/', true);
        request.responseType = 'blob';
        request.abort();
        return request.responseType === 'blob';
    });
    // Native Array methods
    add('es6-array-from', 'from' in global_1.default.Array);
    add('es6-array-of', 'of' in global_1.default.Array);
    add('es6-array-fill', 'fill' in global_1.default.Array.prototype);
    add('es6-array-findIndex', 'findIndex' in global_1.default.Array.prototype);
    add('es6-array-find', 'find' in global_1.default.Array.prototype);
    add('es6-array-copyWithin', 'copyWithin' in global_1.default.Array.prototype);
    add('es7-array-includes', 'includes' in global_1.default.Array.prototype);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2hhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFBQSx5QkFBbUIsVUFBVSxDQUFDLENBQUE7SUFNakIsYUFBSyxHQUFxQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlDLHFCQUFhLEdBQXFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFbkU7Ozs7OztPQU1HO0lBQ0gsY0FBcUIsVUFBa0IsRUFBRSxPQUEyQixFQUFFLElBQTJCLEVBQUUsTUFBMEI7UUFDNUgsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNoQixPQUFPLENBQUMsQ0FBRSxVQUFVLENBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDTCxJQUFJLEVBQUUsQ0FBQztRQUNSLENBQUM7SUFDRixDQUFDO0lBUGUsWUFBSSxPQU9uQixDQUFBO0lBRUQ7Ozs7O09BS0c7SUFDSCxtQkFBMEIsVUFBa0IsRUFBRSxTQUF1QztRQUNwRixNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsYUFBYSxJQUFjO1lBQzFCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3pCLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNsQiw2Q0FBNkM7Z0JBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDYixDQUFDO1lBQ0QsSUFBSSxDQUFDLENBQUM7Z0JBQ0wsNkZBQTZGO2dCQUM3RixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUN6QixF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QyxLQUFLLENBQUMsQ0FBQztJQUMxQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxJQUFJLGdCQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3hELEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxXQUFXLElBQUksZ0JBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEUsR0FBRyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sSUFBSSxnQkFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4RCxHQUFHLENBQUMsc0JBQXNCLEVBQUUsWUFBWSxJQUFJLGdCQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BFLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxVQUFVLElBQUksZ0JBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZ2xvYmFsIGZyb20gJy4vZ2xvYmFsJztcbmltcG9ydCB7IEhhc2ggfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgdHlwZSBUZXN0UmVzdWx0ID0gYm9vbGVhbiB8IHN0cmluZyB8IG51bWJlcjtcbmV4cG9ydCB0eXBlIFRlc3RNZXRob2QgPSAoKSA9PiBUZXN0UmVzdWx0O1xuXG5leHBvcnQgY29uc3QgY2FjaGU6IEhhc2g8VGVzdFJlc3VsdD4gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuZXhwb3J0IGNvbnN0IHRlc3RGdW5jdGlvbnM6IEhhc2g8VGVzdE1ldGhvZD4gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4vKipcbiAqIENvbmRpdGlvbmFsIGxvYWRpbmcgb2YgQU1EIG1vZHVsZXMgYmFzZWQgb24gYSBoYXMgZmVhdHVyZSB0ZXN0IHZhbHVlLlxuICpcbiAqIEBwYXJhbSByZXNvdXJjZUlkIEdpdmVzIHRoZSByZXNvbHZlZCBtb2R1bGUgaWQgdG8gbG9hZC5cbiAqIEBwYXJhbSByZXF1aXJlIFRoZSBsb2FkZXIgcmVxdWlyZSBmdW5jdGlvbiB3aXRoIHJlc3BlY3QgdG8gdGhlIG1vZHVsZSB0aGF0IGNvbnRhaW5lZCB0aGUgcGx1Z2luIHJlc291cmNlIGluIGl0J3MgZGVwZW5kZW5jeSBsaXN0LlxuICogQHBhcmFtIGxvYWQgQ2FsbGJhY2sgdG8gbG9hZGVyIHRoYXQgY29uc3VtZXMgcmVzdWx0IG9mIHBsdWdpbiBkZW1hbmQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkKHJlc291cmNlSWQ6IHN0cmluZywgcmVxdWlyZTogRG9qb0xvYWRlci5SZXF1aXJlLCBsb2FkOiAodmFsdWU/OiBhbnkpID0+IHZvaWQsIGNvbmZpZz86IERvam9Mb2FkZXIuQ29uZmlnKTogdm9pZCB7XG5cdGlmIChyZXNvdXJjZUlkKSB7XG5cdFx0cmVxdWlyZShbIHJlc291cmNlSWQgXSwgbG9hZCk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0bG9hZCgpO1xuXHR9XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgcmVzb3VyY2VJZCBpbnRvIGEgbW9kdWxlIGlkIGJhc2VkIG9uIHBvc3NpYmx5LW5lc3RlZCB0ZW5hcnkgZXhwcmVzc2lvbiB0aGF0IGJyYW5jaGVzIG9uIGhhcyBmZWF0dXJlIHRlc3QgdmFsdWUocykuXG4gKlxuICogQHBhcmFtIHJlc291cmNlSWQgVGhlIGlkIG9mIHRoZSBtb2R1bGVcbiAqIEBwYXJhbSBub3JtYWxpemUgUmVzb2x2ZXMgYSByZWxhdGl2ZSBtb2R1bGUgaWQgaW50byBhbiBhYnNvbHV0ZSBtb2R1bGUgaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShyZXNvdXJjZUlkOiBzdHJpbmcsIG5vcm1hbGl6ZTogKG1vZHVsZUlkOiBzdHJpbmcpID0+IHN0cmluZyk6IHN0cmluZyB7XG5cdGNvbnN0IHRva2VucyA9IHJlc291cmNlSWQubWF0Y2goL1tcXD86XXxbXjpcXD9dKi9nKTtcblx0bGV0IGkgPSAwO1xuXG5cdGZ1bmN0aW9uIGdldChza2lwPzogYm9vbGVhbik6IHN0cmluZyB7XG5cdFx0Y29uc3QgdGVybSA9IHRva2Vuc1tpKytdO1xuXHRcdGlmICh0ZXJtID09PSAnOicpIHtcblx0XHRcdC8vIGVtcHR5IHN0cmluZyBtb2R1bGUgbmFtZSwgcmVzb2x2ZXMgdG8gbnVsbFxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0Ly8gcG9zdGZpeGVkIHdpdGggYSA/IG1lYW5zIGl0IGlzIGEgZmVhdHVyZSB0byBicmFuY2ggb24sIHRoZSB0ZXJtIGlzIHRoZSBuYW1lIG9mIHRoZSBmZWF0dXJlXG5cdFx0XHRpZiAodG9rZW5zW2krK10gPT09ICc/Jykge1xuXHRcdFx0XHRpZiAoIXNraXAgJiYgaGFzKHRlcm0pKSB7XG5cdFx0XHRcdFx0Ly8gbWF0Y2hlZCB0aGUgZmVhdHVyZSwgZ2V0IHRoZSBmaXJzdCB2YWx1ZSBmcm9tIHRoZSBvcHRpb25zXG5cdFx0XHRcdFx0cmV0dXJuIGdldCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdC8vIGRpZCBub3QgbWF0Y2gsIGdldCB0aGUgc2Vjb25kIHZhbHVlLCBwYXNzaW5nIG92ZXIgdGhlIGZpcnN0XG5cdFx0XHRcdFx0Z2V0KHRydWUpO1xuXHRcdFx0XHRcdHJldHVybiBnZXQoc2tpcCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIGEgbW9kdWxlXG5cdFx0XHRyZXR1cm4gdGVybTtcblx0XHR9XG5cdH1cblx0cmVzb3VyY2VJZCA9IGdldCgpO1xuXHRyZXR1cm4gcmVzb3VyY2VJZCAmJiBub3JtYWxpemUocmVzb3VyY2VJZCk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBmZWF0dXJlIGhhcyBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZFxuICpcbiAqIEBwYXJhbSBmZWF0dXJlIHRoZSBuYW1lIG9mIHRoZSBmZWF0dXJlXG4gKiBAcmV0dXJuIGlmIHRoZSBmZWF0dXJlIGhhcyBiZWVuIHJlZ2lzdGVyZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4aXN0cyhmZWF0dXJlOiBzdHJpbmcpOiBib29sZWFuIHtcblx0cmV0dXJuIGZlYXR1cmUgaW4gY2FjaGUgfHwgZmVhdHVyZSBpbiB0ZXN0RnVuY3Rpb25zO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IHRlc3QgZm9yIGEgbmFtZWQgZmVhdHVyZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogaGFzLmFkZCgnZG9tLWFkZGV2ZW50bGlzdGVuZXInLCAhIWRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpO1xuICpcbiAqIEBleGFtcGxlXG4gKiBoYXMuYWRkKCd0b3VjaC1ldmVudHMnLCBmdW5jdGlvbiAoKSB7XG4gKiAgICByZXR1cm4gJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnRcbiAqIH0pO1xuICpcbiAqIEBwYXJhbSBmZWF0dXJlIHRoZSBuYW1lIG9mIHRoZSBmZWF0dXJlXG4gKiBAcGFyYW0gdmFsdWUgdGhlIHZhbHVlIHJlcG9ydGVkIG9mIHRoZSBmZWF0dXJlLCBvciBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBvbmNlIG9uIGZpcnN0IHRlc3RcbiAqIEBwYXJhbSBvdmVyd3JpdGUgaWYgYW4gZXhpc3RpbmcgdmFsdWUgc2hvdWxkIGJlIG92ZXJ3cml0dGVuLiBEZWZhdWx0cyB0byBmYWxzZS5cbiAqIEByZXR1cm4gaWYgdGhlIGZlYXR1cmUgdGVzdCB3YXMgc3VjY2Vzc2Z1bGx5IGFkZGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQoZmVhdHVyZTogc3RyaW5nLCB2YWx1ZTogVGVzdFJlc3VsdCB8IFRlc3RNZXRob2QsIG92ZXJ3cml0ZTogYm9vbGVhbiA9IGZhbHNlKTogYm9vbGVhbiB7XG5cdGlmIChleGlzdHMoZmVhdHVyZSkgJiYgIW92ZXJ3cml0ZSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcblx0XHR0ZXN0RnVuY3Rpb25zW2ZlYXR1cmVdID0gPFRlc3RNZXRob2Q+IHZhbHVlO1xuXHR9XG5cdGVsc2Uge1xuXHRcdGNhY2hlW2ZlYXR1cmVdID0gPFRlc3RSZXN1bHQ+IHZhbHVlO1xuXHRcdC8vIEVuc3VyZSB3ZSBkb24ndCBoYXZlIHN0YWxlIHRlc3RzIHNpdHRpbmcgYXJvdW5kIHRoYXQgY291bGQgb3ZlcndyaXRlIGEgY2FjaGUgdmFsdWUgYmVpbmcgc2V0XG5cdFx0ZGVsZXRlIHRlc3RGdW5jdGlvbnNbZmVhdHVyZV07XG5cdH1cblx0cmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjdXJyZW50IHZhbHVlIG9mIGEgbmFtZWQgZmVhdHVyZS5cbiAqXG4gKiBAcGFyYW0gZmVhdHVyZSBUaGUgbmFtZSAoaWYgYSBzdHJpbmcpIG9yIGlkZW50aWZpZXIgKGlmIGFuIGludGVnZXIpIG9mIHRoZSBmZWF0dXJlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIFRoZSB2YWx1ZSBvZiBhIGdpdmVuIGZlYXR1cmUgdGVzdFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBoYXMoZmVhdHVyZTogc3RyaW5nKTogVGVzdFJlc3VsdCB7XG5cdGxldCByZXN1bHQ6IGFueTtcblxuXHRpZiAodGVzdEZ1bmN0aW9uc1tmZWF0dXJlXSkge1xuXHRcdHJlc3VsdCA9IGNhY2hlW2ZlYXR1cmVdID0gdGVzdEZ1bmN0aW9uc1tmZWF0dXJlXS5jYWxsKG51bGwpO1xuXHRcdHRlc3RGdW5jdGlvbnNbZmVhdHVyZV0gPSBudWxsO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHJlc3VsdCA9IGNhY2hlW2ZlYXR1cmVdO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLypcbiAqIE9PVEIgZmVhdHVyZSB0ZXN0c1xuICovXG5hZGQoJ2hvc3QtYnJvd3NlcicsIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGxvY2F0aW9uICE9PSAndW5kZWZpbmVkJyk7XG5hZGQoJ2hvc3Qtbm9kZScsIGZ1bmN0aW9uICgpIHtcblx0aWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiBwcm9jZXNzLnZlcnNpb25zICYmIHByb2Nlc3MudmVyc2lvbnMubm9kZSkge1xuXHRcdHJldHVybiBwcm9jZXNzLnZlcnNpb25zLm5vZGU7XG5cdH1cbn0pO1xuYWRkKCdmbG9hdDMyYXJyYXknLCAnRmxvYXQzMkFycmF5JyBpbiBnbG9iYWwpO1xuYWRkKCdzZXRpbW1lZGlhdGUnLCB0eXBlb2YgZ2xvYmFsLnNldEltbWVkaWF0ZSAhPT0gJ3VuZGVmaW5lZCcpO1xuYWRkKCdkb20tbXV0YXRpb25vYnNlcnZlcicsIGZ1bmN0aW9uKCk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gaGFzKCdob3N0LWJyb3dzZXInKSAmJiBCb29sZWFuKGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyKTtcbn0pO1xuYWRkKCdtaWNyb3Rhc2tzJywgZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gaGFzKCdwcm9taXNlJykgfHwgaGFzKCdob3N0LW5vZGUnKSB8fCBoYXMoJ2RvbS1tdXRhdGlvbm9ic2VydmVyJyk7XG59KTtcbmFkZCgnb2JqZWN0LWFzc2lnbicsIHR5cGVvZiAoPGFueT4gT2JqZWN0KS5hc3NpZ24gPT09ICdmdW5jdGlvbicpO1xuYWRkKCdvYmplY3Qtb2JzZXJ2ZScsIHR5cGVvZiAoPGFueT4gT2JqZWN0KS5vYnNlcnZlID09PSAnZnVuY3Rpb24nKTtcbmFkZCgncG9zdG1lc3NhZ2UnLCB0eXBlb2YgcG9zdE1lc3NhZ2UgPT09ICdmdW5jdGlvbicpO1xuYWRkKCdwcm9taXNlJywgdHlwZW9mIGdsb2JhbC5Qcm9taXNlICE9PSAndW5kZWZpbmVkJyk7XG5hZGQoJ3JhZicsIHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09ICdmdW5jdGlvbicpO1xuYWRkKCd3ZWFrbWFwJywgZnVuY3Rpb24gKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbC5XZWFrTWFwICE9PSAndW5kZWZpbmVkJykge1xuXHRcdGNvbnN0IGtleTEgPSB7fTtcblx0XHRjb25zdCBrZXkyID0ge307XG5cdFx0Y29uc3QgbWFwID0gbmV3IGdsb2JhbC5XZWFrTWFwKFsgWyBrZXkxLCAxIF0gXSk7XG5cdFx0cmV0dXJuIG1hcC5nZXQoa2V5MSkgPT09IDEgJiYgbWFwLnNldChrZXkyLCAyKSA9PT0gbWFwO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn0pO1xuYWRkKCdhcnJheWJ1ZmZlcicsIHR5cGVvZiBnbG9iYWwuQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKTtcbmFkZCgnZm9ybWRhdGEnLCB0eXBlb2YgZ2xvYmFsLkZvcm1EYXRhICE9PSAndW5kZWZpbmVkJyk7XG5hZGQoJ3hocicsIHR5cGVvZiBnbG9iYWwuWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKTtcbmFkZCgneGhyMicsIGhhcygneGhyJykgJiYgJ3Jlc3BvbnNlVHlwZScgaW4gZ2xvYmFsLlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZSk7XG5hZGQoJ3hocjItYmxvYicsIGZ1bmN0aW9uICgpIHtcblx0aWYgKCFoYXMoJ3hocjInKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGNvbnN0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblx0cmVxdWVzdC5vcGVuKCdHRVQnLCAnLycsIHRydWUpO1xuXHRyZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdibG9iJztcblx0cmVxdWVzdC5hYm9ydCgpO1xuXHRyZXR1cm4gcmVxdWVzdC5yZXNwb25zZVR5cGUgPT09ICdibG9iJztcbn0pO1xuLy8gTmF0aXZlIEFycmF5IG1ldGhvZHNcbmFkZCgnZXM2LWFycmF5LWZyb20nLCAnZnJvbScgaW4gZ2xvYmFsLkFycmF5KTtcbmFkZCgnZXM2LWFycmF5LW9mJywgJ29mJyBpbiBnbG9iYWwuQXJyYXkpO1xuYWRkKCdlczYtYXJyYXktZmlsbCcsICdmaWxsJyBpbiBnbG9iYWwuQXJyYXkucHJvdG90eXBlKTtcbmFkZCgnZXM2LWFycmF5LWZpbmRJbmRleCcsICdmaW5kSW5kZXgnIGluIGdsb2JhbC5BcnJheS5wcm90b3R5cGUpO1xuYWRkKCdlczYtYXJyYXktZmluZCcsICdmaW5kJyBpbiBnbG9iYWwuQXJyYXkucHJvdG90eXBlKTtcbmFkZCgnZXM2LWFycmF5LWNvcHlXaXRoaW4nLCAnY29weVdpdGhpbicgaW4gZ2xvYmFsLkFycmF5LnByb3RvdHlwZSk7XG5hZGQoJ2VzNy1hcnJheS1pbmNsdWRlcycsICdpbmNsdWRlcycgaW4gZ2xvYmFsLkFycmF5LnByb3RvdHlwZSk7XG4iXX0=