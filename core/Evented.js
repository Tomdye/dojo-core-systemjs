(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './aspect'], factory);
    }
})(function (require, exports) {
    "use strict";
    const aspect_1 = require('./aspect');
    class Evented {
        /**
         * Emits an event, firing listeners registered for it.
         * @param event The event object to emit
         */
        emit(data) {
            const type = '__on' + data.type;
            const method = this[type];
            if (method) {
                method.call(this, data);
            }
        }
        /**
         * Listens for an event, calling the listener whenever the event fires.
         * @param type Event type to listen for
         * @param listener Callback to handle the event when it fires
         * @return A handle which will remove the listener when destroy is called
         */
        on(type, listener) {
            const name = '__on' + type;
            if (!this[name]) {
                // define a non-enumerable property (see #77)
                Object.defineProperty(this, name, {
                    configurable: true,
                    value: undefined,
                    writable: true
                });
            }
            return aspect_1.on(this, name, listener);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Evented;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9FdmVudGVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUNBLHlCQUFtQixVQUFVLENBQUMsQ0FBQTtJQUU5QjtRQUNDOzs7V0FHRztRQUNILElBQUksQ0FBd0IsSUFBTztZQUNsQyxNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNoQyxNQUFNLE1BQU0sR0FBb0IsSUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekIsQ0FBQztRQUNGLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILEVBQUUsQ0FBQyxJQUFZLEVBQUUsUUFBc0M7WUFDdEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztZQUMzQixFQUFFLENBQUMsQ0FBQyxDQUFRLElBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLDZDQUE2QztnQkFDN0MsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO29CQUNqQyxZQUFZLEVBQUUsSUFBSTtvQkFDbEIsS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLFFBQVEsRUFBRSxJQUFJO2lCQUNkLENBQUMsQ0FBQztZQUNKLENBQUM7WUFDRCxNQUFNLENBQUMsV0FBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDakMsQ0FBQztJQUNGLENBQUM7SUEvQkQ7NkJBK0JDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIYW5kbGUsIEV2ZW50T2JqZWN0IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IG9uIH0gZnJvbSAnLi9hc3BlY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudGVkIHtcblx0LyoqXG5cdCAqIEVtaXRzIGFuIGV2ZW50LCBmaXJpbmcgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgZm9yIGl0LlxuXHQgKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IG9iamVjdCB0byBlbWl0XG5cdCAqL1xuXHRlbWl0PFQgZXh0ZW5kcyBFdmVudE9iamVjdD4oZGF0YTogVCk6IHZvaWQge1xuXHRcdGNvbnN0IHR5cGUgPSAnX19vbicgKyBkYXRhLnR5cGU7XG5cdFx0Y29uc3QgbWV0aG9kOiBGdW5jdGlvbiA9ICg8YW55PiB0aGlzKVt0eXBlXTtcblx0XHRpZiAobWV0aG9kKSB7XG5cdFx0XHRtZXRob2QuY2FsbCh0aGlzLCBkYXRhKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTGlzdGVucyBmb3IgYW4gZXZlbnQsIGNhbGxpbmcgdGhlIGxpc3RlbmVyIHdoZW5ldmVyIHRoZSBldmVudCBmaXJlcy5cblx0ICogQHBhcmFtIHR5cGUgRXZlbnQgdHlwZSB0byBsaXN0ZW4gZm9yXG5cdCAqIEBwYXJhbSBsaXN0ZW5lciBDYWxsYmFjayB0byBoYW5kbGUgdGhlIGV2ZW50IHdoZW4gaXQgZmlyZXNcblx0ICogQHJldHVybiBBIGhhbmRsZSB3aGljaCB3aWxsIHJlbW92ZSB0aGUgbGlzdGVuZXIgd2hlbiBkZXN0cm95IGlzIGNhbGxlZFxuXHQgKi9cblx0b24odHlwZTogc3RyaW5nLCBsaXN0ZW5lcjogKGV2ZW50OiBFdmVudE9iamVjdCkgPT4gdm9pZCk6IEhhbmRsZSB7XG5cdFx0Y29uc3QgbmFtZSA9ICdfX29uJyArIHR5cGU7XG5cdFx0aWYgKCEoPGFueT4gdGhpcylbbmFtZV0pIHtcblx0XHRcdC8vIGRlZmluZSBhIG5vbi1lbnVtZXJhYmxlIHByb3BlcnR5IChzZWUgIzc3KVxuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIG5hbWUsIHtcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxuXHRcdFx0XHR2YWx1ZTogdW5kZWZpbmVkLFxuXHRcdFx0XHR3cml0YWJsZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBvbih0aGlzLCBuYW1lLCBsaXN0ZW5lcik7XG5cdH1cbn1cbiJdfQ==