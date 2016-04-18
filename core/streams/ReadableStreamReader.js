(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise', './ReadableStream'], factory);
    }
})(function (require, exports) {
    "use strict";
    const Promise_1 = require('../Promise');
    const ReadableStream_1 = require('./ReadableStream');
    function isReadableStreamReader(readableStreamReader) {
        return Object.prototype.hasOwnProperty.call(readableStreamReader, '_ownerReadableStream');
    }
    /**
     * This class provides the interface for reading data from a stream. A reader can by acquired by calling
     * {@link ReadableStream#getReader}. A {@link ReadableStream} can only have a single reader at any time. A reader can
     * be released from the stream by calling {@link ReadableStreamReader.releaseLock}. If the stream still has data, a new
     * reader can be acquired to read from the stream.
     */
    class ReadableStreamReader {
        constructor(stream) {
            if (!stream.readable) {
                throw new TypeError('3.4.3-1: stream must be a ReadableStream');
            }
            if (stream.locked) {
                throw new TypeError('3.4.3-2: stream cannot be locked');
            }
            stream.reader = this;
            this._ownerReadableStream = stream;
            this.state = ReadableStream_1.State.Readable;
            this._storedError = undefined;
            this._readRequests = [];
            this._closedPromise = new Promise_1.default((resolve, reject) => {
                this._resolveClosedPromise = resolve;
                this._rejectClosedPromise = reject;
            });
        }
        get closed() {
            return this._closedPromise;
        }
        /**
         * Cancel a stream. The reader is released and the stream is closed. {@link ReadableStream.Source#cancel} is
         * called with the provided `reason`.
         *
         * @param reason The reason for canceling the stream
         */
        cancel(reason) {
            if (!isReadableStreamReader(this)) {
                return Promise_1.default.reject(new TypeError('3.4.4.2-1: Must be a ReadableStreamReader instance'));
            }
            if (this.state === ReadableStream_1.State.Closed) {
                return Promise_1.default.resolve();
            }
            if (this.state === ReadableStream_1.State.Errored) {
                return Promise_1.default.reject(this._storedError);
            }
            if (this._ownerReadableStream && this._ownerReadableStream.state === ReadableStream_1.State.Readable) {
                return this._ownerReadableStream.cancel(reason);
            }
            // 3.4.4.2-4,5 - the spec calls for this to throw an error. We have changed it to reject instead
            return Promise_1.default.reject(new TypeError('3.4.4.2-4,5: Cannot cancel ReadableStreamReader'));
        }
        /**
         * Read data from the stream.
         *
         * @returns A promise that resolves to a {@link ReadResult}.
         */
        // This method also incorporates the ReadFromReadableStreamReader from 3.5.12.
        read() {
            if (!isReadableStreamReader(this)) {
                return Promise_1.default.reject(new TypeError('3.4.4.3-1: Must be a ReadableStreamReader instance'));
            }
            if (this.state === ReadableStream_1.State.Closed) {
                return Promise_1.default.resolve({
                    value: undefined,
                    done: true
                });
            }
            if (this.state === ReadableStream_1.State.Errored) {
                return Promise_1.default.reject(new TypeError('3.5.12-2: reader state is Errored'));
            }
            const stream = this._ownerReadableStream;
            if (!stream || stream.state !== ReadableStream_1.State.Readable) {
                throw new TypeError('3.5.12-3,4: Stream must exist and be readable');
            }
            const queue = stream.queue;
            if (queue.length > 0) {
                const chunk = queue.dequeue();
                if (stream.closeRequested && !queue.length) {
                    stream.close();
                }
                else {
                    stream.pull();
                }
                return Promise_1.default.resolve({
                    value: chunk,
                    done: false
                });
            }
            else {
                let resolve, reject;
                const readPromise = new Promise_1.default(function (_resolve, _reject) {
                    resolve = _resolve;
                    reject = _reject;
                });
                this._readRequests.push({
                    promise: readPromise,
                    resolve: resolve,
                    reject: reject
                });
                stream.pull();
                return readPromise;
            }
        }
        /**
         * Release a reader's lock on the corresponding stream. The reader will no longer be readable. Further reading on
         * the stream can be done by acquiring a new `ReadableStreamReader`.
         */
        // 3.4.4.4. releaseLock()
        releaseLock() {
            if (!isReadableStreamReader(this)) {
                throw new TypeError('3.4.4.4-1: Must be a ReadableStreamReader isntance');
            }
            if (!this._ownerReadableStream) {
                return;
            }
            if (this._readRequests.length) {
                throw new TypeError('3.4.4.4-3: Tried to release a reader lock when that reader has pending read calls un-settled');
            }
            this.release();
        }
        // 3.5.13. ReleaseReadableStreamReader ( reader )
        release() {
            let request;
            if (this._ownerReadableStream.state === ReadableStream_1.State.Errored) {
                this.state = ReadableStream_1.State.Errored;
                const e = this._ownerReadableStream.storedError;
                this._storedError = e;
                this._rejectClosedPromise(e);
                for (request of this._readRequests) {
                    request.reject(e);
                }
            }
            else {
                this.state = ReadableStream_1.State.Closed;
                this._resolveClosedPromise();
                for (request of this._readRequests) {
                    request.resolve({
                        value: undefined,
                        done: true
                    });
                }
            }
            this._readRequests = [];
            this._ownerReadableStream.reader = undefined;
            this._ownerReadableStream = undefined;
        }
        /**
         * Resolves a pending read request, if any, with the provided chunk.
         * @param chunk
         * @return boolean True if a read request was resolved.
         */
        resolveReadRequest(chunk) {
            if (this._readRequests.length > 0) {
                this._readRequests.shift().resolve({
                    value: chunk,
                    done: false
                });
                return true;
            }
            return false;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ReadableStreamReader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhZGFibGVTdHJlYW1SZWFkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9SZWFkYWJsZVN0cmVhbVJlYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFBQSwwQkFBb0IsWUFBWSxDQUFDLENBQUE7SUFDakMsaUNBQXNDLGtCQUFrQixDQUFDLENBQUE7SUFpQnpELGdDQUFtQyxvQkFBNkM7UUFDL0UsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0lBQzNGLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNIO1FBZUMsWUFBWSxNQUF5QjtZQUNwQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixNQUFNLElBQUksU0FBUyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDakUsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixNQUFNLElBQUksU0FBUyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7WUFDekQsQ0FBQztZQUVELE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxNQUFNLENBQUM7WUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRyxzQkFBSyxDQUFDLFFBQVEsQ0FBQztZQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQztZQUM5QixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksaUJBQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNO2dCQUN2RCxJQUFJLENBQUMscUJBQXFCLEdBQUcsT0FBTyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsTUFB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UUFDSCxrQkFBa0IsQ0FBQyxLQUFRO1lBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDO29CQUNsQyxLQUFLLEVBQUUsS0FBSztvQkFDWixJQUFJLEVBQUUsS0FBSztpQkFDWCxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNiLENBQUM7WUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2QsQ0FBQztJQUNGLENBQUM7SUEzTEQ7MENBMkxDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvbWlzZSBmcm9tICcuLi9Qcm9taXNlJztcbmltcG9ydCBSZWFkYWJsZVN0cmVhbSwgeyBTdGF0ZSB9IGZyb20gJy4vUmVhZGFibGVTdHJlYW0nO1xuXG5pbnRlcmZhY2UgUmVhZFJlcXVlc3Q8VD4ge1xuXHRwcm9taXNlOiBQcm9taXNlPFJlYWRSZXN1bHQ8VD4+O1xuXHRyZXNvbHZlOiAodmFsdWU6IFJlYWRSZXN1bHQ8VD4pID0+IHZvaWQ7XG5cdHJlamVjdDogKHJlYXNvbjogYW55KSA9PiB2b2lkO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIG9iamVjdHMgcmV0dXJuZWQgYnkge0BsaW5rIFJlYWRhYmxlU3RyZWFtUmVhZGVyI3JlYWR9LiBUaGUgZGF0YSBpcyBhY2Nlc3NpYmxlIG9uIHRoZSBgdmFsdWVgIHByb3BlcnR5LlxuICogSWYgdGhlIGBkb25lYCBwcm9wZXJ0eSBpcyB0cnVlLCB0aGUgc3RyZWFtIGhhcyBubyBtb3JlIGRhdGEgdG8gcHJvdmlkZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWFkUmVzdWx0PFQ+IHtcblx0dmFsdWU6IFQ7XG5cdGRvbmU6IGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIGlzUmVhZGFibGVTdHJlYW1SZWFkZXI8VD4ocmVhZGFibGVTdHJlYW1SZWFkZXI6IFJlYWRhYmxlU3RyZWFtUmVhZGVyPFQ+KTogYm9vbGVhbiB7XG5cdHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmVhZGFibGVTdHJlYW1SZWFkZXIsICdfb3duZXJSZWFkYWJsZVN0cmVhbScpO1xufVxuXG4vKipcbiAqIFRoaXMgY2xhc3MgcHJvdmlkZXMgdGhlIGludGVyZmFjZSBmb3IgcmVhZGluZyBkYXRhIGZyb20gYSBzdHJlYW0uIEEgcmVhZGVyIGNhbiBieSBhY3F1aXJlZCBieSBjYWxsaW5nXG4gKiB7QGxpbmsgUmVhZGFibGVTdHJlYW0jZ2V0UmVhZGVyfS4gQSB7QGxpbmsgUmVhZGFibGVTdHJlYW19IGNhbiBvbmx5IGhhdmUgYSBzaW5nbGUgcmVhZGVyIGF0IGFueSB0aW1lLiBBIHJlYWRlciBjYW5cbiAqIGJlIHJlbGVhc2VkIGZyb20gdGhlIHN0cmVhbSBieSBjYWxsaW5nIHtAbGluayBSZWFkYWJsZVN0cmVhbVJlYWRlci5yZWxlYXNlTG9ja30uIElmIHRoZSBzdHJlYW0gc3RpbGwgaGFzIGRhdGEsIGEgbmV3XG4gKiByZWFkZXIgY2FuIGJlIGFjcXVpcmVkIHRvIHJlYWQgZnJvbSB0aGUgc3RyZWFtLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWFkYWJsZVN0cmVhbVJlYWRlcjxUPiB7XG5cdGdldCBjbG9zZWQoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuX2Nsb3NlZFByb21pc2U7XG5cdH1cblxuXHRwcml2YXRlIF9jbG9zZWRQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXHRwcml2YXRlIF9zdG9yZWRFcnJvcjogRXJyb3I7XG5cdHByaXZhdGUgX3JlYWRSZXF1ZXN0czogUmVhZFJlcXVlc3Q8VD5bXTtcblx0cHJpdmF0ZSBfcmVzb2x2ZUNsb3NlZFByb21pc2U6ICgpID0+IHZvaWQ7XG5cdHByaXZhdGUgX3JlamVjdENsb3NlZFByb21pc2U6IChlcnJvcjogRXJyb3IpID0+IHZvaWQ7XG5cblx0cHJvdGVjdGVkIF9vd25lclJlYWRhYmxlU3RyZWFtOiBSZWFkYWJsZVN0cmVhbTxUPjtcblxuXHRzdGF0ZTogU3RhdGU7XG5cblx0Y29uc3RydWN0b3Ioc3RyZWFtOiBSZWFkYWJsZVN0cmVhbTxUPikge1xuXHRcdGlmICghc3RyZWFtLnJlYWRhYmxlKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCczLjQuMy0xOiBzdHJlYW0gbXVzdCBiZSBhIFJlYWRhYmxlU3RyZWFtJyk7XG5cdFx0fVxuXG5cdFx0aWYgKHN0cmVhbS5sb2NrZWQpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJzMuNC4zLTI6IHN0cmVhbSBjYW5ub3QgYmUgbG9ja2VkJyk7XG5cdFx0fVxuXG5cdFx0c3RyZWFtLnJlYWRlciA9IHRoaXM7XG5cdFx0dGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbSA9IHN0cmVhbTtcblx0XHR0aGlzLnN0YXRlID0gU3RhdGUuUmVhZGFibGU7XG5cdFx0dGhpcy5fc3RvcmVkRXJyb3IgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5fcmVhZFJlcXVlc3RzID0gW107XG5cdFx0dGhpcy5fY2xvc2VkUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHRoaXMuX3Jlc29sdmVDbG9zZWRQcm9taXNlID0gcmVzb2x2ZTtcblx0XHRcdHRoaXMuX3JlamVjdENsb3NlZFByb21pc2UgPSByZWplY3Q7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FuY2VsIGEgc3RyZWFtLiBUaGUgcmVhZGVyIGlzIHJlbGVhc2VkIGFuZCB0aGUgc3RyZWFtIGlzIGNsb3NlZC4ge0BsaW5rIFJlYWRhYmxlU3RyZWFtLlNvdXJjZSNjYW5jZWx9IGlzXG5cdCAqIGNhbGxlZCB3aXRoIHRoZSBwcm92aWRlZCBgcmVhc29uYC5cblx0ICpcblx0ICogQHBhcmFtIHJlYXNvbiBUaGUgcmVhc29uIGZvciBjYW5jZWxpbmcgdGhlIHN0cmVhbVxuXHQgKi9cblx0Y2FuY2VsKHJlYXNvbjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKCFpc1JlYWRhYmxlU3RyZWFtUmVhZGVyKHRoaXMpKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignMy40LjQuMi0xOiBNdXN0IGJlIGEgUmVhZGFibGVTdHJlYW1SZWFkZXIgaW5zdGFuY2UnKSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkNsb3NlZCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnN0YXRlID09PSBTdGF0ZS5FcnJvcmVkKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QodGhpcy5fc3RvcmVkRXJyb3IpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtICYmIHRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0uc3RhdGUgPT09IFN0YXRlLlJlYWRhYmxlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbS5jYW5jZWwocmVhc29uKTtcblx0XHR9XG5cblx0XHQvLyAzLjQuNC4yLTQsNSAtIHRoZSBzcGVjIGNhbGxzIGZvciB0aGlzIHRvIHRocm93IGFuIGVycm9yLiBXZSBoYXZlIGNoYW5nZWQgaXQgdG8gcmVqZWN0IGluc3RlYWRcblx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignMy40LjQuMi00LDU6IENhbm5vdCBjYW5jZWwgUmVhZGFibGVTdHJlYW1SZWFkZXInKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZCBkYXRhIGZyb20gdGhlIHN0cmVhbS5cblx0ICpcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSB7QGxpbmsgUmVhZFJlc3VsdH0uXG5cdCAqL1xuXHQvLyBUaGlzIG1ldGhvZCBhbHNvIGluY29ycG9yYXRlcyB0aGUgUmVhZEZyb21SZWFkYWJsZVN0cmVhbVJlYWRlciBmcm9tIDMuNS4xMi5cblx0cmVhZCgpOiBQcm9taXNlPFJlYWRSZXN1bHQ8VD4+IHtcblx0XHRpZiAoIWlzUmVhZGFibGVTdHJlYW1SZWFkZXIodGhpcykpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdDxSZWFkUmVzdWx0PFQ+PihuZXcgVHlwZUVycm9yKCczLjQuNC4zLTE6IE11c3QgYmUgYSBSZWFkYWJsZVN0cmVhbVJlYWRlciBpbnN0YW5jZScpKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gU3RhdGUuQ2xvc2VkKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcblx0XHRcdFx0dmFsdWU6IHVuZGVmaW5lZCxcblx0XHRcdFx0ZG9uZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IFN0YXRlLkVycm9yZWQpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdDxSZWFkUmVzdWx0PFQ+PihuZXcgVHlwZUVycm9yKCczLjUuMTItMjogcmVhZGVyIHN0YXRlIGlzIEVycm9yZWQnKSk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc3RyZWFtID0gdGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbTtcblx0XHRpZiAoIXN0cmVhbSB8fCBzdHJlYW0uc3RhdGUgIT09IFN0YXRlLlJlYWRhYmxlKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCczLjUuMTItMyw0OiBTdHJlYW0gbXVzdCBleGlzdCBhbmQgYmUgcmVhZGFibGUnKTtcblx0XHR9XG5cblx0XHRjb25zdCBxdWV1ZSA9IHN0cmVhbS5xdWV1ZTtcblx0XHRpZiAocXVldWUubGVuZ3RoID4gMCkge1xuXHRcdFx0Y29uc3QgY2h1bmsgPSBxdWV1ZS5kZXF1ZXVlKCk7XG5cdFx0XHRpZiAoc3RyZWFtLmNsb3NlUmVxdWVzdGVkICYmICFxdWV1ZS5sZW5ndGgpIHtcblx0XHRcdFx0c3RyZWFtLmNsb3NlKCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0c3RyZWFtLnB1bGwoKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuXHRcdFx0XHR2YWx1ZTogY2h1bmssXG5cdFx0XHRcdGRvbmU6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRsZXQgcmVzb2x2ZTogYW55LCByZWplY3Q6IGFueTtcblx0XHRcdGNvbnN0IHJlYWRQcm9taXNlID0gbmV3IFByb21pc2U8UmVhZFJlc3VsdDxUPj4oZnVuY3Rpb24gKF9yZXNvbHZlLCBfcmVqZWN0KSB7XG5cdFx0XHRcdHJlc29sdmUgPSBfcmVzb2x2ZTtcblx0XHRcdFx0cmVqZWN0ID0gX3JlamVjdDtcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLl9yZWFkUmVxdWVzdHMucHVzaCh7XG5cdFx0XHRcdHByb21pc2U6IHJlYWRQcm9taXNlLFxuXHRcdFx0XHRyZXNvbHZlOiByZXNvbHZlLFxuXHRcdFx0XHRyZWplY3Q6IHJlamVjdFxuXHRcdFx0fSk7XG5cdFx0XHRzdHJlYW0ucHVsbCgpO1xuXG5cdFx0XHRyZXR1cm4gcmVhZFByb21pc2U7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlbGVhc2UgYSByZWFkZXIncyBsb2NrIG9uIHRoZSBjb3JyZXNwb25kaW5nIHN0cmVhbS4gVGhlIHJlYWRlciB3aWxsIG5vIGxvbmdlciBiZSByZWFkYWJsZS4gRnVydGhlciByZWFkaW5nIG9uXG5cdCAqIHRoZSBzdHJlYW0gY2FuIGJlIGRvbmUgYnkgYWNxdWlyaW5nIGEgbmV3IGBSZWFkYWJsZVN0cmVhbVJlYWRlcmAuXG5cdCAqL1xuXHQvLyAzLjQuNC40LiByZWxlYXNlTG9jaygpXG5cdHJlbGVhc2VMb2NrKCk6IHZvaWQge1xuXHRcdGlmICghaXNSZWFkYWJsZVN0cmVhbVJlYWRlcih0aGlzKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignMy40LjQuNC0xOiBNdXN0IGJlIGEgUmVhZGFibGVTdHJlYW1SZWFkZXIgaXNudGFuY2UnKTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fcmVhZFJlcXVlc3RzLmxlbmd0aCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignMy40LjQuNC0zOiBUcmllZCB0byByZWxlYXNlIGEgcmVhZGVyIGxvY2sgd2hlbiB0aGF0IHJlYWRlciBoYXMgcGVuZGluZyByZWFkIGNhbGxzIHVuLXNldHRsZWQnKTtcblx0XHR9XG5cblx0XHR0aGlzLnJlbGVhc2UoKTtcblx0fVxuXG5cdC8vIDMuNS4xMy4gUmVsZWFzZVJlYWRhYmxlU3RyZWFtUmVhZGVyICggcmVhZGVyIClcblx0cmVsZWFzZSgpOiB2b2lkIHtcblx0XHRsZXQgcmVxdWVzdDogYW55O1xuXHRcdGlmICh0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLnN0YXRlID09PSBTdGF0ZS5FcnJvcmVkKSB7XG5cdFx0XHR0aGlzLnN0YXRlID0gU3RhdGUuRXJyb3JlZDtcblxuXHRcdFx0Y29uc3QgZSA9IHRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0uc3RvcmVkRXJyb3I7XG5cdFx0XHR0aGlzLl9zdG9yZWRFcnJvciA9IGU7XG5cdFx0XHR0aGlzLl9yZWplY3RDbG9zZWRQcm9taXNlKGUpO1xuXG5cdFx0XHRmb3IgKHJlcXVlc3Qgb2YgdGhpcy5fcmVhZFJlcXVlc3RzKSB7XG5cdFx0XHRcdHJlcXVlc3QucmVqZWN0KGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuc3RhdGUgPSBTdGF0ZS5DbG9zZWQ7XG5cdFx0XHR0aGlzLl9yZXNvbHZlQ2xvc2VkUHJvbWlzZSgpO1xuXHRcdFx0Zm9yIChyZXF1ZXN0IG9mIHRoaXMuX3JlYWRSZXF1ZXN0cykge1xuXHRcdFx0XHRyZXF1ZXN0LnJlc29sdmUoe1xuXHRcdFx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0ZG9uZTogdHJ1ZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9yZWFkUmVxdWVzdHMgPSBbXTtcblx0XHR0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLnJlYWRlciA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIGEgcGVuZGluZyByZWFkIHJlcXVlc3QsIGlmIGFueSwgd2l0aCB0aGUgcHJvdmlkZWQgY2h1bmsuXG5cdCAqIEBwYXJhbSBjaHVua1xuXHQgKiBAcmV0dXJuIGJvb2xlYW4gVHJ1ZSBpZiBhIHJlYWQgcmVxdWVzdCB3YXMgcmVzb2x2ZWQuXG5cdCAqL1xuXHRyZXNvbHZlUmVhZFJlcXVlc3QoY2h1bms6IFQpOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy5fcmVhZFJlcXVlc3RzLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMuX3JlYWRSZXF1ZXN0cy5zaGlmdCgpLnJlc29sdmUoe1xuXHRcdFx0XHR2YWx1ZTogY2h1bmssXG5cdFx0XHRcdGRvbmU6IGZhbHNlXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cbiJdfQ==