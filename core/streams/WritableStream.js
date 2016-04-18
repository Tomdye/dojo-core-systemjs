(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise', './SizeQueue', './util'], factory);
    }
})(function (require, exports) {
    "use strict";
    const Promise_1 = require('../Promise');
    const SizeQueue_1 = require('./SizeQueue');
    const util = require('./util');
    /**
     * WritableStream's possible states
     */
    (function (State) {
        State[State["Closed"] = 0] = "Closed";
        State[State["Closing"] = 1] = "Closing";
        State[State["Errored"] = 2] = "Errored";
        State[State["Waiting"] = 3] = "Waiting";
        State[State["Writable"] = 4] = "Writable";
    })(exports.State || (exports.State = {}));
    var State = exports.State;
    // This function is basically a context check to protect against calling WritableStream methods with incorrect context
    // (as one might accidentally do when passing a method as callback)
    function isWritableStream(x) {
        return Object.prototype.hasOwnProperty.call(x, '_underlyingSink');
    }
    /**
     * This class provides a writable stream implementation. Data written to a stream will be passed on to the underlying
     * sink (`WritableStream.Sink`), an instance of which must be supplied to the stream upon instantation. This class
     * provides the standard stream API, while implementations of the `Sink` API allow the data to be written to
     * various persistence layers.
     */
    class WritableStream {
        constructor(underlyingSink = {}, strategy = {}) {
            this._underlyingSink = underlyingSink;
            this._closedPromise = new Promise_1.default((resolve, reject) => {
                this._resolveClosedPromise = resolve;
                this._rejectClosedPromise = reject;
            });
            this._advancing = false;
            this._readyPromise = Promise_1.default.resolve();
            this._queue = new SizeQueue_1.default();
            this._state = State.Writable;
            this._started = false;
            this._writing = false;
            this._strategy = util.normalizeStrategy(strategy);
            this._syncStateWithQueue();
            this._startedPromise = Promise_1.default.resolve(util.invokeOrNoop(this._underlyingSink, 'start', [this._error.bind(this)])).then(() => {
                this._started = true;
                this._startedPromise = undefined;
            }, (error) => {
                this._error(error);
            });
        }
        /**
         * @returns A promise that is resolved when the stream is closed, or is rejected if the stream errors.
         */
        get closed() {
            return this._closedPromise;
        }
        /**
         * @returns A promise that is resolved when the stream transitions away from the 'waiting' state. The stream will
         * use this to indicate backpressure - an unresolved `ready` promise indicates that writes should not yet be
         * performed.
         */
        get ready() {
            return this._readyPromise;
        }
        /**
         * @returns The stream's current @State
         */
        get state() {
            return this._state;
        }
        // This method combines the logic of two methods:
        // 4.3.1 CallOrScheduleWritableStreamAdvanceQueue
        // 4.3.6 WritableStreamAdvanceQueue
        _advanceQueue() {
            if (!this._started) {
                if (!this._advancing) {
                    this._advancing = true;
                    this._startedPromise.then(() => {
                        this._advanceQueue();
                    });
                }
                return;
            }
            if (!this._queue || this._writing) {
                return;
            }
            const writeRecord = this._queue.peek();
            if (writeRecord.close) {
                // TODO: SKIP? Assert 4.3.6-3.a
                if (this.state !== State.Closing) {
                    throw new Error('Invalid record');
                }
                this._queue.dequeue();
                // TODO: SKIP? Assert 4.3.6-3.c
                this._close();
                return;
            }
            this._writing = true;
            util.promiseInvokeOrNoop(this._underlyingSink, 'write', [writeRecord.chunk]).then(() => {
                if (this.state !== State.Errored) {
                    this._writing = false;
                    writeRecord.resolve();
                    this._queue.dequeue();
                    try {
                        this._syncStateWithQueue();
                    }
                    catch (error) {
                        return this._error(error);
                    }
                    this._advanceQueue();
                }
            }, (error) => {
                this._error(error);
            });
        }
        // 4.3.2 CloseWritableStream
        _close() {
            if (this.state !== State.Closing) {
                // 4.3.2-1
                throw new Error('WritableStream#_close called while state is not "Closing"');
            }
            util.promiseInvokeOrNoop(this._underlyingSink, 'close').then(() => {
                if (this.state !== State.Errored) {
                    // TODO: Assert 4.3.2.2-a.ii
                    this._resolveClosedPromise();
                    this._state = State.Closed;
                    this._underlyingSink = undefined;
                }
            }, (error) => {
                this._error(error);
            });
        }
        // 4.3.3 ErrorWritableStream
        _error(error) {
            if (this.state === State.Closed || this.state === State.Errored) {
                return;
            }
            let writeRecord;
            while (this._queue.length) {
                writeRecord = this._queue.dequeue();
                if (!writeRecord.close) {
                    writeRecord.reject(error);
                }
            }
            this._storedError = error;
            if (this.state === State.Waiting) {
                this._resolveReadyPromise();
            }
            this._rejectClosedPromise(error);
            this._state = State.Errored;
        }
        // 4.3.5 SyncWritableStreamStateWithQueue
        _syncStateWithQueue() {
            if (this.state === State.Closing) {
                return;
            }
            const queueSize = this._queue.totalSize;
            const shouldApplyBackPressure = queueSize > this._strategy.highWaterMark;
            if (shouldApplyBackPressure && this.state === State.Writable) {
                this._state = State.Waiting;
                this._readyPromise = new Promise_1.default((resolve, reject) => {
                    this._resolveReadyPromise = resolve;
                    this._rejectReadyPromise = reject;
                });
            }
            if (shouldApplyBackPressure === false && this.state === State.Waiting) {
                this._state = State.Writable;
                this._resolveReadyPromise();
            }
        }
        /**
         * Signals that the producer can no longer write to the stream and it should be immediately moved to an "errored"
         * state. Any un-written data that is queued will be discarded.
         */
        abort(reason) {
            // 4.2.4.4-1
            if (!isWritableStream(this)) {
                return Promise_1.default.reject(new Error('WritableStream method called in context of object that is not a WritableStream instance'));
            }
            if (this.state === State.Closed) {
                // 4.2.4.4-2
                return Promise_1.default.resolve();
            }
            if (this.state === State.Errored) {
                // 4.2.4.4-3
                return Promise_1.default.reject(this._storedError);
            }
            const error = reason instanceof Error ? reason : new Error(reason);
            this._error(error);
            return util.promiseInvokeOrFallbackOrNoop(this._underlyingSink, 'abort', [reason], 'close')
                .then(function () {
                return;
            });
        }
        /**
         * Signals that the producer is done writing to the stream and wishes to move it to a "closed" state. The stream
         * may have un-writted data queued; until the data has been written the stream will remain in the "closing" state.
         */
        close() {
            // 4.2.4.5-1
            if (!isWritableStream(this)) {
                return Promise_1.default.reject(new Error('WritableStream method called in context of object that is not a WritableStream instance'));
            }
            // 4.2.4.5-2
            if (this.state === State.Closed) {
                return Promise_1.default.reject(new TypeError('Stream is already closed'));
            }
            if (this.state === State.Closing) {
                return Promise_1.default.reject(new TypeError('Stream is already closing'));
            }
            if (this.state === State.Errored) {
                // 4.2.4.5-3
                return Promise_1.default.reject(this._storedError);
            }
            if (this.state === State.Waiting) {
                // 4.2.4.5-4
                this._resolveReadyPromise();
            }
            this._state = State.Closing;
            this._queue.enqueue({ close: true }, 0);
            this._advanceQueue();
            return this._closedPromise;
        }
        /**
         * Enqueue a chunk of data to be written to the underlying sink. `write` can be called successively without waiting
         * for the previous write's promise to resolve. To respect the stream's backpressure indicator, check if the stream
         * has entered the "waiting" state between writes.
         *
         * @returns A promise that will be fulfilled when the chunk has been written to the underlying sink.
         */
        write(chunk) {
            // 4.2.4.6-1
            if (!isWritableStream(this)) {
                return Promise_1.default.reject(new Error('WritableStream method called in context of object that is not a WritableStream instance'));
            }
            // 4.2.4.6-2
            if (this.state === State.Closed) {
                return Promise_1.default.reject(new TypeError('Stream is closed'));
            }
            if (this.state === State.Closing) {
                return Promise_1.default.reject(new TypeError('Stream is closing'));
            }
            if (this.state === State.Errored) {
                // 4.2.4.6-3
                return Promise_1.default.reject(this._storedError);
            }
            let chunkSize = 1;
            let writeRecord;
            let promise = new Promise_1.default(function (resolve, reject) {
                writeRecord = {
                    chunk: chunk,
                    reject: reject,
                    resolve: resolve
                };
            });
            // 4.2.4.6-6.b
            try {
                if (this._strategy && this._strategy.size) {
                    chunkSize = this._strategy.size(chunk);
                }
                this._queue.enqueue(writeRecord, chunkSize);
                this._syncStateWithQueue();
            }
            catch (error) {
                // 4.2.4.6-6.b, 4.2.4.6-10, 4.2.4.6-12
                this._error(error);
                return Promise_1.default.reject(error);
            }
            this._advanceQueue();
            return promise;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = WritableStream;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV3JpdGFibGVTdHJlYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9Xcml0YWJsZVN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFDQSwwQkFBb0IsWUFBWSxDQUFDLENBQUE7SUFDakMsNEJBQXNCLGFBQWEsQ0FBQyxDQUFBO0lBQ3BDLE1BQVksSUFBSSxXQUFNLFFBQVEsQ0FBQyxDQUFBO0lBWS9COztPQUVHO0lBQ0gsV0FBWSxLQUFLO1FBQUcscUNBQU0sQ0FBQTtRQUFFLHVDQUFPLENBQUE7UUFBRSx1Q0FBTyxDQUFBO1FBQUUsdUNBQU8sQ0FBQTtRQUFFLHlDQUFRLENBQUE7SUFBQyxDQUFDLEVBQXJELGFBQUssS0FBTCxhQUFLLFFBQWdEO0lBQWpFLElBQVksS0FBSyxHQUFMLGFBQXFELENBQUE7SUFFakUsc0hBQXNIO0lBQ3RILG1FQUFtRTtJQUNuRSwwQkFBMEIsQ0FBTTtRQUMvQixNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUE0Q0Q7Ozs7O09BS0c7SUFDSDtRQXdDQyxZQUFZLGNBQWMsR0FBWSxFQUFFLEVBQUUsUUFBUSxHQUFnQixFQUFFO1lBQ25FLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1lBRXRDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxpQkFBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU07Z0JBQ3ZELElBQUksQ0FBQyxxQkFBcUIsR0FBRyxPQUFPLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxNQUFNLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUN4QixJQUFJLENBQUMsYUFBYSxHQUFHLGlCQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdkMs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Z0JBQ25CLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBRUQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXJCLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDaEIsQ0FBQztJQUNGLENBQUM7SUEvVEQ7b0NBK1RDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdHJhdGVneSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICcuLi9Qcm9taXNlJztcbmltcG9ydCBTaXplUXVldWUgZnJvbSAnLi9TaXplUXVldWUnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnO1xuXG4vLyBBIFJlY29yZCBpcyB1c2VkIGludGVybmFsbHkgYnkgdGhlIHN0cmVhbSB0byBwcm9jZXNzIHF1ZXVlZCB3cml0ZXMuIEl0IHJlcHJlc2VudHMgdGhlIGNodW5rIHRvIGJlIHdyaXR0ZW4gcGx1c1xuLy8gYWRkaXRpb25hbCBtZXRhZGF0YSB1c2VkIGludGVybmFsbHkuXG5leHBvcnQgaW50ZXJmYWNlIFJlY29yZDxUPiB7XG5cdC8vIFRoaXMgZmxhZyBpbmRpY2F0ZXMgdGhhdCB0aGlzIHJlY29yZCBpcyB0aGUgZW5kIG9mIHRoZSBzdHJlYW0gYW5kIHRoZSBzdHJlYW0gc2hvdWxkIGNsb3NlIHdoZW4gcHJvY2Vzc2luZyBpdFxuXHRjbG9zZT86IGJvb2xlYW47XG5cdGNodW5rPzogVDtcblx0cmVqZWN0PzogKGVycm9yOiBFcnJvcikgPT4gdm9pZDtcblx0cmVzb2x2ZT86ICgpID0+IHZvaWQ7XG59XG5cbi8qKlxuICogV3JpdGFibGVTdHJlYW0ncyBwb3NzaWJsZSBzdGF0ZXNcbiAqL1xuZXhwb3J0IGVudW0gU3RhdGUgeyBDbG9zZWQsIENsb3NpbmcsIEVycm9yZWQsIFdhaXRpbmcsIFdyaXRhYmxlIH1cblxuLy8gVGhpcyBmdW5jdGlvbiBpcyBiYXNpY2FsbHkgYSBjb250ZXh0IGNoZWNrIHRvIHByb3RlY3QgYWdhaW5zdCBjYWxsaW5nIFdyaXRhYmxlU3RyZWFtIG1ldGhvZHMgd2l0aCBpbmNvcnJlY3QgY29udGV4dFxuLy8gKGFzIG9uZSBtaWdodCBhY2NpZGVudGFsbHkgZG8gd2hlbiBwYXNzaW5nIGEgbWV0aG9kIGFzIGNhbGxiYWNrKVxuZnVuY3Rpb24gaXNXcml0YWJsZVN0cmVhbSh4OiBhbnkpOiBib29sZWFuIHtcblx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh4LCAnX3VuZGVybHlpbmdTaW5rJyk7XG59XG5cbi8qKlxuICogVGhlIFNpbmsgaW50ZXJmYWNlIGRlZmluZXMgdGhlIG1ldGhvZHMgYSBtb2R1bGUgY2FuIGltcGxlbWVudCB0byBjcmVhdGUgYSB0YXJnZXQgc2luayBmb3IgYSBgV3JpdGFibGVTdHJlYW1gLlxuICpcbiAqIFRoZSBTdHJlYW0gQVBJIHByb3ZpZGVzIGEgY29uc2lzdGVudCBzdHJlYW0gQVBJIHdoaWxlIGBSZWFkYWJsZVN0cmVhbS5Tb3VyY2VgIGFuZCBgV3JpdGFibGVTdHJlYW0uU2lua2AgaW1wbGVtZW50b3JzXG4gKiBwcm92aWRlIHRoZSBsb2dpYyB0byBjb25uZWN0IGEgc3RyZWFtIHRvIHNwZWNpZmljIGRhdGEgc291cmNlcyAmIHNpbmtzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNpbms8VD4ge1xuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgdGhlIHN0cmVhbSBpcyBwcmVtYXR1cmVseSBjbG9zaW5nIGR1ZSB0byBhbiBlcnJvci4gIFRoZSBzaW5rIHNob3VsZCBkbyBhbnkgbmVjZXNzYXJ5IGNsZWFudXBcblx0ICogYW5kIHJlbGVhc2UgcmVzb3VyY2VzLiBXaGVuIGEgc3RyZWFtIGNhbGxzIGBhYm9ydGAgaXQgd2lsbCBkaXNjYXJkIGFueSBxdWV1ZWQgY2h1bmtzLiBJZiB0aGUgc2luayBkb2VzIG5vdFxuXHQgKiBwcm92aWRlIGFuIGBhYm9ydGAgbWV0aG9kIHRoZW4gdGhlIHN0cmVhbSB3aWxsIGNhbGwgYGNsb3NlYCBpbnN0ZWFkLlxuXHQgKlxuXHQgKiBAcGFyYW0gcmVhc29uIFRoZSByZWFzb24gdGhlIHN0cmVhbSBpcyBjbG9zaW5nLlxuXHQgKi9cblx0YWJvcnQ/KHJlYXNvbj86IGFueSk6IFByb21pc2U8dm9pZD47XG5cblx0LyoqXG5cdCAqIEluZGljYXRlcyB0aGUgc3RyZWFtIGlzIGNsb3NpbmcuICBUaGUgc2luayBzaG91bGQgZG8gYW55IG5lY2Vzc2FyeSBjbGVhbnVwIGFuZCByZWxlYXNlIHJlc291cmNlcy4gVGhlIHN0cmVhbVxuXHQgKiB3aWxsIG5vdCBjYWxsIHRoaXMgbWV0aG9kIHVudGlsIGlzIGhhcyBzdWNjZXNzZnVsbHkgd3JpdHRlbiBhbGwgcXVldWVkIGNodW5rcy5cblx0ICovXG5cdGNsb3NlPygpOiBQcm9taXNlPHZvaWQ+O1xuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyB0aGUgc2luayB0byBwcmVwYXJlIGZvciByZWNlaXZpbmcgY2h1bmtzLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXJyb3IgQW4gZXJyb3IgY2FsbGJhY2sgdGhhdCBjYW4gYmUgdXNlZCBhdCBhbnkgdGltZSBieSB0aGUgc2luayB0byBpbmRpY2F0ZSBhbiBlcnJvciBoYXMgb2NjdXJyZWQuXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHNpbmsncyBzdGFydCBvcGVyYXRpb24gaGFzIGZpbmlzaGVkLiAgSWYgdGhlIHByb21pc2UgcmVqZWN0cyxcblx0ICogXHRcdHRoZSBzdHJlYW0gd2lsbCBiZSBlcnJvcmVkLlxuXHQgKi9cblx0c3RhcnQ/KGVycm9yOiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkKTogUHJvbWlzZTx2b2lkPjtcblxuXHQvKipcblx0ICogUmVxdWVzdHMgdGhlIHNpbmsgd3JpdGUgYSBjaHVuay5cblx0ICpcblx0ICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBiZSB3cml0dGVuLlxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBzaW5rJ3Mgd3JpdGUgb3BlcmF0aW9uIGhhcyBmaW5pc2hlZC4gIElmIHRoZSBwcm9taXNlIHJlamVjdHMsXG5cdCAqIFx0XHR0aGUgc3RyZWFtIHdpbGwgYmUgZXJyb3JlZC5cblx0ICovXG5cdHdyaXRlPyhjaHVuazogVCk6IFByb21pc2U8dm9pZD47XG59XG5cbi8qKlxuICogVGhpcyBjbGFzcyBwcm92aWRlcyBhIHdyaXRhYmxlIHN0cmVhbSBpbXBsZW1lbnRhdGlvbi4gRGF0YSB3cml0dGVuIHRvIGEgc3RyZWFtIHdpbGwgYmUgcGFzc2VkIG9uIHRvIHRoZSB1bmRlcmx5aW5nXG4gKiBzaW5rIChgV3JpdGFibGVTdHJlYW0uU2lua2ApLCBhbiBpbnN0YW5jZSBvZiB3aGljaCBtdXN0IGJlIHN1cHBsaWVkIHRvIHRoZSBzdHJlYW0gdXBvbiBpbnN0YW50YXRpb24uIFRoaXMgY2xhc3NcbiAqIHByb3ZpZGVzIHRoZSBzdGFuZGFyZCBzdHJlYW0gQVBJLCB3aGlsZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIGBTaW5rYCBBUEkgYWxsb3cgdGhlIGRhdGEgdG8gYmUgd3JpdHRlbiB0b1xuICogdmFyaW91cyBwZXJzaXN0ZW5jZSBsYXllcnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdyaXRhYmxlU3RyZWFtPFQ+IHtcblx0LyoqXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIHN0cmVhbSBpcyBjbG9zZWQsIG9yIGlzIHJlamVjdGVkIGlmIHRoZSBzdHJlYW0gZXJyb3JzLlxuXHQgKi9cblx0Z2V0IGNsb3NlZCgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5fY2xvc2VkUHJvbWlzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBzdHJlYW0gdHJhbnNpdGlvbnMgYXdheSBmcm9tIHRoZSAnd2FpdGluZycgc3RhdGUuIFRoZSBzdHJlYW0gd2lsbFxuXHQgKiB1c2UgdGhpcyB0byBpbmRpY2F0ZSBiYWNrcHJlc3N1cmUgLSBhbiB1bnJlc29sdmVkIGByZWFkeWAgcHJvbWlzZSBpbmRpY2F0ZXMgdGhhdCB3cml0ZXMgc2hvdWxkIG5vdCB5ZXQgYmVcblx0ICogcGVyZm9ybWVkLlxuXHQgKi9cblx0Z2V0IHJlYWR5KCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLl9yZWFkeVByb21pc2U7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybnMgVGhlIHN0cmVhbSdzIGN1cnJlbnQgQFN0YXRlXG5cdCAqL1xuXHRnZXQgc3RhdGUoKTogU3RhdGUge1xuXHRcdHJldHVybiB0aGlzLl9zdGF0ZTtcblx0fVxuXG5cdHByb3RlY3RlZCBfYWR2YW5jaW5nOiBib29sZWFuO1xuXHRwcm90ZWN0ZWQgX2Nsb3NlZFByb21pc2U6IFByb21pc2U8dm9pZD47XG5cdHByb3RlY3RlZCBfcmVhZHlQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXHRwcm90ZWN0ZWQgX3JlamVjdENsb3NlZFByb21pc2U6IChlcnJvcjogRXJyb3IpID0+IHZvaWQ7XG5cdHByb3RlY3RlZCBfcmVqZWN0UmVhZHlQcm9taXNlOiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkO1xuXHRwcm90ZWN0ZWQgX3Jlc29sdmVDbG9zZWRQcm9taXNlOiAoKSA9PiB2b2lkO1xuXHRwcm90ZWN0ZWQgX3Jlc29sdmVSZWFkeVByb21pc2U6ICgpID0+IHZvaWQ7XG5cdHByb3RlY3RlZCBfc3RhcnRlZDogYm9vbGVhbjtcblx0cHJvdGVjdGVkIF9zdGFydGVkUHJvbWlzZTogUHJvbWlzZTxhbnk+O1xuXHRwcm90ZWN0ZWQgX3N0YXRlOiBTdGF0ZTtcblx0cHJvdGVjdGVkIF9zdG9yZWRFcnJvcjogRXJyb3I7XG5cdHByb3RlY3RlZCBfc3RyYXRlZ3k6IFN0cmF0ZWd5PFQ+O1xuXHRwcm90ZWN0ZWQgX3VuZGVybHlpbmdTaW5rOiBTaW5rPFQ+O1xuXHRwcm90ZWN0ZWQgX3F1ZXVlOiBTaXplUXVldWU8UmVjb3JkPFQ+Pjtcblx0cHJvdGVjdGVkIF93cml0aW5nOiBib29sZWFuO1xuXG5cdGNvbnN0cnVjdG9yKHVuZGVybHlpbmdTaW5rOiBTaW5rPFQ+ID0ge30sIHN0cmF0ZWd5OiBTdHJhdGVneTxUPiA9IHt9KSB7XG5cdFx0dGhpcy5fdW5kZXJseWluZ1NpbmsgPSB1bmRlcmx5aW5nU2luaztcblxuXHRcdHRoaXMuX2Nsb3NlZFByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0aGlzLl9yZXNvbHZlQ2xvc2VkUHJvbWlzZSA9IHJlc29sdmU7XG5cdFx0XHR0aGlzLl9yZWplY3RDbG9zZWRQcm9taXNlID0gcmVqZWN0O1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5fYWR2YW5jaW5nID0gZmFsc2U7XG5cdFx0dGhpcy5fcmVhZHlQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0dGhpcy5fcXVldWUgPSBuZXcgU2l6ZVF1ZXVlPFJlY29yZDxUPj4oKTtcblx0XHR0aGlzLl9zdGF0ZSA9IFN0YXRlLldyaXRhYmxlO1xuXHRcdHRoaXMuX3N0YXJ0ZWQgPSBmYWxzZTtcblx0XHR0aGlzLl93cml0aW5nID0gZmFsc2U7XG5cdFx0dGhpcy5fc3RyYXRlZ3kgPSB1dGlsLm5vcm1hbGl6ZVN0cmF0ZWd5KHN0cmF0ZWd5KTtcblx0XHR0aGlzLl9zeW5jU3RhdGVXaXRoUXVldWUoKTtcblxuXHRcdHRoaXMuX3N0YXJ0ZWRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKFxuXHRcdFx0dXRpbC5pbnZva2VPck5vb3AodGhpcy5fdW5kZXJseWluZ1NpbmssICdzdGFydCcsIFsgdGhpcy5fZXJyb3IuYmluZCh0aGlzKSBdKVxuXHRcdCkudGhlbigoKSA9PiB7XG5cdFx0XHR0aGlzLl9zdGFydGVkID0gdHJ1ZTtcblx0XHRcdHRoaXMuX3N0YXJ0ZWRQcm9taXNlID0gdW5kZWZpbmVkO1xuXHRcdH0sIChlcnJvcjogRXJyb3IpID0+IHtcblx0XHRcdHRoaXMuX2Vycm9yKGVycm9yKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIFRoaXMgbWV0aG9kIGNvbWJpbmVzIHRoZSBsb2dpYyBvZiB0d28gbWV0aG9kczpcblx0Ly8gNC4zLjEgQ2FsbE9yU2NoZWR1bGVXcml0YWJsZVN0cmVhbUFkdmFuY2VRdWV1ZVxuXHQvLyA0LjMuNiBXcml0YWJsZVN0cmVhbUFkdmFuY2VRdWV1ZVxuXHRwcm90ZWN0ZWQgX2FkdmFuY2VRdWV1ZSgpIHtcblx0XHRpZiAoIXRoaXMuX3N0YXJ0ZWQpIHtcblx0XHRcdGlmICghdGhpcy5fYWR2YW5jaW5nKSB7XG5cdFx0XHRcdHRoaXMuX2FkdmFuY2luZyA9IHRydWU7XG5cdFx0XHRcdHRoaXMuX3N0YXJ0ZWRQcm9taXNlLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX2FkdmFuY2VRdWV1ZSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5fcXVldWUgfHwgdGhpcy5fd3JpdGluZykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IHdyaXRlUmVjb3JkOiBSZWNvcmQ8VD4gPSB0aGlzLl9xdWV1ZS5wZWVrKCk7XG5cblx0XHRpZiAod3JpdGVSZWNvcmQuY2xvc2UpIHtcblx0XHRcdC8vIFRPRE86IFNLSVA/IEFzc2VydCA0LjMuNi0zLmFcblx0XHRcdGlmICh0aGlzLnN0YXRlICE9PSBTdGF0ZS5DbG9zaW5nKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZWNvcmQnKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fcXVldWUuZGVxdWV1ZSgpO1xuXHRcdFx0Ly8gVE9ETzogU0tJUD8gQXNzZXJ0IDQuMy42LTMuY1xuXHRcdFx0dGhpcy5fY2xvc2UoKTtcblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX3dyaXRpbmcgPSB0cnVlO1xuXG5cdFx0dXRpbC5wcm9taXNlSW52b2tlT3JOb29wKHRoaXMuX3VuZGVybHlpbmdTaW5rLCAnd3JpdGUnLCBbIHdyaXRlUmVjb3JkLmNodW5rIF0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUgIT09IFN0YXRlLkVycm9yZWQpIHtcblx0XHRcdFx0dGhpcy5fd3JpdGluZyA9IGZhbHNlO1xuXHRcdFx0XHR3cml0ZVJlY29yZC5yZXNvbHZlKCk7XG5cdFx0XHRcdHRoaXMuX3F1ZXVlLmRlcXVldWUoKTtcblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHRoaXMuX3N5bmNTdGF0ZVdpdGhRdWV1ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9lcnJvcihlcnJvcik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLl9hZHZhbmNlUXVldWUoKTtcblx0XHRcdH1cblx0XHR9LCAoZXJyb3I6IEVycm9yKSA9PiB7XG5cdFx0XHR0aGlzLl9lcnJvcihlcnJvcik7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyA0LjMuMiBDbG9zZVdyaXRhYmxlU3RyZWFtXG5cdHByb3RlY3RlZCBfY2xvc2UoKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuc3RhdGUgIT09IFN0YXRlLkNsb3NpbmcpIHtcblx0XHRcdC8vIDQuMy4yLTFcblx0XHRcdHRocm93IG5ldyBFcnJvcignV3JpdGFibGVTdHJlYW0jX2Nsb3NlIGNhbGxlZCB3aGlsZSBzdGF0ZSBpcyBub3QgXCJDbG9zaW5nXCInKTtcblx0XHR9XG5cblx0XHR1dGlsLnByb21pc2VJbnZva2VPck5vb3AodGhpcy5fdW5kZXJseWluZ1NpbmssICdjbG9zZScpLnRoZW4oKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUgIT09IFN0YXRlLkVycm9yZWQpIHtcblx0XHRcdFx0Ly8gVE9ETzogQXNzZXJ0IDQuMy4yLjItYS5paVxuXHRcdFx0XHR0aGlzLl9yZXNvbHZlQ2xvc2VkUHJvbWlzZSgpO1xuXHRcdFx0XHR0aGlzLl9zdGF0ZSA9IFN0YXRlLkNsb3NlZDtcblx0XHRcdFx0dGhpcy5fdW5kZXJseWluZ1NpbmsgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fSwgKGVycm9yOiBFcnJvcikgPT4ge1xuXHRcdFx0dGhpcy5fZXJyb3IoZXJyb3IpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gNC4zLjMgRXJyb3JXcml0YWJsZVN0cmVhbVxuXHRwcm90ZWN0ZWQgX2Vycm9yKGVycm9yOiBFcnJvcikge1xuXHRcdGlmICh0aGlzLnN0YXRlID09PSBTdGF0ZS5DbG9zZWQgfHwgdGhpcy5zdGF0ZSA9PT0gU3RhdGUuRXJyb3JlZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCB3cml0ZVJlY29yZDogUmVjb3JkPFQ+O1xuXG5cdFx0d2hpbGUgKHRoaXMuX3F1ZXVlLmxlbmd0aCkge1xuXHRcdFx0d3JpdGVSZWNvcmQgPSB0aGlzLl9xdWV1ZS5kZXF1ZXVlKCk7XG5cblx0XHRcdGlmICghd3JpdGVSZWNvcmQuY2xvc2UpIHtcblx0XHRcdFx0d3JpdGVSZWNvcmQucmVqZWN0KGVycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9zdG9yZWRFcnJvciA9IGVycm9yO1xuXG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLldhaXRpbmcpIHtcblx0XHRcdHRoaXMuX3Jlc29sdmVSZWFkeVByb21pc2UoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9yZWplY3RDbG9zZWRQcm9taXNlKGVycm9yKTtcblx0XHR0aGlzLl9zdGF0ZSA9IFN0YXRlLkVycm9yZWQ7XG5cdH1cblxuXHQvLyA0LjMuNSBTeW5jV3JpdGFibGVTdHJlYW1TdGF0ZVdpdGhRdWV1ZVxuXHRwcm90ZWN0ZWQgX3N5bmNTdGF0ZVdpdGhRdWV1ZSgpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuQ2xvc2luZykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IHF1ZXVlU2l6ZSA9IHRoaXMuX3F1ZXVlLnRvdGFsU2l6ZTtcblx0XHRjb25zdCBzaG91bGRBcHBseUJhY2tQcmVzc3VyZSA9IHF1ZXVlU2l6ZSA+IHRoaXMuX3N0cmF0ZWd5LmhpZ2hXYXRlck1hcms7XG5cblx0XHRpZiAoc2hvdWxkQXBwbHlCYWNrUHJlc3N1cmUgJiYgdGhpcy5zdGF0ZSA9PT0gU3RhdGUuV3JpdGFibGUpIHtcblx0XHRcdHRoaXMuX3N0YXRlID0gU3RhdGUuV2FpdGluZztcblx0XHRcdHRoaXMuX3JlYWR5UHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdFx0dGhpcy5fcmVzb2x2ZVJlYWR5UHJvbWlzZSA9IHJlc29sdmU7XG5cdFx0XHRcdHRoaXMuX3JlamVjdFJlYWR5UHJvbWlzZSA9IHJlamVjdDtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmIChzaG91bGRBcHBseUJhY2tQcmVzc3VyZSA9PT0gZmFsc2UgJiYgdGhpcy5zdGF0ZSA9PT0gU3RhdGUuV2FpdGluZykge1xuXHRcdFx0dGhpcy5fc3RhdGUgPSBTdGF0ZS5Xcml0YWJsZTtcblx0XHRcdHRoaXMuX3Jlc29sdmVSZWFkeVByb21pc2UoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2lnbmFscyB0aGF0IHRoZSBwcm9kdWNlciBjYW4gbm8gbG9uZ2VyIHdyaXRlIHRvIHRoZSBzdHJlYW0gYW5kIGl0IHNob3VsZCBiZSBpbW1lZGlhdGVseSBtb3ZlZCB0byBhbiBcImVycm9yZWRcIlxuXHQgKiBzdGF0ZS4gQW55IHVuLXdyaXR0ZW4gZGF0YSB0aGF0IGlzIHF1ZXVlZCB3aWxsIGJlIGRpc2NhcmRlZC5cblx0ICovXG5cdGFib3J0KHJlYXNvbjogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gNC4yLjQuNC0xXG5cdFx0aWYgKCFpc1dyaXRhYmxlU3RyZWFtKHRoaXMpKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoXG5cdFx0XHRcdG5ldyBFcnJvcignV3JpdGFibGVTdHJlYW0gbWV0aG9kIGNhbGxlZCBpbiBjb250ZXh0IG9mIG9iamVjdCB0aGF0IGlzIG5vdCBhIFdyaXRhYmxlU3RyZWFtIGluc3RhbmNlJylcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkNsb3NlZCkge1xuXHRcdFx0Ly8gNC4yLjQuNC0yXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkVycm9yZWQpIHtcblx0XHRcdC8vIDQuMi40LjQtM1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KHRoaXMuX3N0b3JlZEVycm9yKTtcblx0XHR9XG5cblx0XHRjb25zdCBlcnJvcjogRXJyb3IgPSByZWFzb24gaW5zdGFuY2VvZiBFcnJvciA/IHJlYXNvbiA6IG5ldyBFcnJvcihyZWFzb24pO1xuXG5cdFx0dGhpcy5fZXJyb3IoZXJyb3IpO1xuXG5cdFx0cmV0dXJuIHV0aWwucHJvbWlzZUludm9rZU9yRmFsbGJhY2tPck5vb3AodGhpcy5fdW5kZXJseWluZ1NpbmssICdhYm9ydCcsIFsgcmVhc29uIF0sICdjbG9zZScpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNpZ25hbHMgdGhhdCB0aGUgcHJvZHVjZXIgaXMgZG9uZSB3cml0aW5nIHRvIHRoZSBzdHJlYW0gYW5kIHdpc2hlcyB0byBtb3ZlIGl0IHRvIGEgXCJjbG9zZWRcIiBzdGF0ZS4gVGhlIHN0cmVhbVxuXHQgKiBtYXkgaGF2ZSB1bi13cml0dGVkIGRhdGEgcXVldWVkOyB1bnRpbCB0aGUgZGF0YSBoYXMgYmVlbiB3cml0dGVuIHRoZSBzdHJlYW0gd2lsbCByZW1haW4gaW4gdGhlIFwiY2xvc2luZ1wiIHN0YXRlLlxuXHQgKi9cblx0Y2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gNC4yLjQuNS0xXG5cdFx0aWYgKCFpc1dyaXRhYmxlU3RyZWFtKHRoaXMpKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoXG5cdFx0XHRcdG5ldyBFcnJvcignV3JpdGFibGVTdHJlYW0gbWV0aG9kIGNhbGxlZCBpbiBjb250ZXh0IG9mIG9iamVjdCB0aGF0IGlzIG5vdCBhIFdyaXRhYmxlU3RyZWFtIGluc3RhbmNlJylcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Ly8gNC4yLjQuNS0yXG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkNsb3NlZCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1N0cmVhbSBpcyBhbHJlYWR5IGNsb3NlZCcpKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuQ2xvc2luZykge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1N0cmVhbSBpcyBhbHJlYWR5IGNsb3NpbmcnKSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkVycm9yZWQpIHtcblx0XHRcdC8vIDQuMi40LjUtM1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KHRoaXMuX3N0b3JlZEVycm9yKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuV2FpdGluZykge1xuXHRcdFx0Ly8gNC4yLjQuNS00XG5cdFx0XHR0aGlzLl9yZXNvbHZlUmVhZHlQcm9taXNlKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fc3RhdGUgPSBTdGF0ZS5DbG9zaW5nO1xuXHRcdHRoaXMuX3F1ZXVlLmVucXVldWUoeyBjbG9zZTogdHJ1ZSB9LCAwKTtcblx0XHR0aGlzLl9hZHZhbmNlUXVldWUoKTtcblxuXHRcdHJldHVybiB0aGlzLl9jbG9zZWRQcm9taXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVucXVldWUgYSBjaHVuayBvZiBkYXRhIHRvIGJlIHdyaXR0ZW4gdG8gdGhlIHVuZGVybHlpbmcgc2luay4gYHdyaXRlYCBjYW4gYmUgY2FsbGVkIHN1Y2Nlc3NpdmVseSB3aXRob3V0IHdhaXRpbmdcblx0ICogZm9yIHRoZSBwcmV2aW91cyB3cml0ZSdzIHByb21pc2UgdG8gcmVzb2x2ZS4gVG8gcmVzcGVjdCB0aGUgc3RyZWFtJ3MgYmFja3ByZXNzdXJlIGluZGljYXRvciwgY2hlY2sgaWYgdGhlIHN0cmVhbVxuXHQgKiBoYXMgZW50ZXJlZCB0aGUgXCJ3YWl0aW5nXCIgc3RhdGUgYmV0d2VlbiB3cml0ZXMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgZnVsZmlsbGVkIHdoZW4gdGhlIGNodW5rIGhhcyBiZWVuIHdyaXR0ZW4gdG8gdGhlIHVuZGVybHlpbmcgc2luay5cblx0ICovXG5cdHdyaXRlKGNodW5rOiBUKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gNC4yLjQuNi0xXG5cdFx0aWYgKCFpc1dyaXRhYmxlU3RyZWFtKHRoaXMpKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoXG5cdFx0XHRcdG5ldyBFcnJvcignV3JpdGFibGVTdHJlYW0gbWV0aG9kIGNhbGxlZCBpbiBjb250ZXh0IG9mIG9iamVjdCB0aGF0IGlzIG5vdCBhIFdyaXRhYmxlU3RyZWFtIGluc3RhbmNlJylcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Ly8gNC4yLjQuNi0yXG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkNsb3NlZCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ1N0cmVhbSBpcyBjbG9zZWQnKSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkNsb3NpbmcpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdTdHJlYW0gaXMgY2xvc2luZycpKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuRXJyb3JlZCkge1xuXHRcdFx0Ly8gNC4yLjQuNi0zXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QodGhpcy5fc3RvcmVkRXJyb3IpO1xuXHRcdH1cblxuXHRcdGxldCBjaHVua1NpemUgPSAxO1xuXHRcdGxldCB3cml0ZVJlY29yZDogUmVjb3JkPFQ+O1xuXHRcdGxldCBwcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4oZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0d3JpdGVSZWNvcmQgPSB7XG5cdFx0XHRcdGNodW5rOiBjaHVuayxcblx0XHRcdFx0cmVqZWN0OiByZWplY3QsXG5cdFx0XHRcdHJlc29sdmU6IHJlc29sdmVcblx0XHRcdH07XG5cdFx0fSk7XG5cblx0XHQvLyA0LjIuNC42LTYuYlxuXHRcdHRyeSB7XG5cdFx0XHRpZiAodGhpcy5fc3RyYXRlZ3kgJiYgdGhpcy5fc3RyYXRlZ3kuc2l6ZSkge1xuXHRcdFx0XHRjaHVua1NpemUgPSB0aGlzLl9zdHJhdGVneS5zaXplKGNodW5rKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fcXVldWUuZW5xdWV1ZSh3cml0ZVJlY29yZCwgY2h1bmtTaXplKTtcblx0XHRcdHRoaXMuX3N5bmNTdGF0ZVdpdGhRdWV1ZSgpO1xuXHRcdH1cblx0XHRjYXRjaCAoZXJyb3IpIHtcblx0XHRcdC8vIDQuMi40LjYtNi5iLCA0LjIuNC42LTEwLCA0LjIuNC42LTEyXG5cdFx0XHR0aGlzLl9lcnJvcihlcnJvcik7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2FkdmFuY2VRdWV1ZSgpO1xuXG5cdFx0cmV0dXJuIHByb21pc2U7XG5cdH1cbn1cbiJdfQ==