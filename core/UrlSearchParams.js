(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './lang'], factory);
    }
})(function (require, exports) {
    "use strict";
    const lang_1 = require('./lang');
    /**
     * Parses a query string, returning a ParamList object.
     */
    function parseQueryString(input) {
        const query = {};
        for (const entry of input.split('&')) {
            const indexOfFirstEquals = entry.indexOf('=');
            let key;
            let value;
            if (indexOfFirstEquals >= 0) {
                key = entry.slice(0, indexOfFirstEquals);
                value = entry.slice(indexOfFirstEquals + 1);
            }
            else {
                key = entry;
            }
            key = key ? decodeURIComponent(key) : '';
            value = value ? decodeURIComponent(value) : '';
            if (key in query) {
                query[key].push(value);
            }
            else {
                query[key] = [value];
            }
        }
        return query;
    }
    /**
     * Represents a set of URL query search parameters.
     */
    class UrlSearchParams {
        /**
         * Constructs a new UrlSearchParams from a query string, an object of parameters and values, or another
         * UrlSearchParams.
         */
        constructor(input) {
            let list;
            if (input instanceof UrlSearchParams) {
                // Copy the incoming UrlSearchParam's internal list
                list = lang_1.duplicate(input._list);
            }
            else if (typeof input === 'object') {
                // Copy the incoming object, assuming its property values are either arrays or strings
                list = {};
                for (const key in input) {
                    const value = input[key];
                    if (Array.isArray(value)) {
                        list[key] = value.length ? value.slice() : [''];
                    }
                    else if (value == null) {
                        list[key] = [''];
                    }
                    else {
                        list[key] = [value];
                    }
                }
            }
            else if (typeof input === 'string') {
                // Parse the incoming string as a query string
                list = parseQueryString(input);
            }
            else {
                list = {};
            }
            Object.defineProperty(this, '_list', { value: list });
        }
        /**
         * Appends a new value to the set of values for a key.
         * @param key The key to add a value for
         * @param value The value to add
         */
        append(key, value) {
            if (!this.has(key)) {
                this.set(key, value);
            }
            else {
                this._list[key].push(value);
            }
        }
        /**
         * Deletes all values for a key.
         * @param key The key whose values are to be removed
         */
        delete(key) {
            // Set to undefined rather than deleting the key, for better consistency across browsers.
            // If a deleted key is re-added, most browsers put it at the end of iteration order, but IE maintains
            // its original position.  This approach maintains the original position everywhere.
            this._list[key] = undefined;
        }
        /**
         * Returns the first value associated with a key.
         * @param key The key to return the first value for
         * @return The first string value for the key
         */
        get(key) {
            if (!this.has(key)) {
                return null;
            }
            return this._list[key][0];
        }
        /**
         * Returns all the values associated with a key.
         * @param key The key to return all values for
         * @return An array of strings containing all values for the key
         */
        getAll(key) {
            if (!this.has(key)) {
                return null;
            }
            return this._list[key];
        }
        /**
         * Returns true if a key has been set to any value, false otherwise.
         * @param key The key to test for existence
         * @return A boolean indicating if the key has been set
         */
        has(key) {
            return Array.isArray(this._list[key]);
        }
        /**
         * Returns an array of all keys which have been set.
         * @return An array of strings containing all keys set in the UrlSearchParams instance
         */
        keys() {
            const keys = [];
            for (const key in this._list) {
                if (this.has(key)) {
                    keys.push(key);
                }
            }
            return keys;
        }
        /**
         * Sets the value associated with a key.
         * @param key The key to set the value of
         */
        set(key, value) {
            this._list[key] = [value];
        }
        /**
         * Returns this object's data as an encoded query string.
         * @return A string in application/x-www-form-urlencoded format containing all of the set keys/values
         */
        toString() {
            const query = [];
            for (const key in this._list) {
                if (!this.has(key)) {
                    continue;
                }
                const values = this._list[key];
                const encodedKey = encodeURIComponent(key);
                for (const value of values) {
                    query.push(encodedKey + (value ? ('=' + encodeURIComponent(value)) : ''));
                }
            }
            return query.join('&');
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = UrlSearchParams;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXJsU2VhcmNoUGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1VybFNlYXJjaFBhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFDQSx1QkFBMEIsUUFBUSxDQUFDLENBQUE7SUFPbkM7O09BRUc7SUFDSCwwQkFBMEIsS0FBYTtRQUN0QyxNQUFNLEtBQUssR0FBbUIsRUFBRSxDQUFDO1FBQ2pDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QyxJQUFJLEdBQVcsQ0FBQztZQUNoQixJQUFJLEtBQWEsQ0FBQztZQUVsQixFQUFFLENBQUMsQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztnQkFDekMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNQLEdBQUcsR0FBRyxLQUFLLENBQUM7WUFDYixDQUFDO1lBRUQsR0FBRyxHQUFHLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDekMsS0FBSyxHQUFHLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFL0MsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEIsQ0FBQztZQUNELElBQUks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Q0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEIsUUFBUSxDQUFDO2dCQUNWLENBQUM7Z0JBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxVQUFVLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzNDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQzVCLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDM0UsQ0FBQztZQUNGLENBQUM7WUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDO0lBQ0YsQ0FBQztJQXJKRDtxQ0FxSkMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEhhc2ggfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgZHVwbGljYXRlIH0gZnJvbSAnLi9sYW5nJztcblxuLyoqXG4gKiBPYmplY3Qgd2l0aCBzdHJpbmcga2V5cyBhbmQgc3RyaW5nIG9yIHN0cmluZyBhcnJheSB2YWx1ZXMgdGhhdCBkZXNjcmliZXMgYSBxdWVyeSBzdHJpbmcuXG4gKi9cbmV4cG9ydCB0eXBlIFBhcmFtTGlzdCA9IEhhc2g8c3RyaW5nIHwgc3RyaW5nW10+O1xuXG4vKipcbiAqIFBhcnNlcyBhIHF1ZXJ5IHN0cmluZywgcmV0dXJuaW5nIGEgUGFyYW1MaXN0IG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gcGFyc2VRdWVyeVN0cmluZyhpbnB1dDogc3RyaW5nKTogUGFyYW1MaXN0IHtcblx0Y29uc3QgcXVlcnk6IEhhc2g8c3RyaW5nW10+ID0ge307XG5cdGZvciAoY29uc3QgZW50cnkgb2YgaW5wdXQuc3BsaXQoJyYnKSkge1xuXHRcdGNvbnN0IGluZGV4T2ZGaXJzdEVxdWFscyA9IGVudHJ5LmluZGV4T2YoJz0nKTtcblx0XHRsZXQga2V5OiBzdHJpbmc7XG5cdFx0bGV0IHZhbHVlOiBzdHJpbmc7XG5cblx0XHRpZiAoaW5kZXhPZkZpcnN0RXF1YWxzID49IDApIHtcblx0XHRcdGtleSA9IGVudHJ5LnNsaWNlKDAsIGluZGV4T2ZGaXJzdEVxdWFscyk7XG5cdFx0XHR2YWx1ZSA9IGVudHJ5LnNsaWNlKGluZGV4T2ZGaXJzdEVxdWFscyArIDEpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRrZXkgPSBlbnRyeTtcblx0XHR9XG5cblx0XHRrZXkgPSBrZXkgPyBkZWNvZGVVUklDb21wb25lbnQoa2V5KSA6ICcnO1xuXHRcdHZhbHVlID0gdmFsdWUgPyBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpIDogJyc7XG5cblx0XHRpZiAoa2V5IGluIHF1ZXJ5KSB7XG5cdFx0XHRxdWVyeVtrZXldLnB1c2godmFsdWUpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHF1ZXJ5W2tleV0gPSBbIHZhbHVlIF07XG5cdFx0fVxuXHR9XG5cdHJldHVybiBxdWVyeTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgc2V0IG9mIFVSTCBxdWVyeSBzZWFyY2ggcGFyYW1ldGVycy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXJsU2VhcmNoUGFyYW1zIHtcblx0LyoqXG5cdCAqIENvbnN0cnVjdHMgYSBuZXcgVXJsU2VhcmNoUGFyYW1zIGZyb20gYSBxdWVyeSBzdHJpbmcsIGFuIG9iamVjdCBvZiBwYXJhbWV0ZXJzIGFuZCB2YWx1ZXMsIG9yIGFub3RoZXJcblx0ICogVXJsU2VhcmNoUGFyYW1zLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoaW5wdXQ/OiBzdHJpbmcgfCBQYXJhbUxpc3QgfCBVcmxTZWFyY2hQYXJhbXMpIHtcblx0XHRsZXQgbGlzdDogUGFyYW1MaXN0O1xuXG5cdFx0aWYgKGlucHV0IGluc3RhbmNlb2YgVXJsU2VhcmNoUGFyYW1zKSB7XG5cdFx0XHQvLyBDb3B5IHRoZSBpbmNvbWluZyBVcmxTZWFyY2hQYXJhbSdzIGludGVybmFsIGxpc3Rcblx0XHRcdGxpc3QgPSA8UGFyYW1MaXN0PiBkdXBsaWNhdGUoaW5wdXQuX2xpc3QpO1xuXHRcdH1cblx0XHRlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnKSB7XG5cdFx0XHQvLyBDb3B5IHRoZSBpbmNvbWluZyBvYmplY3QsIGFzc3VtaW5nIGl0cyBwcm9wZXJ0eSB2YWx1ZXMgYXJlIGVpdGhlciBhcnJheXMgb3Igc3RyaW5nc1xuXHRcdFx0bGlzdCA9IHt9O1xuXHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gaW5wdXQpIHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSAoPFBhcmFtTGlzdD4gaW5wdXQpW2tleV07XG5cblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRcdFx0bGlzdFtrZXldID0gdmFsdWUubGVuZ3RoID8gdmFsdWUuc2xpY2UoKSA6IFsgJycgXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmICh2YWx1ZSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0bGlzdFtrZXldID0gWyAnJyBdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGxpc3Rba2V5XSA9IFsgPHN0cmluZz4gdmFsdWUgXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHQvLyBQYXJzZSB0aGUgaW5jb21pbmcgc3RyaW5nIGFzIGEgcXVlcnkgc3RyaW5nXG5cdFx0XHRsaXN0ID0gcGFyc2VRdWVyeVN0cmluZyhpbnB1dCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0bGlzdCA9IHt9O1xuXHRcdH1cblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX2xpc3QnLCB7IHZhbHVlOiBsaXN0IH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1hcHMgcHJvcGVydHkga2V5cyB0byBhcnJheXMgb2YgdmFsdWVzLiBUaGUgdmFsdWUgZm9yIGFueSBwcm9wZXJ0eSB0aGF0IGhhcyBiZWVuIHNldCB3aWxsIGJlIGFuIGFycmF5IGNvbnRhaW5pbmdcblx0ICogYXQgbGVhc3Qgb25lIGl0ZW0uIFByb3BlcnRpZXMgdGhhdCBoYXZlIGJlZW4gZGVsZXRlZCB3aWxsIGhhdmUgYSB2YWx1ZSBvZiAndW5kZWZpbmVkJy5cblx0ICovXG5cdHByb3RlY3RlZCBfbGlzdDogSGFzaDxzdHJpbmdbXT47XG5cblx0LyoqXG5cdCAqIEFwcGVuZHMgYSBuZXcgdmFsdWUgdG8gdGhlIHNldCBvZiB2YWx1ZXMgZm9yIGEga2V5LlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgdG8gYWRkIGEgdmFsdWUgZm9yXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gYWRkXG5cdCAqL1xuXHRhcHBlbmQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRpZiAoIXRoaXMuaGFzKGtleSkpIHtcblx0XHRcdHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuX2xpc3Rba2V5XS5wdXNoKHZhbHVlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyBhbGwgdmFsdWVzIGZvciBhIGtleS5cblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHdob3NlIHZhbHVlcyBhcmUgdG8gYmUgcmVtb3ZlZFxuXHQgKi9cblx0ZGVsZXRlKGtleTogc3RyaW5nKTogdm9pZCB7XG5cdFx0Ly8gU2V0IHRvIHVuZGVmaW5lZCByYXRoZXIgdGhhbiBkZWxldGluZyB0aGUga2V5LCBmb3IgYmV0dGVyIGNvbnNpc3RlbmN5IGFjcm9zcyBicm93c2Vycy5cblx0XHQvLyBJZiBhIGRlbGV0ZWQga2V5IGlzIHJlLWFkZGVkLCBtb3N0IGJyb3dzZXJzIHB1dCBpdCBhdCB0aGUgZW5kIG9mIGl0ZXJhdGlvbiBvcmRlciwgYnV0IElFIG1haW50YWluc1xuXHRcdC8vIGl0cyBvcmlnaW5hbCBwb3NpdGlvbi4gIFRoaXMgYXBwcm9hY2ggbWFpbnRhaW5zIHRoZSBvcmlnaW5hbCBwb3NpdGlvbiBldmVyeXdoZXJlLlxuXHRcdHRoaXMuX2xpc3Rba2V5XSA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBmaXJzdCB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggYSBrZXkuXG5cdCAqIEBwYXJhbSBrZXkgVGhlIGtleSB0byByZXR1cm4gdGhlIGZpcnN0IHZhbHVlIGZvclxuXHQgKiBAcmV0dXJuIFRoZSBmaXJzdCBzdHJpbmcgdmFsdWUgZm9yIHRoZSBrZXlcblx0ICovXG5cdGdldChrZXk6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0aWYgKCF0aGlzLmhhcyhrZXkpKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX2xpc3Rba2V5XVswXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFsbCB0aGUgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCBhIGtleS5cblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHRvIHJldHVybiBhbGwgdmFsdWVzIGZvclxuXHQgKiBAcmV0dXJuIEFuIGFycmF5IG9mIHN0cmluZ3MgY29udGFpbmluZyBhbGwgdmFsdWVzIGZvciB0aGUga2V5XG5cdCAqL1xuXHRnZXRBbGwoa2V5OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG5cdFx0aWYgKCF0aGlzLmhhcyhrZXkpKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX2xpc3Rba2V5XTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgYSBrZXkgaGFzIGJlZW4gc2V0IHRvIGFueSB2YWx1ZSwgZmFsc2Ugb3RoZXJ3aXNlLlxuXHQgKiBAcGFyYW0ga2V5IFRoZSBrZXkgdG8gdGVzdCBmb3IgZXhpc3RlbmNlXG5cdCAqIEByZXR1cm4gQSBib29sZWFuIGluZGljYXRpbmcgaWYgdGhlIGtleSBoYXMgYmVlbiBzZXRcblx0ICovXG5cdGhhcyhrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KHRoaXMuX2xpc3Rba2V5XSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwga2V5cyB3aGljaCBoYXZlIGJlZW4gc2V0LlxuXHQgKiBAcmV0dXJuIEFuIGFycmF5IG9mIHN0cmluZ3MgY29udGFpbmluZyBhbGwga2V5cyBzZXQgaW4gdGhlIFVybFNlYXJjaFBhcmFtcyBpbnN0YW5jZVxuXHQgKi9cblx0a2V5cygpOiBzdHJpbmdbXSB7XG5cdFx0Y29uc3Qga2V5czogc3RyaW5nW10gPSBbXTtcblxuXHRcdGZvciAoY29uc3Qga2V5IGluIHRoaXMuX2xpc3QpIHtcblx0XHRcdGlmICh0aGlzLmhhcyhrZXkpKSB7XG5cdFx0XHRcdGtleXMucHVzaChrZXkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBrZXlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCBhIGtleS5cblx0ICogQHBhcmFtIGtleSBUaGUga2V5IHRvIHNldCB0aGUgdmFsdWUgb2Zcblx0ICovXG5cdHNldChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuXHRcdHRoaXMuX2xpc3Rba2V5XSA9IFsgdmFsdWUgXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoaXMgb2JqZWN0J3MgZGF0YSBhcyBhbiBlbmNvZGVkIHF1ZXJ5IHN0cmluZy5cblx0ICogQHJldHVybiBBIHN0cmluZyBpbiBhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQgZm9ybWF0IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBzZXQga2V5cy92YWx1ZXNcblx0ICovXG5cdHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0Y29uc3QgcXVlcnk6IHN0cmluZ1tdID0gW107XG5cblx0XHRmb3IgKGNvbnN0IGtleSBpbiB0aGlzLl9saXN0KSB7XG5cdFx0XHRpZiAoIXRoaXMuaGFzKGtleSkpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHZhbHVlcyA9IHRoaXMuX2xpc3Rba2V5XTtcblx0XHRcdGNvbnN0IGVuY29kZWRLZXkgPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KTtcblx0XHRcdGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG5cdFx0XHRcdHF1ZXJ5LnB1c2goZW5jb2RlZEtleSArICh2YWx1ZSA/ICgnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKSA6ICcnKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHF1ZXJ5LmpvaW4oJyYnKTtcblx0fVxufVxuIl19