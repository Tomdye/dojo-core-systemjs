(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './has'], factory);
    }
})(function (require, exports) {
    "use strict";
    const has_1 = require('./has');
    const slice = Array.prototype.slice;
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    /**
     * Type guard that ensures that the value can be coerced to Object
     * to weed out host objects that do not derive from Object.
     * This function is used to check if we want to deep copy an object or not.
     * Note: In ES6 it is possible to modify an object's Symbol.toStringTag property, which will
     * change the value returned by `toString`. This is a rare edge case that is difficult to handle,
     * so it is not handled here.
     * @param  value The value to check
     * @return       If the value is coercible into an Object
     */
    function shouldDeepCopyObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }
    function copyArray(array, inherited) {
        return array.map(function (item) {
            if (Array.isArray(item)) {
                return copyArray(item, inherited);
            }
            return !shouldDeepCopyObject(item) ?
                item :
                _mixin({
                    deep: true,
                    inherited: inherited,
                    sources: [item],
                    target: {}
                });
        });
    }
    function _mixin(kwArgs) {
        const deep = kwArgs.deep;
        const inherited = kwArgs.inherited;
        const target = kwArgs.target;
        for (let source of kwArgs.sources) {
            for (let key in source) {
                if (inherited || hasOwnProperty.call(source, key)) {
                    let value = source[key];
                    if (deep) {
                        if (Array.isArray(value)) {
                            value = copyArray(value, inherited);
                        }
                        else if (shouldDeepCopyObject(value)) {
                            value = _mixin({
                                deep: true,
                                inherited: inherited,
                                sources: [value],
                                target: {}
                            });
                        }
                    }
                    target[key] = value;
                }
            }
        }
        return target;
    }
    /**
     * Copies the values of all enumerable own properties of one or more source objects to the target object.
     *
     * @param target The target object to receive values from source objects
     * @param sources Any number of objects whose enumerable own properties will be copied to the target object
     * @return The modified target object
     */
    exports.assign = has_1.default('object-assign') ?
        Object.assign :
        function (target, ...sources) {
            return _mixin({
                deep: false,
                inherited: false,
                sources: sources,
                target: target
            });
        };
    /**
     * Creates a new object from the given prototype, and copies all enumerable own properties of one or more
     * source objects to the newly created target object.
     *
     * @param prototype The prototype to create a new object from
     * @param mixins Any number of objects whose enumerable own properties will be copied to the created object
     * @return The new object
     */
    function create(prototype, ...mixins) {
        if (!mixins.length) {
            throw new RangeError('lang.create requires at least one mixin object.');
        }
        const args = mixins.slice();
        args.unshift(Object.create(prototype));
        return exports.assign.apply(null, args);
    }
    exports.create = create;
    /**
     * Copies the values of all enumerable own properties of one or more source objects to the target object,
     * recursively copying all nested objects and arrays as well.
     *
     * @param target The target object to receive values from source objects
     * @param sources Any number of objects whose enumerable own properties will be copied to the target object
     * @return The modified target object
     */
    function deepAssign(target, ...sources) {
        return _mixin({
            deep: true,
            inherited: false,
            sources: sources,
            target: target
        });
    }
    exports.deepAssign = deepAssign;
    /**
     * Copies the values of all enumerable (own or inherited) properties of one or more source objects to the
     * target object, recursively copying all nested objects and arrays as well.
     *
     * @param target The target object to receive values from source objects
     * @param sources Any number of objects whose enumerable properties will be copied to the target object
     * @return The modified target object
     */
    function deepMixin(target, ...sources) {
        return _mixin({
            deep: true,
            inherited: true,
            sources: sources,
            target: target
        });
    }
    exports.deepMixin = deepMixin;
    /**
     * Creates a new object using the provided source's prototype as the prototype for the new object, and then
     * deep copies the provided source's values into the new target.
     *
     * @param source The object to duplicate
     * @return The new object
     */
    function duplicate(source) {
        const target = Object.create(Object.getPrototypeOf(source));
        return deepMixin(target, source);
    }
    exports.duplicate = duplicate;
    /**
     * Determines whether two values are the same value.
     *
     * @param a First value to compare
     * @param b Second value to compare
     * @return true if the values are the same; false otherwise
     */
    function isIdentical(a, b) {
        return a === b ||
            /* both values are NaN */
            (a !== a && b !== b);
    }
    exports.isIdentical = isIdentical;
    /**
     * Returns a function that binds a method to the specified object at runtime. This is similar to
     * `Function.prototype.bind`, but instead of a function it takes the name of a method on an object.
     * As a result, the function returned by `lateBind` will always call the function currently assigned to
     * the specified property on the object as of the moment the function it returns is called.
     *
     * @param instance The context object
     * @param method The name of the method on the context object to bind to itself
     * @param suppliedArgs An optional array of values to prepend to the `instance[method]` arguments list
     * @return The bound function
     */
    function lateBind(instance, method, ...suppliedArgs) {
        return suppliedArgs.length ?
            function () {
                const args = arguments.length ? suppliedArgs.concat(slice.call(arguments)) : suppliedArgs;
                // TS7017
                return instance[method].apply(instance, args);
            } :
            function () {
                // TS7017
                return instance[method].apply(instance, arguments);
            };
    }
    exports.lateBind = lateBind;
    /**
     * Copies the values of all enumerable (own or inherited) properties of one or more source objects to the
     * target object.
     *
     * @return The modified target object
     */
    function mixin(target, ...sources) {
        return _mixin({
            deep: false,
            inherited: true,
            sources: sources,
            target: target
        });
    }
    exports.mixin = mixin;
    /**
     * Returns a function which invokes the given function with the given arguments prepended to its argument list.
     * Like `Function.prototype.bind`, but does not alter execution context.
     *
     * @param targetFunction The function that needs to be bound
     * @param suppliedArgs An optional array of arguments to prepend to the `targetFunction` arguments list
     * @return The bound function
     */
    function partial(targetFunction, ...suppliedArgs) {
        return function () {
            const args = arguments.length ? suppliedArgs.concat(slice.call(arguments)) : suppliedArgs;
            return targetFunction.apply(this, args);
        };
    }
    exports.partial = partial;
    /**
     * Returns an object with a destroy method that, when called, calls the passed-in destructor.
     * This is intended to provide a unified interface for creating "remove" / "destroy" handlers for
     * event listeners, timers, etc.
     *
     * @param destructor A function that will be called when the handle's `destroy` method is invoked
     * @return The handle object
     */
    function createHandle(destructor) {
        return {
            destroy: function () {
                this.destroy = function () { };
                destructor.call(this);
            }
        };
    }
    exports.createHandle = createHandle;
    /**
     * Returns a single handle that can be used to destroy multiple handles simultaneously.
     *
     * @param handles An array of handles with `destroy` methods
     * @return The handle object
     */
    function createCompositeHandle(...handles) {
        return createHandle(function () {
            for (let handle of handles) {
                handle.destroy();
            }
        });
    }
    exports.createCompositeHandle = createCompositeHandle;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9sYW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUFBLHNCQUFnQixPQUFPLENBQUMsQ0FBQTtJQUd4QixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztJQUNwQyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztJQUV2RDs7Ozs7Ozs7O09BU0c7SUFDSCw4QkFBOEIsS0FBVTtRQUN2QyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLGlCQUFpQixDQUFDO0lBQ3BFLENBQUM7SUFFRCxtQkFBc0IsS0FBVSxFQUFFLFNBQWtCO1FBQ25ELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBTztZQUNqQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsTUFBTSxDQUFRLFNBQVMsQ0FBTyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDaEQsQ0FBQztZQUVELE1BQU0sQ0FBQyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQztnQkFDakMsSUFBSTtnQkFDSixNQUFNLENBQUM7b0JBQ04sSUFBSSxFQUFFLElBQUk7b0JBQ1YsU0FBUyxFQUFFLFNBQVM7b0JBQ3BCLE9BQU8sRUFBYSxDQUFFLElBQUksQ0FBRTtvQkFDNUIsTUFBTSxFQUFNLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBU0QsZ0JBQTRDLE1BQXVCO1FBQ2xFLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDekIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNuQyxNQUFNLE1BQU0sR0FB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RUFBRSxLQUFLO1lBQ1gsU0FBUyxFQUFFLElBQUk7WUFDZixPQUFPLEVBQUUsT0FBTztZQUNoQixNQUFNLEVBQUUsTUFBTTtTQUNkLENBQUMsQ0FBQztJQUNKLENBQUM7SUFQZSxhQUFLLFFBT3BCLENBQUE7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsaUJBQXdCLGNBQXVDLEVBQUUsR0FBRyxZQUFtQjtRQUN0RixNQUFNLENBQUM7WUFDTixNQUFNLElBQUksR0FBVSxTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQztZQUVqRyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDekMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQU5lLGVBQU8sVUFNdEIsQ0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSCxzQkFBNkIsVUFBc0I7UUFDbEQsTUFBTSxDQUFDO1lBQ04sT0FBTyxFQUFFO2dCQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsY0FBYSxDQUFDLENBQUM7Z0JBQzlCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsQ0FBQztTQUNELENBQUM7SUFDSCxDQUFDO0lBUGUsb0JBQVksZUFPM0IsQ0FBQTtJQUVEOzs7OztPQUtHO0lBQ0gsK0JBQXNDLEdBQUcsT0FBaUI7UUFDekQsTUFBTSxDQUFDLFlBQVksQ0FBQztZQUNuQixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbEIsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQU5lLDZCQUFxQix3QkFNcEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBoYXMgZnJvbSAnLi9oYXMnO1xuaW1wb3J0IHsgSGFuZGxlIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuY29uc3Qgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5jb25zdCBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVHlwZSBndWFyZCB0aGF0IGVuc3VyZXMgdGhhdCB0aGUgdmFsdWUgY2FuIGJlIGNvZXJjZWQgdG8gT2JqZWN0XG4gKiB0byB3ZWVkIG91dCBob3N0IG9iamVjdHMgdGhhdCBkbyBub3QgZGVyaXZlIGZyb20gT2JqZWN0LlxuICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGNoZWNrIGlmIHdlIHdhbnQgdG8gZGVlcCBjb3B5IGFuIG9iamVjdCBvciBub3QuXG4gKiBOb3RlOiBJbiBFUzYgaXQgaXMgcG9zc2libGUgdG8gbW9kaWZ5IGFuIG9iamVjdCdzIFN5bWJvbC50b1N0cmluZ1RhZyBwcm9wZXJ0eSwgd2hpY2ggd2lsbFxuICogY2hhbmdlIHRoZSB2YWx1ZSByZXR1cm5lZCBieSBgdG9TdHJpbmdgLiBUaGlzIGlzIGEgcmFyZSBlZGdlIGNhc2UgdGhhdCBpcyBkaWZmaWN1bHQgdG8gaGFuZGxlLFxuICogc28gaXQgaXMgbm90IGhhbmRsZWQgaGVyZS5cbiAqIEBwYXJhbSAgdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrXG4gKiBAcmV0dXJuICAgICAgIElmIHRoZSB2YWx1ZSBpcyBjb2VyY2libGUgaW50byBhbiBPYmplY3RcbiAqL1xuZnVuY3Rpb24gc2hvdWxkRGVlcENvcHlPYmplY3QodmFsdWU6IGFueSk6IHZhbHVlIGlzIE9iamVjdCB7XG5cdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBPYmplY3RdJztcbn1cblxuZnVuY3Rpb24gY29weUFycmF5PFQ+KGFycmF5OiBUW10sIGluaGVyaXRlZDogYm9vbGVhbik6IFRbXSB7XG5cdHJldHVybiBhcnJheS5tYXAoZnVuY3Rpb24gKGl0ZW06IFQpOiBUIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShpdGVtKSkge1xuXHRcdFx0cmV0dXJuICA8YW55PiBjb3B5QXJyYXkoPGFueT4gaXRlbSwgaW5oZXJpdGVkKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gIXNob3VsZERlZXBDb3B5T2JqZWN0KGl0ZW0pID9cblx0XHRcdGl0ZW0gOlxuXHRcdFx0X21peGluKHtcblx0XHRcdFx0ZGVlcDogdHJ1ZSxcblx0XHRcdFx0aW5oZXJpdGVkOiBpbmhlcml0ZWQsXG5cdFx0XHRcdHNvdXJjZXM6IDxBcnJheTxUPj4gWyBpdGVtIF0sXG5cdFx0XHRcdHRhcmdldDogPFQ+IHt9XG5cdFx0XHR9KTtcblx0fSk7XG59XG5cbmludGVyZmFjZSBNaXhpbkFyZ3M8VCBleHRlbmRzIHt9LCBVIGV4dGVuZHMge30+IHtcblx0ZGVlcDogYm9vbGVhbjtcblx0aW5oZXJpdGVkOiBib29sZWFuO1xuXHRzb3VyY2VzOiBVW107XG5cdHRhcmdldDogVDtcbn1cblxuZnVuY3Rpb24gX21peGluPFQgZXh0ZW5kcyB7fSwgVSBleHRlbmRzIHt9Pihrd0FyZ3M6IE1peGluQXJnczxULCBVPik6IFQmVSB7XG5cdGNvbnN0IGRlZXAgPSBrd0FyZ3MuZGVlcDtcblx0Y29uc3QgaW5oZXJpdGVkID0ga3dBcmdzLmluaGVyaXRlZDtcblx0Y29uc3QgdGFyZ2V0ID0ga3dBcmdzLnRhcmdldDtcblxuXHRmb3IgKGxldCBzb3VyY2Ugb2Yga3dBcmdzLnNvdXJjZXMpIHtcblx0XHRmb3IgKGxldCBrZXkgaW4gc291cmNlKSB7XG5cdFx0XHRpZiAoaW5oZXJpdGVkIHx8IGhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG5cdFx0XHRcdGxldCB2YWx1ZTogYW55ID0gKDxhbnk+IHNvdXJjZSlba2V5XTtcblxuXHRcdFx0XHRpZiAoZGVlcCkge1xuXHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0XHRcdFx0dmFsdWUgPSBjb3B5QXJyYXkodmFsdWUsIGluaGVyaXRlZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKHNob3VsZERlZXBDb3B5T2JqZWN0KHZhbHVlKSkge1xuXHRcdFx0XHRcdFx0dmFsdWUgPSBfbWl4aW4oe1xuXHRcdFx0XHRcdFx0XHRkZWVwOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRpbmhlcml0ZWQ6IGluaGVyaXRlZCxcblx0XHRcdFx0XHRcdFx0c291cmNlczogPFVbXT4gWyB2YWx1ZSBdLFxuXHRcdFx0XHRcdFx0XHR0YXJnZXQ6IHt9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQoPGFueT4gdGFyZ2V0KVtrZXldID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIDxUJlU+IHRhcmdldDtcbn1cblxuaW50ZXJmYWNlIE9iamVjdEFzc2lnbkNvbnN0cnVjdG9yIGV4dGVuZHMgT2JqZWN0Q29uc3RydWN0b3Ige1xuXHRhc3NpZ248VCBleHRlbmRzIHt9LCBVIGV4dGVuZHMge30+KHRhcmdldDogVCwgLi4uc291cmNlczogVVtdKTogVCZVO1xufVxuXG4vKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIG9mIGFsbCBlbnVtZXJhYmxlIG93biBwcm9wZXJ0aWVzIG9mIG9uZSBvciBtb3JlIHNvdXJjZSBvYmplY3RzIHRvIHRoZSB0YXJnZXQgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3QgdG8gcmVjZWl2ZSB2YWx1ZXMgZnJvbSBzb3VyY2Ugb2JqZWN0c1xuICogQHBhcmFtIHNvdXJjZXMgQW55IG51bWJlciBvZiBvYmplY3RzIHdob3NlIGVudW1lcmFibGUgb3duIHByb3BlcnRpZXMgd2lsbCBiZSBjb3BpZWQgdG8gdGhlIHRhcmdldCBvYmplY3RcbiAqIEByZXR1cm4gVGhlIG1vZGlmaWVkIHRhcmdldCBvYmplY3RcbiAqL1xuZXhwb3J0IGNvbnN0IGFzc2lnbiA9IGhhcygnb2JqZWN0LWFzc2lnbicpID9cblx0KDxPYmplY3RBc3NpZ25Db25zdHJ1Y3Rvcj4gT2JqZWN0KS5hc3NpZ24gOlxuXHRmdW5jdGlvbjxUIGV4dGVuZHMge30sIFUgZXh0ZW5kcyB7fT4gKHRhcmdldDogVCwgLi4uc291cmNlczogVVtdKTogVCZVIHtcblx0XHRyZXR1cm4gX21peGluKHtcblx0XHRcdGRlZXA6IGZhbHNlLFxuXHRcdFx0aW5oZXJpdGVkOiBmYWxzZSxcblx0XHRcdHNvdXJjZXM6IHNvdXJjZXMsXG5cdFx0XHR0YXJnZXQ6IHRhcmdldFxuXHRcdH0pO1xuXHR9O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgb2JqZWN0IGZyb20gdGhlIGdpdmVuIHByb3RvdHlwZSwgYW5kIGNvcGllcyBhbGwgZW51bWVyYWJsZSBvd24gcHJvcGVydGllcyBvZiBvbmUgb3IgbW9yZVxuICogc291cmNlIG9iamVjdHMgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgdGFyZ2V0IG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gcHJvdG90eXBlIFRoZSBwcm90b3R5cGUgdG8gY3JlYXRlIGEgbmV3IG9iamVjdCBmcm9tXG4gKiBAcGFyYW0gbWl4aW5zIEFueSBudW1iZXIgb2Ygb2JqZWN0cyB3aG9zZSBlbnVtZXJhYmxlIG93biBwcm9wZXJ0aWVzIHdpbGwgYmUgY29waWVkIHRvIHRoZSBjcmVhdGVkIG9iamVjdFxuICogQHJldHVybiBUaGUgbmV3IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlPFQgZXh0ZW5kcyB7fSwgVSBleHRlbmRzIHt9Pihwcm90b3R5cGU6IFQsIC4uLm1peGluczogVVtdKTogVCZVIHtcblx0aWYgKCFtaXhpbnMubGVuZ3RoKSB7XG5cdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2xhbmcuY3JlYXRlIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBtaXhpbiBvYmplY3QuJyk7XG5cdH1cblxuXHRjb25zdCBhcmdzID0gbWl4aW5zLnNsaWNlKCk7XG5cdGFyZ3MudW5zaGlmdChPYmplY3QuY3JlYXRlKHByb3RvdHlwZSkpO1xuXG5cdHJldHVybiBhc3NpZ24uYXBwbHkobnVsbCwgYXJncyk7XG59XG5cbi8qKlxuICogQ29waWVzIHRoZSB2YWx1ZXMgb2YgYWxsIGVudW1lcmFibGUgb3duIHByb3BlcnRpZXMgb2Ygb25lIG9yIG1vcmUgc291cmNlIG9iamVjdHMgdG8gdGhlIHRhcmdldCBvYmplY3QsXG4gKiByZWN1cnNpdmVseSBjb3B5aW5nIGFsbCBuZXN0ZWQgb2JqZWN0cyBhbmQgYXJyYXlzIGFzIHdlbGwuXG4gKlxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCB0byByZWNlaXZlIHZhbHVlcyBmcm9tIHNvdXJjZSBvYmplY3RzXG4gKiBAcGFyYW0gc291cmNlcyBBbnkgbnVtYmVyIG9mIG9iamVjdHMgd2hvc2UgZW51bWVyYWJsZSBvd24gcHJvcGVydGllcyB3aWxsIGJlIGNvcGllZCB0byB0aGUgdGFyZ2V0IG9iamVjdFxuICogQHJldHVybiBUaGUgbW9kaWZpZWQgdGFyZ2V0IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVlcEFzc2lnbjxUIGV4dGVuZHMge30sIFUgZXh0ZW5kcyB7fT4odGFyZ2V0OiBULCAuLi5zb3VyY2VzOiBVW10pOiBUJlUge1xuXHRyZXR1cm4gX21peGluKHtcblx0XHRkZWVwOiB0cnVlLFxuXHRcdGluaGVyaXRlZDogZmFsc2UsXG5cdFx0c291cmNlczogc291cmNlcyxcblx0XHR0YXJnZXQ6IHRhcmdldFxuXHR9KTtcbn1cblxuLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBvZiBhbGwgZW51bWVyYWJsZSAob3duIG9yIGluaGVyaXRlZCkgcHJvcGVydGllcyBvZiBvbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyB0byB0aGVcbiAqIHRhcmdldCBvYmplY3QsIHJlY3Vyc2l2ZWx5IGNvcHlpbmcgYWxsIG5lc3RlZCBvYmplY3RzIGFuZCBhcnJheXMgYXMgd2VsbC5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IHRvIHJlY2VpdmUgdmFsdWVzIGZyb20gc291cmNlIG9iamVjdHNcbiAqIEBwYXJhbSBzb3VyY2VzIEFueSBudW1iZXIgb2Ygb2JqZWN0cyB3aG9zZSBlbnVtZXJhYmxlIHByb3BlcnRpZXMgd2lsbCBiZSBjb3BpZWQgdG8gdGhlIHRhcmdldCBvYmplY3RcbiAqIEByZXR1cm4gVGhlIG1vZGlmaWVkIHRhcmdldCBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZXBNaXhpbjxUIGV4dGVuZHMge30sIFUgZXh0ZW5kcyB7fT4odGFyZ2V0OiBULCAuLi5zb3VyY2VzOiBVW10pOiBUJlUge1xuXHRyZXR1cm4gX21peGluKHtcblx0XHRkZWVwOiB0cnVlLFxuXHRcdGluaGVyaXRlZDogdHJ1ZSxcblx0XHRzb3VyY2VzOiBzb3VyY2VzLFxuXHRcdHRhcmdldDogdGFyZ2V0XG5cdH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgb2JqZWN0IHVzaW5nIHRoZSBwcm92aWRlZCBzb3VyY2UncyBwcm90b3R5cGUgYXMgdGhlIHByb3RvdHlwZSBmb3IgdGhlIG5ldyBvYmplY3QsIGFuZCB0aGVuXG4gKiBkZWVwIGNvcGllcyB0aGUgcHJvdmlkZWQgc291cmNlJ3MgdmFsdWVzIGludG8gdGhlIG5ldyB0YXJnZXQuXG4gKlxuICogQHBhcmFtIHNvdXJjZSBUaGUgb2JqZWN0IHRvIGR1cGxpY2F0ZVxuICogQHJldHVybiBUaGUgbmV3IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZHVwbGljYXRlPFQgZXh0ZW5kcyB7fT4oc291cmNlOiBUKTogVCB7XG5cdGNvbnN0IHRhcmdldCA9IE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKHNvdXJjZSkpO1xuXG5cdHJldHVybiBkZWVwTWl4aW4odGFyZ2V0LCBzb3VyY2UpO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0d28gdmFsdWVzIGFyZSB0aGUgc2FtZSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gYSBGaXJzdCB2YWx1ZSB0byBjb21wYXJlXG4gKiBAcGFyYW0gYiBTZWNvbmQgdmFsdWUgdG8gY29tcGFyZVxuICogQHJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZXMgYXJlIHRoZSBzYW1lOyBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSWRlbnRpY2FsKGE6IGFueSwgYjogYW55KTogYm9vbGVhbiB7XG5cdHJldHVybiBhID09PSBiIHx8XG5cdFx0LyogYm90aCB2YWx1ZXMgYXJlIE5hTiAqL1xuXHRcdChhICE9PSBhICYmIGIgIT09IGIpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGJpbmRzIGEgbWV0aG9kIHRvIHRoZSBzcGVjaWZpZWQgb2JqZWN0IGF0IHJ1bnRpbWUuIFRoaXMgaXMgc2ltaWxhciB0b1xuICogYEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kYCwgYnV0IGluc3RlYWQgb2YgYSBmdW5jdGlvbiBpdCB0YWtlcyB0aGUgbmFtZSBvZiBhIG1ldGhvZCBvbiBhbiBvYmplY3QuXG4gKiBBcyBhIHJlc3VsdCwgdGhlIGZ1bmN0aW9uIHJldHVybmVkIGJ5IGBsYXRlQmluZGAgd2lsbCBhbHdheXMgY2FsbCB0aGUgZnVuY3Rpb24gY3VycmVudGx5IGFzc2lnbmVkIHRvXG4gKiB0aGUgc3BlY2lmaWVkIHByb3BlcnR5IG9uIHRoZSBvYmplY3QgYXMgb2YgdGhlIG1vbWVudCB0aGUgZnVuY3Rpb24gaXQgcmV0dXJucyBpcyBjYWxsZWQuXG4gKlxuICogQHBhcmFtIGluc3RhbmNlIFRoZSBjb250ZXh0IG9iamVjdFxuICogQHBhcmFtIG1ldGhvZCBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIG9uIHRoZSBjb250ZXh0IG9iamVjdCB0byBiaW5kIHRvIGl0c2VsZlxuICogQHBhcmFtIHN1cHBsaWVkQXJncyBBbiBvcHRpb25hbCBhcnJheSBvZiB2YWx1ZXMgdG8gcHJlcGVuZCB0byB0aGUgYGluc3RhbmNlW21ldGhvZF1gIGFyZ3VtZW50cyBsaXN0XG4gKiBAcmV0dXJuIFRoZSBib3VuZCBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gbGF0ZUJpbmQoaW5zdGFuY2U6IHt9LCBtZXRob2Q6IHN0cmluZywgLi4uc3VwcGxpZWRBcmdzOiBhbnlbXSk6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55IHtcblx0cmV0dXJuIHN1cHBsaWVkQXJncy5sZW5ndGggP1xuXHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdGNvbnN0IGFyZ3M6IGFueVtdID0gYXJndW1lbnRzLmxlbmd0aCA/IHN1cHBsaWVkQXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSA6IHN1cHBsaWVkQXJncztcblxuXHRcdFx0Ly8gVFM3MDE3XG5cdFx0XHRyZXR1cm4gKDxhbnk+IGluc3RhbmNlKVttZXRob2RdLmFwcGx5KGluc3RhbmNlLCBhcmdzKTtcblx0XHR9IDpcblx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHQvLyBUUzcwMTdcblx0XHRcdHJldHVybiAoPGFueT4gaW5zdGFuY2UpW21ldGhvZF0uYXBwbHkoaW5zdGFuY2UsIGFyZ3VtZW50cyk7XG5cdFx0fTtcbn1cblxuLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBvZiBhbGwgZW51bWVyYWJsZSAob3duIG9yIGluaGVyaXRlZCkgcHJvcGVydGllcyBvZiBvbmUgb3IgbW9yZSBzb3VyY2Ugb2JqZWN0cyB0byB0aGVcbiAqIHRhcmdldCBvYmplY3QuXG4gKlxuICogQHJldHVybiBUaGUgbW9kaWZpZWQgdGFyZ2V0IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWl4aW48VCBleHRlbmRzIHt9LCBVIGV4dGVuZHMge30+KHRhcmdldDogVCwgLi4uc291cmNlczogVVtdKTogVCZVIHtcblx0cmV0dXJuIF9taXhpbih7XG5cdFx0ZGVlcDogZmFsc2UsXG5cdFx0aW5oZXJpdGVkOiB0cnVlLFxuXHRcdHNvdXJjZXM6IHNvdXJjZXMsXG5cdFx0dGFyZ2V0OiB0YXJnZXRcblx0fSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIHdoaWNoIGludm9rZXMgdGhlIGdpdmVuIGZ1bmN0aW9uIHdpdGggdGhlIGdpdmVuIGFyZ3VtZW50cyBwcmVwZW5kZWQgdG8gaXRzIGFyZ3VtZW50IGxpc3QuXG4gKiBMaWtlIGBGdW5jdGlvbi5wcm90b3R5cGUuYmluZGAsIGJ1dCBkb2VzIG5vdCBhbHRlciBleGVjdXRpb24gY29udGV4dC5cbiAqXG4gKiBAcGFyYW0gdGFyZ2V0RnVuY3Rpb24gVGhlIGZ1bmN0aW9uIHRoYXQgbmVlZHMgdG8gYmUgYm91bmRcbiAqIEBwYXJhbSBzdXBwbGllZEFyZ3MgQW4gb3B0aW9uYWwgYXJyYXkgb2YgYXJndW1lbnRzIHRvIHByZXBlbmQgdG8gdGhlIGB0YXJnZXRGdW5jdGlvbmAgYXJndW1lbnRzIGxpc3RcbiAqIEByZXR1cm4gVGhlIGJvdW5kIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJ0aWFsKHRhcmdldEZ1bmN0aW9uOiAoLi4uYXJnczogYW55W10pID0+IGFueSwgLi4uc3VwcGxpZWRBcmdzOiBhbnlbXSk6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55IHtcblx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRjb25zdCBhcmdzOiBhbnlbXSA9IGFyZ3VtZW50cy5sZW5ndGggPyBzdXBwbGllZEFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkgOiBzdXBwbGllZEFyZ3M7XG5cblx0XHRyZXR1cm4gdGFyZ2V0RnVuY3Rpb24uYXBwbHkodGhpcywgYXJncyk7XG5cdH07XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBhIGRlc3Ryb3kgbWV0aG9kIHRoYXQsIHdoZW4gY2FsbGVkLCBjYWxscyB0aGUgcGFzc2VkLWluIGRlc3RydWN0b3IuXG4gKiBUaGlzIGlzIGludGVuZGVkIHRvIHByb3ZpZGUgYSB1bmlmaWVkIGludGVyZmFjZSBmb3IgY3JlYXRpbmcgXCJyZW1vdmVcIiAvIFwiZGVzdHJveVwiIGhhbmRsZXJzIGZvclxuICogZXZlbnQgbGlzdGVuZXJzLCB0aW1lcnMsIGV0Yy5cbiAqXG4gKiBAcGFyYW0gZGVzdHJ1Y3RvciBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgaGFuZGxlJ3MgYGRlc3Ryb3lgIG1ldGhvZCBpcyBpbnZva2VkXG4gKiBAcmV0dXJuIFRoZSBoYW5kbGUgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIYW5kbGUoZGVzdHJ1Y3RvcjogKCkgPT4gdm9pZCk6IEhhbmRsZSB7XG5cdHJldHVybiB7XG5cdFx0ZGVzdHJveTogZnVuY3Rpb24gKCkge1xuXHRcdFx0dGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge307XG5cdFx0XHRkZXN0cnVjdG9yLmNhbGwodGhpcyk7XG5cdFx0fVxuXHR9O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBzaW5nbGUgaGFuZGxlIHRoYXQgY2FuIGJlIHVzZWQgdG8gZGVzdHJveSBtdWx0aXBsZSBoYW5kbGVzIHNpbXVsdGFuZW91c2x5LlxuICpcbiAqIEBwYXJhbSBoYW5kbGVzIEFuIGFycmF5IG9mIGhhbmRsZXMgd2l0aCBgZGVzdHJveWAgbWV0aG9kc1xuICogQHJldHVybiBUaGUgaGFuZGxlIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9zaXRlSGFuZGxlKC4uLmhhbmRsZXM6IEhhbmRsZVtdKTogSGFuZGxlIHtcblx0cmV0dXJuIGNyZWF0ZUhhbmRsZShmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yIChsZXQgaGFuZGxlIG9mIGhhbmRsZXMpIHtcblx0XHRcdGhhbmRsZS5kZXN0cm95KCk7XG5cdFx0fVxuXHR9KTtcbn1cbiJdfQ==