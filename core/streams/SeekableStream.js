(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise', './ReadableStream', './SeekableStreamReader'], factory);
    }
})(function (require, exports) {
    "use strict";
    const Promise_1 = require('../Promise');
    const ReadableStream_1 = require('./ReadableStream');
    const SeekableStreamReader_1 = require('./SeekableStreamReader');
    class SeekableStream extends ReadableStream_1.default {
        /**
         * @param preventClose (default=true) Prevent the stream from closing when it reaches the end.
         * If true, the stream will not close when requestClose is called on the controller (which is typically done by the
         * source when it reaches its end). This allows for re-seeking in a stream that has already been read to the end.
         * The stream can be closed by calling ReadableStream#close.
         */
        constructor(underlyingSource, strategy = {}, preventClose = true) {
            super(underlyingSource, strategy);
            this.preventClose = preventClose;
        }
        getReader() {
            if (!this.readable || !this.seek) {
                throw new TypeError('Must be a SeekableStream instance');
            }
            return new SeekableStreamReader_1.default(this);
        }
        requestClose() {
            if (!this.preventClose) {
                super.requestClose();
            }
        }
        seek(position) {
            if (this._underlyingSource.seek) {
                return this._underlyingSource.seek(this.controller, position);
            }
            else {
                if (this.reader && position < this.reader.currentPosition) {
                    return Promise_1.default.reject(new Error('Stream source is not seekable; cannot seek backwards'));
                }
                else {
                    let discardNext = () => {
                        return this.reader.read().then((result) => {
                            if (result.done || this.reader.currentPosition === position) {
                                return Promise_1.default.resolve(this.reader.currentPosition);
                            }
                            else {
                                return discardNext();
                            }
                        });
                    };
                    return discardNext();
                }
            }
        }
        get strategy() {
            return this._strategy;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SeekableStream;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vla2FibGVTdHJlYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9TZWVrYWJsZVN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFDQSwwQkFBb0IsWUFBWSxDQUFDLENBQUE7SUFDakMsaUNBQXVDLGtCQUFrQixDQUFDLENBQUE7SUFFMUQsdUNBQWlDLHdCQUF3QixDQUFDLENBQUE7SUFFMUQsNkJBQStDLHdCQUFjO1FBSTVEOzs7OztXQUtHO1FBQ0gsWUFBWSxnQkFBMkIsRUFBRSxRQUFRLEdBQWdCLEVBQUUsRUFBRSxZQUFZLEdBQVksSUFBSTtZQUNoRyxNQUFNLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRWxDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLENBQUM7UUFFRCxTQUFTO1lBQ1IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLE1BQU0sSUFBSSxTQUFTLENBQUMsbUNBQW1DLENBQUMsQ0FBQztZQUMxRCxDQUFDO1lBRUQsTUFBTSxDQUFDLElBQUksOEJBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVELFlBQVk7WUFDWCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdEIsQ0FBQztRQUNGLENBQUM7UUFFRCxJQUFJLENBQUMsUUFBZ0I7WUFDcEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDL0QsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNMLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztvQkFDM0QsTUFBTSxDQUFDLGlCQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUMsQ0FBQztnQkFDMUYsQ0FBQztnQkFDRCxJQUFJLENBQUMsQ0FBQztvQkFDTCxJQUFJLFdBQVcsR0FBRzt3QkFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBcUI7NEJBQ3BELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztnQ0FDN0QsTUFBTSxDQUFDLGlCQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7NEJBQ3JELENBQUM7NEJBQ0QsSUFBSSxDQUFDLENBQUM7Z0NBQ0wsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDOzRCQUN0QixDQUFDO3dCQUNGLENBQUMsQ0FBQyxDQUFDO29CQUNKLENBQUMsQ0FBQztvQkFFRixNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3RCLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVELElBQUksUUFBUTtZQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3ZCLENBQUM7SUFDRixDQUFDO0lBMUREO29DQTBEQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3RyYXRlZ3kgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IFByb21pc2UgZnJvbSAnLi4vUHJvbWlzZSc7XG5pbXBvcnQgUmVhZGFibGVTdHJlYW0sIHsgU291cmNlIH0gZnJvbSAnLi9SZWFkYWJsZVN0cmVhbSc7XG5pbXBvcnQgeyBSZWFkUmVzdWx0IH0gZnJvbSAnLi9SZWFkYWJsZVN0cmVhbVJlYWRlcic7XG5pbXBvcnQgU2Vla2FibGVTdHJlYW1SZWFkZXIgZnJvbSAnLi9TZWVrYWJsZVN0cmVhbVJlYWRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlZWthYmxlU3RyZWFtPFQ+IGV4dGVuZHMgUmVhZGFibGVTdHJlYW08VD4ge1xuXHRwcmV2ZW50Q2xvc2U6IGJvb2xlYW47XG5cdHJlYWRlcjogU2Vla2FibGVTdHJlYW1SZWFkZXI8VD47XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBwcmV2ZW50Q2xvc2UgKGRlZmF1bHQ9dHJ1ZSkgUHJldmVudCB0aGUgc3RyZWFtIGZyb20gY2xvc2luZyB3aGVuIGl0IHJlYWNoZXMgdGhlIGVuZC5cblx0ICogSWYgdHJ1ZSwgdGhlIHN0cmVhbSB3aWxsIG5vdCBjbG9zZSB3aGVuIHJlcXVlc3RDbG9zZSBpcyBjYWxsZWQgb24gdGhlIGNvbnRyb2xsZXIgKHdoaWNoIGlzIHR5cGljYWxseSBkb25lIGJ5IHRoZVxuXHQgKiBzb3VyY2Ugd2hlbiBpdCByZWFjaGVzIGl0cyBlbmQpLiBUaGlzIGFsbG93cyBmb3IgcmUtc2Vla2luZyBpbiBhIHN0cmVhbSB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gcmVhZCB0byB0aGUgZW5kLlxuXHQgKiBUaGUgc3RyZWFtIGNhbiBiZSBjbG9zZWQgYnkgY2FsbGluZyBSZWFkYWJsZVN0cmVhbSNjbG9zZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHVuZGVybHlpbmdTb3VyY2U6IFNvdXJjZTxUPiwgc3RyYXRlZ3k6IFN0cmF0ZWd5PFQ+ID0ge30sIHByZXZlbnRDbG9zZTogYm9vbGVhbiA9IHRydWUpIHtcblx0XHRzdXBlcih1bmRlcmx5aW5nU291cmNlLCBzdHJhdGVneSk7XG5cblx0XHR0aGlzLnByZXZlbnRDbG9zZSA9IHByZXZlbnRDbG9zZTtcblx0fVxuXG5cdGdldFJlYWRlcigpOiBTZWVrYWJsZVN0cmVhbVJlYWRlcjxUPiB7XG5cdFx0aWYgKCF0aGlzLnJlYWRhYmxlIHx8ICF0aGlzLnNlZWspIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgYmUgYSBTZWVrYWJsZVN0cmVhbSBpbnN0YW5jZScpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgU2Vla2FibGVTdHJlYW1SZWFkZXIodGhpcyk7XG5cdH1cblxuXHRyZXF1ZXN0Q2xvc2UoKTogdm9pZCB7XG5cdFx0aWYgKCF0aGlzLnByZXZlbnRDbG9zZSkge1xuXHRcdFx0c3VwZXIucmVxdWVzdENsb3NlKCk7XG5cdFx0fVxuXHR9XG5cblx0c2Vlayhwb3NpdGlvbjogbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+IHtcblx0XHRpZiAodGhpcy5fdW5kZXJseWluZ1NvdXJjZS5zZWVrKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fdW5kZXJseWluZ1NvdXJjZS5zZWVrKHRoaXMuY29udHJvbGxlciwgcG9zaXRpb24pO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGlmICh0aGlzLnJlYWRlciAmJiBwb3NpdGlvbiA8IHRoaXMucmVhZGVyLmN1cnJlbnRQb3NpdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdTdHJlYW0gc291cmNlIGlzIG5vdCBzZWVrYWJsZTsgY2Fubm90IHNlZWsgYmFja3dhcmRzJykpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGxldCBkaXNjYXJkTmV4dCA9ICgpOiBQcm9taXNlPG51bWJlcj4gPT4ge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLnJlYWRlci5yZWFkKCkudGhlbigocmVzdWx0OiBSZWFkUmVzdWx0PFQ+KSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAocmVzdWx0LmRvbmUgfHwgdGhpcy5yZWFkZXIuY3VycmVudFBvc2l0aW9uID09PSBwb3NpdGlvbikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMucmVhZGVyLmN1cnJlbnRQb3NpdGlvbik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGRpc2NhcmROZXh0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0cmV0dXJuIGRpc2NhcmROZXh0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Z2V0IHN0cmF0ZWd5KCkge1xuXHRcdHJldHVybiB0aGlzLl9zdHJhdGVneTtcblx0fVxufVxuIl19