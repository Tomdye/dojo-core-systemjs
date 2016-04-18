(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise'], factory);
    }
})(function (require, exports) {
    "use strict";
    const Promise_1 = require('../Promise');
    /*
    Based on sizeof.js by Stephen Morley
    
    A function to calculate the approximate memory usage of objects
    
    Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
    the terms of the CC0 1.0 Universal legal code:
    
    http://creativecommons.org/publicdomain/zero/1.0/legalcode
    
    Returns the approximate memory usage, in bytes, of the specified object.
    */
    function getApproximateByteSize(object) {
        let objects = [object];
        let size = 0;
        for (let index = 0; index < objects.length; index++) {
            switch (typeof objects[index]) {
                case 'boolean':
                    size += 4;
                    break;
                case 'number':
                    size += 8;
                    break;
                case 'string':
                    size += 2 * objects[index].length;
                    break;
                case 'object':
                    // if the object is not an array, add the sizes of the keys
                    if (Object.prototype.toString.call(objects[index]) !== '[object Array]') {
                        for (let key in objects[index]) {
                            size += 2 * key.length;
                        }
                    }
                    // loop over the keys
                    for (let key in objects[index]) {
                        // determine whether the value has already been processed
                        let processed = false;
                        for (let j = 0; j < objects.length; j++) {
                            if (objects[j] === objects[index][key]) {
                                processed = true;
                                break;
                            }
                        }
                        // queue the value to be processed if appropriate
                        if (!processed) {
                            objects.push(objects[index][key]);
                        }
                    }
            }
        }
        return size;
    }
    exports.getApproximateByteSize = getApproximateByteSize;
    /**
     * Calls the method or returns undefined.
     */
    function invokeOrNoop(O, P, args = []) {
        const method = O[P];
        return method ? method.apply(O, args) : undefined;
    }
    exports.invokeOrNoop = invokeOrNoop;
    function normalizeStrategy({ size, highWaterMark = 1 }) {
        return {
            size: size,
            highWaterMark: highWaterMark > 0 ? highWaterMark : 1
        };
    }
    exports.normalizeStrategy = normalizeStrategy;
    function promiseInvokeOrFallbackOrNoop(object, method1, args1, method2, args2 = []) {
        let method;
        try {
            method = object[method1];
        }
        catch (error) {
            return Promise_1.default.reject(error);
        }
        if (!method) {
            return promiseInvokeOrNoop(object, method2, args2);
        }
        if (!args1) {
            args1 = [];
        }
        try {
            return Promise_1.default.resolve(method.apply(object, args1));
        }
        catch (error) {
            return Promise_1.default.reject(error);
        }
    }
    exports.promiseInvokeOrFallbackOrNoop = promiseInvokeOrFallbackOrNoop;
    /**
     * Returns a promise that resolves the with result of the method call or undefined.
     */
    function promiseInvokeOrNoop(O, P, args = []) {
        let method;
        try {
            method = O[P];
        }
        catch (error) {
            return Promise_1.default.reject(error);
        }
        if (!method) {
            return Promise_1.default.resolve();
        }
        try {
            return Promise_1.default.resolve(method.apply(O, args));
        }
        catch (error) {
            return Promise_1.default.reject(error);
        }
    }
    exports.promiseInvokeOrNoop = promiseInvokeOrNoop;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJlYW1zL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBQ0EsMEJBQW9CLFlBQVksQ0FBQyxDQUFBO0lBRWpDOzs7Ozs7Ozs7OztNQVdFO0lBQ0YsZ0NBQXVDLE1BQVc7UUFDakQsSUFBSSxPQUFPLEdBQUcsQ0FBRSxNQUFNLENBQUUsQ0FBQztRQUN6QixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7UUFFYixHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUNyRCxNQUFNLENBQUMsQ0FBQyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLEtBQUssU0FBUztvQkFDYixJQUFJLElBQUksQ0FBQyxDQUFDO29CQUNWLEtBQUssQ0FBQztnQkFFUCxLQUFLLFFBQVE7b0JBQ1osSUFBSSxJQUFJLENBQUMsQ0FBQztvQkFDVixLQUFLLENBQUM7Z0JBRVAsS0FBSyxRQUFRO29CQUNaLElBQUksSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQztvQkFDbEMsS0FBSyxDQUFDO2dCQUVQLEtBQUssUUFBUTtvQkFDWiwyREFBMkQ7b0JBQzNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7d0JBQ3pFLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ2hDLElBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQzt3QkFDeEIsQ0FBQztvQkFD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RSxJQUFJLE1BQVcsQ0FBQztRQUVoQixJQUFJLENBQUM7WUFDSixNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2YsQ0FDQTtRQUFBLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDZCxNQUFNLENBQUMsaUJBQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNiLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxJQUFJLENBQUM7WUFDSixNQUFNLENBQUMsaUJBQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUNBO1FBQUEsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNkLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixDQUFDO0lBQ0YsQ0FBQztJQXBCZSwyQkFBbUIsc0JBb0JsQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3RyYXRlZ3kgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IFByb21pc2UgZnJvbSAnLi4vUHJvbWlzZSc7XG5cbi8qXG5CYXNlZCBvbiBzaXplb2YuanMgYnkgU3RlcGhlbiBNb3JsZXlcblxuQSBmdW5jdGlvbiB0byBjYWxjdWxhdGUgdGhlIGFwcHJveGltYXRlIG1lbW9yeSB1c2FnZSBvZiBvYmplY3RzXG5cbkNyZWF0ZWQgYnkgU3RlcGhlbiBNb3JsZXkgLSBodHRwOi8vY29kZS5zdGVwaGVubW9ybGV5Lm9yZy8gLSBhbmQgcmVsZWFzZWQgdW5kZXJcbnRoZSB0ZXJtcyBvZiB0aGUgQ0MwIDEuMCBVbml2ZXJzYWwgbGVnYWwgY29kZTpcblxuaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvcHVibGljZG9tYWluL3plcm8vMS4wL2xlZ2FsY29kZVxuXG5SZXR1cm5zIHRoZSBhcHByb3hpbWF0ZSBtZW1vcnkgdXNhZ2UsIGluIGJ5dGVzLCBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cbiovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwcm94aW1hdGVCeXRlU2l6ZShvYmplY3Q6IGFueSk6IG51bWJlciB7XG5cdGxldCBvYmplY3RzID0gWyBvYmplY3QgXTtcblx0bGV0IHNpemUgPSAwO1xuXG5cdGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBvYmplY3RzLmxlbmd0aDsgaW5kZXgrKykge1xuXHRcdHN3aXRjaCAodHlwZW9mIG9iamVjdHNbaW5kZXhdKSB7XG5cdFx0XHRjYXNlICdib29sZWFuJzpcblx0XHRcdFx0c2l6ZSArPSA0O1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnbnVtYmVyJzpcblx0XHRcdFx0c2l6ZSArPSA4O1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0c2l6ZSArPSAyICogb2JqZWN0c1tpbmRleF0ubGVuZ3RoO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnb2JqZWN0Jzpcblx0XHRcdFx0Ly8gaWYgdGhlIG9iamVjdCBpcyBub3QgYW4gYXJyYXksIGFkZCB0aGUgc2l6ZXMgb2YgdGhlIGtleXNcblx0XHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3RzW2luZGV4XSkgIT09ICdbb2JqZWN0IEFycmF5XScpIHtcblx0XHRcdFx0XHRmb3IgKGxldCBrZXkgaW4gb2JqZWN0c1tpbmRleF0pIHtcblx0XHRcdFx0XHRcdHNpemUgKz0gMiAqIGtleS5sZW5ndGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gbG9vcCBvdmVyIHRoZSBrZXlzXG5cdFx0XHRcdGZvciAobGV0IGtleSBpbiBvYmplY3RzW2luZGV4XSkge1xuXHRcdFx0XHRcdC8vIGRldGVybWluZSB3aGV0aGVyIHRoZSB2YWx1ZSBoYXMgYWxyZWFkeSBiZWVuIHByb2Nlc3NlZFxuXHRcdFx0XHRcdGxldCBwcm9jZXNzZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgb2JqZWN0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0aWYgKG9iamVjdHNbal0gPT09IG9iamVjdHNbaW5kZXhdW2tleV0pIHtcblx0XHRcdFx0XHRcdFx0cHJvY2Vzc2VkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcXVldWUgdGhlIHZhbHVlIHRvIGJlIHByb2Nlc3NlZCBpZiBhcHByb3ByaWF0ZVxuXHRcdFx0XHRcdGlmICghcHJvY2Vzc2VkKSB7XG5cdFx0XHRcdFx0XHRvYmplY3RzLnB1c2gob2JqZWN0c1tpbmRleF1ba2V5XSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNpemU7XG59XG5cbi8qKlxuICogQ2FsbHMgdGhlIG1ldGhvZCBvciByZXR1cm5zIHVuZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludm9rZU9yTm9vcChPOiBhbnksIFA6IHN0cmluZywgYXJnczogYW55W10gPSBbXSk6IGFueSB7XG5cdGNvbnN0IG1ldGhvZDogRnVuY3Rpb24gPSBPW1BdO1xuXHRyZXR1cm4gbWV0aG9kID8gbWV0aG9kLmFwcGx5KE8sIGFyZ3MpIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplU3RyYXRlZ3k8VD4oeyBzaXplLCBoaWdoV2F0ZXJNYXJrID0gMSB9OiBTdHJhdGVneTxUPik6IFN0cmF0ZWd5PFQ+IHtcblx0cmV0dXJuIDxTdHJhdGVneSA8VD4+IHtcblx0XHRzaXplOiBzaXplLFxuXHRcdGhpZ2hXYXRlck1hcms6IGhpZ2hXYXRlck1hcmsgPiAwID8gaGlnaFdhdGVyTWFyayA6IDFcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb21pc2VJbnZva2VPckZhbGxiYWNrT3JOb29wKG9iamVjdDogYW55LCBtZXRob2QxOiBzdHJpbmcsIGFyZ3MxOiBhbnlbXSwgbWV0aG9kMjogc3RyaW5nLCBhcmdzMjogYW55W10gPSBbXSk6IFByb21pc2U8YW55PiB7XG5cdGxldCBtZXRob2Q6IEZ1bmN0aW9uO1xuXG5cdHRyeSB7XG5cdFx0bWV0aG9kID0gb2JqZWN0W21ldGhvZDFdO1xuXHR9XG5cdGNhdGNoIChlcnJvciApIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuXHR9XG5cblx0aWYgKCFtZXRob2QpIHtcblx0XHRyZXR1cm4gcHJvbWlzZUludm9rZU9yTm9vcChvYmplY3QsIG1ldGhvZDIsIGFyZ3MyKTtcblx0fVxuXG5cdGlmICghYXJnczEpIHtcblx0XHRhcmdzMSA9IFtdO1xuXHR9XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG1ldGhvZC5hcHBseShvYmplY3QsIGFyZ3MxKSk7XG5cdH1cblx0Y2F0Y2ggKGVycm9yKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcblx0fVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdGhlIHdpdGggcmVzdWx0IG9mIHRoZSBtZXRob2QgY2FsbCBvciB1bmRlZmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9taXNlSW52b2tlT3JOb29wKE86IGFueSwgUDogc3RyaW5nLCBhcmdzOiBhbnlbXSA9IFtdKTogUHJvbWlzZTxhbnk+IHtcblx0bGV0IG1ldGhvZDogYW55O1xuXG5cdHRyeSB7XG5cdFx0bWV0aG9kID0gT1tQXTtcblx0fVxuXHRjYXRjaCAoZXJyb3IpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuXHR9XG5cblx0aWYgKCFtZXRob2QpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblxuXHR0cnkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobWV0aG9kLmFwcGx5KE8sIGFyZ3MpKTtcblx0fVxuXHRjYXRjaCAoZXJyb3IpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuXHR9XG59XG4iXX0=