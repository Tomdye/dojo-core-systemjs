(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise', './ReadableStreamReader'], factory);
    }
})(function (require, exports) {
    "use strict";
    const Promise_1 = require('../Promise');
    const ReadableStreamReader_1 = require('./ReadableStreamReader');
    class SeekableStreamReader extends ReadableStreamReader_1.default {
        constructor(...args) {
            super(...args);
            this._currentPosition = 0;
        }
        get currentPosition() {
            return this._currentPosition;
        }
        read() {
            return super.read().then((result) => {
                if (!result.done) {
                    let chunkSize = 1;
                    try {
                        if (this._ownerReadableStream.strategy && this._ownerReadableStream.strategy.size) {
                            chunkSize = this._ownerReadableStream.strategy.size(result.value);
                        }
                    }
                    catch (error) {
                        this._ownerReadableStream.error(error);
                        return Promise_1.default.reject(error);
                    }
                    this._currentPosition += chunkSize;
                }
                return Promise_1.default.resolve(result);
            }, function (error) {
                return Promise_1.default.reject(error);
            });
        }
        seek(position) {
            if (position === this._currentPosition) {
                return Promise_1.default.resolve(this._currentPosition);
            }
            if (position < this._currentPosition) {
                this._ownerReadableStream.queue.empty();
            }
            // Drain the queue of any items prior to the desired seek position
            while (position > this._currentPosition && this._ownerReadableStream.queue.length) {
                let chunkSize = 1;
                let chunk = this._ownerReadableStream.queue.dequeue();
                if (this._ownerReadableStream.strategy && this._ownerReadableStream.strategy.size) {
                    try {
                        chunkSize = this._ownerReadableStream.strategy.size(chunk);
                    }
                    catch (error) {
                        return Promise_1.default.reject(error);
                    }
                }
                this._currentPosition += chunkSize;
            }
            // If there's anything left in the queue, we don't need to seek in the source, we can read from the queue
            if (this._ownerReadableStream.queue.length) {
                return Promise_1.default.resolve(this._currentPosition);
            }
            return this._ownerReadableStream.seek(position).then((position) => {
                this._currentPosition = position;
                return Promise_1.default.resolve(position);
            }, (error) => {
                return Promise_1.default.reject(error);
            });
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SeekableStreamReader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vla2FibGVTdHJlYW1SZWFkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9TZWVrYWJsZVN0cmVhbVJlYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFBQSwwQkFBb0IsWUFBWSxDQUFDLENBQUE7SUFDakMsdUNBQWlELHdCQUF3QixDQUFDLENBQUE7SUFHMUUsbUNBQXFELDhCQUFvQjtRQUF6RTtZQUFxRCxlQUF1QjtZQUNqRSxxQkFBZ0IsR0FBVyxDQUFDLENBQUM7UUF1RXhDLENBQUM7UUFwRUEsSUFBSSxlQUFlO1lBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDOUIsQ0FBQztRQUVELElBQUk7WUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQXFCO2dCQUM5QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNsQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7b0JBRWxCLElBQUksQ0FBQzt3QkFDSixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDbkYsU0FBUyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbkUsQ0FBQztvQkFDRixDQUNBO29CQUFBLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ2QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFFdkMsTUFBTSxDQUFDLGlCQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM5QixDQUFDO29CQUVELElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxTQUFTLENBQUM7Z0JBQ3BDLENBQUM7Z0JBRUQsTUFBTSxDQUFDLGlCQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLENBQUMsRUFBRSxVQUFVLEtBQVk7Z0JBQ3hCLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxJQUFJLENBQUMsUUFBZ0I7WUFDcEIsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMvQyxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDekMsQ0FBQztZQUVELGtFQUFrRTtZQUNsRSxPQUFPLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbkYsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO2dCQUNsQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUV0RCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDbkYsSUFBSSxDQUFDO3dCQUNKLFNBQVMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDNUQsQ0FDQTtvQkFBQSxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUNkLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDOUIsQ0FBQztnQkFDRixDQUFDO2dCQUVELElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxTQUFTLENBQUM7WUFDcEMsQ0FBQztZQUVELHlHQUF5RztZQUN6RyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMvQyxDQUFDO1lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBZ0I7Z0JBQ3JFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7Z0JBRWpDLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsQyxDQUFDLEVBQUUsQ0FBQyxLQUFZO2dCQUNmLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7SUFDRixDQUFDO0lBeEVEOzBDQXdFQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAnLi4vUHJvbWlzZSc7XG5pbXBvcnQgUmVhZGFibGVTdHJlYW1SZWFkZXIsIHsgUmVhZFJlc3VsdCB9IGZyb20gJy4vUmVhZGFibGVTdHJlYW1SZWFkZXInO1xuaW1wb3J0IFNlZWthYmxlU3RyZWFtIGZyb20gJy4vU2Vla2FibGVTdHJlYW0nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWVrYWJsZVN0cmVhbVJlYWRlcjxUPiBleHRlbmRzIFJlYWRhYmxlU3RyZWFtUmVhZGVyPFQ+IHtcblx0cHJvdGVjdGVkIF9jdXJyZW50UG9zaXRpb246IG51bWJlciA9IDA7XG5cdHByb3RlY3RlZCBfb3duZXJSZWFkYWJsZVN0cmVhbTogU2Vla2FibGVTdHJlYW08VD47XG5cblx0Z2V0IGN1cnJlbnRQb3NpdGlvbigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9jdXJyZW50UG9zaXRpb247XG5cdH1cblxuXHRyZWFkKCk6IFByb21pc2U8UmVhZFJlc3VsdDxUPj4ge1xuXHRcdHJldHVybiBzdXBlci5yZWFkKCkudGhlbigocmVzdWx0OiBSZWFkUmVzdWx0PFQ+KSA9PiB7XG5cdFx0XHRpZiAoIXJlc3VsdC5kb25lKSB7XG5cdFx0XHRcdGxldCBjaHVua1NpemUgPSAxO1xuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0uc3RyYXRlZ3kgJiYgdGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbS5zdHJhdGVneS5zaXplKSB7XG5cdFx0XHRcdFx0XHRjaHVua1NpemUgPSB0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLnN0cmF0ZWd5LnNpemUocmVzdWx0LnZhbHVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0dGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbS5lcnJvcihlcnJvcik7XG5cblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5fY3VycmVudFBvc2l0aW9uICs9IGNodW5rU2l6ZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuXHRcdH0sIGZ1bmN0aW9uIChlcnJvcjogRXJyb3IpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG5cdFx0fSk7XG5cdH1cblxuXHRzZWVrKHBvc2l0aW9uOiBudW1iZXIpOiBQcm9taXNlPG51bWJlcj4ge1xuXHRcdGlmIChwb3NpdGlvbiA9PT0gdGhpcy5fY3VycmVudFBvc2l0aW9uKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2N1cnJlbnRQb3NpdGlvbik7XG5cdFx0fVxuXG5cdFx0aWYgKHBvc2l0aW9uIDwgdGhpcy5fY3VycmVudFBvc2l0aW9uKSB7XG5cdFx0XHR0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLnF1ZXVlLmVtcHR5KCk7XG5cdFx0fVxuXG5cdFx0Ly8gRHJhaW4gdGhlIHF1ZXVlIG9mIGFueSBpdGVtcyBwcmlvciB0byB0aGUgZGVzaXJlZCBzZWVrIHBvc2l0aW9uXG5cdFx0d2hpbGUgKHBvc2l0aW9uID4gdGhpcy5fY3VycmVudFBvc2l0aW9uICYmIHRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0ucXVldWUubGVuZ3RoKSB7XG5cdFx0XHRsZXQgY2h1bmtTaXplID0gMTtcblx0XHRcdGxldCBjaHVuayA9IHRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0ucXVldWUuZGVxdWV1ZSgpO1xuXG5cdFx0XHRpZiAodGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbS5zdHJhdGVneSAmJiB0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLnN0cmF0ZWd5LnNpemUpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjaHVua1NpemUgPSB0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtLnN0cmF0ZWd5LnNpemUoY2h1bmspO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fY3VycmVudFBvc2l0aW9uICs9IGNodW5rU2l6ZTtcblx0XHR9XG5cblx0XHQvLyBJZiB0aGVyZSdzIGFueXRoaW5nIGxlZnQgaW4gdGhlIHF1ZXVlLCB3ZSBkb24ndCBuZWVkIHRvIHNlZWsgaW4gdGhlIHNvdXJjZSwgd2UgY2FuIHJlYWQgZnJvbSB0aGUgcXVldWVcblx0XHRpZiAodGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbS5xdWV1ZS5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fY3VycmVudFBvc2l0aW9uKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbS5zZWVrKHBvc2l0aW9uKS50aGVuKChwb3NpdGlvbjogbnVtYmVyKSA9PiB7XG5cdFx0XHR0aGlzLl9jdXJyZW50UG9zaXRpb24gPSBwb3NpdGlvbjtcblxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShwb3NpdGlvbik7XG5cdFx0fSwgKGVycm9yOiBFcnJvcikgPT4ge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcblx0XHR9KTtcblx0fVxufVxuIl19