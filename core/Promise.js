(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './queue', './global', './has'], factory);
    }
})(function (require, exports) {
    "use strict";
    const queue_1 = require('./queue');
    const global_1 = require('./global');
    const has_1 = require('./has');
    /**
     * Copies an array of values, replacing any PlatformPromises in the copy with unwrapped global.Promises. This is necessary
     * for .all and .race so that the native promise doesn't treat the PlatformPromises like generic thenables.
     */
    function unwrapPromises(items) {
        const unwrapped = [];
        const count = items.length;
        for (let i = 0; i < count; i++) {
            if (!(i in items)) {
                continue;
            }
            let item = items[i];
            unwrapped[i] = item instanceof Promise ? item.promise : item;
        }
        return unwrapped;
    }
    /**
     * Returns true if a given value has a `then` method.
     * @param {any} value The value to check if is Thenable
     * @returns {is Thenable<T>} A type guard if the value is thenable
     */
    function isThenable(value) {
        return value && typeof value.then === 'function';
    }
    exports.isThenable = isThenable;
    /**
     * PromiseShim is a partial implementation of the ES2015 Promise specification. It relies on Promise to do some safety
     * checks such as verifying that a Promise isn't resolved with itself. This class is exported for testability, and is
     * not intended to be used directly.
     *
     * @borrows Promise.all as PromiseShim.all
     * @borrows Promise.race as PromiseShim.race
     * @borrows Promise.reject as PromiseShim.reject
     * @borrows Promise.resolve as PromiseShim.resolve
     * @borrows Promise#catch as PromiseShim#catch
     * @borrows Promise#then as PromiseShim#then
     */
    class PromiseShim {
        /**
         * Creates a new PromiseShim.
         *
         * @constructor
         *
         * @param executor
         * The executor function is called immediately when the PromiseShim is instantiated. It is responsible for
         * starting the asynchronous operation when it is invoked.
         *
         * The executor must call either the passed `resolve` function when the asynchronous operation has completed
         * successfully, or the `reject` function when the operation fails.
         */
        constructor(executor) {
            /**
             * The current state of this promise.
             */
            this.state = State.Pending;
            /**
             * If true, the resolution of this promise is chained ("locked in") to another promise.
             */
            let isChained = false;
            /**
             * Whether or not this promise is in a resolved state.
             */
            const isResolved = () => {
                return this.state !== State.Pending || isChained;
            };
            /**
             * Callbacks that should be invoked once the asynchronous operation has completed.
             */
            let callbacks = [];
            /**
             * Initially pushes callbacks onto a queue for execution once this promise settles. After the promise settles,
             * enqueues callbacks for execution on the next event loop turn.
             */
            let whenFinished = function (callback) {
                callbacks.push(callback);
            };
            /**
             * Settles this promise.
             *
             * @param newState The resolved state for this promise.
             * @param {T|Error} value The resolved value for this promise.
             */
            const settle = (newState, value) => {
                // A promise can only be settled once.
                if (this.state !== State.Pending) {
                    return;
                }
                this.state = newState;
                this.resolvedValue = value;
                whenFinished = queue_1.queueMicroTask;
                // Only enqueue a callback runner if there are callbacks so that initially fulfilled Promises don't have to
                // wait an extra turn.
                if (callbacks.length > 0) {
                    queue_1.queueMicroTask(function () {
                        let count = callbacks.length;
                        for (let i = 0; i < count; ++i) {
                            callbacks[i].call(null);
                        }
                        callbacks = null;
                    });
                }
            };
            /**
             * Resolves this promise.
             *
             * @param newState The resolved state for this promise.
             * @param {T|Error} value The resolved value for this promise.
             */
            const resolve = (newState, value) => {
                if (isResolved()) {
                    return;
                }
                if (isThenable(value)) {
                    value.then(settle.bind(null, State.Fulfilled), settle.bind(null, State.Rejected));
                    isChained = true;
                }
                else {
                    settle(newState, value);
                }
            };
            this.then = (onFulfilled, onRejected) => {
                return new PromiseShim((resolve, reject) => {
                    // whenFinished initially queues up callbacks for execution after the promise has settled. Once the
                    // promise has settled, whenFinished will schedule callbacks for execution on the next turn through the
                    // event loop.
                    whenFinished(() => {
                        const callback = this.state === State.Rejected ? onRejected : onFulfilled;
                        if (typeof callback === 'function') {
                            try {
                                resolve(callback(this.resolvedValue));
                            }
                            catch (error) {
                                reject(error);
                            }
                        }
                        else if (this.state === State.Rejected) {
                            reject(this.resolvedValue);
                        }
                        else {
                            resolve(this.resolvedValue);
                        }
                    });
                });
            };
            try {
                executor(resolve.bind(null, State.Fulfilled), resolve.bind(null, State.Rejected));
            }
            catch (error) {
                settle(State.Rejected, error);
            }
        }
        static all(items) {
            return new this(function (resolve, reject) {
                const values = [];
                let complete = 0;
                let total = 0;
                let populating = true;
                function fulfill(index, value) {
                    values[index] = value;
                    ++complete;
                    finish();
                }
                function finish() {
                    if (populating || complete < total) {
                        return;
                    }
                    resolve(values);
                }
                function processItem(index, item) {
                    ++total;
                    if (item instanceof PromiseShim) {
                        // If an item PromiseShim rejects, this PromiseShim is immediately rejected with the item
                        // PromiseShim's rejection error.
                        item.then(fulfill.bind(null, index), reject);
                    }
                    else {
                        PromiseShim.resolve(item).then(fulfill.bind(null, index));
                    }
                }
                let count = items.length;
                for (let i = 0; i < count; ++i) {
                    processItem(i, items[i]);
                }
                populating = false;
                finish();
            });
        }
        static race(items) {
            return new this(function (resolve, reject) {
                const count = items.length;
                let item;
                for (let i = 0; i < count; ++i) {
                    item = items[i];
                    if (item instanceof PromiseShim) {
                        // If a PromiseShim item rejects, this PromiseShim is immediately rejected with the item
                        // PromiseShim's rejection error.
                        item.then(resolve, reject);
                    }
                    else {
                        PromiseShim.resolve(item).then(resolve);
                    }
                }
            });
        }
        static reject(reason) {
            return new this(function (resolve, reject) {
                reject(reason);
            });
        }
        static resolve(value) {
            return new this(function (resolve) {
                resolve(value);
            });
        }
    }
    exports.PromiseShim = PromiseShim;
    /**
     * PlatformPromise is a very thin wrapper around either a native promise implementation or PromiseShim.
     */
    class Promise {
        /**
         * Creates a new Promise.
         *
         * @constructor
         *
         * @param executor
         * The executor function is called immediately when the PromiseShim is instantiated. It is responsible for
         * starting the asynchronous operation when it is invoked.
         *
         * The executor must call either the passed `resolve` function when the asynchronous operation has completed
         * successfully, or the `reject` function when the operation fails.
         */
        constructor(executor) {
            // Wrap the executor to verify that the the resolution value isn't this promise. Since any incoming promise
            // should be wrapped, the native resolver can't automatically detect self-resolution.
            this.promise = new Promise.PromiseConstructor(((resolve, reject) => {
                executor((value) => {
                    if (value === this) {
                        reject(new TypeError('Cannot chain a promise to itself'));
                    }
                    else {
                        resolve(value);
                    }
                }, function (reason) {
                    reject(reason);
                });
            }));
            this._state = State.Pending;
            this.promise.then(() => { this._state = State.Fulfilled; }, () => { this._state = State.Rejected; });
        }
        /**
         * Converts an iterable object containing promises into a single promise that resolves to a new iterable object
         * containing the fulfilled values of all the promises in the iterable, in the same order as the Promises in the
         * iterable. Iterable values that are not promises are converted to promises using PromiseShim.resolve.
         *
         * @example
         * PromiseShim.all([ PromiseShim.resolve('foo'), 'bar' ]).then(function (value) {
         *     value[0] === 'foo'; // true
         *     value[1] === 'bar'; // true
         * });
         *
         * @example
         * PromiseShim.all({
         *     foo: PromiseShim.resolve('foo'),
         *     bar: 'bar'
         * }).then((value) => {
         *     value.foo === 'foo'; // true
         *     value.bar === 'bar'; // true
         * });
         */
        static all(items) {
            return this.copy(Promise.PromiseConstructor.all(unwrapPromises(items)));
        }
        /**
         * Converts an iterable object containing promises into a single promise that resolves or rejects as soon as one of
         * the promises in the iterable resolves or rejects, with the value of the resolved or rejected promise. Values in
         * the iterable that are not Promises are converted to Promises with PromiseShim.resolve.
         *
         * @example
         * PromiseShim.race([ PromiseShim.resolve('foo'), PromiseShim.resolve('bar') ]).then((value) => {
         *     value === 'foo'; // true
         * });
         *
         * @example
         * PromiseShim.race({
         *     foo: PromiseShim.resolve('foo'),
         *     bar: PromiseShim.resolve('bar')
         * }).then((value) => {
         *     value === 'foo'; // true
         * });
         */
        static race(items) {
            return this.copy(Promise.PromiseConstructor.race(unwrapPromises(items)));
        }
        /**
         * Creates a new promise that is rejected with the given error.
         */
        static reject(reason) {
            return this.copy(Promise.PromiseConstructor.reject(reason));
        }
        static resolve(value) {
            if (value instanceof Promise) {
                return value;
            }
            return this.copy(Promise.PromiseConstructor.resolve(value));
        }
        /**
         * Copies another Promise, taking on its inner state.
         */
        static copy(other) {
            const promise = Object.create(this.prototype, {
                promise: { value: other instanceof Promise.PromiseConstructor ? other : other.promise }
            });
            promise._state = State.Pending;
            promise.promise.then(function () { promise._state = State.Fulfilled; }, function () { promise._state = State.Rejected; });
            return promise;
        }
        catch(onRejected) {
            return this.then(null, onRejected);
        }
        /**
         * Allows for cleanup actions to be performed after resolution of a Promise.
         */
        finally(callback) {
            // Handler to be used for fulfillment and rejection; whether it was fulfilled or rejected is explicitly
            // indicated by the first argument
            function handler(rejected, valueOrError) {
                // If callback throws, the handler will throw
                const result = callback();
                if (isThenable(result)) {
                    // If callback returns a Thenable that rejects, return the rejection. Otherwise, return or throw the
                    // incoming value as appropriate when the Thenable resolves.
                    return Promise.resolve(result).then(function () {
                        if (rejected) {
                            throw valueOrError;
                        }
                        return valueOrError;
                    });
                }
                else {
                    // If callback returns a non-Thenable, return or throw the incoming value as appropriate.
                    if (rejected) {
                        throw valueOrError;
                    }
                    return valueOrError;
                }
            }
            ;
            return this.then(handler.bind(null, false), handler.bind(null, true));
        }
        /**
         * The current Promise state.
         */
        get state() {
            return this._state;
        }
        then(onFulfilled, onRejected) {
            return this.constructor.copy(this.promise.then(onFulfilled, onRejected));
        }
    }
    /**
     * Points to the promise constructor this platform should use.
     */
    Promise.PromiseConstructor = has_1.default('promise') ? global_1.default.Promise : PromiseShim;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Promise;
    /**
     * The State enum represents the possible states of a promise.
     */
    (function (State) {
        State[State["Fulfilled"] = 0] = "Fulfilled";
        State[State["Pending"] = 1] = "Pending";
        State[State["Rejected"] = 2] = "Rejected";
    })(exports.State || (exports.State = {}));
    var State = exports.State;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbWlzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Qcm9taXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUFBLHdCQUErQixTQUFTLENBQUMsQ0FBQTtJQUN6Qyx5QkFBbUIsVUFBVSxDQUFDLENBQUE7SUFDOUIsc0JBQWdCLE9BQU8sQ0FBQyxDQUFBO0lBRXhCOzs7T0FHRztJQUNILHdCQUF3QixLQUFZO1FBQ25DLE1BQU0sU0FBUyxHQUFpQixFQUFFLENBQUM7UUFDbkMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUMzQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixRQUFRLENBQUM7WUFDVixDQUFDO1lBQ0QsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFlBQVksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQzlELENBQUM7UUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFTRDs7OztPQUlHO0lBQ0gsb0JBQThCLEtBQVU7UUFDdkMsTUFBTSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFDO0lBQ2xELENBQUM7SUFGZSxrQkFBVSxhQUV6QixDQUFBO0lBRUQ7Ozs7Ozs7Ozs7O09BV0c7SUFDSDtRQTZFQzs7Ozs7Ozs7Ozs7V0FXRztRQUNILFlBQVksUUFBcUI7WUFzSGpDOztlQUVHO1lBQ0ssVUFBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7WUF4SDdCOztlQUVHO1lBQ0gsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRXRCOztlQUVHO1lBQ0gsTUFBTSxVQUFVLEdBQUc7Z0JBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxPQUFPLElBQUksU0FBUyxDQUFDO1lBQ2xELENBQUMsQ0FBQztZQUVGOztlQUVHO1lBQ0gsSUFBSSxTQUFTLEdBQXNCLEVBQUUsQ0FBQztZQUV0Qzs7O2VBR0c7WUFDSCxJQUFJLFlBQVksR0FBRyxVQUFVLFFBQW9CO2dCQUNoRCxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFCLENBQUMsQ0FBQztZQUVGOzs7OztlQUtHO1lBQ0gsTUFBTSxNQUFNLEdBQUcsQ0FBQyxRQUFlLEVBQUUsS0FBVTtnQkFDMUMsc0NBQXNDO2dCQUN0QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNsQyxNQUFNLENBQUM7Z0JBQ1IsQ0FBQztnQkFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7Z0JBQzNCLFlBQVksR0FBRyxzQkFBYyxDQUFDO2dCQUU5QiwyR0FBMkc7Z0JBQzNHLHNCQUFzQjtnQkFDdEIsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxQixzQkFBYyxDQUFDO3dCQUNkLElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7d0JBQzdCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7NEJBQ2hDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3pCLENBQUM7d0JBQ0QsU0FBUyxHQUFHLElBQUksQ0FBQztvQkFDbEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQztZQUNGLENBQUMsQ0FBQztZQUVGOzs7OztlQUtHO1lBQ0gsTUFBTSxPQUFPLEdBQUcsQ0FBQyxRQUFlLEVBQUUsS0FBVTtnQkFDM0MsRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNsQixNQUFNLENBQUM7Z0JBQ1IsQ0FBQztnQkFFRCxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2QixLQUFLLENBQUMsSUFBSSxDQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUNqQyxDQUFDO29CQUNGLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ2xCLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLENBQUM7b0JBQ0wsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDekIsQ0FBQztZQUNGLENBQUMsQ0FBQztZQUVGLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FDWCxXQUFpRCxFQUNqRCxVQUFxRDtnQkFFckQsTUFBTSxDQUFDLElBQUksV0FBVyxDQUFJLENBQUMsT0FBTyxFQUFFLE1BQU07b0JBQ3pDLG1HQUFtRztvQkFDbkcsdUdBQXVHO29CQUN2RyxjQUFjO29CQUNkLFlBQVksQ0FBQzt3QkFDWixNQUFNLFFBQVEsR0FBeUIsSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsR0FBRyxXQUFXLENBQUM7d0JBRWhHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sUUFBUSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7NEJBQ3BDLElBQUksQ0FBQztnQ0FDSixPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDOzRCQUN2QyxDQUNBOzRCQUFBLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0NBQ2QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNmLENBQUM7d0JBQ0YsQ0FBQzt3QkFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs0QkFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFDNUIsQ0FBQzt3QkFDRCxJQUFJLENBQUMsQ0FBQzs0QkFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO3dCQUM3QixDQUFDO29CQUNGLENBQUMsQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDO1lBRUYsSUFBSSxDQUFDO2dCQUNXLFFBQVMsQ0FDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQ2xDLENBQUM7WUFDSCxDQUNBO1lBQUEsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDZCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMvQixDQUFDO1FBQ0YsQ0FBQztRQTVNRCxPQUFPLEdBQUcsQ0FBSSxLQUEwQjtZQUN2QyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtnQkFDeEMsTUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFDO2dCQUN2QixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDZCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7Z0JBRXRCLGlCQUFpQixLQUFhLEVBQUUsS0FBVTtvQkFDekMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztvQkFDdEIsRUFBRSxRQUFRLENBQUM7b0JBQ1gsTUFBTSxFQUFFLENBQUM7Z0JBQ1YsQ0FBQztnQkFFRDtvQkFDQyxFQUFFLENBQUMsQ0FBQyxVQUFVLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ3BDLE1BQU0sQ0FBQztvQkFDUixDQUFDO29CQUNELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDakIsQ0FBQztnQkFFRCxxQkFBcUIsS0FBYSxFQUFFLElBQXVCO29CQUMxRCxFQUFFLEtBQUssQ0FBQztvQkFDUixFQUFFLENBQUMsQ0FBQyxJQUFJLFlBQVksV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFDakMseUZBQXlGO3dCQUN6RixpQ0FBaUM7d0JBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQzlDLENBQUM7b0JBQ0QsSUFBSSxDQUFDLENBQUM7d0JBQ0wsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDM0QsQ0FBQztnQkFDRixDQUFDO2dCQUVELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQ3pCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7b0JBQ2hDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLENBQUM7Z0JBQ0QsVUFBVSxHQUFHLEtBQUssQ0FBQztnQkFFbkIsTUFBTSxFQUFFLENBQUM7WUFDVixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBSSxLQUEwQjtZQUN4QyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtnQkFDeEMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDM0IsSUFBSSxJQUF1QixDQUFDO2dCQUU1QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO29CQUNoQyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVoQixFQUFFLENBQUMsQ0FBQyxJQUFJLFlBQVksV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFDakMsd0ZBQXdGO3dCQUN4RixpQ0FBaUM7d0JBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUM1QixDQUFDO29CQUNELElBQUksQ0FBQyxDQUFDO3dCQUNMLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN6QyxDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxPQUFPLE1BQU0sQ0FBSSxNQUFjO1lBQzlCLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO2dCQUN4QyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBSUQsT0FBTyxPQUFPLENBQUksS0FBVztZQUM1QixNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxPQUFPO2dCQUNoQyxPQUFPLENBQUssS0FBSyxDQUFDLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0lBb0pGLENBQUM7SUEvTlksbUJBQVcsY0ErTnZCLENBQUE7SUFFRDs7T0FFRztJQUNIO1FBeUZDOzs7Ozs7Ozs7OztXQVdHO1FBQ0gsWUFBWSxRQUFxQjtZQUNoQywyR0FBMkc7WUFDM0cscUZBQXFGO1lBQ3JGLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsa0JBQWtCLENBQWUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNO2dCQUM1RSxRQUFRLENBQ1AsQ0FBQyxLQUFLO29CQUNMLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUNwQixNQUFNLENBQUMsSUFBSSxTQUFTLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDO29CQUMzRCxDQUFDO29CQUNELElBQUksQ0FBQyxDQUFDO3dCQUNMLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDaEIsQ0FBQztnQkFDRixDQUFDLEVBQ0QsVUFBVSxNQUFNO29CQUNmLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEIsQ0FBQyxDQUNELENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1lBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUNoQixRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFDeEMsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQ3ZDLENBQUM7UUFDSCxDQUFDO1FBdkhEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBbUJHO1FBQ0gsT0FBTyxHQUFHLENBQUksS0FBMEI7WUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7V0FpQkc7UUFDSCxPQUFPLElBQUksQ0FBSSxLQUEwQjtZQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVEOztXQUVHO1FBQ0gsT0FBTyxNQUFNLENBQUksTUFBYTtZQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQVFELE9BQU8sT0FBTyxDQUFJLEtBQVc7WUFDNUIsRUFBRSxDQUFDLENBQUMsS0FBSyxZQUFZLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFRDs7V0FFRztRQUNILE9BQWlCLElBQUksQ0FBSSxLQUFpQjtZQUN6QyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQzdDLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLFlBQVksT0FBTyxDQUFDLGtCQUFrQixHQUFHLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFO2FBQ3ZGLENBQUMsQ0FBQztZQUVILE9BQU8sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztZQUMvQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDbkIsY0FBYyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQ2pELGNBQWMsT0FBTyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUNoRCxDQUFDO1lBRUYsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBc0RELEtBQUssQ0FBSSxVQUFvQztZQUM1QyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBSSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVEOztXQUVHO1FBQ0gsT0FBTyxDQUFDLFFBQW9DO1lBQzNDLHVHQUF1RztZQUN2RyxrQ0FBa0M7WUFDbEMsaUJBQWlCLFFBQWlCLEVBQUUsWUFBaUI7Z0JBQ3BELDZDQUE2QztnQkFDN0MsTUFBTSxNQUFNLEdBQUcsUUFBUSxFQUFFLENBQUM7Z0JBQzFCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hCLG9HQUFvRztvQkFDcEcsNERBQTREO29CQUM1RCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBQ25DLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7NEJBQ2QsTUFBTSxZQUFZLENBQUM7d0JBQ3BCLENBQUM7d0JBQ0QsTUFBTSxDQUFDLFlBQVksQ0FBQztvQkFDckIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQztnQkFDRCxJQUFJLENBQUMsQ0FBQztvQkFDTCx5RkFBeUY7b0JBQ3pGLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQ2QsTUFBTSxZQUFZLENBQUM7b0JBQ3BCLENBQUM7b0JBQ0QsTUFBTSxDQUFDLFlBQVksQ0FBQztnQkFDckIsQ0FBQztZQUNGLENBQUM7WUFBQSxDQUFDO1lBRUYsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxJQUFJLEtBQUs7WUFDUixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixDQUFDO1FBTUQsSUFBSSxDQUFJLFdBQThDLEVBQUUsVUFBa0Q7WUFDekcsTUFBTSxDQUFtQixJQUFJLENBQUMsV0FBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO0lBQ0YsQ0FBQztJQTdMQTs7T0FFRztJQUNJLDBCQUFrQixHQUFHLGFBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxnQkFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7SUFKM0U7NkJBOExDLENBQUE7SUFFRDs7T0FFRztJQUNILFdBQVksS0FBSztRQUNoQiwyQ0FBUyxDQUFBO1FBQ1QsdUNBQU8sQ0FBQTtRQUNQLHlDQUFRLENBQUE7SUFDVCxDQUFDLEVBSlcsYUFBSyxLQUFMLGFBQUssUUFJaEI7SUFKRCxJQUFZLEtBQUssR0FBTCxhQUlYLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBxdWV1ZU1pY3JvVGFzayB9IGZyb20gJy4vcXVldWUnO1xuaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XG5pbXBvcnQgaGFzIGZyb20gJy4vaGFzJztcblxuLyoqXG4gKiBDb3BpZXMgYW4gYXJyYXkgb2YgdmFsdWVzLCByZXBsYWNpbmcgYW55IFBsYXRmb3JtUHJvbWlzZXMgaW4gdGhlIGNvcHkgd2l0aCB1bndyYXBwZWQgZ2xvYmFsLlByb21pc2VzLiBUaGlzIGlzIG5lY2Vzc2FyeVxuICogZm9yIC5hbGwgYW5kIC5yYWNlIHNvIHRoYXQgdGhlIG5hdGl2ZSBwcm9taXNlIGRvZXNuJ3QgdHJlYXQgdGhlIFBsYXRmb3JtUHJvbWlzZXMgbGlrZSBnZW5lcmljIHRoZW5hYmxlcy5cbiAqL1xuZnVuY3Rpb24gdW53cmFwUHJvbWlzZXMoaXRlbXM6IGFueVtdKTogYW55W10ge1xuXHRjb25zdCB1bndyYXBwZWQ6IHR5cGVvZiBpdGVtcyA9IFtdO1xuXHRjb25zdCBjb3VudCA9IGl0ZW1zLmxlbmd0aDtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG5cdFx0aWYgKCEoaSBpbiBpdGVtcykpIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblx0XHRsZXQgaXRlbSA9IGl0ZW1zW2ldO1xuXHRcdHVud3JhcHBlZFtpXSA9IGl0ZW0gaW5zdGFuY2VvZiBQcm9taXNlID8gaXRlbS5wcm9taXNlIDogaXRlbTtcblx0fVxuXHRyZXR1cm4gdW53cmFwcGVkO1xufVxuXG4vKipcbiAqIEV4ZWN1dG9yIGlzIHRoZSBpbnRlcmZhY2UgZm9yIGZ1bmN0aW9ucyB1c2VkIHRvIGluaXRpYWxpemUgYSBQcm9taXNlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV4ZWN1dG9yPFQ+IHtcblx0KHJlc29sdmU6ICh2YWx1ZT86IFQgfCBUaGVuYWJsZTxUPikgPT4gdm9pZCwgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkKTogdm9pZDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgYSBnaXZlbiB2YWx1ZSBoYXMgYSBgdGhlbmAgbWV0aG9kLlxuICogQHBhcmFtIHthbnl9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjayBpZiBpcyBUaGVuYWJsZVxuICogQHJldHVybnMge2lzIFRoZW5hYmxlPFQ+fSBBIHR5cGUgZ3VhcmQgaWYgdGhlIHZhbHVlIGlzIHRoZW5hYmxlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1RoZW5hYmxlPFQ+KHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBUaGVuYWJsZTxUPiB7XG5cdHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBQcm9taXNlU2hpbSBpcyBhIHBhcnRpYWwgaW1wbGVtZW50YXRpb24gb2YgdGhlIEVTMjAxNSBQcm9taXNlIHNwZWNpZmljYXRpb24uIEl0IHJlbGllcyBvbiBQcm9taXNlIHRvIGRvIHNvbWUgc2FmZXR5XG4gKiBjaGVja3Mgc3VjaCBhcyB2ZXJpZnlpbmcgdGhhdCBhIFByb21pc2UgaXNuJ3QgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuIFRoaXMgY2xhc3MgaXMgZXhwb3J0ZWQgZm9yIHRlc3RhYmlsaXR5LCBhbmQgaXNcbiAqIG5vdCBpbnRlbmRlZCB0byBiZSB1c2VkIGRpcmVjdGx5LlxuICpcbiAqIEBib3Jyb3dzIFByb21pc2UuYWxsIGFzIFByb21pc2VTaGltLmFsbFxuICogQGJvcnJvd3MgUHJvbWlzZS5yYWNlIGFzIFByb21pc2VTaGltLnJhY2VcbiAqIEBib3Jyb3dzIFByb21pc2UucmVqZWN0IGFzIFByb21pc2VTaGltLnJlamVjdFxuICogQGJvcnJvd3MgUHJvbWlzZS5yZXNvbHZlIGFzIFByb21pc2VTaGltLnJlc29sdmVcbiAqIEBib3Jyb3dzIFByb21pc2UjY2F0Y2ggYXMgUHJvbWlzZVNoaW0jY2F0Y2hcbiAqIEBib3Jyb3dzIFByb21pc2UjdGhlbiBhcyBQcm9taXNlU2hpbSN0aGVuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9taXNlU2hpbTxUPiBpbXBsZW1lbnRzIFRoZW5hYmxlPFQ+IHtcblx0c3RhdGljIGFsbDxUPihpdGVtczogKFQgfCBUaGVuYWJsZTxUPilbXSk6IFByb21pc2VTaGltPFRbXT4ge1xuXHRcdHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRjb25zdCB2YWx1ZXM6IFRbXSA9IFtdO1xuXHRcdFx0bGV0IGNvbXBsZXRlID0gMDtcblx0XHRcdGxldCB0b3RhbCA9IDA7XG5cdFx0XHRsZXQgcG9wdWxhdGluZyA9IHRydWU7XG5cblx0XHRcdGZ1bmN0aW9uIGZ1bGZpbGwoaW5kZXg6IG51bWJlciwgdmFsdWU6IGFueSk6IHZvaWQge1xuXHRcdFx0XHR2YWx1ZXNbaW5kZXhdID0gdmFsdWU7XG5cdFx0XHRcdCsrY29tcGxldGU7XG5cdFx0XHRcdGZpbmlzaCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBmaW5pc2goKTogdm9pZCB7XG5cdFx0XHRcdGlmIChwb3B1bGF0aW5nIHx8IGNvbXBsZXRlIDwgdG90YWwpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0cmVzb2x2ZSh2YWx1ZXMpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBwcm9jZXNzSXRlbShpbmRleDogbnVtYmVyLCBpdGVtOiAoVCB8IFRoZW5hYmxlPFQ+KSk6IHZvaWQge1xuXHRcdFx0XHQrK3RvdGFsO1xuXHRcdFx0XHRpZiAoaXRlbSBpbnN0YW5jZW9mIFByb21pc2VTaGltKSB7XG5cdFx0XHRcdFx0Ly8gSWYgYW4gaXRlbSBQcm9taXNlU2hpbSByZWplY3RzLCB0aGlzIFByb21pc2VTaGltIGlzIGltbWVkaWF0ZWx5IHJlamVjdGVkIHdpdGggdGhlIGl0ZW1cblx0XHRcdFx0XHQvLyBQcm9taXNlU2hpbSdzIHJlamVjdGlvbiBlcnJvci5cblx0XHRcdFx0XHRpdGVtLnRoZW4oZnVsZmlsbC5iaW5kKG51bGwsIGluZGV4KSwgcmVqZWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRQcm9taXNlU2hpbS5yZXNvbHZlKGl0ZW0pLnRoZW4oZnVsZmlsbC5iaW5kKG51bGwsIGluZGV4KSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IGNvdW50ID0gaXRlbXMubGVuZ3RoO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgKytpKSB7XG5cdFx0XHRcdHByb2Nlc3NJdGVtKGksIGl0ZW1zW2ldKTtcblx0XHRcdH1cblx0XHRcdHBvcHVsYXRpbmcgPSBmYWxzZTtcblxuXHRcdFx0ZmluaXNoKCk7XG5cdFx0fSk7XG5cdH1cblxuXHRzdGF0aWMgcmFjZTxUPihpdGVtczogKFQgfCBUaGVuYWJsZTxUPilbXSk6IFByb21pc2VTaGltPFQ+IHtcblx0XHRyZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0Y29uc3QgY291bnQgPSBpdGVtcy5sZW5ndGg7XG5cdFx0XHRsZXQgaXRlbTogKFQgfCBUaGVuYWJsZTxUPik7XG5cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7ICsraSkge1xuXHRcdFx0XHRpdGVtID0gaXRlbXNbaV07XG5cblx0XHRcdFx0aWYgKGl0ZW0gaW5zdGFuY2VvZiBQcm9taXNlU2hpbSkge1xuXHRcdFx0XHRcdC8vIElmIGEgUHJvbWlzZVNoaW0gaXRlbSByZWplY3RzLCB0aGlzIFByb21pc2VTaGltIGlzIGltbWVkaWF0ZWx5IHJlamVjdGVkIHdpdGggdGhlIGl0ZW1cblx0XHRcdFx0XHQvLyBQcm9taXNlU2hpbSdzIHJlamVjdGlvbiBlcnJvci5cblx0XHRcdFx0XHRpdGVtLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRQcm9taXNlU2hpbS5yZXNvbHZlKGl0ZW0pLnRoZW4ocmVzb2x2ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHN0YXRpYyByZWplY3Q8VD4ocmVhc29uPzogRXJyb3IpOiBQcm9taXNlU2hpbTxUPiB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdHJlamVjdChyZWFzb24pO1xuXHRcdH0pO1xuXHR9XG5cblx0c3RhdGljIHJlc29sdmUoKTogUHJvbWlzZVNoaW08dm9pZD47XG5cdHN0YXRpYyByZXNvbHZlPFQ+KHZhbHVlOiAoVCB8IFRoZW5hYmxlPFQ+KSk6IFByb21pc2VTaGltPFQ+O1xuXHRzdGF0aWMgcmVzb2x2ZTxUPih2YWx1ZT86IGFueSk6IFByb21pc2VTaGltPFQ+IHtcblx0XHRyZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24gKHJlc29sdmUpIHtcblx0XHRcdHJlc29sdmUoPFQ+IHZhbHVlKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IFByb21pc2VTaGltLlxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICpcblx0ICogQHBhcmFtIGV4ZWN1dG9yXG5cdCAqIFRoZSBleGVjdXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgaW1tZWRpYXRlbHkgd2hlbiB0aGUgUHJvbWlzZVNoaW0gaXMgaW5zdGFudGlhdGVkLiBJdCBpcyByZXNwb25zaWJsZSBmb3Jcblx0ICogc3RhcnRpbmcgdGhlIGFzeW5jaHJvbm91cyBvcGVyYXRpb24gd2hlbiBpdCBpcyBpbnZva2VkLlxuXHQgKlxuXHQgKiBUaGUgZXhlY3V0b3IgbXVzdCBjYWxsIGVpdGhlciB0aGUgcGFzc2VkIGByZXNvbHZlYCBmdW5jdGlvbiB3aGVuIHRoZSBhc3luY2hyb25vdXMgb3BlcmF0aW9uIGhhcyBjb21wbGV0ZWRcblx0ICogc3VjY2Vzc2Z1bGx5LCBvciB0aGUgYHJlamVjdGAgZnVuY3Rpb24gd2hlbiB0aGUgb3BlcmF0aW9uIGZhaWxzLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoZXhlY3V0b3I6IEV4ZWN1dG9yPFQ+KSB7XG5cdFx0LyoqXG5cdFx0ICogSWYgdHJ1ZSwgdGhlIHJlc29sdXRpb24gb2YgdGhpcyBwcm9taXNlIGlzIGNoYWluZWQgKFwibG9ja2VkIGluXCIpIHRvIGFub3RoZXIgcHJvbWlzZS5cblx0XHQgKi9cblx0XHRsZXQgaXNDaGFpbmVkID0gZmFsc2U7XG5cblx0XHQvKipcblx0XHQgKiBXaGV0aGVyIG9yIG5vdCB0aGlzIHByb21pc2UgaXMgaW4gYSByZXNvbHZlZCBzdGF0ZS5cblx0XHQgKi9cblx0XHRjb25zdCBpc1Jlc29sdmVkID0gKCk6IGJvb2xlYW4gPT4ge1xuXHRcdFx0cmV0dXJuIHRoaXMuc3RhdGUgIT09IFN0YXRlLlBlbmRpbmcgfHwgaXNDaGFpbmVkO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBDYWxsYmFja3MgdGhhdCBzaG91bGQgYmUgaW52b2tlZCBvbmNlIHRoZSBhc3luY2hyb25vdXMgb3BlcmF0aW9uIGhhcyBjb21wbGV0ZWQuXG5cdFx0ICovXG5cdFx0bGV0IGNhbGxiYWNrczogQXJyYXk8KCkgPT4gdm9pZD4gPSBbXTtcblxuXHRcdC8qKlxuXHRcdCAqIEluaXRpYWxseSBwdXNoZXMgY2FsbGJhY2tzIG9udG8gYSBxdWV1ZSBmb3IgZXhlY3V0aW9uIG9uY2UgdGhpcyBwcm9taXNlIHNldHRsZXMuIEFmdGVyIHRoZSBwcm9taXNlIHNldHRsZXMsXG5cdFx0ICogZW5xdWV1ZXMgY2FsbGJhY2tzIGZvciBleGVjdXRpb24gb24gdGhlIG5leHQgZXZlbnQgbG9vcCB0dXJuLlxuXHRcdCAqL1xuXHRcdGxldCB3aGVuRmluaXNoZWQgPSBmdW5jdGlvbiAoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcblx0XHRcdGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogU2V0dGxlcyB0aGlzIHByb21pc2UuXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3U3RhdGUgVGhlIHJlc29sdmVkIHN0YXRlIGZvciB0aGlzIHByb21pc2UuXG5cdFx0ICogQHBhcmFtIHtUfEVycm9yfSB2YWx1ZSBUaGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoaXMgcHJvbWlzZS5cblx0XHQgKi9cblx0XHRjb25zdCBzZXR0bGUgPSAobmV3U3RhdGU6IFN0YXRlLCB2YWx1ZTogYW55KTogdm9pZCA9PiB7XG5cdFx0XHQvLyBBIHByb21pc2UgY2FuIG9ubHkgYmUgc2V0dGxlZCBvbmNlLlxuXHRcdFx0aWYgKHRoaXMuc3RhdGUgIT09IFN0YXRlLlBlbmRpbmcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnN0YXRlID0gbmV3U3RhdGU7XG5cdFx0XHR0aGlzLnJlc29sdmVkVmFsdWUgPSB2YWx1ZTtcblx0XHRcdHdoZW5GaW5pc2hlZCA9IHF1ZXVlTWljcm9UYXNrO1xuXG5cdFx0XHQvLyBPbmx5IGVucXVldWUgYSBjYWxsYmFjayBydW5uZXIgaWYgdGhlcmUgYXJlIGNhbGxiYWNrcyBzbyB0aGF0IGluaXRpYWxseSBmdWxmaWxsZWQgUHJvbWlzZXMgZG9uJ3QgaGF2ZSB0b1xuXHRcdFx0Ly8gd2FpdCBhbiBleHRyYSB0dXJuLlxuXHRcdFx0aWYgKGNhbGxiYWNrcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHF1ZXVlTWljcm9UYXNrKGZ1bmN0aW9uICgpOiB2b2lkIHtcblx0XHRcdFx0XHRsZXQgY291bnQgPSBjYWxsYmFja3MubGVuZ3RoO1xuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7ICsraSkge1xuXHRcdFx0XHRcdFx0Y2FsbGJhY2tzW2ldLmNhbGwobnVsbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhbGxiYWNrcyA9IG51bGw7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBSZXNvbHZlcyB0aGlzIHByb21pc2UuXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3U3RhdGUgVGhlIHJlc29sdmVkIHN0YXRlIGZvciB0aGlzIHByb21pc2UuXG5cdFx0ICogQHBhcmFtIHtUfEVycm9yfSB2YWx1ZSBUaGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoaXMgcHJvbWlzZS5cblx0XHQgKi9cblx0XHRjb25zdCByZXNvbHZlID0gKG5ld1N0YXRlOiBTdGF0ZSwgdmFsdWU6IGFueSk6IHZvaWQgPT4ge1xuXHRcdFx0aWYgKGlzUmVzb2x2ZWQoKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpc1RoZW5hYmxlKHZhbHVlKSkge1xuXHRcdFx0XHR2YWx1ZS50aGVuKFxuXHRcdFx0XHRcdHNldHRsZS5iaW5kKG51bGwsIFN0YXRlLkZ1bGZpbGxlZCksXG5cdFx0XHRcdFx0c2V0dGxlLmJpbmQobnVsbCwgU3RhdGUuUmVqZWN0ZWQpXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlzQ2hhaW5lZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0c2V0dGxlKG5ld1N0YXRlLCB2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMudGhlbiA9IDxVPihcblx0XHRcdG9uRnVsZmlsbGVkPzogKHZhbHVlPzogVCkgPT4gKFUgfCBQcm9taXNlU2hpbTxVPiksXG5cdFx0XHRvblJlamVjdGVkPzogKHJlYXNvbj86IEVycm9yKSA9PiAoVSB8IFByb21pc2VTaGltPFU+KVxuXHRcdCk6IFByb21pc2VTaGltPFU+ID0+IHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZVNoaW08VT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0XHQvLyB3aGVuRmluaXNoZWQgaW5pdGlhbGx5IHF1ZXVlcyB1cCBjYWxsYmFja3MgZm9yIGV4ZWN1dGlvbiBhZnRlciB0aGUgcHJvbWlzZSBoYXMgc2V0dGxlZC4gT25jZSB0aGVcblx0XHRcdFx0Ly8gcHJvbWlzZSBoYXMgc2V0dGxlZCwgd2hlbkZpbmlzaGVkIHdpbGwgc2NoZWR1bGUgY2FsbGJhY2tzIGZvciBleGVjdXRpb24gb24gdGhlIG5leHQgdHVybiB0aHJvdWdoIHRoZVxuXHRcdFx0XHQvLyBldmVudCBsb29wLlxuXHRcdFx0XHR3aGVuRmluaXNoZWQoKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGNhbGxiYWNrOiAodmFsdWU/OiBhbnkpID0+IGFueSA9IHRoaXMuc3RhdGUgPT09IFN0YXRlLlJlamVjdGVkID8gb25SZWplY3RlZCA6IG9uRnVsZmlsbGVkO1xuXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShjYWxsYmFjayh0aGlzLnJlc29sdmVkVmFsdWUpKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIGlmICh0aGlzLnN0YXRlID09PSBTdGF0ZS5SZWplY3RlZCkge1xuXHRcdFx0XHRcdFx0cmVqZWN0KHRoaXMucmVzb2x2ZWRWYWx1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZSh0aGlzLnJlc29sdmVkVmFsdWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0dHJ5IHtcblx0XHRcdCg8RXhlY3V0b3I8VD4+IGV4ZWN1dG9yKShcblx0XHRcdFx0cmVzb2x2ZS5iaW5kKG51bGwsIFN0YXRlLkZ1bGZpbGxlZCksXG5cdFx0XHRcdHJlc29sdmUuYmluZChudWxsLCBTdGF0ZS5SZWplY3RlZClcblx0XHRcdCk7XG5cdFx0fVxuXHRcdGNhdGNoIChlcnJvcikge1xuXHRcdFx0c2V0dGxlKFN0YXRlLlJlamVjdGVkLCBlcnJvcik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjdXJyZW50IHN0YXRlIG9mIHRoaXMgcHJvbWlzZS5cblx0ICovXG5cdHByaXZhdGUgc3RhdGUgPSBTdGF0ZS5QZW5kaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoaXMgcHJvbWlzZS5cblx0ICpcblx0ICogQHR5cGUge1R8RXJyb3J9XG5cdCAqL1xuXHRwcml2YXRlIHJlc29sdmVkVmFsdWU6IGFueTtcblxuXHR0aGVuOiA8VT4oXG5cdFx0b25GdWxmaWxsZWQ/OiAodmFsdWU/OiBUKSA9PiAoVSB8IFRoZW5hYmxlPFU+KSxcblx0XHRvblJlamVjdGVkPzogKHJlYXNvbj86IEVycm9yKSA9PiAoVSB8IFRoZW5hYmxlPFU+KVxuXHQpID0+IFByb21pc2VTaGltPFU+O1xufVxuXG4vKipcbiAqIFBsYXRmb3JtUHJvbWlzZSBpcyBhIHZlcnkgdGhpbiB3cmFwcGVyIGFyb3VuZCBlaXRoZXIgYSBuYXRpdmUgcHJvbWlzZSBpbXBsZW1lbnRhdGlvbiBvciBQcm9taXNlU2hpbS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvbWlzZTxUPiBpbXBsZW1lbnRzIFRoZW5hYmxlPFQ+IHtcblx0LyoqXG5cdCAqIFBvaW50cyB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvciB0aGlzIHBsYXRmb3JtIHNob3VsZCB1c2UuXG5cdCAqL1xuXHRzdGF0aWMgUHJvbWlzZUNvbnN0cnVjdG9yID0gaGFzKCdwcm9taXNlJykgPyBnbG9iYWwuUHJvbWlzZSA6IFByb21pc2VTaGltO1xuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhbiBpdGVyYWJsZSBvYmplY3QgY29udGFpbmluZyBwcm9taXNlcyBpbnRvIGEgc2luZ2xlIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIG5ldyBpdGVyYWJsZSBvYmplY3Rcblx0ICogY29udGFpbmluZyB0aGUgZnVsZmlsbGVkIHZhbHVlcyBvZiBhbGwgdGhlIHByb21pc2VzIGluIHRoZSBpdGVyYWJsZSwgaW4gdGhlIHNhbWUgb3JkZXIgYXMgdGhlIFByb21pc2VzIGluIHRoZVxuXHQgKiBpdGVyYWJsZS4gSXRlcmFibGUgdmFsdWVzIHRoYXQgYXJlIG5vdCBwcm9taXNlcyBhcmUgY29udmVydGVkIHRvIHByb21pc2VzIHVzaW5nIFByb21pc2VTaGltLnJlc29sdmUuXG5cdCAqXG5cdCAqIEBleGFtcGxlXG5cdCAqIFByb21pc2VTaGltLmFsbChbIFByb21pc2VTaGltLnJlc29sdmUoJ2ZvbycpLCAnYmFyJyBdKS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuXHQgKiAgICAgdmFsdWVbMF0gPT09ICdmb28nOyAvLyB0cnVlXG5cdCAqICAgICB2YWx1ZVsxXSA9PT0gJ2Jhcic7IC8vIHRydWVcblx0ICogfSk7XG5cdCAqXG5cdCAqIEBleGFtcGxlXG5cdCAqIFByb21pc2VTaGltLmFsbCh7XG5cdCAqICAgICBmb286IFByb21pc2VTaGltLnJlc29sdmUoJ2ZvbycpLFxuXHQgKiAgICAgYmFyOiAnYmFyJ1xuXHQgKiB9KS50aGVuKCh2YWx1ZSkgPT4ge1xuXHQgKiAgICAgdmFsdWUuZm9vID09PSAnZm9vJzsgLy8gdHJ1ZVxuXHQgKiAgICAgdmFsdWUuYmFyID09PSAnYmFyJzsgLy8gdHJ1ZVxuXHQgKiB9KTtcblx0ICovXG5cdHN0YXRpYyBhbGw8VD4oaXRlbXM6IChUIHwgVGhlbmFibGU8VD4pW10pOiBQcm9taXNlPFRbXT4ge1xuXHRcdHJldHVybiB0aGlzLmNvcHkoUHJvbWlzZS5Qcm9taXNlQ29uc3RydWN0b3IuYWxsKHVud3JhcFByb21pc2VzKGl0ZW1zKSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGFuIGl0ZXJhYmxlIG9iamVjdCBjb250YWluaW5nIHByb21pc2VzIGludG8gYSBzaW5nbGUgcHJvbWlzZSB0aGF0IHJlc29sdmVzIG9yIHJlamVjdHMgYXMgc29vbiBhcyBvbmUgb2Zcblx0ICogdGhlIHByb21pc2VzIGluIHRoZSBpdGVyYWJsZSByZXNvbHZlcyBvciByZWplY3RzLCB3aXRoIHRoZSB2YWx1ZSBvZiB0aGUgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQgcHJvbWlzZS4gVmFsdWVzIGluXG5cdCAqIHRoZSBpdGVyYWJsZSB0aGF0IGFyZSBub3QgUHJvbWlzZXMgYXJlIGNvbnZlcnRlZCB0byBQcm9taXNlcyB3aXRoIFByb21pc2VTaGltLnJlc29sdmUuXG5cdCAqXG5cdCAqIEBleGFtcGxlXG5cdCAqIFByb21pc2VTaGltLnJhY2UoWyBQcm9taXNlU2hpbS5yZXNvbHZlKCdmb28nKSwgUHJvbWlzZVNoaW0ucmVzb2x2ZSgnYmFyJykgXSkudGhlbigodmFsdWUpID0+IHtcblx0ICogICAgIHZhbHVlID09PSAnZm9vJzsgLy8gdHJ1ZVxuXHQgKiB9KTtcblx0ICpcblx0ICogQGV4YW1wbGVcblx0ICogUHJvbWlzZVNoaW0ucmFjZSh7XG5cdCAqICAgICBmb286IFByb21pc2VTaGltLnJlc29sdmUoJ2ZvbycpLFxuXHQgKiAgICAgYmFyOiBQcm9taXNlU2hpbS5yZXNvbHZlKCdiYXInKVxuXHQgKiB9KS50aGVuKCh2YWx1ZSkgPT4ge1xuXHQgKiAgICAgdmFsdWUgPT09ICdmb28nOyAvLyB0cnVlXG5cdCAqIH0pO1xuXHQgKi9cblx0c3RhdGljIHJhY2U8VD4oaXRlbXM6IChUIHwgVGhlbmFibGU8VD4pW10pOiBQcm9taXNlPFQ+IHtcblx0XHRyZXR1cm4gdGhpcy5jb3B5KFByb21pc2UuUHJvbWlzZUNvbnN0cnVjdG9yLnJhY2UodW53cmFwUHJvbWlzZXMoaXRlbXMpKSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBwcm9taXNlIHRoYXQgaXMgcmVqZWN0ZWQgd2l0aCB0aGUgZ2l2ZW4gZXJyb3IuXG5cdCAqL1xuXHRzdGF0aWMgcmVqZWN0PFQ+KHJlYXNvbjogRXJyb3IpOiBQcm9taXNlPGFueT4ge1xuXHRcdHJldHVybiB0aGlzLmNvcHkoUHJvbWlzZS5Qcm9taXNlQ29uc3RydWN0b3IucmVqZWN0KHJlYXNvbikpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggdGhlIGdpdmVuIHZhbHVlLiBJZiB0aGUgcGFzc2VkIHZhbHVlIGlzIGFscmVhZHkgYSBQcm9taXNlU2hpbSwgaXRcblx0ICogd2lsbCBiZSByZXR1cm5lZCBhcy1pcy5cblx0ICovXG5cdHN0YXRpYyByZXNvbHZlKCk6IFByb21pc2U8dm9pZD47XG5cdHN0YXRpYyByZXNvbHZlPFQ+KHZhbHVlOiAoVCB8IFRoZW5hYmxlPFQ+KSk6IFByb21pc2U8VD47XG5cdHN0YXRpYyByZXNvbHZlPFQ+KHZhbHVlPzogYW55KTogUHJvbWlzZTxUPiB7XG5cdFx0aWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5jb3B5KFByb21pc2UuUHJvbWlzZUNvbnN0cnVjdG9yLnJlc29sdmUodmFsdWUpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb3BpZXMgYW5vdGhlciBQcm9taXNlLCB0YWtpbmcgb24gaXRzIGlubmVyIHN0YXRlLlxuXHQgKi9cblx0cHJvdGVjdGVkIHN0YXRpYyBjb3B5PFU+KG90aGVyOiBQcm9taXNlPFU+KTogUHJvbWlzZTxVPiB7XG5cdFx0Y29uc3QgcHJvbWlzZSA9IE9iamVjdC5jcmVhdGUodGhpcy5wcm90b3R5cGUsIHtcblx0XHRcdHByb21pc2U6IHsgdmFsdWU6IG90aGVyIGluc3RhbmNlb2YgUHJvbWlzZS5Qcm9taXNlQ29uc3RydWN0b3IgPyBvdGhlciA6IG90aGVyLnByb21pc2UgfVxuXHRcdH0pO1xuXG5cdFx0cHJvbWlzZS5fc3RhdGUgPSBTdGF0ZS5QZW5kaW5nO1xuXHRcdHByb21pc2UucHJvbWlzZS50aGVuKFxuXHRcdFx0ZnVuY3Rpb24gKCkgeyBwcm9taXNlLl9zdGF0ZSA9IFN0YXRlLkZ1bGZpbGxlZDsgfSxcblx0XHRcdGZ1bmN0aW9uICgpIHsgcHJvbWlzZS5fc3RhdGUgPSBTdGF0ZS5SZWplY3RlZDsgfVxuXHRcdCk7XG5cblx0XHRyZXR1cm4gcHJvbWlzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IFByb21pc2UuXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKlxuXHQgKiBAcGFyYW0gZXhlY3V0b3Jcblx0ICogVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBpbW1lZGlhdGVseSB3aGVuIHRoZSBQcm9taXNlU2hpbSBpcyBpbnN0YW50aWF0ZWQuIEl0IGlzIHJlc3BvbnNpYmxlIGZvclxuXHQgKiBzdGFydGluZyB0aGUgYXN5bmNocm9ub3VzIG9wZXJhdGlvbiB3aGVuIGl0IGlzIGludm9rZWQuXG5cdCAqXG5cdCAqIFRoZSBleGVjdXRvciBtdXN0IGNhbGwgZWl0aGVyIHRoZSBwYXNzZWQgYHJlc29sdmVgIGZ1bmN0aW9uIHdoZW4gdGhlIGFzeW5jaHJvbm91cyBvcGVyYXRpb24gaGFzIGNvbXBsZXRlZFxuXHQgKiBzdWNjZXNzZnVsbHksIG9yIHRoZSBgcmVqZWN0YCBmdW5jdGlvbiB3aGVuIHRoZSBvcGVyYXRpb24gZmFpbHMuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihleGVjdXRvcjogRXhlY3V0b3I8VD4pIHtcblx0XHQvLyBXcmFwIHRoZSBleGVjdXRvciB0byB2ZXJpZnkgdGhhdCB0aGUgdGhlIHJlc29sdXRpb24gdmFsdWUgaXNuJ3QgdGhpcyBwcm9taXNlLiBTaW5jZSBhbnkgaW5jb21pbmcgcHJvbWlzZVxuXHRcdC8vIHNob3VsZCBiZSB3cmFwcGVkLCB0aGUgbmF0aXZlIHJlc29sdmVyIGNhbid0IGF1dG9tYXRpY2FsbHkgZGV0ZWN0IHNlbGYtcmVzb2x1dGlvbi5cblx0XHR0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZS5Qcm9taXNlQ29uc3RydWN0b3IoPEV4ZWN1dG9yPFQ+PiAoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0ZXhlY3V0b3IoXG5cdFx0XHRcdCh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGlmICh2YWx1ZSA9PT0gdGhpcykge1xuXHRcdFx0XHRcdFx0cmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjaGFpbiBhIHByb21pc2UgdG8gaXRzZWxmJykpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdHJlc29sdmUodmFsdWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0ZnVuY3Rpb24gKHJlYXNvbik6IHZvaWQge1xuXHRcdFx0XHRcdHJlamVjdChyZWFzb24pO1xuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXHRcdH0pKTtcblxuXHRcdHRoaXMuX3N0YXRlID0gU3RhdGUuUGVuZGluZztcblx0XHR0aGlzLnByb21pc2UudGhlbihcblx0XHRcdCgpID0+IHsgdGhpcy5fc3RhdGUgPSBTdGF0ZS5GdWxmaWxsZWQ7IH0sXG5cdFx0XHQoKSA9PiB7IHRoaXMuX3N0YXRlID0gU3RhdGUuUmVqZWN0ZWQ7IH1cblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFuIG9iamVjdCB3cmFwcGVkIGJ5IHRoaXMgY2xhc3MgdGhhdCBhY3R1YWxseSBpbXBsZW1lbnRzIHRoZSBQcm9taXNlIEFQSS5cblx0ICovXG5cdHByaXZhdGUgcHJvbWlzZTogYW55O1xuXG5cdC8qKlxuXHQgKiBUaGUgaW50ZXJuYWwgc3RhdGUgb2YgdGhpcyBwcm9taXNlLiBUaGlzIG1heSBiZSB1cGRhdGVkIGRpcmVjdGx5IGJ5IHN1YmNsYXNzZXMuXG5cdCAqL1xuXHRwcm90ZWN0ZWQgX3N0YXRlOiBTdGF0ZTtcblxuXHQvKipcblx0ICogQWRkcyBhIGNhbGxiYWNrIHRvIHRoZSBwcm9taXNlIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgYXN5bmNocm9ub3VzIG9wZXJhdGlvbiB0aHJvd3MgYW4gZXJyb3IuXG5cdCAqL1xuXHRjYXRjaDxVPihvblJlamVjdGVkOiAocmVhc29uPzogRXJyb3IpID0+IChVIHwgVGhlbmFibGU8VT4pKTogUHJvbWlzZTxVPjtcblx0Y2F0Y2g8VT4ob25SZWplY3RlZDogKHJlYXNvbj86IEVycm9yKSA9PiB2b2lkKTogUHJvbWlzZTxVPiB7XG5cdFx0cmV0dXJuIHRoaXMudGhlbjxVPihudWxsLCBvblJlamVjdGVkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBbGxvd3MgZm9yIGNsZWFudXAgYWN0aW9ucyB0byBiZSBwZXJmb3JtZWQgYWZ0ZXIgcmVzb2x1dGlvbiBvZiBhIFByb21pc2UuXG5cdCAqL1xuXHRmaW5hbGx5KGNhbGxiYWNrOiAoKSA9PiB2b2lkIHwgVGhlbmFibGU8YW55Pik6IFByb21pc2U8VD4ge1xuXHRcdC8vIEhhbmRsZXIgdG8gYmUgdXNlZCBmb3IgZnVsZmlsbG1lbnQgYW5kIHJlamVjdGlvbjsgd2hldGhlciBpdCB3YXMgZnVsZmlsbGVkIG9yIHJlamVjdGVkIGlzIGV4cGxpY2l0bHlcblx0XHQvLyBpbmRpY2F0ZWQgYnkgdGhlIGZpcnN0IGFyZ3VtZW50XG5cdFx0ZnVuY3Rpb24gaGFuZGxlcihyZWplY3RlZDogYm9vbGVhbiwgdmFsdWVPckVycm9yOiBhbnkpIHtcblx0XHRcdC8vIElmIGNhbGxiYWNrIHRocm93cywgdGhlIGhhbmRsZXIgd2lsbCB0aHJvd1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gY2FsbGJhY2soKTtcblx0XHRcdGlmIChpc1RoZW5hYmxlKHJlc3VsdCkpIHtcblx0XHRcdFx0Ly8gSWYgY2FsbGJhY2sgcmV0dXJucyBhIFRoZW5hYmxlIHRoYXQgcmVqZWN0cywgcmV0dXJuIHRoZSByZWplY3Rpb24uIE90aGVyd2lzZSwgcmV0dXJuIG9yIHRocm93IHRoZVxuXHRcdFx0XHQvLyBpbmNvbWluZyB2YWx1ZSBhcyBhcHByb3ByaWF0ZSB3aGVuIHRoZSBUaGVuYWJsZSByZXNvbHZlcy5cblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXN1bHQpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGlmIChyZWplY3RlZCkge1xuXHRcdFx0XHRcdFx0dGhyb3cgdmFsdWVPckVycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdmFsdWVPckVycm9yO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHQvLyBJZiBjYWxsYmFjayByZXR1cm5zIGEgbm9uLVRoZW5hYmxlLCByZXR1cm4gb3IgdGhyb3cgdGhlIGluY29taW5nIHZhbHVlIGFzIGFwcHJvcHJpYXRlLlxuXHRcdFx0XHRpZiAocmVqZWN0ZWQpIHtcblx0XHRcdFx0XHR0aHJvdyB2YWx1ZU9yRXJyb3I7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHZhbHVlT3JFcnJvcjtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIHRoaXMudGhlbjxUPihoYW5kbGVyLmJpbmQobnVsbCwgZmFsc2UpLCBoYW5kbGVyLmJpbmQobnVsbCwgdHJ1ZSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjdXJyZW50IFByb21pc2Ugc3RhdGUuXG5cdCAqL1xuXHRnZXQgc3RhdGUoKTogU3RhdGUge1xuXHRcdHJldHVybiB0aGlzLl9zdGF0ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgY2FsbGJhY2sgdG8gdGhlIHByb21pc2UgdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBhc3luY2hyb25vdXMgb3BlcmF0aW9uIGNvbXBsZXRlcyBzdWNjZXNzZnVsbHkuXG5cdCAqL1xuXHR0aGVuPFU+KG9uRnVsZmlsbGVkPzogKHZhbHVlPzogVCkgPT4gKFUgfCBUaGVuYWJsZTxVPiksIG9uUmVqZWN0ZWQ/OiAocmVhc29uPzogRXJyb3IpID0+IHZvaWQpOiBQcm9taXNlPFU+O1xuXHR0aGVuPFU+KG9uRnVsZmlsbGVkPzogKHZhbHVlPzogVCkgPT4gKFUgfCBUaGVuYWJsZTxVPiksIG9uUmVqZWN0ZWQ/OiAocmVhc29uPzogRXJyb3IpID0+IChVIHwgVGhlbmFibGU8VT4pKTogUHJvbWlzZTxVPiB7XG5cdFx0cmV0dXJuICg8dHlwZW9mIFByb21pc2U+IHRoaXMuY29uc3RydWN0b3IpLmNvcHkodGhpcy5wcm9taXNlLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpKTtcblx0fVxufVxuXG4vKipcbiAqIFRoZSBTdGF0ZSBlbnVtIHJlcHJlc2VudHMgdGhlIHBvc3NpYmxlIHN0YXRlcyBvZiBhIHByb21pc2UuXG4gKi9cbmV4cG9ydCBlbnVtIFN0YXRlIHtcblx0RnVsZmlsbGVkLFxuXHRQZW5kaW5nLFxuXHRSZWplY3RlZFxufVxuXG4vKipcbiAqIFRoZW5hYmxlIHJlcHJlc2VudHMgYW55IG9iamVjdCB3aXRoIGEgY2FsbGFibGUgYHRoZW5gIHByb3BlcnR5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRoZW5hYmxlPFQ+IHtcblx0dGhlbjxVPihvbkZ1bGZpbGxlZD86ICh2YWx1ZT86IFQpID0+IFUgfCBUaGVuYWJsZTxVPiwgb25SZWplY3RlZD86IChlcnJvcj86IGFueSkgPT4gVSB8IFRoZW5hYmxlPFU+KTogVGhlbmFibGU8VT47XG5cdHRoZW48VT4ob25GdWxmaWxsZWQ/OiAodmFsdWU/OiBUKSA9PiBVIHwgVGhlbmFibGU8VT4sIG9uUmVqZWN0ZWQ/OiAoZXJyb3I/OiBhbnkpID0+IHZvaWQpOiBUaGVuYWJsZTxVPjtcbn1cbiJdfQ==