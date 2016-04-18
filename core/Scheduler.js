(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './queue'], factory);
    }
})(function (require, exports) {
    "use strict";
    const queue_1 = require('./queue');
    function getQueueHandle(item) {
        return {
            destroy: function () {
                this.destroy = function () { };
                item.isActive = false;
                item.callback = null;
            }
        };
    }
    class Scheduler {
        constructor(kwArgs) {
            this.deferWhileProcessing = (kwArgs && 'deferWhileProcessing' in kwArgs) ? kwArgs.deferWhileProcessing : true;
            this.queueFunction = (kwArgs && kwArgs.queueFunction) ? kwArgs.queueFunction : queue_1.queueTask;
            this._boundDispatch = this._dispatch.bind(this);
            this._isProcessing = false;
            this._queue = [];
        }
        _defer(callback) {
            const item = {
                isActive: true,
                callback: callback
            };
            if (!this._deferred) {
                this._deferred = [];
            }
            this._deferred.push(item);
            return getQueueHandle(item);
        }
        _dispatch() {
            this._isProcessing = true;
            this._task.destroy();
            this._task = null;
            const queue = this._queue;
            let item;
            while (item = queue.shift()) {
                if (item.isActive) {
                    item.callback();
                }
            }
            this._isProcessing = false;
            let deferred = this._deferred;
            if (deferred && deferred.length) {
                this._deferred = null;
                let item;
                while (item = deferred.shift()) {
                    this._schedule(item);
                }
            }
        }
        _schedule(item) {
            if (!this._task) {
                this._task = this.queueFunction(this._boundDispatch);
            }
            this._queue.push(item);
        }
        schedule(callback) {
            if (this._isProcessing && this.deferWhileProcessing) {
                return this._defer(callback);
            }
            const item = {
                isActive: true,
                callback: callback
            };
            this._schedule(item);
            return getQueueHandle(item);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Scheduler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NoZWR1bGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1NjaGVkdWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFDQSx3QkFBcUMsU0FBUyxDQUFDLENBQUE7SUFFL0Msd0JBQXdCLElBQWU7UUFDdEMsTUFBTSxDQUFDO1lBQ04sT0FBTyxFQUFFO2dCQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsY0FBYSxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO2dCQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUN0QixDQUFDO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFPRDtRQXFFQyxZQUFZLE1BQWU7WUFDMUIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsTUFBTSxJQUFJLHNCQUFzQixJQUFJLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7WUFDOUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsTUFBTSxDQUFDLGFBQWEsR0FBRyxpQkFBUyxDQUFDO1lBRXpGLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQXpEUyxNQUFNLENBQUMsUUFBa0M7WUFDbEQsTUFBTSxJQUFJLEdBQWM7Z0JBQ3ZCLFFBQVEsRUFBRSxJQUFJO2dCQUNkLFFBQVEsRUFBRSxRQUFRO2FBQ2xCLENBQUM7WUFFRixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNyQixDQUFDO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFMUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRVMsU0FBUztZQUNsQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRWxCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDMUIsSUFBSSxJQUFlLENBQUM7WUFFcEIsT0FBTyxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7Z0JBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNuQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2pCLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFFM0IsSUFBSSxRQUFRLEdBQWdCLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDM0MsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFFdEIsSUFBSSxJQUFlLENBQUM7Z0JBQ3BCLE9BQU8sSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO29CQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN0QixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFUyxTQUFTLENBQUMsSUFBZTtZQUNsQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3RELENBQUM7WUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBV0QsUUFBUSxDQUFDLFFBQWtDO1lBQzFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztnQkFDckQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUIsQ0FBQztZQUVELE1BQU0sSUFBSSxHQUFjO2dCQUN2QixRQUFRLEVBQUUsSUFBSTtnQkFDZCxRQUFRLEVBQUUsUUFBUTthQUNsQixDQUFDO1lBRUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVyQixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLENBQUM7SUFDRixDQUFDO0lBNUZEOytCQTRGQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSGFuZGxlIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFF1ZXVlSXRlbSwgcXVldWVUYXNrIH0gZnJvbSAnLi9xdWV1ZSc7XG5cbmZ1bmN0aW9uIGdldFF1ZXVlSGFuZGxlKGl0ZW06IFF1ZXVlSXRlbSk6IEhhbmRsZSB7XG5cdHJldHVybiB7XG5cdFx0ZGVzdHJveTogZnVuY3Rpb24gKCkge1xuXHRcdFx0dGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge307XG5cdFx0XHRpdGVtLmlzQWN0aXZlID0gZmFsc2U7XG5cdFx0XHRpdGVtLmNhbGxiYWNrID0gbnVsbDtcblx0XHR9XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgS3dBcmdzIHtcblx0ZGVmZXJXaGlsZVByb2Nlc3Npbmc/OiBib29sZWFuO1xuXHRxdWV1ZUZ1bmN0aW9uPzogKGNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IGFueSkgPT4gSGFuZGxlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlZHVsZXIge1xuXHRwcm90ZWN0ZWQgX2JvdW5kRGlzcGF0Y2g6ICgpID0+IHZvaWQ7XG5cdHByb3RlY3RlZCBfZGVmZXJyZWQ6IFF1ZXVlSXRlbVtdO1xuXHRwcm90ZWN0ZWQgX2lzUHJvY2Vzc2luZzogYm9vbGVhbjtcblx0cHJvdGVjdGVkIF9xdWV1ZTogUXVldWVJdGVtW107XG5cdHByb3RlY3RlZCBfdGFzazogSGFuZGxlO1xuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW55IGNhbGxiYWNrcyByZWdpc3RlcmVkIGR1cmluZyBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIGN1cnJlbnQgYmF0Y2ggKGBmYWxzZWApXG5cdCAqIG9yIGRlZmVycmVkIHVudGlsIHRoZSBuZXh0IGJhdGNoIChgdHJ1ZWAsIGRlZmF1bHQpLlxuXHQgKi9cblx0ZGVmZXJXaGlsZVByb2Nlc3Npbmc6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEFsbG93cyB1c2VycyB0byBzcGVjaWZ5IHRoZSBmdW5jdGlvbiB0aGF0IHNob3VsZCBiZSB1c2VkIHRvIHNjaGVkdWxlIGNhbGxiYWNrcy5cblx0ICogSWYgbm8gZnVuY3Rpb24gaXMgcHJvdmlkZWQsIHRoZW4gYHF1ZXVlVGFza2Agd2lsbCBiZSB1c2VkLlxuXHQgKi9cblx0cXVldWVGdW5jdGlvbjogKGNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IGFueSkgPT4gSGFuZGxlO1xuXG5cdHByb3RlY3RlZCBfZGVmZXIoY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6IEhhbmRsZSB7XG5cdFx0Y29uc3QgaXRlbTogUXVldWVJdGVtID0ge1xuXHRcdFx0aXNBY3RpdmU6IHRydWUsXG5cdFx0XHRjYWxsYmFjazogY2FsbGJhY2tcblx0XHR9O1xuXG5cdFx0aWYgKCF0aGlzLl9kZWZlcnJlZCkge1xuXHRcdFx0dGhpcy5fZGVmZXJyZWQgPSBbXTtcblx0XHR9XG5cblx0XHR0aGlzLl9kZWZlcnJlZC5wdXNoKGl0ZW0pO1xuXG5cdFx0cmV0dXJuIGdldFF1ZXVlSGFuZGxlKGl0ZW0pO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9kaXNwYXRjaCgpOiB2b2lkIHtcblx0XHR0aGlzLl9pc1Byb2Nlc3NpbmcgPSB0cnVlO1xuXHRcdHRoaXMuX3Rhc2suZGVzdHJveSgpO1xuXHRcdHRoaXMuX3Rhc2sgPSBudWxsO1xuXG5cdFx0Y29uc3QgcXVldWUgPSB0aGlzLl9xdWV1ZTtcblx0XHRsZXQgaXRlbTogUXVldWVJdGVtO1xuXG5cdFx0d2hpbGUgKGl0ZW0gPSBxdWV1ZS5zaGlmdCgpKSB7XG5cdFx0XHRpZiAoaXRlbS5pc0FjdGl2ZSkge1xuXHRcdFx0XHRpdGVtLmNhbGxiYWNrKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5faXNQcm9jZXNzaW5nID0gZmFsc2U7XG5cblx0XHRsZXQgZGVmZXJyZWQ6IFF1ZXVlSXRlbVtdID0gdGhpcy5fZGVmZXJyZWQ7XG5cdFx0aWYgKGRlZmVycmVkICYmIGRlZmVycmVkLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5fZGVmZXJyZWQgPSBudWxsO1xuXG5cdFx0XHRsZXQgaXRlbTogUXVldWVJdGVtO1xuXHRcdFx0d2hpbGUgKGl0ZW0gPSBkZWZlcnJlZC5zaGlmdCgpKSB7XG5cdFx0XHRcdHRoaXMuX3NjaGVkdWxlKGl0ZW0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCBfc2NoZWR1bGUoaXRlbTogUXVldWVJdGVtKTogdm9pZCB7XG5cdFx0aWYgKCF0aGlzLl90YXNrKSB7XG5cdFx0XHR0aGlzLl90YXNrID0gdGhpcy5xdWV1ZUZ1bmN0aW9uKHRoaXMuX2JvdW5kRGlzcGF0Y2gpO1xuXHRcdH1cblxuXHRcdHRoaXMuX3F1ZXVlLnB1c2goaXRlbSk7XG5cdH1cblxuXHRjb25zdHJ1Y3Rvcihrd0FyZ3M/OiBLd0FyZ3MpIHtcblx0XHR0aGlzLmRlZmVyV2hpbGVQcm9jZXNzaW5nID0gKGt3QXJncyAmJiAnZGVmZXJXaGlsZVByb2Nlc3NpbmcnIGluIGt3QXJncykgPyBrd0FyZ3MuZGVmZXJXaGlsZVByb2Nlc3NpbmcgOiB0cnVlO1xuXHRcdHRoaXMucXVldWVGdW5jdGlvbiA9IChrd0FyZ3MgJiYga3dBcmdzLnF1ZXVlRnVuY3Rpb24pID8ga3dBcmdzLnF1ZXVlRnVuY3Rpb24gOiBxdWV1ZVRhc2s7XG5cblx0XHR0aGlzLl9ib3VuZERpc3BhdGNoID0gdGhpcy5fZGlzcGF0Y2guYmluZCh0aGlzKTtcblx0XHR0aGlzLl9pc1Byb2Nlc3NpbmcgPSBmYWxzZTtcblx0XHR0aGlzLl9xdWV1ZSA9IFtdO1xuXHR9XG5cblx0c2NoZWR1bGUoY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6IEhhbmRsZSB7XG5cdFx0aWYgKHRoaXMuX2lzUHJvY2Vzc2luZyAmJiB0aGlzLmRlZmVyV2hpbGVQcm9jZXNzaW5nKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fZGVmZXIoY2FsbGJhY2spO1xuXHRcdH1cblxuXHRcdGNvbnN0IGl0ZW06IFF1ZXVlSXRlbSA9IHtcblx0XHRcdGlzQWN0aXZlOiB0cnVlLFxuXHRcdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdFx0fTtcblxuXHRcdHRoaXMuX3NjaGVkdWxlKGl0ZW0pO1xuXG5cdFx0cmV0dXJuIGdldFF1ZXVlSGFuZGxlKGl0ZW0pO1xuXHR9XG59XG4iXX0=