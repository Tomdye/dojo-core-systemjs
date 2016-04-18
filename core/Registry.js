(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    /**
     * A registry of values tagged with matchers.
     */
    class Registry {
        /**
         * Construct a new Registry, optionally containing a given default value.
         */
        constructor(defaultValue) {
            this._defaultValue = defaultValue;
            this._entries = [];
        }
        /**
         * Return the first entry in this registry that matches the given arguments. If no entry matches and the registry
         * was created with a default value, that value will be returned. Otherwise, an exception is thrown.
         *
         * @param ...args Arguments that will be used to select a matching value.
         * @returns the matching value, or a default value if one exists.
         */
        match(...args) {
            let entries = this._entries.slice(0);
            let entry;
            for (let i = 0; (entry = entries[i]); ++i) {
                if (entry.test.apply(null, args)) {
                    return entry.value;
                }
            }
            if (this._defaultValue !== undefined) {
                return this._defaultValue;
            }
            throw new Error('No match found');
        }
        /**
         * Register a test + value pair with this registry.
         *
         * @param test The test that will be used to determine if the registered value matches a set of arguments.
         * @param value A value being registered.
         * @param first If true, the newly registered test and value will be the first entry in the registry.
         */
        register(test, value, first) {
            let entries = this._entries;
            let entry = {
                test: test,
                value: value
            };
            entries[(first ? 'unshift' : 'push')](entry);
            return {
                destroy: function () {
                    this.destroy = function () { };
                    let i = 0;
                    while ((i = entries.indexOf(entry, i)) > -1) {
                        entries.splice(i, 1);
                    }
                    test = value = entries = entry = null;
                }
            };
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Registry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvUmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBV0E7O09BRUc7SUFDSDtRQUlDOztXQUVHO1FBQ0gsWUFBWSxZQUFnQjtZQUMzQixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRUQ7Ozs7OztXQU1HO1FBQ0gsS0FBSyxDQUFDLEdBQUcsSUFBVztZQUNuQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEtBQWUsQ0FBQztZQUVwQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDM0MsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQ3BCLENBQUM7WUFDRixDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUMzQixDQUFDO1lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRDs7Ozs7O1dBTUc7UUFDSCxRQUFRLENBQUMsSUFBVSxFQUFFLEtBQVEsRUFBRSxLQUFlO1lBQzdDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDNUIsSUFBSSxLQUFLLEdBQWE7Z0JBQ3JCLElBQUksRUFBRSxJQUFJO2dCQUNWLEtBQUssRUFBRSxLQUFLO2FBQ1osQ0FBQztZQUVLLE9BQVEsQ0FBQyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVyRCxNQUFNLENBQUM7Z0JBQ04sT0FBTyxFQUFFO29CQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsY0FBbUIsQ0FBQyxDQUFDO29CQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ1YsT0FBTyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQzdDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN0QixDQUFDO29CQUNELElBQUksR0FBRyxLQUFLLEdBQUcsT0FBTyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7Z0JBQ3ZDLENBQUM7YUFDRCxDQUFDO1FBQ0gsQ0FBQztJQUNGLENBQUM7SUEvREQ7OEJBK0RDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIYW5kbGUgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIEFuIGVudHJ5IGluIGEgUmVnaXN0cnkuIEVhY2ggRW50cnkgY29udGFpbnMgYSB0ZXN0IHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBFbnRyeSBpcyBhcHBsaWNhYmxlLCBhbmQgYSB2YWx1ZSBmb3IgdGhlXG4gKiBlbnRyeS5cbiAqL1xuaW50ZXJmYWNlIEVudHJ5PFQ+IHtcblx0dGVzdDogVGVzdDtcblx0dmFsdWU6IFQ7XG59XG5cbi8qKlxuICogQSByZWdpc3RyeSBvZiB2YWx1ZXMgdGFnZ2VkIHdpdGggbWF0Y2hlcnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlZ2lzdHJ5PFQ+IHtcblx0cHJvdGVjdGVkIF9kZWZhdWx0VmFsdWU6IFQ7XG5cdHByaXZhdGUgX2VudHJpZXM6IEVudHJ5PFQ+W107XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIG5ldyBSZWdpc3RyeSwgb3B0aW9uYWxseSBjb250YWluaW5nIGEgZ2l2ZW4gZGVmYXVsdCB2YWx1ZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKGRlZmF1bHRWYWx1ZT86IFQpIHtcblx0XHR0aGlzLl9kZWZhdWx0VmFsdWUgPSBkZWZhdWx0VmFsdWU7XG5cdFx0dGhpcy5fZW50cmllcyA9IFtdO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGUgZmlyc3QgZW50cnkgaW4gdGhpcyByZWdpc3RyeSB0aGF0IG1hdGNoZXMgdGhlIGdpdmVuIGFyZ3VtZW50cy4gSWYgbm8gZW50cnkgbWF0Y2hlcyBhbmQgdGhlIHJlZ2lzdHJ5XG5cdCAqIHdhcyBjcmVhdGVkIHdpdGggYSBkZWZhdWx0IHZhbHVlLCB0aGF0IHZhbHVlIHdpbGwgYmUgcmV0dXJuZWQuIE90aGVyd2lzZSwgYW4gZXhjZXB0aW9uIGlzIHRocm93bi5cblx0ICpcblx0ICogQHBhcmFtIC4uLmFyZ3MgQXJndW1lbnRzIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHNlbGVjdCBhIG1hdGNoaW5nIHZhbHVlLlxuXHQgKiBAcmV0dXJucyB0aGUgbWF0Y2hpbmcgdmFsdWUsIG9yIGEgZGVmYXVsdCB2YWx1ZSBpZiBvbmUgZXhpc3RzLlxuXHQgKi9cblx0bWF0Y2goLi4uYXJnczogYW55W10pOiBUIHtcblx0XHRsZXQgZW50cmllcyA9IHRoaXMuX2VudHJpZXMuc2xpY2UoMCk7XG5cdFx0bGV0IGVudHJ5OiBFbnRyeTxUPjtcblxuXHRcdGZvciAobGV0IGkgPSAwOyAoZW50cnkgPSBlbnRyaWVzW2ldKTsgKytpKSB7XG5cdFx0XHRpZiAoZW50cnkudGVzdC5hcHBseShudWxsLCBhcmdzKSkge1xuXHRcdFx0XHRyZXR1cm4gZW50cnkudmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX2RlZmF1bHRWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fZGVmYXVsdFZhbHVlO1xuXHRcdH1cblxuXHRcdHRocm93IG5ldyBFcnJvcignTm8gbWF0Y2ggZm91bmQnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBhIHRlc3QgKyB2YWx1ZSBwYWlyIHdpdGggdGhpcyByZWdpc3RyeS5cblx0ICpcblx0ICogQHBhcmFtIHRlc3QgVGhlIHRlc3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSByZWdpc3RlcmVkIHZhbHVlIG1hdGNoZXMgYSBzZXQgb2YgYXJndW1lbnRzLlxuXHQgKiBAcGFyYW0gdmFsdWUgQSB2YWx1ZSBiZWluZyByZWdpc3RlcmVkLlxuXHQgKiBAcGFyYW0gZmlyc3QgSWYgdHJ1ZSwgdGhlIG5ld2x5IHJlZ2lzdGVyZWQgdGVzdCBhbmQgdmFsdWUgd2lsbCBiZSB0aGUgZmlyc3QgZW50cnkgaW4gdGhlIHJlZ2lzdHJ5LlxuXHQgKi9cblx0cmVnaXN0ZXIodGVzdDogVGVzdCwgdmFsdWU6IFQsIGZpcnN0PzogYm9vbGVhbik6IEhhbmRsZSB7XG5cdFx0bGV0IGVudHJpZXMgPSB0aGlzLl9lbnRyaWVzO1xuXHRcdGxldCBlbnRyeTogRW50cnk8VD4gPSB7XG5cdFx0XHR0ZXN0OiB0ZXN0LFxuXHRcdFx0dmFsdWU6IHZhbHVlXG5cdFx0fTtcblxuXHRcdCg8YW55PiBlbnRyaWVzKVsoZmlyc3QgPyAndW5zaGlmdCcgOiAncHVzaCcpXShlbnRyeSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGVzdHJveTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKTogdm9pZCB7fTtcblx0XHRcdFx0bGV0IGkgPSAwO1xuXHRcdFx0XHR3aGlsZSAoKGkgPSBlbnRyaWVzLmluZGV4T2YoZW50cnksIGkpKSA+IC0xKSB7XG5cdFx0XHRcdFx0ZW50cmllcy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGVzdCA9IHZhbHVlID0gZW50cmllcyA9IGVudHJ5ID0gbnVsbDtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG59XG5cbi8qKlxuICogVGhlIGludGVyZmFjZSB0aGF0IGEgdGVzdCBmdW5jdGlvbiBtdXN0IGltcGxlbWVudC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUZXN0IHtcblx0KC4uLmFyZ3M6IGFueVtdKTogYm9vbGVhbjtcbn1cbiJdfQ==