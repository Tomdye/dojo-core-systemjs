(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise'], factory);
    }
})(function (require, exports) {
    "use strict";
    const Promise_1 = require('../Promise');
    // Since this Sink is doing no asynchronous operations,
    // use a single resolved promise for all returned promises.
    let resolved = Promise_1.default.resolve();
    /**
     * A WritableStream sink that collects the chunks it receives and
     * stores them into an array.  Use the chunks property to retrieve
     * the collection of chunks.
     */
    class ArraySink {
        abort(reason) {
            return resolved;
        }
        close() {
            return Promise_1.default.resolve();
        }
        start(error) {
            this.chunks = [];
            return resolved;
        }
        write(chunk) {
            if (chunk) {
                this.chunks.push(chunk);
            }
            return resolved;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ArraySink;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJyYXlTaW5rLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbXMvQXJyYXlTaW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUFBLDBCQUFvQixZQUFZLENBQUMsQ0FBQTtJQUdqQyx1REFBdUQ7SUFDdkQsMkRBQTJEO0lBQzNELElBQUksUUFBUSxHQUFHLGlCQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFFakM7Ozs7T0FJRztJQUNIO1FBSUMsS0FBSyxDQUFDLE1BQVc7WUFDaEIsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNqQixDQUFDO1FBRUQsS0FBSztZQUNKLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxLQUFLLENBQUMsS0FBaUI7WUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDakIsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNqQixDQUFDO1FBRUQsS0FBSyxDQUFDLEtBQVE7WUFDYixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pCLENBQUM7WUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2pCLENBQUM7SUFDRixDQUFDO0lBdkJEOytCQXVCQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAnLi4vUHJvbWlzZSc7XG5pbXBvcnQgeyBTaW5rIH0gZnJvbSAnLi9Xcml0YWJsZVN0cmVhbSc7XG5cbi8vIFNpbmNlIHRoaXMgU2luayBpcyBkb2luZyBubyBhc3luY2hyb25vdXMgb3BlcmF0aW9ucyxcbi8vIHVzZSBhIHNpbmdsZSByZXNvbHZlZCBwcm9taXNlIGZvciBhbGwgcmV0dXJuZWQgcHJvbWlzZXMuXG5sZXQgcmVzb2x2ZWQgPSBQcm9taXNlLnJlc29sdmUoKTtcblxuLyoqXG4gKiBBIFdyaXRhYmxlU3RyZWFtIHNpbmsgdGhhdCBjb2xsZWN0cyB0aGUgY2h1bmtzIGl0IHJlY2VpdmVzIGFuZFxuICogc3RvcmVzIHRoZW0gaW50byBhbiBhcnJheS4gIFVzZSB0aGUgY2h1bmtzIHByb3BlcnR5IHRvIHJldHJpZXZlXG4gKiB0aGUgY29sbGVjdGlvbiBvZiBjaHVua3MuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFycmF5U2luazxUPiBpbXBsZW1lbnRzIFNpbms8VD4ge1xuXG5cdGNodW5rczogVFtdO1xuXG5cdGFib3J0KHJlYXNvbjogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHJlc29sdmVkO1xuXHR9XG5cblx0Y2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0c3RhcnQoZXJyb3I6ICgpID0+IHZvaWQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0aGlzLmNodW5rcyA9IFtdO1xuXHRcdHJldHVybiByZXNvbHZlZDtcblx0fVxuXG5cdHdyaXRlKGNodW5rOiBUKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKGNodW5rKSB7XG5cdFx0XHR0aGlzLmNodW5rcy5wdXNoKGNodW5rKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc29sdmVkO1xuXHR9XG59XG4iXX0=