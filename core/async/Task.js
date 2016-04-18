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
    exports.Canceled = 4;
    /**
     * Task is an extension of Promise that supports cancelation.
     */
    class Task extends Promise_1.default {
        constructor(executor, canceler) {
            let resolve, reject;
            super((_resolve, _reject) => {
                resolve = _resolve;
                reject = _reject;
            });
            // Don't let the Task resolve if it's been canceled
            try {
                executor((value) => {
                    if (this._state === exports.Canceled) {
                        return;
                    }
                    resolve(value);
                }, (reason) => {
                    if (this._state === exports.Canceled) {
                        return;
                    }
                    reject(reason);
                });
            }
            catch (error) {
                reject(error);
            }
            this.children = [];
            this.canceler = () => {
                if (canceler) {
                    canceler();
                }
                this._cancel();
            };
        }
        static all(items) {
            return super.all(items);
        }
        static race(items) {
            return super.race(items);
        }
        static reject(reason) {
            return super.reject(reason);
        }
        static resolve(value) {
            return super.resolve(value);
        }
        static copy(other) {
            const task = super.copy(other);
            task.children = [];
            task.canceler = other instanceof Task ? other.canceler : function () { };
            return task;
        }
        /**
         * Propagates cancelation down through a Task tree. The Task's state is immediately set to canceled. If a Thenable
         * finally task was passed in, it is resolved before calling this Task's finally callback; otherwise, this Task's
         * finally callback is immediately executed. `_cancel` is called for each child Task, passing in the value returned
         * by this Task's finally callback or a Promise chain that will eventually resolve to that value.
         */
        _cancel(finallyTask) {
            this._state = exports.Canceled;
            const runFinally = () => {
                try {
                    return this._finally();
                }
                catch (error) {
                }
            };
            if (this._finally) {
                if (Promise_1.isThenable(finallyTask)) {
                    finallyTask = finallyTask.then(runFinally, runFinally);
                }
                else {
                    finallyTask = runFinally();
                }
            }
            this.children.forEach(function (child) {
                child._cancel(finallyTask);
            });
        }
        /**
         * Immediately cancels this task if it has not already resolved. This Task and any descendants are synchronously set
         * to the Canceled state and any `finally` added downstream from the canceled Task are invoked.
         */
        cancel() {
            if (this._state === Promise_1.State.Pending) {
                this.canceler();
            }
        }
        finally(callback) {
            const task = super.finally(callback);
            // Keep a reference to the callback; it will be called if the Task is canceled
            task._finally = callback;
            return task;
        }
        then(onFulfilled, onRejected) {
            const task = super.then(
            // Don't call the onFulfilled or onRejected handlers if this Task is canceled
            function (value) {
                if (task._state === exports.Canceled) {
                    return;
                }
                if (onFulfilled) {
                    return onFulfilled(value);
                }
                return value;
            }, function (error) {
                if (task._state === exports.Canceled) {
                    return;
                }
                if (onRejected) {
                    return onRejected(error);
                }
                throw error;
            });
            task.canceler = () => {
                // If task's parent (this) hasn't been resolved, cancel it; downward propagation will start at the first
                // unresolved parent
                if (this._state === Promise_1.State.Pending) {
                    this.cancel();
                }
                else {
                    task._cancel();
                }
            };
            // Keep track of child Tasks for propogating cancelation back down the chain
            this.children.push(task);
            return task;
        }
        catch(onRejected) {
            return super.catch(onRejected);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Task;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hc3luYy9UYXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUFBLDBCQUErRCxZQUFZLENBQUMsQ0FBQTtJQUUvRCxnQkFBUSxHQUFXLENBQUMsQ0FBQztJQUVsQzs7T0FFRztJQUNILG1CQUFxQyxpQkFBTztRQTBCM0MsWUFBWSxRQUFxQixFQUFFLFFBQXFCO1lBQ3ZELElBQUksT0FBWSxFQUFFLE1BQVcsQ0FBQztZQUU5QixNQUFNLENBQUMsUUFBUSxFQUFFLE9BQU87Z0JBQ3ZCLE9BQU8sR0FBRyxRQUFRLENBQUM7Z0JBQ25CLE1BQU0sR0FBRyxPQUFPLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUM7WUFFSCxtREFBbUQ7WUFDbkQsSUFBSSxDQUFDO2dCQUNKLFFBQVEsQ0FDUCxDQUFDLEtBQUs7b0JBQ0wsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxnQkFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDOUIsTUFBTSxDQUFDO29CQUNSLENBQUM7b0JBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoQixDQUFDLEVBQ0QsQ0FBQyxNQUFNO29CQUNOLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssZ0JBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQzlCLE1BQU0sQ0FBQztvQkFDUixDQUFDO29CQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEIsQ0FBQyxDQUNELENBQUM7WUFDSCxDQUNBO1lBQUEsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDZCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDZixDQUFDO1lBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRztnQkFDZixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxD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LFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzNCLENBQUM7Z0JBQ0QsTUFBTSxDQUFPLEtBQUssQ0FBQztZQUNwQixDQUFDLEVBQ0QsVUFBVSxLQUFLO2dCQUNkLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssZ0JBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLE1BQU0sQ0FBQztnQkFDUixDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFCLENBQUM7Z0JBQ0QsTUFBTSxLQUFLLENBQUM7WUFDYixDQUFDLENBQ0QsQ0FBQztZQUVGLElBQUksQ0FBQyxRQUFRLEdBQUc7Z0JBQ2Ysd0dBQXdHO2dCQUN4RyxvQkFBb0I7Z0JBQ3BCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssZUFBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ25DLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDZixDQUFDO2dCQUVELElBQUksQ0FBQyxDQUFDO29CQUNMLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDaEIsQ0FBQztZQUNGLENBQUMsQ0FBQztZQUVGLDRFQUE0RTtZQUM1RSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV6QixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELEtBQUssQ0FBSSxVQUFpRDtZQUN6RCxNQUFNLENBQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0QyxDQUFDO0lBRUYsQ0FBQztJQTdLRDswQkE2S0MsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9taXNlLCB7IEV4ZWN1dG9yLCBTdGF0ZSwgVGhlbmFibGUsIGlzVGhlbmFibGUgfSBmcm9tICcuLi9Qcm9taXNlJztcblxuZXhwb3J0IGNvbnN0IENhbmNlbGVkID0gPFN0YXRlPiA0O1xuXG4vKipcbiAqIFRhc2sgaXMgYW4gZXh0ZW5zaW9uIG9mIFByb21pc2UgdGhhdCBzdXBwb3J0cyBjYW5jZWxhdGlvbi5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFzazxUPiBleHRlbmRzIFByb21pc2U8VD4ge1xuXHRzdGF0aWMgYWxsPFQ+KGl0ZW1zOiAoVCB8IFRoZW5hYmxlPFQ+KVtdKTogVGFzazxUW10+IHtcblx0XHRyZXR1cm4gPGFueT4gc3VwZXIuYWxsKGl0ZW1zKTtcblx0fVxuXG5cdHN0YXRpYyByYWNlPFQ+KGl0ZW1zOiAoVCB8IFRoZW5hYmxlPFQ+KVtdKTogVGFzazxUPiB7XG5cdFx0cmV0dXJuIDxhbnk+IHN1cGVyLnJhY2UoaXRlbXMpO1xuXHR9XG5cblx0c3RhdGljIHJlamVjdDxUPihyZWFzb246IEVycm9yKTogVGFzazxhbnk+IHtcblx0XHRyZXR1cm4gPGFueT4gc3VwZXIucmVqZWN0KHJlYXNvbik7XG5cdH1cblxuXHRzdGF0aWMgcmVzb2x2ZSgpOiBUYXNrPHZvaWQ+O1xuXHRzdGF0aWMgcmVzb2x2ZTxUPih2YWx1ZTogKFQgfCBUaGVuYWJsZTxUPikpOiBUYXNrPFQ+O1xuXHRzdGF0aWMgcmVzb2x2ZTxUPih2YWx1ZT86IGFueSk6IFRhc2s8VD4ge1xuXHRcdHJldHVybiA8YW55PiBzdXBlci5yZXNvbHZlKHZhbHVlKTtcblx0fVxuXG5cdHByb3RlY3RlZCBzdGF0aWMgY29weTxVPihvdGhlcjogUHJvbWlzZTxVPik6IFRhc2s8VT4ge1xuXHRcdGNvbnN0IHRhc2sgPSA8VGFzazxVPj4gc3VwZXIuY29weShvdGhlcik7XG5cdFx0dGFzay5jaGlsZHJlbiA9IFtdO1xuXHRcdHRhc2suY2FuY2VsZXIgPSBvdGhlciBpbnN0YW5jZW9mIFRhc2sgPyBvdGhlci5jYW5jZWxlciA6IGZ1bmN0aW9uICgpIHt9O1xuXHRcdHJldHVybiB0YXNrO1xuXHR9XG5cblx0Y29uc3RydWN0b3IoZXhlY3V0b3I6IEV4ZWN1dG9yPFQ+LCBjYW5jZWxlcj86ICgpID0+IHZvaWQpIHtcblx0XHRsZXQgcmVzb2x2ZTogYW55LCByZWplY3Q6IGFueTtcblxuXHRcdHN1cGVyKChfcmVzb2x2ZSwgX3JlamVjdCkgPT4ge1xuXHRcdFx0cmVzb2x2ZSA9IF9yZXNvbHZlO1xuXHRcdFx0cmVqZWN0ID0gX3JlamVjdDtcblx0XHR9KTtcblxuXHRcdC8vIERvbid0IGxldCB0aGUgVGFzayByZXNvbHZlIGlmIGl0J3MgYmVlbiBjYW5jZWxlZFxuXHRcdHRyeSB7XG5cdFx0XHRleGVjdXRvcihcblx0XHRcdFx0KHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX3N0YXRlID09PSBDYW5jZWxlZCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXNvbHZlKHZhbHVlKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0KHJlYXNvbikgPT4ge1xuXHRcdFx0XHRcdGlmICh0aGlzLl9zdGF0ZSA9PT0gQ2FuY2VsZWQpIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVqZWN0KHJlYXNvbik7XG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cdFx0fVxuXHRcdGNhdGNoIChlcnJvcikge1xuXHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHR9XG5cblx0XHR0aGlzLmNoaWxkcmVuID0gW107XG5cdFx0dGhpcy5jYW5jZWxlciA9ICgpID0+IHtcblx0XHRcdGlmIChjYW5jZWxlcikge1xuXHRcdFx0XHRjYW5jZWxlcigpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fY2FuY2VsKCk7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIGNhbmNlbGF0aW9uIGhhbmRsZXIgdGhhdCB3aWxsIGJlIGNhbGxlZCBpZiB0aGlzIHRhc2sgaXMgY2FuY2VsZWQuXG5cdCAqL1xuXHRwcml2YXRlIGNhbmNlbGVyOiAoKSA9PiB2b2lkO1xuXG5cdC8qKlxuXHQgKiBDaGlsZHJlbiBvZiB0aGlzIFRhc2sgKGkuZS4sIFRhc2tzIHRoYXQgd2VyZSBjcmVhdGVkIGZyb20gdGhpcyBUYXNrIHdpdGggYHRoZW5gIG9yIGBjYXRjaGApLlxuXHQgKi9cblx0cHJpdmF0ZSBjaGlsZHJlbjogVGFzazxhbnk+W107XG5cblx0LyoqXG5cdCAqIFRoZSBmaW5hbGx5IGNhbGxiYWNrIGZvciB0aGlzIFRhc2sgKGlmIGl0IHdhcyBjcmVhdGVkIGJ5IGEgY2FsbCB0byBgZmluYWxseWApLlxuXHQgKi9cblx0cHJpdmF0ZSBfZmluYWxseTogKCkgPT4gdm9pZCB8IFRoZW5hYmxlPGFueT47XG5cblx0LyoqXG5cdCAqIFByb3BhZ2F0ZXMgY2FuY2VsYXRpb24gZG93biB0aHJvdWdoIGEgVGFzayB0cmVlLiBUaGUgVGFzaydzIHN0YXRlIGlzIGltbWVkaWF0ZWx5IHNldCB0byBjYW5jZWxlZC4gSWYgYSBUaGVuYWJsZVxuXHQgKiBmaW5hbGx5IHRhc2sgd2FzIHBhc3NlZCBpbiwgaXQgaXMgcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgdGhpcyBUYXNrJ3MgZmluYWxseSBjYWxsYmFjazsgb3RoZXJ3aXNlLCB0aGlzIFRhc2snc1xuXHQgKiBmaW5hbGx5IGNhbGxiYWNrIGlzIGltbWVkaWF0ZWx5IGV4ZWN1dGVkLiBgX2NhbmNlbGAgaXMgY2FsbGVkIGZvciBlYWNoIGNoaWxkIFRhc2ssIHBhc3NpbmcgaW4gdGhlIHZhbHVlIHJldHVybmVkXG5cdCAqIGJ5IHRoaXMgVGFzaydzIGZpbmFsbHkgY2FsbGJhY2sgb3IgYSBQcm9taXNlIGNoYWluIHRoYXQgd2lsbCBldmVudHVhbGx5IHJlc29sdmUgdG8gdGhhdCB2YWx1ZS5cblx0ICovXG5cdHByaXZhdGUgX2NhbmNlbChmaW5hbGx5VGFzaz86IHZvaWQgfCBUaGVuYWJsZTxhbnk+KTogdm9pZCB7XG5cdFx0dGhpcy5fc3RhdGUgPSBDYW5jZWxlZDtcblxuXHRcdGNvbnN0IHJ1bkZpbmFsbHkgPSAoKSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fZmluYWxseSgpO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdC8vIEFueSBlcnJvcnMgaW4gYSBgZmluYWxseWAgY2FsbGJhY2sgYXJlIGNvbXBsZXRlbHkgaWdub3JlZCBkdXJpbmcgY2FuY2VsYXRpb25cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aWYgKHRoaXMuX2ZpbmFsbHkpIHtcblx0XHRcdGlmIChpc1RoZW5hYmxlKGZpbmFsbHlUYXNrKSkge1xuXHRcdFx0XHRmaW5hbGx5VGFzayA9ICg8VGhlbmFibGU8YW55Pj4gZmluYWxseVRhc2spLnRoZW4ocnVuRmluYWxseSwgcnVuRmluYWxseSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0ZmluYWxseVRhc2sgPSBydW5GaW5hbGx5KCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuXHRcdFx0Y2hpbGQuX2NhbmNlbChmaW5hbGx5VGFzayk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogSW1tZWRpYXRlbHkgY2FuY2VscyB0aGlzIHRhc2sgaWYgaXQgaGFzIG5vdCBhbHJlYWR5IHJlc29sdmVkLiBUaGlzIFRhc2sgYW5kIGFueSBkZXNjZW5kYW50cyBhcmUgc3luY2hyb25vdXNseSBzZXRcblx0ICogdG8gdGhlIENhbmNlbGVkIHN0YXRlIGFuZCBhbnkgYGZpbmFsbHlgIGFkZGVkIGRvd25zdHJlYW0gZnJvbSB0aGUgY2FuY2VsZWQgVGFzayBhcmUgaW52b2tlZC5cblx0ICovXG5cdGNhbmNlbCgpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5fc3RhdGUgPT09IFN0YXRlLlBlbmRpbmcpIHtcblx0XHRcdHRoaXMuY2FuY2VsZXIoKTtcblx0XHR9XG5cdH1cblxuXHRmaW5hbGx5KGNhbGxiYWNrOiAoKSA9PiB2b2lkIHwgVGhlbmFibGU8YW55Pik6IFRhc2s8VD4ge1xuXHRcdGNvbnN0IHRhc2sgPSA8VGFzazxUPj4gc3VwZXIuZmluYWxseShjYWxsYmFjayk7XG5cdFx0Ly8gS2VlcCBhIHJlZmVyZW5jZSB0byB0aGUgY2FsbGJhY2s7IGl0IHdpbGwgYmUgY2FsbGVkIGlmIHRoZSBUYXNrIGlzIGNhbmNlbGVkXG5cdFx0dGFzay5fZmluYWxseSA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0YXNrO1xuXHR9XG5cblx0dGhlbjxVPihvbkZ1bGZpbGxlZD86ICh2YWx1ZTogVCkgPT4gVSB8IFRoZW5hYmxlPFU+LCAgb25SZWplY3RlZD86IChlcnJvcjogRXJyb3IpID0+IFUgfCBUaGVuYWJsZTxVPik6IFRhc2s8VT4ge1xuXHRcdGNvbnN0IHRhc2sgPSA8VGFzazxVPj4gc3VwZXIudGhlbjxVPihcblx0XHRcdC8vIERvbid0IGNhbGwgdGhlIG9uRnVsZmlsbGVkIG9yIG9uUmVqZWN0ZWQgaGFuZGxlcnMgaWYgdGhpcyBUYXNrIGlzIGNhbmNlbGVkXG5cdFx0XHRmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0aWYgKHRhc2suX3N0YXRlID09PSBDYW5jZWxlZCkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob25GdWxmaWxsZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gb25GdWxmaWxsZWQodmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiA8YW55PiB2YWx1ZTtcblx0XHRcdH0sXG5cdFx0XHRmdW5jdGlvbiAoZXJyb3IpIHtcblx0XHRcdFx0aWYgKHRhc2suX3N0YXRlID09PSBDYW5jZWxlZCkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob25SZWplY3RlZCkge1xuXHRcdFx0XHRcdHJldHVybiBvblJlamVjdGVkKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdH1cblx0XHQpO1xuXG5cdFx0dGFzay5jYW5jZWxlciA9ICgpID0+IHtcblx0XHRcdC8vIElmIHRhc2sncyBwYXJlbnQgKHRoaXMpIGhhc24ndCBiZWVuIHJlc29sdmVkLCBjYW5jZWwgaXQ7IGRvd253YXJkIHByb3BhZ2F0aW9uIHdpbGwgc3RhcnQgYXQgdGhlIGZpcnN0XG5cdFx0XHQvLyB1bnJlc29sdmVkIHBhcmVudFxuXHRcdFx0aWYgKHRoaXMuX3N0YXRlID09PSBTdGF0ZS5QZW5kaW5nKSB7XG5cdFx0XHRcdHRoaXMuY2FuY2VsKCk7XG5cdFx0XHR9XG5cdFx0XHQvLyBJZiB0YXNrJ3MgcGFyZW50IGhhcyBiZWVuIHJlc29sdmVkLCBwcm9wYWdhdGUgY2FuY2VsYXRpb24gdG8gdGhlIHRhc2sncyBkZXNjZW5kYW50c1xuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHRhc2suX2NhbmNlbCgpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBLZWVwIHRyYWNrIG9mIGNoaWxkIFRhc2tzIGZvciBwcm9wb2dhdGluZyBjYW5jZWxhdGlvbiBiYWNrIGRvd24gdGhlIGNoYWluXG5cdFx0dGhpcy5jaGlsZHJlbi5wdXNoKHRhc2spO1xuXG5cdFx0cmV0dXJuIHRhc2s7XG5cdH1cblxuXHRjYXRjaDxVPihvblJlamVjdGVkOiAocmVhc29uPzogRXJyb3IpID0+IChVIHwgVGhlbmFibGU8VT4pKTogVGFzazxVPiB7XG5cdFx0cmV0dXJuIDxhbnk+IHN1cGVyLmNhdGNoKG9uUmVqZWN0ZWQpO1xuXHR9XG5cbn1cbiJdfQ==