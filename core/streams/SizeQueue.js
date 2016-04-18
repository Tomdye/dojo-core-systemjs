(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    /**
     * This class is used internally by {@link ReadableStream} and {@link WritableStream} as a simple queue.
     * Each value in the queue includes a piece of metadata: the size of the value.
     */
    class SizeQueue {
        constructor() {
            this._queue = [];
        }
        get totalSize() {
            let totalSize = 0;
            this._queue.forEach(function (pair) {
                totalSize += pair.size;
            });
            return totalSize;
        }
        get length() {
            return this._queue.length;
        }
        empty() {
            this._queue = [];
        }
        enqueue(value, size) {
            this._queue.push({ value: value, size: size });
        }
        dequeue() {
            const pair = this._queue.shift();
            return pair.value;
        }
        peek() {
            const pair = this._queue[0];
            return pair.value;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SizeQueue;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2l6ZVF1ZXVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbXMvU2l6ZVF1ZXVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUtBOzs7T0FHRztJQUNIO1FBQUE7WUFhUyxXQUFNLEdBQWMsRUFBRSxDQUFDO1FBbUJoQyxDQUFDO1FBL0JBLElBQUksU0FBUztZQUNaLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUk7Z0JBQ2pDLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsSUFBSSxNQUFNO1lBQ1QsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzNCLENBQUM7UUFJRCxLQUFLO1lBQ0osSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQUVELE9BQU8sQ0FBQyxLQUFRLEVBQUUsSUFBWTtZQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELE9BQU87WUFDTixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFFRCxJQUFJO1lBQ0gsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO0lBQ0YsQ0FBQztJQWhDRDsrQkFnQ0MsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImludGVyZmFjZSBQYWlyPFQ+IHtcblx0dmFsdWU6IFQ7XG5cdHNpemU6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBUaGlzIGNsYXNzIGlzIHVzZWQgaW50ZXJuYWxseSBieSB7QGxpbmsgUmVhZGFibGVTdHJlYW19IGFuZCB7QGxpbmsgV3JpdGFibGVTdHJlYW19IGFzIGEgc2ltcGxlIHF1ZXVlLlxuICogRWFjaCB2YWx1ZSBpbiB0aGUgcXVldWUgaW5jbHVkZXMgYSBwaWVjZSBvZiBtZXRhZGF0YTogdGhlIHNpemUgb2YgdGhlIHZhbHVlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaXplUXVldWU8VD4ge1xuXHRnZXQgdG90YWxTaXplKCk6IG51bWJlciB7XG5cdFx0bGV0IHRvdGFsU2l6ZSA9IDA7XG5cdFx0dGhpcy5fcXVldWUuZm9yRWFjaChmdW5jdGlvbiAocGFpcikge1xuXHRcdFx0dG90YWxTaXplICs9IHBhaXIuc2l6ZTtcblx0XHR9KTtcblx0XHRyZXR1cm4gdG90YWxTaXplO1xuXHR9XG5cblx0Z2V0IGxlbmd0aCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9xdWV1ZS5sZW5ndGg7XG5cdH1cblxuXHRwcml2YXRlIF9xdWV1ZTogUGFpcjxUPltdID0gW107XG5cblx0ZW1wdHkoKSB7XG5cdFx0dGhpcy5fcXVldWUgPSBbXTtcblx0fVxuXG5cdGVucXVldWUodmFsdWU6IFQsIHNpemU6IG51bWJlcik6IHZvaWQge1xuXHRcdHRoaXMuX3F1ZXVlLnB1c2goeyB2YWx1ZTogdmFsdWUsIHNpemU6IHNpemUgfSk7XG5cdH1cblxuXHRkZXF1ZXVlKCk6IFQge1xuXHRcdGNvbnN0IHBhaXIgPSB0aGlzLl9xdWV1ZS5zaGlmdCgpO1xuXHRcdHJldHVybiBwYWlyLnZhbHVlO1xuXHR9XG5cblx0cGVlaygpOiBUIHtcblx0XHRjb25zdCBwYWlyID0gdGhpcy5fcXVldWVbMF07XG5cdFx0cmV0dXJuIHBhaXIudmFsdWU7XG5cdH1cbn1cbiJdfQ==