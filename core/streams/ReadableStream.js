(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise', './ReadableStreamController', './ReadableStreamReader', './SizeQueue', './util', './WritableStream'], factory);
    }
})(function (require, exports) {
    "use strict";
    const Promise_1 = require('../Promise');
    const ReadableStreamController_1 = require('./ReadableStreamController');
    const ReadableStreamReader_1 = require('./ReadableStreamReader');
    const SizeQueue_1 = require('./SizeQueue');
    const util = require('./util');
    const WritableStream_1 = require('./WritableStream');
    /**
     * `ReadableStream`'s possible states
     */
    (function (State) {
        State[State["Readable"] = 0] = "Readable";
        State[State["Closed"] = 1] = "Closed";
        State[State["Errored"] = 2] = "Errored";
    })(exports.State || (exports.State = {}));
    var State = exports.State;
    /**
     * Implementation of a readable stream.
     */
    class ReadableStream {
        /**
         * A `ReadableStream` requires an underlying source to supply data. The source interacts with the stream through
         * a {@link ReadableStreamController} that is associated with the stream, and provided to the source.
         *
         * @constructor
         * @param underlyingSource The source object that supplies data to the stream by interacting with its controller.
         * @param strategy The strategy for this stream.
         */
        constructor(underlyingSource, strategy = {}) {
            this.closeRequested = false;
            if (!underlyingSource) {
                throw new Error('An ReadableStream Source must be provided.');
            }
            this.state = State.Readable;
            this._underlyingSource = underlyingSource;
            this.controller = new ReadableStreamController_1.default(this);
            this._strategy = util.normalizeStrategy(strategy);
            this.queue = new SizeQueue_1.default();
            this._startedPromise = new Promise_1.default((resolveStarted) => {
                const startResult = util.invokeOrNoop(this._underlyingSource, 'start', [this.controller]);
                Promise_1.default.resolve(startResult).then(() => {
                    this._started = true;
                    resolveStarted();
                    this.pull();
                }, (error) => {
                    this.error(error);
                });
            });
        }
        // ShouldReadableStreamPull
        get _allowPull() {
            return !this.pullScheduled &&
                !this.closeRequested &&
                this._started &&
                this.state !== State.Closed &&
                this.state !== State.Errored &&
                !this._shouldApplyBackPressure();
        }
        /**
         * Returns a number indicating how much additional data can be pushed by the source to the stream's queue before it
         * exceeds its `highWaterMark`. An underlying source should use this information to determine when and how to apply
         * backpressure.
         *
         * @returns The stream's strategy's `highWaterMark` value minus the queue size
         */
        // 3.5.7. GetReadableStreamDesiredSize ( stream )
        get desiredSize() {
            return this._strategy.highWaterMark - this.queueSize;
        }
        get hasSource() {
            return this._underlyingSource != null;
        }
        /**
         * A stream can only have one reader at a time. This value indicates if a stream already has a reader, and hence
         * cannot be read from other than by that reader. When a consumer is done with a reader they can dissociate it
         * by calling {@link ReadableStreamReader#releaseLock}.
         *
         * @returns True if the stream has a reader associated with it
         */
        // IsReadableStreamLocked
        get locked() {
            return this.hasSource && !!this.reader;
        }
        get readable() {
            return this.hasSource && this.state === State.Readable;
        }
        /**
         * This promise will resolve when the stream's underlying source has started and is ready to provide data. If
         * the {@link ReadableStreamReader#read} method is called before the stream has started it will not do anything.
         * Wait for this promise to resolve to ensure that your `read` calls are responded to as promptly as possible.
         *
         * @returns A promise that resolves when the stream is ready to be read from.
         */
        get started() {
            return this._startedPromise;
        }
        get queueSize() {
            return this.queue.totalSize;
        }
        _cancel(reason) {
            // 3.2.4.1-3: return cancelReadableStream(this, reason);
            if (this.state === State.Closed) {
                return Promise_1.default.resolve();
            }
            if (this.state === State.Errored) {
                return Promise_1.default.reject(new TypeError('3.5.3-2: State is errored'));
            }
            this.queue.empty();
            this.close();
            return util.promiseInvokeOrNoop(this._underlyingSource, 'cancel', [reason]).then(function () { });
        }
        // shouldReadableStreamApplyBackPressure
        _shouldApplyBackPressure() {
            const queueSize = this.queue.totalSize;
            return queueSize > this._strategy.highWaterMark;
        }
        /**
         *
         * @param reason A description of the reason the stream is being canceled.
         * @returns A promise that resolves when the stream has closed and the call to the underlying source's `cancel`
         * method has completed.
         */
        cancel(reason) {
            if (!this.hasSource) {
                return Promise_1.default.reject(new TypeError('3.2.4.1-1: Must be a ReadableStream'));
            }
            return this._cancel(reason);
        }
        /**
         * Closes the stream without regard to the status of the queue.  Use {@link requestClose} to close the
         * stream and allow the queue to flush.
         *
         */
        // 3.5.4. FinishClosingReadableStream ( stream )
        close() {
            if (this.state !== State.Readable) {
                return;
            }
            this.state = State.Closed;
            if (this.locked) {
                this.reader.release();
            }
        }
        // EnqueueInReadableStream
        enqueue(chunk) {
            const size = this._strategy.size;
            if (!this.readable || this.closeRequested) {
                throw new Error('3.5.6-1,2: Stream._state should be Readable and stream.closeRequested should be true');
            }
            if (!this.locked || !this.reader.resolveReadRequest(chunk)) {
                try {
                    let chunkSize = 1;
                    if (size) {
                        chunkSize = size(chunk);
                    }
                    this.queue.enqueue(chunk, chunkSize);
                }
                catch (error) {
                    this.error(error);
                    throw error;
                }
            }
            this.pull();
        }
        error(error) {
            if (this.state !== State.Readable) {
                throw new Error('3.5.7-1: State must be Readable');
            }
            this.queue.empty();
            this.storedError = error;
            this.state = State.Errored;
            if (this.locked) {
                this.reader.release();
            }
        }
        /**
         * create a new {@link ReadableStreamReader} and lock the stream to the new reader
         */
        // AcquireReadableStreamReader
        getReader() {
            if (!this.readable) {
                throw new TypeError('3.2.4.2-1: must be a ReadableStream instance');
            }
            return new ReadableStreamReader_1.default(this);
        }
        pipeThrough(transformStream, options) {
            this.pipeTo(transformStream.writable, options);
            return transformStream.readable;
        }
        pipeTo(dest, options = {}) {
            let resolvePipeToPromise;
            let rejectPipeToPromise;
            let closedPurposefully = false;
            let lastRead;
            let reader;
            function doPipe() {
                lastRead = reader.read();
                Promise_1.default.all([lastRead, dest.ready]).then(function ([readResult]) {
                    if (readResult.done) {
                        closeDest();
                    }
                    else if (dest.state === WritableStream_1.State.Writable) {
                        dest.write(readResult.value);
                        doPipe();
                    }
                });
            }
            function cancelSource(reason) {
                if (!options.preventCancel) {
                    reader.cancel(reason);
                    rejectPipeToPromise(reason);
                }
                else {
                    lastRead.then(function () {
                        reader.releaseLock();
                        rejectPipeToPromise(reason);
                    });
                }
            }
            function closeDest() {
                const destState = dest.state;
                if (!options.preventClose &&
                    (destState === WritableStream_1.State.Waiting || destState === WritableStream_1.State.Writable)) {
                    closedPurposefully = true;
                    dest.close().then(resolvePipeToPromise, rejectPipeToPromise);
                }
                else {
                    resolvePipeToPromise();
                }
            }
            return new Promise_1.default((resolve, reject) => {
                resolvePipeToPromise = resolve;
                rejectPipeToPromise = reject;
                reader = this.getReader();
                reader.closed.catch((reason) => {
                    // abortDest
                    if (!options.preventAbort) {
                        dest.abort(reason);
                    }
                    rejectPipeToPromise(reason);
                });
                dest.closed.then(function () {
                    if (!closedPurposefully) {
                        cancelSource(new TypeError('destination is closing or closed and cannot be piped to anymore'));
                    }
                }, cancelSource);
                doPipe();
            });
        }
        // RequestReadableStreamPull
        pull() {
            if (!this._allowPull) {
                return;
            }
            if (this._pullingPromise) {
                this.pullScheduled = true;
                this._pullingPromise.then(() => {
                    this.pullScheduled = false;
                    this.pull();
                });
                return;
            }
            this._pullingPromise = util.promiseInvokeOrNoop(this._underlyingSource, 'pull', [this.controller]);
            this._pullingPromise.then(() => {
                this._pullingPromise = undefined;
            }, (error) => {
                this.error(error);
            });
        }
        /**
         * Requests the stream be closed.  This method allows the queue to be emptied before the stream closes.
         *
         */
        // 3.5.3. CloseReadableStream ( stream )
        requestClose() {
            if (this.closeRequested || this.state !== State.Readable) {
                return;
            }
            this.closeRequested = true;
            if (this.queue.length === 0) {
                this.close();
            }
        }
        /**
         * Tee a readable stream, returning a two-element array containing
         * the two resulting ReadableStream instances
         */
        // TeeReadableStream
        tee() {
            if (!this.readable) {
                throw new TypeError('3.2.4.5-1: must be a ReadableSream');
            }
            let branch1;
            let branch2;
            const reader = this.getReader();
            const teeState = {
                closedOrErrored: false,
                canceled1: false,
                canceled2: false,
                reason1: undefined,
                reason2: undefined
            };
            teeState.promise = new Promise_1.default(function (resolve) {
                teeState._resolve = resolve;
            });
            const createCancelFunction = (branch) => {
                return (reason) => {
                    teeState['canceled' + branch] = true;
                    teeState['reason' + branch] = reason;
                    if (teeState['canceled' + (branch === 1 ? 2 : 1)]) {
                        const cancelResult = this._cancel([teeState.reason1, teeState.reason2]);
                        teeState._resolve(cancelResult);
                    }
                    return teeState.promise;
                };
            };
            const pull = function (controller) {
                return reader.read().then(function (result) {
                    const value = result.value;
                    const done = result.done;
                    if (done && !teeState.closedOrErrored) {
                        branch1.requestClose();
                        branch2.requestClose();
                        teeState.closedOrErrored = true;
                    }
                    if (teeState.closedOrErrored) {
                        return;
                    }
                    if (!teeState.canceled1) {
                        branch1.enqueue(value);
                    }
                    if (!teeState.canceled2) {
                        branch2.enqueue(value);
                    }
                });
            };
            const cancel1 = createCancelFunction(1);
            const cancel2 = createCancelFunction(2);
            const underlyingSource1 = {
                pull: pull,
                cancel: cancel1
            };
            branch1 = new ReadableStream(underlyingSource1);
            const underlyingSource2 = {
                pull: pull,
                cancel: cancel2
            };
            branch2 = new ReadableStream(underlyingSource2);
            reader.closed.catch(function (r) {
                if (teeState.closedOrErrored) {
                    return;
                }
                branch1.error(r);
                branch2.error(r);
                teeState.closedOrErrored = true;
            });
            return [branch1, branch2];
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ReadableStream;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhZGFibGVTdHJlYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9SZWFkYWJsZVN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFDQSwwQkFBb0IsWUFBWSxDQUFDLENBQUE7SUFDakMsMkNBQXFDLDRCQUE0QixDQUFDLENBQUE7SUFDbEUsdUNBQWlDLHdCQUF3QixDQUFDLENBQUE7SUFDMUQsNEJBQXNCLGFBQWEsQ0FBQyxDQUFBO0lBRXBDLE1BQVksSUFBSSxXQUFNLFFBQVEsQ0FBQyxDQUFBO0lBQy9CLGlDQUF3RCxrQkFBa0IsQ0FBQyxDQUFBO0lBcUUzRTs7T0FFRztJQUNILFdBQVksS0FBSztRQUFHLHlDQUFRLENBQUE7UUFBRSxxQ0FBTSxDQUFBO1FBQUUsdUNBQU8sQ0FBQTtJQUFDLENBQUMsRUFBbkMsYUFBSyxLQUFMLGFBQUssUUFBOEI7SUFBL0MsSUFBWSxLQUFLLEdBQUwsYUFBbUMsQ0FBQTtJQUUvQzs7T0FFRztJQUNIO1FBeUVDOzs7Ozs7O1dBT0c7UUFDSCxZQUFZLGdCQUEyQixFQUFFLFFBQVEsR0FBZ0IsRUFBRTtZQWhCbkUsbUJBQWMsR0FBWSxLQUFLLENBQUM7WUFpQi9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7WUFDL0QsQ0FBQztZQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztZQUM1QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7WUFDMUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLGtDQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxLQUFLLEdBQUcs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RSxDQUFDO1FBQzdCLENBQUM7SUFDRixDQUFDO0lBOVpEO29DQThaQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3RyYXRlZ3kgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IFByb21pc2UgZnJvbSAnLi4vUHJvbWlzZSc7XG5pbXBvcnQgUmVhZGFibGVTdHJlYW1Db250cm9sbGVyIGZyb20gJy4vUmVhZGFibGVTdHJlYW1Db250cm9sbGVyJztcbmltcG9ydCBSZWFkYWJsZVN0cmVhbVJlYWRlciBmcm9tICcuL1JlYWRhYmxlU3RyZWFtUmVhZGVyJztcbmltcG9ydCBTaXplUXVldWUgZnJvbSAnLi9TaXplUXVldWUnO1xuaW1wb3J0IFRyYW5zZm9ybVN0cmVhbSBmcm9tICcuL1RyYW5zZm9ybVN0cmVhbSc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgV3JpdGFibGVTdHJlYW0sIHsgU3RhdGUgYXMgV3JpdGVhYmxlU3RhdGUgfSBmcm9tICcuL1dyaXRhYmxlU3RyZWFtJztcblxuLyoqXG4gKiBPcHRpb25zIHVzZWQgd2hlbiBwaXBpbmcgYSByZWFkYWJsZSBzdHJlYW0gdG8gYSB3cml0YWJsZSBzdHJlYW0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGlwZU9wdGlvbnMge1xuXHQvKipcblx0ICogUHJldmVudHMgdGhlIHdyaXRhYmxlIHN0cmVhbSBmcm9tIGVycm9yaW5nIGlmIHRoZSByZWFkYWJsZSBzdHJlYW0gZW5jb3VudGVycyBhbiBlcnJvci5cblx0ICovXG5cdHByZXZlbnRBYm9ydD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqICBQcmV2ZW50cyB0aGUgcmVhZGFibGUgc3RyZWFtIGZyb20gZXJyb3JpbmcgaWYgdGhlIHdyaXRhYmxlIHN0cmVhbSBlbmNvdW50ZXJzIGFuIGVycm9yLlxuXHQgKi9cblx0cHJldmVudENhbmNlbD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFByZXZlbnRzIHRoZSB3cml0YWJsZSBzdHJlYW0gZnJvbSBjbG9zaW5nIHdoZW4gdGhlIHBpcGUgb3BlcmF0aW9uIGNvbXBsZXRlcy5cblx0ICovXG5cdHByZXZlbnRDbG9zZT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogVGhlIFNvdXJjZSBpbnRlcmZhY2UgZGVmaW5lcyB0aGUgbWV0aG9kcyBhIG1vZHVsZSBjYW4gaW1wbGVtZW50IHRvIGNyZWF0ZSBhIHNvdXJjZSBmb3IgYSB7QGxpbmsgUmVhZGFibGVTdHJlYW19LlxuICpcbiAqIFRoZSBTdHJlYW0gQVBJIHByb3ZpZGVzIGEgY29uc2lzdGVudCBzdHJlYW0gQVBJIHdoaWxlIHtAbGluayBSZWFkYWJsZVN0cmVhbS5Tb3VyY2V9IGFuZCB7QGxpbmsgV3JpdGFibGVTdHJlYW0uU2lua31cbiAqIGltcGxlbWVudGF0aW9ucyBwcm92aWRlIHRoZSBsb2dpYyB0byBjb25uZWN0IGEgc3RyZWFtIHRvIHNwZWNpZmljIGRhdGEgc291cmNlcyAmIHNpbmtzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNvdXJjZTxUPiB7XG5cblx0LyoqXG5cdCAqIFRlbGxzIHRoZSBzb3VyY2UgdG8gcHJlcGFyZSBmb3IgcHJvdmlkaW5nIGNodW5rcyB0byB0aGUgc3RyZWFtLiAgV2hpbGUgdGhlIHNvdXJjZSBtYXkgZW5xdWV1ZSBjaHVua3MgYXQgdGhpc1xuXHQgKiBwb2ludCwgaXQgaXMgbm90IHJlcXVpcmVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udHJvbGxlciBUaGUgc291cmNlIGNhbiB1c2UgdGhlIGNvbnRyb2xsZXIgdG8gZW5xdWV1ZSBjaHVua3MsIGNsb3NlIHRoZSBzdHJlYW0gb3IgcmVwb3J0IGFuIGVycm9yLlxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBzb3VyY2UncyBzdGFydCBvcGVyYXRpb24gaGFzIGZpbmlzaGVkLiAgSWYgdGhlIHByb21pc2UgcmVqZWN0cyxcblx0ICogXHRcdHRoZSBzdHJlYW0gd2lsbCBiZSBlcnJvcmVkLlxuXHQgKi9cblx0c3RhcnQ/KGNvbnRyb2xsZXI6IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlcjxUPik6IFByb21pc2U8dm9pZD47XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIHRoYXQgc291cmNlIGVucXVldWUgY2h1bmtzLiAgVXNlIHRoZSBjb250cm9sbGVyIHRvIGNsb3NlIHRoZSBzdHJlYW0gd2hlbiBubyBtb3JlIGNodW5rcyBjYW5cblx0ICogYmUgcHJvdmlkZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250cm9sbGVyIFRoZSBzb3VyY2UgY2FuIHVzZSB0aGUgY29udHJvbGxlciB0byBlbnF1ZXVlIGNodW5rcywgY2xvc2UgdGhlIHN0cmVhbSBvciByZXBvcnQgYW4gZXJyb3IuXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHNvdXJjZSdzIHB1bGwgb3BlcmF0aW9uIGhhcyBmaW5pc2hlZC4gIElmIHRoZSBwcm9taXNlIHJlamVjdHMsXG5cdCAqIFx0XHR0aGUgc3RyZWFtIHdpbGwgYmUgZXJyb3JlZC5cblx0ICovXG5cdHB1bGw/KGNvbnRyb2xsZXI6IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlcjxUPik6IFByb21pc2U8dm9pZD47XG5cblx0LyoqXG5cdCAqIE9wdGlvbmFsIG1ldGhvZCBpbXBsZW1lbnRlZCBieSBzZWVrYWJsZSBzb3VyY2VzIHRvIHNldCB0aGUgc2VlayBwb3NpdGlvbi4gVXNlIHRoZSBjb250cm9sbGVyIHRvIHJlcG9ydCBhbiBlcnJvci5cblx0ICogQHBhcmFtIGNvbnRyb2xsZXIgVGhlIHNvdXJjZSBjYW4gdXNlIHRoZSBjb250cm9sbGVyIHRvIHJlcG9ydCBhbiBlcnJvci5cblx0ICogQHBhcmFtIHBvc2l0aW9uIFRoZSBwb3NpdGlvbiBpbiB0aGUgc3RyZWFtIHRvIHNlZWsgdG8uXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBuZXcgc2VlayBwb3NpdGlvbiB3aGVuIHRoZSBzb3VyY2UncyBzZWVrIG9wZXJhdGlvbiBoYXMgZmluaXNoZWQuICBJZiB0aGVcblx0ICogIFx0cHJvbWlzZSByZWplY3RzLCB0aGUgc3RyZWFtIHdpbGwgYmUgZXJyb3JlZC5cblx0ICovXG5cdHNlZWs/KGNvbnRyb2xsZXI6IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlcjxUPiwgcG9zaXRpb246IG51bWJlcik6IFByb21pc2U8bnVtYmVyPjtcblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHRoZSBzdHJlYW0gaXMgcHJlbWF0dXJlbHkgY2xvc2luZyBhbmQgYWxsb3dzIHRoZSBzb3VyY2UgdG8gZG8gYW55IG5lY2Vzc2FyeSBjbGVhbiB1cC5cblx0ICpcblx0ICogQHBhcmFtIHJlYXNvbiBUaGUgcmVhc29uIHdoeSB0aGUgc3RyZWFtIGlzIGNsb3NpbmcuXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHNvdXJjZSdzIHB1bGwgb3BlcmF0aW9uIGhhcyBmaW5pc2hlZC4gIElmIHRoZSBwcm9taXNlIHJlamVjdHMsXG5cdCAqIFx0XHR0aGUgc3RyZWFtIHdpbGwgYmUgZXJyb3JlZC5cblx0ICovXG5cdGNhbmNlbD8ocmVhc29uPzogYW55KTogUHJvbWlzZTx2b2lkPjtcbn1cblxuLyoqXG4gKiBgUmVhZGFibGVTdHJlYW1gJ3MgcG9zc2libGUgc3RhdGVzXG4gKi9cbmV4cG9ydCBlbnVtIFN0YXRlIHsgUmVhZGFibGUsIENsb3NlZCwgRXJyb3JlZCB9XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgYSByZWFkYWJsZSBzdHJlYW0uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlYWRhYmxlU3RyZWFtPFQ+IHtcblxuXHQvLyBTaG91bGRSZWFkYWJsZVN0cmVhbVB1bGxcblx0cHJvdGVjdGVkIGdldCBfYWxsb3dQdWxsKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAhdGhpcy5wdWxsU2NoZWR1bGVkICYmXG5cdFx0XHQhdGhpcy5jbG9zZVJlcXVlc3RlZCAmJlxuXHRcdFx0dGhpcy5fc3RhcnRlZCAmJlxuXHRcdFx0dGhpcy5zdGF0ZSAhPT0gU3RhdGUuQ2xvc2VkICYmXG5cdFx0XHR0aGlzLnN0YXRlICE9PSBTdGF0ZS5FcnJvcmVkICYmXG5cdFx0XHQhdGhpcy5fc2hvdWxkQXBwbHlCYWNrUHJlc3N1cmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgbnVtYmVyIGluZGljYXRpbmcgaG93IG11Y2ggYWRkaXRpb25hbCBkYXRhIGNhbiBiZSBwdXNoZWQgYnkgdGhlIHNvdXJjZSB0byB0aGUgc3RyZWFtJ3MgcXVldWUgYmVmb3JlIGl0XG5cdCAqIGV4Y2VlZHMgaXRzIGBoaWdoV2F0ZXJNYXJrYC4gQW4gdW5kZXJseWluZyBzb3VyY2Ugc2hvdWxkIHVzZSB0aGlzIGluZm9ybWF0aW9uIHRvIGRldGVybWluZSB3aGVuIGFuZCBob3cgdG8gYXBwbHlcblx0ICogYmFja3ByZXNzdXJlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgc3RyZWFtJ3Mgc3RyYXRlZ3kncyBgaGlnaFdhdGVyTWFya2AgdmFsdWUgbWludXMgdGhlIHF1ZXVlIHNpemVcblx0ICovXG5cdC8vIDMuNS43LiBHZXRSZWFkYWJsZVN0cmVhbURlc2lyZWRTaXplICggc3RyZWFtIClcblx0Z2V0IGRlc2lyZWRTaXplKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0cmF0ZWd5LmhpZ2hXYXRlck1hcmsgLSB0aGlzLnF1ZXVlU2l6ZTtcblx0fVxuXG5cdGdldCBoYXNTb3VyY2UoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX3VuZGVybHlpbmdTb3VyY2UgIT0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHN0cmVhbSBjYW4gb25seSBoYXZlIG9uZSByZWFkZXIgYXQgYSB0aW1lLiBUaGlzIHZhbHVlIGluZGljYXRlcyBpZiBhIHN0cmVhbSBhbHJlYWR5IGhhcyBhIHJlYWRlciwgYW5kIGhlbmNlXG5cdCAqIGNhbm5vdCBiZSByZWFkIGZyb20gb3RoZXIgdGhhbiBieSB0aGF0IHJlYWRlci4gV2hlbiBhIGNvbnN1bWVyIGlzIGRvbmUgd2l0aCBhIHJlYWRlciB0aGV5IGNhbiBkaXNzb2NpYXRlIGl0XG5cdCAqIGJ5IGNhbGxpbmcge0BsaW5rIFJlYWRhYmxlU3RyZWFtUmVhZGVyI3JlbGVhc2VMb2NrfS5cblx0ICpcblx0ICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgc3RyZWFtIGhhcyBhIHJlYWRlciBhc3NvY2lhdGVkIHdpdGggaXRcblx0ICovXG5cdC8vIElzUmVhZGFibGVTdHJlYW1Mb2NrZWRcblx0Z2V0IGxvY2tlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5oYXNTb3VyY2UgJiYgISF0aGlzLnJlYWRlcjtcblx0fVxuXG5cdGdldCByZWFkYWJsZSgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5oYXNTb3VyY2UgJiYgdGhpcy5zdGF0ZSA9PT0gU3RhdGUuUmVhZGFibGU7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBwcm9taXNlIHdpbGwgcmVzb2x2ZSB3aGVuIHRoZSBzdHJlYW0ncyB1bmRlcmx5aW5nIHNvdXJjZSBoYXMgc3RhcnRlZCBhbmQgaXMgcmVhZHkgdG8gcHJvdmlkZSBkYXRhLiBJZlxuXHQgKiB0aGUge0BsaW5rIFJlYWRhYmxlU3RyZWFtUmVhZGVyI3JlYWR9IG1ldGhvZCBpcyBjYWxsZWQgYmVmb3JlIHRoZSBzdHJlYW0gaGFzIHN0YXJ0ZWQgaXQgd2lsbCBub3QgZG8gYW55dGhpbmcuXG5cdCAqIFdhaXQgZm9yIHRoaXMgcHJvbWlzZSB0byByZXNvbHZlIHRvIGVuc3VyZSB0aGF0IHlvdXIgYHJlYWRgIGNhbGxzIGFyZSByZXNwb25kZWQgdG8gYXMgcHJvbXB0bHkgYXMgcG9zc2libGUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHN0cmVhbSBpcyByZWFkeSB0byBiZSByZWFkIGZyb20uXG5cdCAqL1xuXHRnZXQgc3RhcnRlZCgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5fc3RhcnRlZFByb21pc2U7XG5cdH1cblxuXHRnZXQgcXVldWVTaXplKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMucXVldWUudG90YWxTaXplO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9wdWxsaW5nUHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcblx0cHJvdGVjdGVkIF9zdGFydGVkOiBib29sZWFuO1xuXHRwcm90ZWN0ZWQgX3N0YXJ0ZWRQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXHRwcm90ZWN0ZWQgX3N0cmF0ZWd5OiBTdHJhdGVneTxUPjtcblx0cHJvdGVjdGVkIF91bmRlcmx5aW5nU291cmNlOiBTb3VyY2U8VD47XG5cblx0Y2xvc2VSZXF1ZXN0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0Y29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPFQ+O1xuXHRwdWxsU2NoZWR1bGVkOiBib29sZWFuO1xuXHRxdWV1ZTogU2l6ZVF1ZXVlPFQ+O1xuXHRyZWFkZXI6IFJlYWRhYmxlU3RyZWFtUmVhZGVyPFQ+O1xuXHRzdGF0ZTogU3RhdGU7XG5cdHN0b3JlZEVycm9yOiBFcnJvcjtcblxuXHQvKipcblx0ICogQSBgUmVhZGFibGVTdHJlYW1gIHJlcXVpcmVzIGFuIHVuZGVybHlpbmcgc291cmNlIHRvIHN1cHBseSBkYXRhLiBUaGUgc291cmNlIGludGVyYWN0cyB3aXRoIHRoZSBzdHJlYW0gdGhyb3VnaFxuXHQgKiBhIHtAbGluayBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXJ9IHRoYXQgaXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBzdHJlYW0sIGFuZCBwcm92aWRlZCB0byB0aGUgc291cmNlLlxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHVuZGVybHlpbmdTb3VyY2UgVGhlIHNvdXJjZSBvYmplY3QgdGhhdCBzdXBwbGllcyBkYXRhIHRvIHRoZSBzdHJlYW0gYnkgaW50ZXJhY3Rpbmcgd2l0aCBpdHMgY29udHJvbGxlci5cblx0ICogQHBhcmFtIHN0cmF0ZWd5IFRoZSBzdHJhdGVneSBmb3IgdGhpcyBzdHJlYW0uXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih1bmRlcmx5aW5nU291cmNlOiBTb3VyY2U8VD4sIHN0cmF0ZWd5OiBTdHJhdGVneTxUPiA9IHt9KSB7XG5cdFx0aWYgKCF1bmRlcmx5aW5nU291cmNlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0FuIFJlYWRhYmxlU3RyZWFtIFNvdXJjZSBtdXN0IGJlIHByb3ZpZGVkLicpO1xuXHRcdH1cblx0XHR0aGlzLnN0YXRlID0gU3RhdGUuUmVhZGFibGU7XG5cdFx0dGhpcy5fdW5kZXJseWluZ1NvdXJjZSA9IHVuZGVybHlpbmdTb3VyY2U7XG5cdFx0dGhpcy5jb250cm9sbGVyID0gbmV3IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlcih0aGlzKTtcblx0XHR0aGlzLl9zdHJhdGVneSA9IHV0aWwubm9ybWFsaXplU3RyYXRlZ3koc3RyYXRlZ3kpO1xuXHRcdHRoaXMucXVldWUgPSBuZXcgU2l6ZVF1ZXVlPFQ+KCk7XG5cdFx0dGhpcy5fc3RhcnRlZFByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZVN0YXJ0ZWQpID0+IHtcblx0XHRcdGNvbnN0IHN0YXJ0UmVzdWx0ID0gdXRpbC5pbnZva2VPck5vb3AodGhpcy5fdW5kZXJseWluZ1NvdXJjZSwgJ3N0YXJ0JywgWyB0aGlzLmNvbnRyb2xsZXIgXSk7XG5cdFx0XHRQcm9taXNlLnJlc29sdmUoc3RhcnRSZXN1bHQpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHR0aGlzLl9zdGFydGVkID0gdHJ1ZTtcblx0XHRcdFx0cmVzb2x2ZVN0YXJ0ZWQoKTtcblx0XHRcdFx0dGhpcy5wdWxsKCk7XG5cdFx0XHR9LCAoZXJyb3I6IEVycm9yKSA9PiB7XG5cdFx0XHRcdHRoaXMuZXJyb3IoZXJyb3IpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2NhbmNlbChyZWFzb24/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyAzLjIuNC4xLTM6IHJldHVybiBjYW5jZWxSZWFkYWJsZVN0cmVhbSh0aGlzLCByZWFzb24pO1xuXHRcdGlmICh0aGlzLnN0YXRlID09PSBTdGF0ZS5DbG9zZWQpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuRXJyb3JlZCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJzMuNS4zLTI6IFN0YXRlIGlzIGVycm9yZWQnKSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5xdWV1ZS5lbXB0eSgpO1xuXHRcdHRoaXMuY2xvc2UoKTtcblx0XHRyZXR1cm4gdXRpbC5wcm9taXNlSW52b2tlT3JOb29wKHRoaXMuX3VuZGVybHlpbmdTb3VyY2UsICdjYW5jZWwnLCBbIHJlYXNvbiBdKS50aGVuKGZ1bmN0aW9uICgpIHt9KTtcblx0fVxuXG5cdC8vIHNob3VsZFJlYWRhYmxlU3RyZWFtQXBwbHlCYWNrUHJlc3N1cmVcblx0cHJvdGVjdGVkIF9zaG91bGRBcHBseUJhY2tQcmVzc3VyZSgpOiBib29sZWFuIHtcblx0XHRjb25zdCBxdWV1ZVNpemUgPSB0aGlzLnF1ZXVlLnRvdGFsU2l6ZTtcblxuXHRcdHJldHVybiBxdWV1ZVNpemUgPiB0aGlzLl9zdHJhdGVneS5oaWdoV2F0ZXJNYXJrO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSByZWFzb24gQSBkZXNjcmlwdGlvbiBvZiB0aGUgcmVhc29uIHRoZSBzdHJlYW0gaXMgYmVpbmcgY2FuY2VsZWQuXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHN0cmVhbSBoYXMgY2xvc2VkIGFuZCB0aGUgY2FsbCB0byB0aGUgdW5kZXJseWluZyBzb3VyY2UncyBgY2FuY2VsYFxuXHQgKiBtZXRob2QgaGFzIGNvbXBsZXRlZC5cblx0ICovXG5cdGNhbmNlbChyZWFzb24/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoIXRoaXMuaGFzU291cmNlKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignMy4yLjQuMS0xOiBNdXN0IGJlIGEgUmVhZGFibGVTdHJlYW0nKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2NhbmNlbChyZWFzb24pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsb3NlcyB0aGUgc3RyZWFtIHdpdGhvdXQgcmVnYXJkIHRvIHRoZSBzdGF0dXMgb2YgdGhlIHF1ZXVlLiAgVXNlIHtAbGluayByZXF1ZXN0Q2xvc2V9IHRvIGNsb3NlIHRoZVxuXHQgKiBzdHJlYW0gYW5kIGFsbG93IHRoZSBxdWV1ZSB0byBmbHVzaC5cblx0ICpcblx0ICovXG5cdC8vIDMuNS40LiBGaW5pc2hDbG9zaW5nUmVhZGFibGVTdHJlYW0gKCBzdHJlYW0gKVxuXHRjbG9zZSgpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5zdGF0ZSAhPT0gU3RhdGUuUmVhZGFibGUpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnN0YXRlID0gU3RhdGUuQ2xvc2VkO1xuXG5cdFx0aWYgKHRoaXMubG9ja2VkKSB7XG5cdFx0XHR0aGlzLnJlYWRlci5yZWxlYXNlKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gRW5xdWV1ZUluUmVhZGFibGVTdHJlYW1cblx0ZW5xdWV1ZShjaHVuazogVCk6IHZvaWQge1xuXHRcdGNvbnN0IHNpemUgPSB0aGlzLl9zdHJhdGVneS5zaXplO1xuXG5cdFx0aWYgKCF0aGlzLnJlYWRhYmxlIHx8IHRoaXMuY2xvc2VSZXF1ZXN0ZWQpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignMy41LjYtMSwyOiBTdHJlYW0uX3N0YXRlIHNob3VsZCBiZSBSZWFkYWJsZSBhbmQgc3RyZWFtLmNsb3NlUmVxdWVzdGVkIHNob3VsZCBiZSB0cnVlJyk7XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLmxvY2tlZCB8fCAhdGhpcy5yZWFkZXIucmVzb2x2ZVJlYWRSZXF1ZXN0KGNodW5rKSkge1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRsZXQgY2h1bmtTaXplID0gMTtcblx0XHRcdFx0aWYgKHNpemUpIHtcblx0XHRcdFx0XHRjaHVua1NpemUgPSBzaXplKGNodW5rKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnF1ZXVlLmVucXVldWUoY2h1bmssIGNodW5rU2l6ZSk7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0dGhpcy5lcnJvcihlcnJvcik7XG5cdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMucHVsbCgpO1xuXHR9XG5cblx0ZXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuc3RhdGUgIT09IFN0YXRlLlJlYWRhYmxlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJzMuNS43LTE6IFN0YXRlIG11c3QgYmUgUmVhZGFibGUnKTtcblx0XHR9XG5cblx0XHR0aGlzLnF1ZXVlLmVtcHR5KCk7XG5cdFx0dGhpcy5zdG9yZWRFcnJvciA9IGVycm9yO1xuXHRcdHRoaXMuc3RhdGUgPSBTdGF0ZS5FcnJvcmVkO1xuXG5cdFx0aWYgKHRoaXMubG9ja2VkKSB7XG5cdFx0XHR0aGlzLnJlYWRlci5yZWxlYXNlKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIGNyZWF0ZSBhIG5ldyB7QGxpbmsgUmVhZGFibGVTdHJlYW1SZWFkZXJ9IGFuZCBsb2NrIHRoZSBzdHJlYW0gdG8gdGhlIG5ldyByZWFkZXJcblx0ICovXG5cdC8vIEFjcXVpcmVSZWFkYWJsZVN0cmVhbVJlYWRlclxuXHRnZXRSZWFkZXIoKTogUmVhZGFibGVTdHJlYW1SZWFkZXI8VD4ge1xuXHRcdGlmICghdGhpcy5yZWFkYWJsZSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignMy4yLjQuMi0xOiBtdXN0IGJlIGEgUmVhZGFibGVTdHJlYW0gaW5zdGFuY2UnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IFJlYWRhYmxlU3RyZWFtUmVhZGVyKHRoaXMpO1xuXHR9XG5cblx0cGlwZVRocm91Z2godHJhbnNmb3JtU3RyZWFtOiBUcmFuc2Zvcm1TdHJlYW08VCwgYW55Piwgb3B0aW9ucz86IFBpcGVPcHRpb25zKTogUmVhZGFibGVTdHJlYW08VD4ge1xuXHRcdHRoaXMucGlwZVRvKHRyYW5zZm9ybVN0cmVhbS53cml0YWJsZSwgb3B0aW9ucyk7XG5cdFx0cmV0dXJuIHRyYW5zZm9ybVN0cmVhbS5yZWFkYWJsZTtcblx0fVxuXG5cdHBpcGVUbyhkZXN0OiBXcml0YWJsZVN0cmVhbTxUPiwgb3B0aW9uczogUGlwZU9wdGlvbnMgPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGxldCByZXNvbHZlUGlwZVRvUHJvbWlzZTogKCkgPT4gdm9pZDtcblx0XHRsZXQgcmVqZWN0UGlwZVRvUHJvbWlzZTogKGVycm9yOiBFcnJvcikgPT4gdm9pZDtcblx0XHRsZXQgY2xvc2VkUHVycG9zZWZ1bGx5ID0gZmFsc2U7XG5cdFx0bGV0IGxhc3RSZWFkOiBhbnk7XG5cdFx0bGV0IHJlYWRlcjogUmVhZGFibGVTdHJlYW1SZWFkZXI8VD47XG5cblx0XHRmdW5jdGlvbiBkb1BpcGUoKTogdm9pZCB7XG5cdFx0XHRsYXN0UmVhZCA9IHJlYWRlci5yZWFkKCk7XG5cdFx0XHRQcm9taXNlLmFsbChbIGxhc3RSZWFkLCBkZXN0LnJlYWR5IF0pLnRoZW4oZnVuY3Rpb24gKFsgcmVhZFJlc3VsdCBdKSB7XG5cdFx0XHRcdGlmIChyZWFkUmVzdWx0LmRvbmUpIHtcblx0XHRcdFx0XHRjbG9zZURlc3QoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChkZXN0LnN0YXRlID09PSBXcml0ZWFibGVTdGF0ZS5Xcml0YWJsZSApIHtcblx0XHRcdFx0XHRkZXN0LndyaXRlKHJlYWRSZXN1bHQudmFsdWUpO1xuXHRcdFx0XHRcdGRvUGlwZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBjYW5jZWxTb3VyY2UocmVhc29uOiBhbnkpOiB2b2lkIHtcblx0XHRcdGlmICghb3B0aW9ucy5wcmV2ZW50Q2FuY2VsKSB7XG5cdFx0XHRcdHJlYWRlci5jYW5jZWwocmVhc29uKTtcblx0XHRcdFx0cmVqZWN0UGlwZVRvUHJvbWlzZShyZWFzb24pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGxhc3RSZWFkLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJlYWRlci5yZWxlYXNlTG9jaygpO1xuXHRcdFx0XHRcdHJlamVjdFBpcGVUb1Byb21pc2UocmVhc29uKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gY2xvc2VEZXN0KCk6IHZvaWQge1xuXHRcdFx0Y29uc3QgZGVzdFN0YXRlID0gZGVzdC5zdGF0ZTtcblx0XHRcdGlmICghb3B0aW9ucy5wcmV2ZW50Q2xvc2UgJiZcblx0XHRcdFx0KGRlc3RTdGF0ZSA9PT0gV3JpdGVhYmxlU3RhdGUuV2FpdGluZyB8fCBkZXN0U3RhdGUgPT09IFdyaXRlYWJsZVN0YXRlLldyaXRhYmxlKSkge1xuXG5cdFx0XHRcdGNsb3NlZFB1cnBvc2VmdWxseSA9IHRydWU7XG5cdFx0XHRcdGRlc3QuY2xvc2UoKS50aGVuKHJlc29sdmVQaXBlVG9Qcm9taXNlLCByZWplY3RQaXBlVG9Qcm9taXNlKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRyZXNvbHZlUGlwZVRvUHJvbWlzZSgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHRyZXNvbHZlUGlwZVRvUHJvbWlzZSA9IHJlc29sdmU7XG5cdFx0XHRyZWplY3RQaXBlVG9Qcm9taXNlID0gcmVqZWN0O1xuXG5cdFx0XHRyZWFkZXIgPSB0aGlzLmdldFJlYWRlcigpO1xuXHRcdFx0cmVhZGVyLmNsb3NlZC5jYXRjaCgocmVhc29uOiBhbnkpID0+IHtcblx0XHRcdFx0Ly8gYWJvcnREZXN0XG5cdFx0XHRcdGlmICghb3B0aW9ucy5wcmV2ZW50QWJvcnQpIHtcblx0XHRcdFx0XHRkZXN0LmFib3J0KHJlYXNvbik7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmVqZWN0UGlwZVRvUHJvbWlzZShyZWFzb24pO1xuXHRcdFx0fSk7XG5cblx0XHRcdGRlc3QuY2xvc2VkLnRoZW4oXG5cdFx0XHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAoIWNsb3NlZFB1cnBvc2VmdWxseSkge1xuXHRcdFx0XHRcdFx0Y2FuY2VsU291cmNlKG5ldyBUeXBlRXJyb3IoJ2Rlc3RpbmF0aW9uIGlzIGNsb3Npbmcgb3IgY2xvc2VkIGFuZCBjYW5ub3QgYmUgcGlwZWQgdG8gYW55bW9yZScpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGNhbmNlbFNvdXJjZVxuXHRcdFx0KTtcblx0XHRcdGRvUGlwZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gUmVxdWVzdFJlYWRhYmxlU3RyZWFtUHVsbFxuXHRwdWxsKCk6IHZvaWQge1xuXHRcdGlmICghdGhpcy5fYWxsb3dQdWxsKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX3B1bGxpbmdQcm9taXNlKSB7XG5cdFx0XHR0aGlzLnB1bGxTY2hlZHVsZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5fcHVsbGluZ1Byb21pc2UudGhlbigoKSA9PiB7XG5cdFx0XHRcdHRoaXMucHVsbFNjaGVkdWxlZCA9IGZhbHNlO1xuXHRcdFx0XHR0aGlzLnB1bGwoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5fcHVsbGluZ1Byb21pc2UgPSB1dGlsLnByb21pc2VJbnZva2VPck5vb3AodGhpcy5fdW5kZXJseWluZ1NvdXJjZSwgJ3B1bGwnLCBbIHRoaXMuY29udHJvbGxlciBdKTtcblx0XHR0aGlzLl9wdWxsaW5nUHJvbWlzZS50aGVuKCgpID0+IHtcblx0XHRcdHRoaXMuX3B1bGxpbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuXHRcdH0sIChlcnJvcjogRXJyb3IpID0+IHtcblx0XHRcdHRoaXMuZXJyb3IoZXJyb3IpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIHRoZSBzdHJlYW0gYmUgY2xvc2VkLiAgVGhpcyBtZXRob2QgYWxsb3dzIHRoZSBxdWV1ZSB0byBiZSBlbXB0aWVkIGJlZm9yZSB0aGUgc3RyZWFtIGNsb3Nlcy5cblx0ICpcblx0ICovXG5cdC8vIDMuNS4zLiBDbG9zZVJlYWRhYmxlU3RyZWFtICggc3RyZWFtIClcblx0cmVxdWVzdENsb3NlKCk6IHZvaWQge1xuXHRcdGlmICh0aGlzLmNsb3NlUmVxdWVzdGVkIHx8IHRoaXMuc3RhdGUgIT09IFN0YXRlLlJlYWRhYmxlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5jbG9zZVJlcXVlc3RlZCA9IHRydWU7XG5cblx0XHRpZiAodGhpcy5xdWV1ZS5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGVlIGEgcmVhZGFibGUgc3RyZWFtLCByZXR1cm5pbmcgYSB0d28tZWxlbWVudCBhcnJheSBjb250YWluaW5nXG5cdCAqIHRoZSB0d28gcmVzdWx0aW5nIFJlYWRhYmxlU3RyZWFtIGluc3RhbmNlc1xuXHQgKi9cblx0Ly8gVGVlUmVhZGFibGVTdHJlYW1cblx0dGVlKCk6IFsgUmVhZGFibGVTdHJlYW08VD4sIFJlYWRhYmxlU3RyZWFtPFQ+IF0ge1xuXHRcdGlmICghdGhpcy5yZWFkYWJsZSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignMy4yLjQuNS0xOiBtdXN0IGJlIGEgUmVhZGFibGVTcmVhbScpO1xuXHRcdH1cblxuXHRcdGxldCBicmFuY2gxOiBSZWFkYWJsZVN0cmVhbTxUPjtcblx0XHRsZXQgYnJhbmNoMjogUmVhZGFibGVTdHJlYW08VD47XG5cblx0XHRjb25zdCByZWFkZXIgPSB0aGlzLmdldFJlYWRlcigpO1xuXHRcdGNvbnN0IHRlZVN0YXRlOiBhbnkgPSB7XG5cdFx0XHRjbG9zZWRPckVycm9yZWQ6IGZhbHNlLFxuXHRcdFx0Y2FuY2VsZWQxOiBmYWxzZSxcblx0XHRcdGNhbmNlbGVkMjogZmFsc2UsXG5cdFx0XHRyZWFzb24xOiB1bmRlZmluZWQsXG5cdFx0XHRyZWFzb24yOiB1bmRlZmluZWRcblx0XHR9O1xuXHRcdHRlZVN0YXRlLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXHRcdFx0dGVlU3RhdGUuX3Jlc29sdmUgPSByZXNvbHZlO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgY3JlYXRlQ2FuY2VsRnVuY3Rpb24gPSAoYnJhbmNoOiBudW1iZXIpID0+IHtcblx0XHRcdHJldHVybiAocmVhc29uPzogYW55KTogUHJvbWlzZTx2b2lkPiA9PiB7XG5cdFx0XHRcdHRlZVN0YXRlWydjYW5jZWxlZCcgKyBicmFuY2hdID0gdHJ1ZTtcblx0XHRcdFx0dGVlU3RhdGVbJ3JlYXNvbicgKyBicmFuY2hdID0gcmVhc29uO1xuXHRcdFx0XHRpZiAodGVlU3RhdGVbJ2NhbmNlbGVkJyArIChicmFuY2ggPT09IDEgPyAyIDogMSldKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2FuY2VsUmVzdWx0ID0gdGhpcy5fY2FuY2VsKFt0ZWVTdGF0ZS5yZWFzb24xLCB0ZWVTdGF0ZS5yZWFzb24yXSk7XG5cdFx0XHRcdFx0dGVlU3RhdGUuX3Jlc29sdmUoY2FuY2VsUmVzdWx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdGVlU3RhdGUucHJvbWlzZTtcblx0XHRcdH07XG5cdFx0fTtcblxuXHRcdGNvbnN0IHB1bGwgPSBmdW5jdGlvbiAoY29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPFQ+KSB7XG5cdFx0XHRyZXR1cm4gcmVhZGVyLnJlYWQoKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQ6IGFueSkge1xuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcblx0XHRcdFx0Y29uc3QgZG9uZSA9IHJlc3VsdC5kb25lO1xuXG5cdFx0XHRcdGlmIChkb25lICYmICF0ZWVTdGF0ZS5jbG9zZWRPckVycm9yZWQpIHtcblx0XHRcdFx0XHRicmFuY2gxLnJlcXVlc3RDbG9zZSgpO1xuXHRcdFx0XHRcdGJyYW5jaDIucmVxdWVzdENsb3NlKCk7XG5cblx0XHRcdFx0XHR0ZWVTdGF0ZS5jbG9zZWRPckVycm9yZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHRlZVN0YXRlLmNsb3NlZE9yRXJyb3JlZCkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghdGVlU3RhdGUuY2FuY2VsZWQxKSB7XG5cdFx0XHRcdFx0YnJhbmNoMS5lbnF1ZXVlKHZhbHVlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghdGVlU3RhdGUuY2FuY2VsZWQyKSB7XG5cdFx0XHRcdFx0YnJhbmNoMi5lbnF1ZXVlKHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdGNvbnN0IGNhbmNlbDEgPSBjcmVhdGVDYW5jZWxGdW5jdGlvbigxKTtcblx0XHRjb25zdCBjYW5jZWwyID0gY3JlYXRlQ2FuY2VsRnVuY3Rpb24oMik7XG5cdFx0Y29uc3QgdW5kZXJseWluZ1NvdXJjZTE6IFNvdXJjZTxUPiA9IDxTb3VyY2U8VD4+IHtcblx0XHRcdHB1bGw6IHB1bGwsXG5cdFx0XHRjYW5jZWw6IGNhbmNlbDFcblx0XHR9O1xuXHRcdGJyYW5jaDEgPSBuZXcgUmVhZGFibGVTdHJlYW0odW5kZXJseWluZ1NvdXJjZTEpO1xuXG5cdFx0Y29uc3QgdW5kZXJseWluZ1NvdXJjZTI6IFNvdXJjZTxUPiA9IDxTb3VyY2U8VD4+IHtcblx0XHRcdHB1bGw6IHB1bGwsXG5cdFx0XHRjYW5jZWw6IGNhbmNlbDJcblx0XHR9O1xuXHRcdGJyYW5jaDIgPSBuZXcgUmVhZGFibGVTdHJlYW0odW5kZXJseWluZ1NvdXJjZTIpO1xuXG5cdFx0cmVhZGVyLmNsb3NlZC5jYXRjaChmdW5jdGlvbiAocjogYW55KSB7XG5cdFx0XHRpZiAodGVlU3RhdGUuY2xvc2VkT3JFcnJvcmVkKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0YnJhbmNoMS5lcnJvcihyKTtcblx0XHRcdGJyYW5jaDIuZXJyb3Iocik7XG5cdFx0XHR0ZWVTdGF0ZS5jbG9zZWRPckVycm9yZWQgPSB0cnVlO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFsgYnJhbmNoMSwgYnJhbmNoMiBdO1xuXHR9XG59XG4iXX0=