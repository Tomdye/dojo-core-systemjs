(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './number', './has'], factory);
    }
})(function (require, exports) {
    "use strict";
    const number_1 = require('./number');
    const has_1 = require('./has');
    /**
     * Ensures a non-negative, non-infinite, safe integer.
     * @param length The number to validate
     * @return A proper length
     */
    function toLength(length) {
        length = Number(length);
        if (isNaN(length)) {
            return 0;
        }
        if (isFinite(length)) {
            length = Math.floor(length);
        }
        // Ensure a non-negative, real, safe integer
        return Math.min(Math.max(length, 0), number_1.MAX_SAFE_INTEGER);
    }
    /**
     * From ES6 7.1.4 ToInteger()
     * @param value A value to convert
     * @return An integer
     */
    function toInteger(value) {
        value = Number(value);
        if (isNaN(value)) {
            return 0;
        }
        if (value === 0 || !isFinite(value)) {
            return value;
        }
        return (value > 0 ? 1 : -1) * Math.floor(Math.abs(value));
    }
    /**
     * Normalizes an offset against a given length, wrapping it if negative.
     * @param value The original offset
     * @param length The total length to normalize against
     * @return If negative, provide a distance from the end (length); otherwise provide a distance from 0
     */
    function normalizeOffset(value, length) {
        return value < 0 ? Math.max(length + value, 0) : Math.min(value, length);
    }
    /**
     * The Array.from() method creates a new Array instance from an array-like or iterable object.
     *
     * @param arrayLike An array-like or iterable object to convert to an array
     * @param [mapFunction] A map function to call on each element in the array
     * @param [thisArg] The execution context for the map function
     * @return The new Array
     */
    function from(arrayLike, mapFunction, thisArg) {
        // Use the native Array.from() if it exists
        if (has_1.default('es6-array-from')) {
            return Array.from.apply(null, arguments);
        }
        if (arrayLike == null) {
            throw new TypeError('from: requires an array-like object');
        }
        if (mapFunction && thisArg) {
            mapFunction = mapFunction.bind(thisArg);
        }
        const Constructor = this;
        const items = Object(arrayLike);
        const length = toLength(items.length);
        // Support extension
        const array = (typeof Constructor === 'function') ? Object(new Constructor(length)) : new Array(length);
        for (let i = 0, value; i < length; i++) {
            value = items[i];
            array[i] = mapFunction ? mapFunction(value, i) : value;
        }
        array.length = length;
        return array;
    }
    exports.from = from;
    /**
     * Creates a new array from the function parameters.
     *
     * @param arguments Any number of arguments for the array
     * @return An array from the given arguments
     */
    function of() {
        if (has_1.default('es6-array-of')) {
            return Array.of.apply(null, arguments);
        }
        return Array.prototype.slice.call(arguments);
    }
    exports.of = of;
    /**
     * Fills elements of an array-like object with the specified value.
     *
     * @param target The target to fill
     * @param value The value to fill each element of the target with
     * @param [start] The first index to fill
     * @param [end] The (exclusive) index at which to stop filling
     * @return The filled target
     */
    function fill(target, value, start, end) {
        if (has_1.default('es6-array-fill')) {
            const method = Array.prototype.fill;
            return method.call.apply(method, arguments);
        }
        const length = toLength(target.length);
        let i = normalizeOffset(toInteger(start), length);
        end = normalizeOffset(end === undefined ? length : toInteger(end), length);
        while (i < end) {
            target[i++] = value;
        }
        return target;
    }
    exports.fill = fill;
    /**
     * Performs a linear search and returns the first index whose value satisfies the passed callback,
     * or -1 if no values satisfy it.
     *
     * @param target An array-like object
     * @param callback A function returning true if the current value satisfies its criteria
     * @param [thisArg] The execution context for the find function
     * @return The first index whose value satisfies the passed callback, or -1 if no values satisfy it
     */
    function findIndex(target, callback, thisArg) {
        if (has_1.default('es6-array-findIndex')) {
            const method = Array.prototype.findIndex;
            return method.call.apply(method, arguments);
        }
        const length = toLength(target.length);
        if (!callback) {
            throw new TypeError('find: second argument must be a function');
        }
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        for (let i = 0; i < length; i++) {
            if (callback(target[i], i, target)) {
                return i;
            }
        }
        return -1;
    }
    exports.findIndex = findIndex;
    /**
     * Finds and returns the first instance matching the callback or undefined if one is not found.
     *
     * @param target An array-like object
     * @param callback A function returning if the current value matches a criteria
     * @param [thisArg] The execution context for the find function
     * @return The first element matching the callback, or undefined if one does not exist
     */
    function find(target, callback, thisArg) {
        if (has_1.default('es6-array-find')) {
            const method = Array.prototype.find;
            return method.call.apply(method, arguments);
        }
        const index = findIndex(target, callback, thisArg);
        return index !== -1 ? target[index] : undefined;
    }
    exports.find = find;
    /**
     * Copies data internally within an array or array-like object.
     *
     * @param target The target array-like object
     * @param offset The index to start copying values to; if negative, it counts backwards from length
     * @param start The first (inclusive) index to copy; if negative, it counts backwards from length
     * @param end The last (exclusive) index to copy; if negative, it counts backwards from length
     * @return The target
     */
    function copyWithin(target, offset, start, end) {
        if (has_1.default('es6-array-copyWithin')) {
            const method = Array.prototype.copyWithin;
            return method.call.apply(method, arguments);
        }
        if (target == null) {
            throw new TypeError('copyWithin: target must be an array-like object');
        }
        const length = toLength(target.length);
        offset = normalizeOffset(toInteger(offset), length);
        start = normalizeOffset(toInteger(start), length);
        end = normalizeOffset(end === undefined ? length : toInteger(end), length);
        let count = Math.min(end - start, length - offset);
        let direction = 1;
        if (offset > start && offset < (start + count)) {
            direction = -1;
            start += count - 1;
            offset += count - 1;
        }
        while (count > 0) {
            if (start in target) {
                target[offset] = target[start];
            }
            else {
                delete target[offset];
            }
            offset += direction;
            start += direction;
            count--;
        }
        return target;
    }
    exports.copyWithin = copyWithin;
    /**
     * Determines whether an array includes a given value
     * @param target the target array-like object
     * @param searchElement the item to search for
     * @param fromIndex the starting index to search from
     */
    function includes(target, searchElement, fromIndex = 0) {
        if (has_1.default('es7-array-includes')) {
            const method = Array.prototype.includes;
            return method.call.apply(method, arguments);
        }
        let len = toLength(target.length);
        for (let i = fromIndex; i < len; ++i) {
            const currentElement = target[i];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
        }
        return false;
    }
    exports.includes = includes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXJyYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBQUEseUJBQW1ELFVBQVUsQ0FBQyxDQUFBO0lBQzlELHNCQUFnQixPQUFPLENBQUMsQ0FBQTtJQWV4Qjs7OztPQUlHO0lBQ0gsa0JBQWtCLE1BQWM7UUFDL0IsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDVixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBQ0QsNENBQTRDO1FBQzVDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLHlCQUFjLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILG1CQUFtQixLQUFVO1FBQzVCLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ1YsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsTUFBTSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxD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X1NBRkVfSU5URUdFUiBhcyBtYXhTYWZlSW50ZWdlciB9IGZyb20gJy4vbnVtYmVyJztcbmltcG9ydCBoYXMgZnJvbSAnLi9oYXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFycmF5TGlrZTxUPiB7XG5cdGxlbmd0aDogbnVtYmVyO1xuXHRbbjogbnVtYmVyXTogVDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNYXBDYWxsYmFjazxUPiB7XG5cdChlbGVtZW50OiBULCBpbmRleDogbnVtYmVyKTogVDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGaW5kQ2FsbGJhY2s8VD4ge1xuXHQoZWxlbWVudDogVCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IEFycmF5TGlrZTxUPik6IGJvb2xlYW47XG59XG5cbi8qKlxuICogRW5zdXJlcyBhIG5vbi1uZWdhdGl2ZSwgbm9uLWluZmluaXRlLCBzYWZlIGludGVnZXIuXG4gKiBAcGFyYW0gbGVuZ3RoIFRoZSBudW1iZXIgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm4gQSBwcm9wZXIgbGVuZ3RoXG4gKi9cbmZ1bmN0aW9uIHRvTGVuZ3RoKGxlbmd0aDogbnVtYmVyKTogbnVtYmVyIHtcblx0bGVuZ3RoID0gTnVtYmVyKGxlbmd0aCk7XG5cdGlmIChpc05hTihsZW5ndGgpKSB7XG5cdFx0cmV0dXJuIDA7XG5cdH1cblx0aWYgKGlzRmluaXRlKGxlbmd0aCkpIHtcblx0XHRsZW5ndGggPSBNYXRoLmZsb29yKGxlbmd0aCk7XG5cdH1cblx0Ly8gRW5zdXJlIGEgbm9uLW5lZ2F0aXZlLCByZWFsLCBzYWZlIGludGVnZXJcblx0cmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbmd0aCwgMCksIG1heFNhZmVJbnRlZ2VyKTtcbn1cblxuLyoqXG4gKiBGcm9tIEVTNiA3LjEuNCBUb0ludGVnZXIoKVxuICogQHBhcmFtIHZhbHVlIEEgdmFsdWUgdG8gY29udmVydFxuICogQHJldHVybiBBbiBpbnRlZ2VyXG4gKi9cbmZ1bmN0aW9uIHRvSW50ZWdlcih2YWx1ZTogYW55KTogbnVtYmVyIHtcblx0dmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuXHRpZiAoaXNOYU4odmFsdWUpKSB7XG5cdFx0cmV0dXJuIDA7XG5cdH1cblx0aWYgKHZhbHVlID09PSAwIHx8ICFpc0Zpbml0ZSh2YWx1ZSkpIHtcblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cblxuXHRyZXR1cm4gKHZhbHVlID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKHZhbHVlKSk7XG59XG5cbi8qKlxuICogTm9ybWFsaXplcyBhbiBvZmZzZXQgYWdhaW5zdCBhIGdpdmVuIGxlbmd0aCwgd3JhcHBpbmcgaXQgaWYgbmVnYXRpdmUuXG4gKiBAcGFyYW0gdmFsdWUgVGhlIG9yaWdpbmFsIG9mZnNldFxuICogQHBhcmFtIGxlbmd0aCBUaGUgdG90YWwgbGVuZ3RoIHRvIG5vcm1hbGl6ZSBhZ2FpbnN0XG4gKiBAcmV0dXJuIElmIG5lZ2F0aXZlLCBwcm92aWRlIGEgZGlzdGFuY2UgZnJvbSB0aGUgZW5kIChsZW5ndGgpOyBvdGhlcndpc2UgcHJvdmlkZSBhIGRpc3RhbmNlIGZyb20gMFxuICovXG5mdW5jdGlvbiBub3JtYWxpemVPZmZzZXQodmFsdWU6IG51bWJlciwgbGVuZ3RoOiBudW1iZXIpOiBudW1iZXIge1xuXHRyZXR1cm4gdmFsdWUgPCAwID8gTWF0aC5tYXgobGVuZ3RoICsgdmFsdWUsIDApIDogTWF0aC5taW4odmFsdWUsIGxlbmd0aCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tKGFycmF5TGlrZTogc3RyaW5nLCBtYXBGdW5jdGlvbj86IE1hcENhbGxiYWNrPHN0cmluZz4sIHRoaXNBcmc/OiB7fSk6IEFycmF5TGlrZTxzdHJpbmc+O1xuZXhwb3J0IGZ1bmN0aW9uIGZyb208VD4oYXJyYXlMaWtlOiBBcnJheUxpa2U8VD4sIG1hcEZ1bmN0aW9uPzogTWFwQ2FsbGJhY2s8VD4sIHRoaXNBcmc/OiB7fSk6IEFycmF5TGlrZTxUPjtcbi8qKlxuICogVGhlIEFycmF5LmZyb20oKSBtZXRob2QgY3JlYXRlcyBhIG5ldyBBcnJheSBpbnN0YW5jZSBmcm9tIGFuIGFycmF5LWxpa2Ugb3IgaXRlcmFibGUgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSBhcnJheUxpa2UgQW4gYXJyYXktbGlrZSBvciBpdGVyYWJsZSBvYmplY3QgdG8gY29udmVydCB0byBhbiBhcnJheVxuICogQHBhcmFtIFttYXBGdW5jdGlvbl0gQSBtYXAgZnVuY3Rpb24gdG8gY2FsbCBvbiBlYWNoIGVsZW1lbnQgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0gW3RoaXNBcmddIFRoZSBleGVjdXRpb24gY29udGV4dCBmb3IgdGhlIG1hcCBmdW5jdGlvblxuICogQHJldHVybiBUaGUgbmV3IEFycmF5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tPFQ+KGFycmF5TGlrZTogKHN0cmluZyB8IEFycmF5TGlrZTxUPiksIG1hcEZ1bmN0aW9uPzogTWFwQ2FsbGJhY2s8VD4sIHRoaXNBcmc/OiB7fSk6IEFycmF5TGlrZTxUPiB7XG5cdC8vIFVzZSB0aGUgbmF0aXZlIEFycmF5LmZyb20oKSBpZiBpdCBleGlzdHNcblx0aWYgKGhhcygnZXM2LWFycmF5LWZyb20nKSkge1xuXHRcdHJldHVybiAoPGFueT4gQXJyYXkpLmZyb20uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcblx0fVxuXG5cdGlmIChhcnJheUxpa2UgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ2Zyb206IHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb2JqZWN0Jyk7XG5cdH1cblxuXHRpZiAobWFwRnVuY3Rpb24gJiYgdGhpc0FyZykge1xuXHRcdG1hcEZ1bmN0aW9uID0gbWFwRnVuY3Rpb24uYmluZCh0aGlzQXJnKTtcblx0fVxuXG5cdGNvbnN0IENvbnN0cnVjdG9yOiBhbnkgPSB0aGlzO1xuXHRjb25zdCBpdGVtczogQXJyYXlMaWtlPGFueT4gPSBPYmplY3QoYXJyYXlMaWtlKTtcblx0Y29uc3QgbGVuZ3RoOiBudW1iZXIgPSB0b0xlbmd0aChpdGVtcy5sZW5ndGgpO1xuXHQvLyBTdXBwb3J0IGV4dGVuc2lvblxuXHRjb25zdCBhcnJheTogYW55W10gPSAodHlwZW9mIENvbnN0cnVjdG9yID09PSAnZnVuY3Rpb24nKSA/IDxhbnlbXT4gT2JqZWN0KG5ldyBDb25zdHJ1Y3RvcihsZW5ndGgpKSA6IG5ldyBBcnJheShsZW5ndGgpO1xuXG5cdGZvciAobGV0IGkgPSAwLCB2YWx1ZTogYW55OyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHR2YWx1ZSA9IGl0ZW1zW2ldO1xuXHRcdGFycmF5W2ldID0gbWFwRnVuY3Rpb24gPyBtYXBGdW5jdGlvbih2YWx1ZSwgaSkgOiB2YWx1ZTtcblx0fVxuXG5cdGFycmF5Lmxlbmd0aCA9IGxlbmd0aDtcblxuXHRyZXR1cm4gYXJyYXk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvZiguLi5pdGVtczogYW55W10pOiBhbnlbXTtcbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBhcnJheSBmcm9tIHRoZSBmdW5jdGlvbiBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwYXJhbSBhcmd1bWVudHMgQW55IG51bWJlciBvZiBhcmd1bWVudHMgZm9yIHRoZSBhcnJheVxuICogQHJldHVybiBBbiBhcnJheSBmcm9tIHRoZSBnaXZlbiBhcmd1bWVudHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9mKCkge1xuXHRpZiAoaGFzKCdlczYtYXJyYXktb2YnKSkge1xuXHRcdHJldHVybiAoPGFueT4gQXJyYXkpLm9mLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG5cdH1cblxuXHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbn1cblxuLyoqXG4gKiBGaWxscyBlbGVtZW50cyBvZiBhbiBhcnJheS1saWtlIG9iamVjdCB3aXRoIHRoZSBzcGVjaWZpZWQgdmFsdWUuXG4gKlxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IHRvIGZpbGxcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gZmlsbCBlYWNoIGVsZW1lbnQgb2YgdGhlIHRhcmdldCB3aXRoXG4gKiBAcGFyYW0gW3N0YXJ0XSBUaGUgZmlyc3QgaW5kZXggdG8gZmlsbFxuICogQHBhcmFtIFtlbmRdIFRoZSAoZXhjbHVzaXZlKSBpbmRleCBhdCB3aGljaCB0byBzdG9wIGZpbGxpbmdcbiAqIEByZXR1cm4gVGhlIGZpbGxlZCB0YXJnZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbGw8VD4odGFyZ2V0OiBBcnJheUxpa2U8VD4sIHZhbHVlOiBhbnksIHN0YXJ0PzogbnVtYmVyLCBlbmQ/OiBudW1iZXIpOiBBcnJheUxpa2U8VD4ge1xuXHRpZiAoaGFzKCdlczYtYXJyYXktZmlsbCcpKSB7XG5cdFx0Y29uc3QgbWV0aG9kID0gKDxhbnk+IEFycmF5LnByb3RvdHlwZSkuZmlsbDtcblx0XHRyZXR1cm4gbWV0aG9kLmNhbGwuYXBwbHkobWV0aG9kLCBhcmd1bWVudHMpO1xuXHR9XG5cblx0Y29uc3QgbGVuZ3RoID0gdG9MZW5ndGgodGFyZ2V0Lmxlbmd0aCk7XG5cdGxldCBpID0gbm9ybWFsaXplT2Zmc2V0KHRvSW50ZWdlcihzdGFydCksIGxlbmd0aCk7XG5cdGVuZCA9IG5vcm1hbGl6ZU9mZnNldChlbmQgPT09IHVuZGVmaW5lZCA/IGxlbmd0aCA6IHRvSW50ZWdlcihlbmQpLCBsZW5ndGgpO1xuXG5cdHdoaWxlIChpIDwgZW5kKSB7XG5cdFx0dGFyZ2V0W2krK10gPSB2YWx1ZTtcblx0fVxuXG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgc2VhcmNoIGFuZCByZXR1cm5zIHRoZSBmaXJzdCBpbmRleCB3aG9zZSB2YWx1ZSBzYXRpc2ZpZXMgdGhlIHBhc3NlZCBjYWxsYmFjayxcbiAqIG9yIC0xIGlmIG5vIHZhbHVlcyBzYXRpc2Z5IGl0LlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgQW4gYXJyYXktbGlrZSBvYmplY3RcbiAqIEBwYXJhbSBjYWxsYmFjayBBIGZ1bmN0aW9uIHJldHVybmluZyB0cnVlIGlmIHRoZSBjdXJyZW50IHZhbHVlIHNhdGlzZmllcyBpdHMgY3JpdGVyaWFcbiAqIEBwYXJhbSBbdGhpc0FyZ10gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGZvciB0aGUgZmluZCBmdW5jdGlvblxuICogQHJldHVybiBUaGUgZmlyc3QgaW5kZXggd2hvc2UgdmFsdWUgc2F0aXNmaWVzIHRoZSBwYXNzZWQgY2FsbGJhY2ssIG9yIC0xIGlmIG5vIHZhbHVlcyBzYXRpc2Z5IGl0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kSW5kZXg8VD4odGFyZ2V0OiBBcnJheUxpa2U8VD4sIGNhbGxiYWNrOiBGaW5kQ2FsbGJhY2s8VD4sIHRoaXNBcmc/OiB7fSk6IG51bWJlciB7XG5cdGlmIChoYXMoJ2VzNi1hcnJheS1maW5kSW5kZXgnKSkge1xuXHRcdGNvbnN0IG1ldGhvZCA9ICg8YW55PiBBcnJheS5wcm90b3R5cGUpLmZpbmRJbmRleDtcblx0XHRyZXR1cm4gbWV0aG9kLmNhbGwuYXBwbHkobWV0aG9kLCBhcmd1bWVudHMpO1xuXHR9XG5cblx0Y29uc3QgbGVuZ3RoID0gdG9MZW5ndGgodGFyZ2V0Lmxlbmd0aCk7XG5cblx0aWYgKCFjYWxsYmFjaykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ2ZpbmQ6IHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblx0fVxuXG5cdGlmICh0aGlzQXJnKSB7XG5cdFx0Y2FsbGJhY2sgPSBjYWxsYmFjay5iaW5kKHRoaXNBcmcpO1xuXHR9XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHRcdGlmIChjYWxsYmFjayh0YXJnZXRbaV0sIGksIHRhcmdldCkpIHtcblx0XHRcdHJldHVybiBpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBGaW5kcyBhbmQgcmV0dXJucyB0aGUgZmlyc3QgaW5zdGFuY2UgbWF0Y2hpbmcgdGhlIGNhbGxiYWNrIG9yIHVuZGVmaW5lZCBpZiBvbmUgaXMgbm90IGZvdW5kLlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgQW4gYXJyYXktbGlrZSBvYmplY3RcbiAqIEBwYXJhbSBjYWxsYmFjayBBIGZ1bmN0aW9uIHJldHVybmluZyBpZiB0aGUgY3VycmVudCB2YWx1ZSBtYXRjaGVzIGEgY3JpdGVyaWFcbiAqIEBwYXJhbSBbdGhpc0FyZ10gVGhlIGV4ZWN1dGlvbiBjb250ZXh0IGZvciB0aGUgZmluZCBmdW5jdGlvblxuICogQHJldHVybiBUaGUgZmlyc3QgZWxlbWVudCBtYXRjaGluZyB0aGUgY2FsbGJhY2ssIG9yIHVuZGVmaW5lZCBpZiBvbmUgZG9lcyBub3QgZXhpc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmQ8VD4odGFyZ2V0OiBBcnJheUxpa2U8VD4sIGNhbGxiYWNrOiBGaW5kQ2FsbGJhY2s8VD4sIHRoaXNBcmc/OiB7fSk6IFQge1xuXHRpZiAoaGFzKCdlczYtYXJyYXktZmluZCcpKSB7XG5cdFx0Y29uc3QgbWV0aG9kID0gKDxhbnk+IEFycmF5LnByb3RvdHlwZSkuZmluZDtcblx0XHRyZXR1cm4gbWV0aG9kLmNhbGwuYXBwbHkobWV0aG9kLCBhcmd1bWVudHMpO1xuXHR9XG5cblx0Y29uc3QgaW5kZXggPSBmaW5kSW5kZXg8VD4odGFyZ2V0LCBjYWxsYmFjaywgdGhpc0FyZyk7XG5cdHJldHVybiBpbmRleCAhPT0gLTEgPyB0YXJnZXRbaW5kZXhdIDogdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIENvcGllcyBkYXRhIGludGVybmFsbHkgd2l0aGluIGFuIGFycmF5IG9yIGFycmF5LWxpa2Ugb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBhcnJheS1saWtlIG9iamVjdFxuICogQHBhcmFtIG9mZnNldCBUaGUgaW5kZXggdG8gc3RhcnQgY29weWluZyB2YWx1ZXMgdG87IGlmIG5lZ2F0aXZlLCBpdCBjb3VudHMgYmFja3dhcmRzIGZyb20gbGVuZ3RoXG4gKiBAcGFyYW0gc3RhcnQgVGhlIGZpcnN0IChpbmNsdXNpdmUpIGluZGV4IHRvIGNvcHk7IGlmIG5lZ2F0aXZlLCBpdCBjb3VudHMgYmFja3dhcmRzIGZyb20gbGVuZ3RoXG4gKiBAcGFyYW0gZW5kIFRoZSBsYXN0IChleGNsdXNpdmUpIGluZGV4IHRvIGNvcHk7IGlmIG5lZ2F0aXZlLCBpdCBjb3VudHMgYmFja3dhcmRzIGZyb20gbGVuZ3RoXG4gKiBAcmV0dXJuIFRoZSB0YXJnZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHlXaXRoaW48VD4odGFyZ2V0OiBBcnJheUxpa2U8VD4sIG9mZnNldDogbnVtYmVyLCBzdGFydDogbnVtYmVyLCBlbmQ/OiBudW1iZXIpOiBBcnJheUxpa2U8VD4ge1xuXHRpZiAoaGFzKCdlczYtYXJyYXktY29weVdpdGhpbicpKSB7XG5cdFx0Y29uc3QgbWV0aG9kID0gKDxhbnk+IEFycmF5LnByb3RvdHlwZSkuY29weVdpdGhpbjtcblx0XHRyZXR1cm4gbWV0aG9kLmNhbGwuYXBwbHkobWV0aG9kLCBhcmd1bWVudHMpO1xuXHR9XG5cblx0aWYgKHRhcmdldCA9PSBudWxsKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignY29weVdpdGhpbjogdGFyZ2V0IG11c3QgYmUgYW4gYXJyYXktbGlrZSBvYmplY3QnKTtcblx0fVxuXG5cdGNvbnN0IGxlbmd0aCA9IHRvTGVuZ3RoKHRhcmdldC5sZW5ndGgpO1xuXHRvZmZzZXQgPSBub3JtYWxpemVPZmZzZXQodG9JbnRlZ2VyKG9mZnNldCksIGxlbmd0aCk7XG5cdHN0YXJ0ID0gbm9ybWFsaXplT2Zmc2V0KHRvSW50ZWdlcihzdGFydCksIGxlbmd0aCk7XG5cdGVuZCA9IG5vcm1hbGl6ZU9mZnNldChlbmQgPT09IHVuZGVmaW5lZCA/IGxlbmd0aCA6IHRvSW50ZWdlcihlbmQpLCBsZW5ndGgpO1xuXHRsZXQgY291bnQgPSBNYXRoLm1pbihlbmQgLSBzdGFydCwgbGVuZ3RoIC0gb2Zmc2V0KTtcblxuXHRsZXQgZGlyZWN0aW9uID0gMTtcblx0aWYgKG9mZnNldCA+IHN0YXJ0ICYmIG9mZnNldCA8IChzdGFydCArIGNvdW50KSkge1xuXHRcdGRpcmVjdGlvbiA9IC0xO1xuXHRcdHN0YXJ0ICs9IGNvdW50IC0gMTtcblx0XHRvZmZzZXQgKz0gY291bnQgLSAxO1xuXHR9XG5cblx0d2hpbGUgKGNvdW50ID4gMCkge1xuXHRcdGlmIChzdGFydCBpbiB0YXJnZXQpIHtcblx0XHRcdHRhcmdldFtvZmZzZXRdID0gdGFyZ2V0W3N0YXJ0XTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRkZWxldGUgdGFyZ2V0W29mZnNldF07XG5cdFx0fVxuXG5cdFx0b2Zmc2V0ICs9IGRpcmVjdGlvbjtcblx0XHRzdGFydCArPSBkaXJlY3Rpb247XG5cdFx0Y291bnQtLTtcblx0fVxuXG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIGFuIGFycmF5IGluY2x1ZGVzIGEgZ2l2ZW4gdmFsdWVcbiAqIEBwYXJhbSB0YXJnZXQgdGhlIHRhcmdldCBhcnJheS1saWtlIG9iamVjdFxuICogQHBhcmFtIHNlYXJjaEVsZW1lbnQgdGhlIGl0ZW0gdG8gc2VhcmNoIGZvclxuICogQHBhcmFtIGZyb21JbmRleCB0aGUgc3RhcnRpbmcgaW5kZXggdG8gc2VhcmNoIGZyb21cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluY2x1ZGVzPFQ+KHRhcmdldDogQXJyYXlMaWtlPFQ+LCBzZWFyY2hFbGVtZW50OiBULCBmcm9tSW5kZXg6IG51bWJlciA9IDApOiBib29sZWFuIHtcblx0aWYgKGhhcygnZXM3LWFycmF5LWluY2x1ZGVzJykpIHtcblx0XHRjb25zdCBtZXRob2QgPSAoPGFueT4gQXJyYXkucHJvdG90eXBlKS5pbmNsdWRlcztcblx0XHRyZXR1cm4gbWV0aG9kLmNhbGwuYXBwbHkobWV0aG9kLCBhcmd1bWVudHMpO1xuXHR9XG5cblx0bGV0IGxlbiA9IHRvTGVuZ3RoKHRhcmdldC5sZW5ndGgpO1xuXG5cdGZvciAobGV0IGkgPSBmcm9tSW5kZXg7IGkgPCBsZW47ICsraSkge1xuXHRcdGNvbnN0IGN1cnJlbnRFbGVtZW50ID0gdGFyZ2V0W2ldO1xuXHRcdGlmIChzZWFyY2hFbGVtZW50ID09PSBjdXJyZW50RWxlbWVudCB8fFxuXHRcdFx0KHNlYXJjaEVsZW1lbnQgIT09IHNlYXJjaEVsZW1lbnQgJiYgY3VycmVudEVsZW1lbnQgIT09IGN1cnJlbnRFbGVtZW50KSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGZhbHNlO1xufVxuIl19