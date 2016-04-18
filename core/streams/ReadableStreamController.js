(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './ReadableStream'], factory);
    }
})(function (require, exports) {
    "use strict";
    const ReadableStream_1 = require('./ReadableStream');
    // 3.5.9-1 has been ignored
    function isReadableStreamController(x) {
        return Object.prototype.hasOwnProperty.call(x, '_controlledReadableStream');
    }
    exports.isReadableStreamController = isReadableStreamController;
    class ReadableStreamController {
        constructor(stream) {
            if (!stream.readable) {
                throw new TypeError('3.3.3-1: ReadableStreamController can only be constructed with a ReadableStream instance');
            }
            if (stream.controller !== undefined) {
                throw new TypeError('ReadableStreamController instances can only be created by the ReadableStream constructor');
            }
            this._controlledReadableStream = stream;
        }
        /**
         * Returns a number indicating how much additional data can be pushed by the source to the stream's queue before it
         * exceeds its `highWaterMark`. An underlying source should use this information to determine when and how to apply
         * backpressure.
         *
         * @returns The stream's strategy's `highWaterMark` value minus the queue size
         */
        // 3.3.4.1. get desiredSize
        get desiredSize() {
            return this._controlledReadableStream.desiredSize;
        }
        /**
         * A source should call this method when it has no more data to provide. After this method is called, the stream
         * will provided any queued data to the reader, but once the stream's queue is exhausted the stream will be closed
         * and no more data can be read from it.
         */
        close() {
            if (!isReadableStreamController(this)) {
                throw new TypeError('3.3.4.2-1: ReadableStreamController#close can only be used on a ReadableStreamController');
            }
            const stream = this._controlledReadableStream;
            if (stream.closeRequested) {
                throw new TypeError('3.3.4.2-3: The stream has already been closed; do not close it again!');
            }
            if (stream.state === ReadableStream_1.State.Errored) {
                throw new TypeError('3.3.4.2-4: The stream is in an errored state and cannot be closed');
            }
            return stream.requestClose();
        }
        /**
         * A source should call this method to provide data to the stream.
         *
         * @param chunk The data to provide to the stream
         */
        enqueue(chunk) {
            if (!isReadableStreamController(this)) {
                throw new TypeError('3.3.4.3-1: ReadableStreamController#enqueue can only be used on a ReadableStreamController');
            }
            const stream = this._controlledReadableStream;
            if (stream.state === ReadableStream_1.State.Errored) {
                throw stream.storedError;
            }
            if (stream.closeRequested) {
                throw new TypeError('3.3.4.3-4: stream is draining');
            }
            stream.enqueue(chunk);
        }
        /**
         * A source should call this method to indicate an error condition to the stream that irreparably disrupts the
         * source's (and thus the stream's) ability to provide all the intended data.
         *
         * @param error An error object representing the error condition in the source
         */
        error(error) {
            if (!isReadableStreamController(this)) {
                throw new TypeError('3.3.4.3-1: ReadableStreamController#enqueue can only be used on a ReadableStreamController');
            }
            if (this._controlledReadableStream.state !== ReadableStream_1.State.Readable) {
                throw new TypeError(`3.3.4.3-2: the stream is ${this._controlledReadableStream.state} and so cannot be errored`);
            }
            // return errorReadableStream(this._controlledReadableStream, e);
            this._controlledReadableStream.error(error);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ReadableStreamController;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhZGFibGVTdHJlYW1Db250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbXMvUmVhZGFibGVTdHJlYW1Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUFBLGlDQUFzQyxrQkFBa0IsQ0FBQyxDQUFBO0lBRXpELDJCQUEyQjtJQUMzQixvQ0FBMkMsQ0FBTTtRQUNoRCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFGZSxrQ0FBMEIsNkJBRXpDLENBQUE7SUFFRDtRQWVDLFlBQVksTUFBeUI7WUFDcEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsTUFBTSxJQUFJLFNBQVMsQ0FBQywwRkFBMEYsQ0FBQyxDQUFDO1lBQ2pILENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sSUFBSSxTQUFTLENBQUMsMEZBQTBGLENBQUMsQ0FBQztZQUNqSCxDQUFDO1lBRUQsSUFBSSxDQUFDLHlCQUF5QixHQUFHLE1BQU0sQ0FBQztRQUN6QyxDQUFDO1FBdEJEOzs7Ozs7V0FNRztRQUNILDJCQUEyQjtRQUMzQixJQUFJLFdBQVc7WUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsQ0FBQztRQUNuRCxDQUFDO1FBY0Q7Ozs7V0FJRztRQUNILEtBQUs7WUFDSixFQUFFLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxJQUFJLFNBQVMsQ0FBQywwRkFBMEYsQ0FBQyxDQUFDO1lBQ2pILENBQUM7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUM7WUFDOUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLE1BQU0sSUFBSSxTQUFTLENBQUMsdUVBQXVFLENBQUMsQ0FBQztZQUM5RixDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxzQkFBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sSUFBSSxTQUFTLENBQUMsbUVBQW1FLENBQUMsQ0FBQztZQUMxRixDQUFDO1lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILE9BQU8sQ0FBQyxLQUFRO1lBQ2YsRUFBRSxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sSUFBSSxTQUFTLENBQUMsNEZBQTRGLENBQUMsQ0FBQztZQUNuSCxDQUFDO1lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDO1lBRTlDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssc0JBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxNQUFNLE1BQU0sQ0FBQyxXQUFXLENBQUM7WUFDMUIsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixNQUFNLElBQUksU0FBUyxDQUFDLCtCQUErQixDQUFDLENBQUM7WUFDdEQsQ0FBQztZQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsS0FBSyxDQUFDLEtBQVk7WUFDakIsRUFBRSxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sSUFBSSxTQUFTLENBQUMsNEZBQTRGLENBQUMsQ0FBQztZQUNuSCxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssS0FBSyxzQkFBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQzdELE1BQU0sSUFBSSxTQUFTLENBQUMsNEJBQTRCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLDJCQUEyQixDQUFDLENBQUM7WUFDbEgsQ0FBQztZQUNELGlFQUFpRTtZQUNqRSxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdDLENBQUM7SUFDRixDQUFDO0lBekZEOzhDQXlGQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWRhYmxlU3RyZWFtLCB7IFN0YXRlIH0gZnJvbSAnLi9SZWFkYWJsZVN0cmVhbSc7XG5cbi8vIDMuNS45LTEgaGFzIGJlZW4gaWdub3JlZFxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVhZGFibGVTdHJlYW1Db250cm9sbGVyKHg6IGFueSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHgsICdfY29udHJvbGxlZFJlYWRhYmxlU3RyZWFtJyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlcjxUPiB7XG5cdHByaXZhdGUgX2NvbnRyb2xsZWRSZWFkYWJsZVN0cmVhbTogUmVhZGFibGVTdHJlYW08VD47XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBudW1iZXIgaW5kaWNhdGluZyBob3cgbXVjaCBhZGRpdGlvbmFsIGRhdGEgY2FuIGJlIHB1c2hlZCBieSB0aGUgc291cmNlIHRvIHRoZSBzdHJlYW0ncyBxdWV1ZSBiZWZvcmUgaXRcblx0ICogZXhjZWVkcyBpdHMgYGhpZ2hXYXRlck1hcmtgLiBBbiB1bmRlcmx5aW5nIHNvdXJjZSBzaG91bGQgdXNlIHRoaXMgaW5mb3JtYXRpb24gdG8gZGV0ZXJtaW5lIHdoZW4gYW5kIGhvdyB0byBhcHBseVxuXHQgKiBiYWNrcHJlc3N1cmUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBzdHJlYW0ncyBzdHJhdGVneSdzIGBoaWdoV2F0ZXJNYXJrYCB2YWx1ZSBtaW51cyB0aGUgcXVldWUgc2l6ZVxuXHQgKi9cblx0Ly8gMy4zLjQuMS4gZ2V0IGRlc2lyZWRTaXplXG5cdGdldCBkZXNpcmVkU2l6ZSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9jb250cm9sbGVkUmVhZGFibGVTdHJlYW0uZGVzaXJlZFNpemU7XG5cdH1cblxuXHRjb25zdHJ1Y3RvcihzdHJlYW06IFJlYWRhYmxlU3RyZWFtPFQ+KSB7XG5cdFx0aWYgKCFzdHJlYW0ucmVhZGFibGUpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJzMuMy4zLTE6IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlciBjYW4gb25seSBiZSBjb25zdHJ1Y3RlZCB3aXRoIGEgUmVhZGFibGVTdHJlYW0gaW5zdGFuY2UnKTtcblx0XHR9XG5cblx0XHRpZiAoc3RyZWFtLmNvbnRyb2xsZXIgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignUmVhZGFibGVTdHJlYW1Db250cm9sbGVyIGluc3RhbmNlcyBjYW4gb25seSBiZSBjcmVhdGVkIGJ5IHRoZSBSZWFkYWJsZVN0cmVhbSBjb25zdHJ1Y3RvcicpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NvbnRyb2xsZWRSZWFkYWJsZVN0cmVhbSA9IHN0cmVhbTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHNvdXJjZSBzaG91bGQgY2FsbCB0aGlzIG1ldGhvZCB3aGVuIGl0IGhhcyBubyBtb3JlIGRhdGEgdG8gcHJvdmlkZS4gQWZ0ZXIgdGhpcyBtZXRob2QgaXMgY2FsbGVkLCB0aGUgc3RyZWFtXG5cdCAqIHdpbGwgcHJvdmlkZWQgYW55IHF1ZXVlZCBkYXRhIHRvIHRoZSByZWFkZXIsIGJ1dCBvbmNlIHRoZSBzdHJlYW0ncyBxdWV1ZSBpcyBleGhhdXN0ZWQgdGhlIHN0cmVhbSB3aWxsIGJlIGNsb3NlZFxuXHQgKiBhbmQgbm8gbW9yZSBkYXRhIGNhbiBiZSByZWFkIGZyb20gaXQuXG5cdCAqL1xuXHRjbG9zZSgpOiB2b2lkIHtcblx0XHRpZiAoIWlzUmVhZGFibGVTdHJlYW1Db250cm9sbGVyKHRoaXMpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCczLjMuNC4yLTE6IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlciNjbG9zZSBjYW4gb25seSBiZSB1c2VkIG9uIGEgUmVhZGFibGVTdHJlYW1Db250cm9sbGVyJyk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc3RyZWFtID0gdGhpcy5fY29udHJvbGxlZFJlYWRhYmxlU3RyZWFtO1xuXHRcdGlmIChzdHJlYW0uY2xvc2VSZXF1ZXN0ZWQpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJzMuMy40LjItMzogVGhlIHN0cmVhbSBoYXMgYWxyZWFkeSBiZWVuIGNsb3NlZDsgZG8gbm90IGNsb3NlIGl0IGFnYWluIScpO1xuXHRcdH1cblxuXHRcdGlmIChzdHJlYW0uc3RhdGUgPT09IFN0YXRlLkVycm9yZWQpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJzMuMy40LjItNDogVGhlIHN0cmVhbSBpcyBpbiBhbiBlcnJvcmVkIHN0YXRlIGFuZCBjYW5ub3QgYmUgY2xvc2VkJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHN0cmVhbS5yZXF1ZXN0Q2xvc2UoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHNvdXJjZSBzaG91bGQgY2FsbCB0aGlzIG1ldGhvZCB0byBwcm92aWRlIGRhdGEgdG8gdGhlIHN0cmVhbS5cblx0ICpcblx0ICogQHBhcmFtIGNodW5rIFRoZSBkYXRhIHRvIHByb3ZpZGUgdG8gdGhlIHN0cmVhbVxuXHQgKi9cblx0ZW5xdWV1ZShjaHVuazogVCk6IHZvaWQge1xuXHRcdGlmICghaXNSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIodGhpcykpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJzMuMy40LjMtMTogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyI2VucXVldWUgY2FuIG9ubHkgYmUgdXNlZCBvbiBhIFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlcicpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHN0cmVhbSA9IHRoaXMuX2NvbnRyb2xsZWRSZWFkYWJsZVN0cmVhbTtcblxuXHRcdGlmIChzdHJlYW0uc3RhdGUgPT09IFN0YXRlLkVycm9yZWQpIHtcblx0XHRcdHRocm93IHN0cmVhbS5zdG9yZWRFcnJvcjtcblx0XHR9XG5cblx0XHRpZiAoc3RyZWFtLmNsb3NlUmVxdWVzdGVkKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCczLjMuNC4zLTQ6IHN0cmVhbSBpcyBkcmFpbmluZycpO1xuXHRcdH1cblxuXHRcdHN0cmVhbS5lbnF1ZXVlKGNodW5rKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHNvdXJjZSBzaG91bGQgY2FsbCB0aGlzIG1ldGhvZCB0byBpbmRpY2F0ZSBhbiBlcnJvciBjb25kaXRpb24gdG8gdGhlIHN0cmVhbSB0aGF0IGlycmVwYXJhYmx5IGRpc3J1cHRzIHRoZVxuXHQgKiBzb3VyY2UncyAoYW5kIHRodXMgdGhlIHN0cmVhbSdzKSBhYmlsaXR5IHRvIHByb3ZpZGUgYWxsIHRoZSBpbnRlbmRlZCBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXJyb3IgQW4gZXJyb3Igb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgZXJyb3IgY29uZGl0aW9uIGluIHRoZSBzb3VyY2Vcblx0ICovXG5cdGVycm9yKGVycm9yOiBFcnJvcik6IHZvaWQge1xuXHRcdGlmICghaXNSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIodGhpcykpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJzMuMy40LjMtMTogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyI2VucXVldWUgY2FuIG9ubHkgYmUgdXNlZCBvbiBhIFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlcicpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9jb250cm9sbGVkUmVhZGFibGVTdHJlYW0uc3RhdGUgIT09IFN0YXRlLlJlYWRhYmxlKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGAzLjMuNC4zLTI6IHRoZSBzdHJlYW0gaXMgJHt0aGlzLl9jb250cm9sbGVkUmVhZGFibGVTdHJlYW0uc3RhdGV9IGFuZCBzbyBjYW5ub3QgYmUgZXJyb3JlZGApO1xuXHRcdH1cblx0XHQvLyByZXR1cm4gZXJyb3JSZWFkYWJsZVN0cmVhbSh0aGlzLl9jb250cm9sbGVkUmVhZGFibGVTdHJlYW0sIGUpO1xuXHRcdHRoaXMuX2NvbnRyb2xsZWRSZWFkYWJsZVN0cmVhbS5lcnJvcihlcnJvcik7XG5cdH1cbn1cbiJdfQ==