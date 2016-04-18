(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './object'], factory);
    }
})(function (require, exports) {
    "use strict";
    const object_1 = require('./object');
    /**
     * An implementation analogous to the Map specification in ES2015,
     * with the exception of iterators.  The entries, keys, and values methods
     * are omitted, since forEach essentially provides the same functionality.
     */
    class Map {
        /**
         * Creates a new Map
         *
         * @constructor
         *
         * @param arrayLike
         * Array or array-like object containing two-item tuples used to initially populate the map.
         * The first item in each tuple corresponds to the key of the map entry.
         * The second item corresponds to the value of the map entry.
         */
        constructor(arrayLike) {
            this._keys = [];
            this._values = [];
            if (arrayLike) {
                for (let i = 0, length = arrayLike.length; i < length; i++) {
                    this.set(arrayLike[i][0], arrayLike[i][1]);
                }
            }
        }
        /*
         * An alternative to Array.prototype.indexOf using Object.is
         * to check for equality. See http://mzl.la/1zuKO2V
         */
        _indexOfKey(keys, key) {
            for (let i = 0, length = keys.length; i < length; i++) {
                if (object_1.is(keys[i], key)) {
                    return i;
                }
            }
            return -1;
        }
        /**
         * Returns the number of key / value pairs in the Map.
         *
         * @return the number of key / value pairs in the Map
         */
        get size() {
            return this._keys.length;
        }
        /**
         * Deletes all keys and their associated values.
         */
        clear() {
            this._keys.length = this._values.length = 0;
        }
        /**
         * Deletes a given key and its associated value.
         *
         * @param key The key to delete
         * @return true if the key exists, false if it does not
         */
        delete(key) {
            const index = this._indexOfKey(this._keys, key);
            if (index < 0) {
                return false;
            }
            this._keys.splice(index, 1);
            this._values.splice(index, 1);
            return true;
        }
        /**
         * Executes a given function for each map entry. The function
         * is invoked with three arguments: the element value, the
         * element key, and the associated Map instance.
         *
         * @param callback The function to execute for each map entry,
         * @param context The value to use for `this` for each execution of the calback
         */
        forEach(callback, context) {
            const keys = this._keys;
            const values = this._values;
            for (let i = 0, length = keys.length; i < length; i++) {
                callback.call(context, values[i], keys[i], this);
            }
        }
        /**
         * Returns the value associated with a given key.
         *
         * @param key The key to look up
         * @return The value if one exists or undefined
         */
        get(key) {
            const index = this._indexOfKey(this._keys, key);
            return index < 0 ? undefined : this._values[index];
        }
        /**
         * Checks for the presence of a given key.
         *
         * @param key The key to check for
         * @return true if the key exists, false if it does not
         */
        has(key) {
            return this._indexOfKey(this._keys, key) > -1;
        }
        /**
         * Sets the value associated with a given key.
         *
         * @param key The key to define a value to
         * @param value The value to assign
         * @return The Map instance
         */
        set(key, value) {
            let index = this._indexOfKey(this._keys, key);
            index = index < 0 ? this._keys.length : index;
            this._keys[index] = key;
            this._values[index] = value;
            return this;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Map;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL01hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFDQSx5QkFBbUIsVUFBVSxDQUFDLENBQUE7SUFFOUI7Ozs7T0FJRztJQUNIO1FBaUJDOzs7Ozs7Ozs7V0FTRztRQUNILFlBQVksU0FBK0I7WUExQmpDLFVBQUssR0FBUSxFQUFFLENBQUM7WUFDaEIsWUFBTyxHQUFRLEVBQUUsQ0FBQztZQTBCM0IsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDZixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUM1RCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBN0JEOzs7V0FHRztRQUNPLFdBQVcsQ0FBQyxJQUFTLEVBQUUsR0FBTTtZQUN0QyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN2RCxFQUFFLENBQUMsQ0FBQyxXQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDVixDQUFDO1lBQ0YsQ0FBQztZQUNELE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUM7UUFvQkQ7Ozs7V0FJRztRQUNILElBQUksSUFBSTtZQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMxQixDQUFDO1FBRUQ7O1dBRUc7UUFDSCxLQUFLO1lBQ0osSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILE1BQU0sQ0FBQyxHQUFNO1lBQ1osTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2hELEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNmLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVEOzs7Ozs7O1dBT0c7UUFDSCxPQUFPLENBQUMsUUFBMkQsRUFBRSxPQUFZO1lBQ2hGLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUM1QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN2RCxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xELENBQUM7UUFDRixDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSCxHQUFHLENBQUMsR0FBTTtZQUNULE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSCxHQUFHLENBQUMsR0FBTTtZQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVEOzs7Ozs7V0FNRztRQUNILEdBQUcsQ0FBQyxHQUFNLEVBQUUsS0FBUTtZQUNuQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDOUMsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQzlDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDYixDQUFDO0lBQ0YsQ0FBQztJQXRIRDt5QkFzSEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFycmF5TGlrZSB9IGZyb20gJy4vYXJyYXknO1xuaW1wb3J0IHsgaXMgfSBmcm9tICcuL29iamVjdCc7XG5cbi8qKlxuICogQW4gaW1wbGVtZW50YXRpb24gYW5hbG9nb3VzIHRvIHRoZSBNYXAgc3BlY2lmaWNhdGlvbiBpbiBFUzIwMTUsXG4gKiB3aXRoIHRoZSBleGNlcHRpb24gb2YgaXRlcmF0b3JzLiAgVGhlIGVudHJpZXMsIGtleXMsIGFuZCB2YWx1ZXMgbWV0aG9kc1xuICogYXJlIG9taXR0ZWQsIHNpbmNlIGZvckVhY2ggZXNzZW50aWFsbHkgcHJvdmlkZXMgdGhlIHNhbWUgZnVuY3Rpb25hbGl0eS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFwPEssIFY+IHtcblx0cHJvdGVjdGVkIF9rZXlzOiBLW10gPSBbXTtcblx0cHJvdGVjdGVkIF92YWx1ZXM6IFZbXSA9IFtdO1xuXG5cdC8qXG5cdCAqIEFuIGFsdGVybmF0aXZlIHRvIEFycmF5LnByb3RvdHlwZS5pbmRleE9mIHVzaW5nIE9iamVjdC5pc1xuXHQgKiB0byBjaGVjayBmb3IgZXF1YWxpdHkuIFNlZSBodHRwOi8vbXpsLmxhLzF6dUtPMlZcblx0ICovXG5cdHByb3RlY3RlZCBfaW5kZXhPZktleShrZXlzOiBLW10sIGtleTogSyk6IG51bWJlciB7XG5cdFx0Zm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChpcyhrZXlzW2ldLCBrZXkpKSB7XG5cdFx0XHRcdHJldHVybiBpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gLTE7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBNYXBcblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqXG5cdCAqIEBwYXJhbSBhcnJheUxpa2Vcblx0ICogQXJyYXkgb3IgYXJyYXktbGlrZSBvYmplY3QgY29udGFpbmluZyB0d28taXRlbSB0dXBsZXMgdXNlZCB0byBpbml0aWFsbHkgcG9wdWxhdGUgdGhlIG1hcC5cblx0ICogVGhlIGZpcnN0IGl0ZW0gaW4gZWFjaCB0dXBsZSBjb3JyZXNwb25kcyB0byB0aGUga2V5IG9mIHRoZSBtYXAgZW50cnkuXG5cdCAqIFRoZSBzZWNvbmQgaXRlbSBjb3JyZXNwb25kcyB0byB0aGUgdmFsdWUgb2YgdGhlIG1hcCBlbnRyeS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKGFycmF5TGlrZT86IEFycmF5TGlrZTxbIEssIFYgXT4pIHtcblx0XHRpZiAoYXJyYXlMaWtlKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gYXJyYXlMaWtlLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHRoaXMuc2V0KGFycmF5TGlrZVtpXVswXSwgYXJyYXlMaWtlW2ldWzFdKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGtleSAvIHZhbHVlIHBhaXJzIGluIHRoZSBNYXAuXG5cdCAqXG5cdCAqIEByZXR1cm4gdGhlIG51bWJlciBvZiBrZXkgLyB2YWx1ZSBwYWlycyBpbiB0aGUgTWFwXG5cdCAqL1xuXHRnZXQgc2l6ZSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9rZXlzLmxlbmd0aDtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIGFsbCBrZXlzIGFuZCB0aGVpciBhc3NvY2lhdGVkIHZhbHVlcy5cblx0ICovXG5cdGNsZWFyKCk6IHZvaWQge1xuXHRcdHRoaXMuX2tleXMubGVuZ3RoID0gdGhpcy5fdmFsdWVzLmxlbmd0aCA9IDA7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyBhIGdpdmVuIGtleSBhbmQgaXRzIGFzc29jaWF0ZWQgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSB0byBkZWxldGVcblx0ICogQHJldHVybiB0cnVlIGlmIHRoZSBrZXkgZXhpc3RzLCBmYWxzZSBpZiBpdCBkb2VzIG5vdFxuXHQgKi9cblx0ZGVsZXRlKGtleTogSyk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGluZGV4ID0gdGhpcy5faW5kZXhPZktleSh0aGlzLl9rZXlzLCBrZXkpO1xuXHRcdGlmIChpbmRleCA8IDApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0dGhpcy5fa2V5cy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdHRoaXMuX3ZhbHVlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV4ZWN1dGVzIGEgZ2l2ZW4gZnVuY3Rpb24gZm9yIGVhY2ggbWFwIGVudHJ5LiBUaGUgZnVuY3Rpb25cblx0ICogaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czogdGhlIGVsZW1lbnQgdmFsdWUsIHRoZVxuXHQgKiBlbGVtZW50IGtleSwgYW5kIHRoZSBhc3NvY2lhdGVkIE1hcCBpbnN0YW5jZS5cblx0ICpcblx0ICogQHBhcmFtIGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBleGVjdXRlIGZvciBlYWNoIG1hcCBlbnRyeSxcblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIHZhbHVlIHRvIHVzZSBmb3IgYHRoaXNgIGZvciBlYWNoIGV4ZWN1dGlvbiBvZiB0aGUgY2FsYmFja1xuXHQgKi9cblx0Zm9yRWFjaChjYWxsYmFjazogKHZhbHVlOiBWLCBrZXk6IEssIG1hcEluc3RhbmNlOiBNYXA8SywgVj4pID0+IGFueSwgY29udGV4dD86IHt9KSB7XG5cdFx0Y29uc3Qga2V5cyA9IHRoaXMuX2tleXM7XG5cdFx0Y29uc3QgdmFsdWVzID0gdGhpcy5fdmFsdWVzO1xuXHRcdGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjYWxsYmFjay5jYWxsKGNvbnRleHQsIHZhbHVlc1tpXSwga2V5c1tpXSwgdGhpcyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCBhIGdpdmVuIGtleS5cblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHRvIGxvb2sgdXBcblx0ICogQHJldHVybiBUaGUgdmFsdWUgaWYgb25lIGV4aXN0cyBvciB1bmRlZmluZWRcblx0ICovXG5cdGdldChrZXk6IEspOiBWIHtcblx0XHRjb25zdCBpbmRleCA9IHRoaXMuX2luZGV4T2ZLZXkodGhpcy5fa2V5cywga2V5KTtcblx0XHRyZXR1cm4gaW5kZXggPCAwID8gdW5kZWZpbmVkIDogdGhpcy5fdmFsdWVzW2luZGV4XTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgZm9yIHRoZSBwcmVzZW5jZSBvZiBhIGdpdmVuIGtleS5cblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHRvIGNoZWNrIGZvclxuXHQgKiBAcmV0dXJuIHRydWUgaWYgdGhlIGtleSBleGlzdHMsIGZhbHNlIGlmIGl0IGRvZXMgbm90XG5cdCAqL1xuXHRoYXMoa2V5OiBLKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2luZGV4T2ZLZXkodGhpcy5fa2V5cywga2V5KSA+IC0xO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCBhIGdpdmVuIGtleS5cblx0ICpcblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHRvIGRlZmluZSBhIHZhbHVlIHRvXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduXG5cdCAqIEByZXR1cm4gVGhlIE1hcCBpbnN0YW5jZVxuXHQgKi9cblx0c2V0KGtleTogSywgdmFsdWU6IFYpOiBNYXA8SywgVj4ge1xuXHRcdGxldCBpbmRleCA9IHRoaXMuX2luZGV4T2ZLZXkodGhpcy5fa2V5cywga2V5KTtcblx0XHRpbmRleCA9IGluZGV4IDwgMCA/IHRoaXMuX2tleXMubGVuZ3RoIDogaW5kZXg7XG5cdFx0dGhpcy5fa2V5c1tpbmRleF0gPSBrZXk7XG5cdFx0dGhpcy5fdmFsdWVzW2luZGV4XSA9IHZhbHVlO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG4iXX0=