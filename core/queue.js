(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './global', './has'], factory);
    }
})(function (require, exports) {
    "use strict";
    const global_1 = require('./global');
    const has_1 = require('./has');
    function executeTask(item) {
        if (item.isActive) {
            item.callback();
        }
    }
    function getQueueHandle(item, destructor) {
        return {
            destroy: function () {
                this.destroy = function () { };
                item.isActive = false;
                item.callback = null;
                if (destructor) {
                    destructor();
                }
            }
        };
    }
    // When no mechanism for registering microtasks is exposed by the environment, microtasks will
    // be queued and then executed in a single macrotask before the other macrotasks are executed.
    let checkMicroTaskQueue;
    let microTasks;
    if (!has_1.default('microtasks')) {
        let isMicroTaskQueued = false;
        microTasks = [];
        checkMicroTaskQueue = function () {
            if (!isMicroTaskQueued) {
                isMicroTaskQueued = true;
                exports.queueTask(function () {
                    isMicroTaskQueued = false;
                    if (microTasks.length) {
                        let item;
                        while (item = microTasks.shift()) {
                            executeTask(item);
                        }
                    }
                });
            }
        };
    }
    /**
     * Schedules a callback to the macrotask queue.
     *
     * @param callback the function to be queued and later executed.
     * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
     */
    exports.queueTask = (function () {
        let destructor;
        let enqueue;
        // Since the IE implementation of `setImmediate` is not flawless, we will test for `postMessage` first.
        if (has_1.default('postmessage')) {
            const queue = [];
            global_1.default.addEventListener('message', function (event) {
                // Confirm that the event was triggered by the current window and by this particular implementation.
                if (event.source === global_1.default && event.data === 'dojo-queue-message') {
                    event.stopPropagation();
                    if (queue.length) {
                        executeTask(queue.shift());
                    }
                }
            });
            enqueue = function (item) {
                queue.push(item);
                global_1.default.postMessage('dojo-queue-message', '*');
            };
        }
        else if (has_1.default('setimmediate')) {
            destructor = global_1.default.clearImmediate;
            enqueue = function (item) {
                return setImmediate(executeTask.bind(null, item));
            };
        }
        else {
            destructor = global_1.default.clearTimeout;
            enqueue = function (item) {
                return setTimeout(executeTask.bind(null, item), 0);
            };
        }
        function queueTask(callback) {
            const item = {
                isActive: true,
                callback: callback
            };
            const id = enqueue(item);
            return getQueueHandle(item, destructor && function () {
                destructor(id);
            });
        }
        ;
        // TODO: Use aspect.before when it is available.
        return has_1.default('microtasks') ? queueTask : function (callback) {
            checkMicroTaskQueue();
            return queueTask(callback);
        };
    })();
    /**
     * Schedules an animation task with `window.requestAnimationFrame` if it exists, or with `queueTask` otherwise.
     *
     * Since requestAnimationFrame's behavior does not match that expected from `queueTask`, it is not used there.
     * However, at times it makes more sense to delegate to requestAnimationFrame; hence the following method.
     *
     * @param callback the function to be queued and later executed.
     * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
     */
    exports.queueAnimationTask = (function () {
        if (!has_1.default('raf')) {
            return exports.queueTask;
        }
        function queueAnimationTask(callback) {
            const item = {
                isActive: true,
                callback: callback
            };
            const rafId = requestAnimationFrame(executeTask.bind(null, item));
            return getQueueHandle(item, function () {
                cancelAnimationFrame(rafId);
            });
        }
        // TODO: Use aspect.before when it is available.
        return has_1.default('microtasks') ? queueAnimationTask : function (callback) {
            checkMicroTaskQueue();
            return queueAnimationTask(callback);
        };
    })();
    /**
     * Schedules a callback to the microtask queue.
     *
     * Any callbacks registered with `queueMicroTask` will be executed before the next macrotask. If no native
     * mechanism for scheduling macrotasks is exposed, then any callbacks will be fired before any macrotask
     * registered with `queueTask` or `queueAnimationTask`.
     *
     * @param callback the function to be queued and later executed.
     * @returns An object with a `destroy` method that, when called, prevents the registered callback from executing.
     */
    exports.queueMicroTask = (function () {
        let enqueue;
        if (has_1.default('host-node')) {
            enqueue = function (item) {
                global_1.default.process.nextTick(executeTask.bind(null, item));
            };
        }
        else if (has_1.default('promise')) {
            enqueue = function (item) {
                global_1.default.Promise.resolve(item).then(executeTask);
            };
        }
        else if (has_1.default('dom-mutationobserver')) {
            const HostMutationObserver = global_1.default.MutationObserver || global_1.default.WebKitMutationObserver;
            const node = document.createElement('div');
            const queue = [];
            const observer = new HostMutationObserver(function () {
                while (queue.length > 0) {
                    const item = queue.shift();
                    if (item && item.isActive) {
                        item.callback();
                    }
                }
            });
            observer.observe(node, { attributes: true });
            enqueue = function (item) {
                queue.push(item);
                node.setAttribute('queueStatus', '1');
            };
        }
        else {
            enqueue = function (item) {
                checkMicroTaskQueue();
                microTasks.push(item);
            };
        }
        return function (callback) {
            const item = {
                isActive: true,
                callback: callback
            };
            enqueue(item);
            return getQueueHandle(item);
        };
    })();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVldWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBQUEseUJBQW1CLFVBQVUsQ0FBQyxDQUFBO0lBQzlCLHNCQUFnQixPQUFPLENBQUMsQ0FBQTtJQUd4QixxQkFBcUIsSUFBZTtRQUNuQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakIsQ0FBQztJQUNGLENBQUM7SUFFRCx3QkFBd0IsSUFBZSxFQUFFLFVBQW9DO1FBQzVFLE1BQU0sQ0FBQztZQUNOLE9BQU8sRUFBRTtnQkFDUixJQUFJLENBQUMsT0FBTyxHQUFHLGNBQWEsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBRXJCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLFVBQVUsRUFBRSxDQUFDO2dCQUNkLENBQUM7WUFDRixDQUFDO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFZRCw4RkFBOEY7SUFDOUYsOEZBQThGO0lBQzlGLElBQUksbUJBQStCLENBQUM7SUFDcEMsSUFBSSxVQUF1QixDQUFDO0lBQzVCLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QixJQUFJLGlCQUFpQixHQUFZLEtBQUssQ0FBQztRQUV2QyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLG1CQUFtQixHQUFHO1lBQ3JCLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixpQkFBaUIsR0FBRyxJQUFJLENBQUM7Z0JBQ3pCLGlCQUFTLENBQUM7b0JBQ1QsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO29CQUUx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QUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sQ0FBQyxVQUFVLFFBQWlDO1lBQ2pELE1BQU0sSUFBSSxHQUFjO2dCQUN2QixRQUFRLEVBQUUsSUFBSTtnQkFDZCxRQUFRLEVBQUUsUUFBUTthQUNsQixDQUFDO1lBRUYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUM7SUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdsb2JhbCBmcm9tICcuL2dsb2JhbCc7XG5pbXBvcnQgaGFzIGZyb20gJy4vaGFzJztcbmltcG9ydCB7IEhhbmRsZSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmZ1bmN0aW9uIGV4ZWN1dGVUYXNrKGl0ZW06IFF1ZXVlSXRlbSk6IHZvaWQge1xuXHRpZiAoaXRlbS5pc0FjdGl2ZSkge1xuXHRcdGl0ZW0uY2FsbGJhY2soKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRRdWV1ZUhhbmRsZShpdGVtOiBRdWV1ZUl0ZW0sIGRlc3RydWN0b3I/OiAoLi4uYXJnczogYW55W10pID0+IGFueSk6IEhhbmRsZSB7XG5cdHJldHVybiB7XG5cdFx0ZGVzdHJveTogZnVuY3Rpb24gKCkge1xuXHRcdFx0dGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge307XG5cdFx0XHRpdGVtLmlzQWN0aXZlID0gZmFsc2U7XG5cdFx0XHRpdGVtLmNhbGxiYWNrID0gbnVsbDtcblxuXHRcdFx0aWYgKGRlc3RydWN0b3IpIHtcblx0XHRcdFx0ZGVzdHJ1Y3RvcigpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn1cblxuaW50ZXJmYWNlIFBvc3RNZXNzYWdlRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG5cdHNvdXJjZTogYW55O1xuXHRkYXRhOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUXVldWVJdGVtIHtcblx0aXNBY3RpdmU6IGJvb2xlYW47XG5cdGNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IGFueTtcbn1cblxuLy8gV2hlbiBubyBtZWNoYW5pc20gZm9yIHJlZ2lzdGVyaW5nIG1pY3JvdGFza3MgaXMgZXhwb3NlZCBieSB0aGUgZW52aXJvbm1lbnQsIG1pY3JvdGFza3Mgd2lsbFxuLy8gYmUgcXVldWVkIGFuZCB0aGVuIGV4ZWN1dGVkIGluIGEgc2luZ2xlIG1hY3JvdGFzayBiZWZvcmUgdGhlIG90aGVyIG1hY3JvdGFza3MgYXJlIGV4ZWN1dGVkLlxubGV0IGNoZWNrTWljcm9UYXNrUXVldWU6ICgpID0+IHZvaWQ7XG5sZXQgbWljcm9UYXNrczogUXVldWVJdGVtW107XG5pZiAoIWhhcygnbWljcm90YXNrcycpKSB7XG5cdGxldCBpc01pY3JvVGFza1F1ZXVlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdG1pY3JvVGFza3MgPSBbXTtcblx0Y2hlY2tNaWNyb1Rhc2tRdWV1ZSA9IGZ1bmN0aW9uICgpOiB2b2lkIHtcblx0XHRpZiAoIWlzTWljcm9UYXNrUXVldWVkKSB7XG5cdFx0XHRpc01pY3JvVGFza1F1ZXVlZCA9IHRydWU7XG5cdFx0XHRxdWV1ZVRhc2soZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRpc01pY3JvVGFza1F1ZXVlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdGlmIChtaWNyb1Rhc2tzLmxlbmd0aCkge1xuXHRcdFx0XHRcdGxldCBpdGVtOiBRdWV1ZUl0ZW07XG5cdFx0XHRcdFx0d2hpbGUgKGl0ZW0gPSBtaWNyb1Rhc2tzLnNoaWZ0KCkpIHtcblx0XHRcdFx0XHRcdGV4ZWN1dGVUYXNrKGl0ZW0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufVxuXG4vKipcbiAqIFNjaGVkdWxlcyBhIGNhbGxiYWNrIHRvIHRoZSBtYWNyb3Rhc2sgcXVldWUuXG4gKlxuICogQHBhcmFtIGNhbGxiYWNrIHRoZSBmdW5jdGlvbiB0byBiZSBxdWV1ZWQgYW5kIGxhdGVyIGV4ZWN1dGVkLlxuICogQHJldHVybnMgQW4gb2JqZWN0IHdpdGggYSBgZGVzdHJveWAgbWV0aG9kIHRoYXQsIHdoZW4gY2FsbGVkLCBwcmV2ZW50cyB0aGUgcmVnaXN0ZXJlZCBjYWxsYmFjayBmcm9tIGV4ZWN1dGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IHF1ZXVlVGFzayA9IChmdW5jdGlvbigpIHtcblx0bGV0IGRlc3RydWN0b3I6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55O1xuXHRsZXQgZW5xdWV1ZTogKGl0ZW06IFF1ZXVlSXRlbSkgPT4gdm9pZDtcblxuXHQvLyBTaW5jZSB0aGUgSUUgaW1wbGVtZW50YXRpb24gb2YgYHNldEltbWVkaWF0ZWAgaXMgbm90IGZsYXdsZXNzLCB3ZSB3aWxsIHRlc3QgZm9yIGBwb3N0TWVzc2FnZWAgZmlyc3QuXG5cdGlmIChoYXMoJ3Bvc3RtZXNzYWdlJykpIHtcblx0XHRjb25zdCBxdWV1ZTogUXVldWVJdGVtW10gPSBbXTtcblxuXHRcdGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2ZW50OiBQb3N0TWVzc2FnZUV2ZW50KTogdm9pZCB7XG5cdFx0XHQvLyBDb25maXJtIHRoYXQgdGhlIGV2ZW50IHdhcyB0cmlnZ2VyZWQgYnkgdGhlIGN1cnJlbnQgd2luZG93IGFuZCBieSB0aGlzIHBhcnRpY3VsYXIgaW1wbGVtZW50YXRpb24uXG5cdFx0XHRpZiAoZXZlbnQuc291cmNlID09PSBnbG9iYWwgJiYgZXZlbnQuZGF0YSA9PT0gJ2Rvam8tcXVldWUtbWVzc2FnZScpIHtcblx0XHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRcdFx0aWYgKHF1ZXVlLmxlbmd0aCkge1xuXHRcdFx0XHRcdGV4ZWN1dGVUYXNrKHF1ZXVlLnNoaWZ0KCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRlbnF1ZXVlID0gZnVuY3Rpb24gKGl0ZW06IFF1ZXVlSXRlbSk6IHZvaWQge1xuXHRcdFx0cXVldWUucHVzaChpdGVtKTtcblx0XHRcdGdsb2JhbC5wb3N0TWVzc2FnZSgnZG9qby1xdWV1ZS1tZXNzYWdlJywgJyonKTtcblx0XHR9O1xuXHR9XG5cdGVsc2UgaWYgKGhhcygnc2V0aW1tZWRpYXRlJykpIHtcblx0XHRkZXN0cnVjdG9yID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlO1xuXHRcdGVucXVldWUgPSBmdW5jdGlvbiAoaXRlbTogUXVldWVJdGVtKTogYW55IHtcblx0XHRcdHJldHVybiBzZXRJbW1lZGlhdGUoZXhlY3V0ZVRhc2suYmluZChudWxsLCBpdGVtKSk7XG5cdFx0fTtcblx0fVxuXHRlbHNlIHtcblx0XHRkZXN0cnVjdG9yID0gZ2xvYmFsLmNsZWFyVGltZW91dDtcblx0XHRlbnF1ZXVlID0gZnVuY3Rpb24gKGl0ZW06IFF1ZXVlSXRlbSk6IGFueSB7XG5cdFx0XHRyZXR1cm4gc2V0VGltZW91dChleGVjdXRlVGFzay5iaW5kKG51bGwsIGl0ZW0pLCAwKTtcblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gcXVldWVUYXNrKGNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IGFueSk6IEhhbmRsZSB7XG5cdFx0Y29uc3QgaXRlbTogUXVldWVJdGVtID0ge1xuXHRcdFx0aXNBY3RpdmU6IHRydWUsXG5cdFx0XHRjYWxsYmFjazogY2FsbGJhY2tcblx0XHR9O1xuXHRcdGNvbnN0IGlkOiBhbnkgPSBlbnF1ZXVlKGl0ZW0pO1xuXG5cdFx0cmV0dXJuIGdldFF1ZXVlSGFuZGxlKGl0ZW0sIGRlc3RydWN0b3IgJiYgZnVuY3Rpb24gKCkge1xuXHRcdFx0ZGVzdHJ1Y3RvcihpZCk7XG5cdFx0fSk7XG5cdH07XG5cblx0Ly8gVE9ETzogVXNlIGFzcGVjdC5iZWZvcmUgd2hlbiBpdCBpcyBhdmFpbGFibGUuXG5cdHJldHVybiBoYXMoJ21pY3JvdGFza3MnKSA/IHF1ZXVlVGFzayA6IGZ1bmN0aW9uIChjYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpOiBIYW5kbGUge1xuXHRcdGNoZWNrTWljcm9UYXNrUXVldWUoKTtcblx0XHRyZXR1cm4gcXVldWVUYXNrKGNhbGxiYWNrKTtcblx0fTtcbn0pKCk7XG5cbi8qKlxuICogU2NoZWR1bGVzIGFuIGFuaW1hdGlvbiB0YXNrIHdpdGggYHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVgIGlmIGl0IGV4aXN0cywgb3Igd2l0aCBgcXVldWVUYXNrYCBvdGhlcndpc2UuXG4gKlxuICogU2luY2UgcmVxdWVzdEFuaW1hdGlvbkZyYW1lJ3MgYmVoYXZpb3IgZG9lcyBub3QgbWF0Y2ggdGhhdCBleHBlY3RlZCBmcm9tIGBxdWV1ZVRhc2tgLCBpdCBpcyBub3QgdXNlZCB0aGVyZS5cbiAqIEhvd2V2ZXIsIGF0IHRpbWVzIGl0IG1ha2VzIG1vcmUgc2Vuc2UgdG8gZGVsZWdhdGUgdG8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lOyBoZW5jZSB0aGUgZm9sbG93aW5nIG1ldGhvZC5cbiAqXG4gKiBAcGFyYW0gY2FsbGJhY2sgdGhlIGZ1bmN0aW9uIHRvIGJlIHF1ZXVlZCBhbmQgbGF0ZXIgZXhlY3V0ZWQuXG4gKiBAcmV0dXJucyBBbiBvYmplY3Qgd2l0aCBhIGBkZXN0cm95YCBtZXRob2QgdGhhdCwgd2hlbiBjYWxsZWQsIHByZXZlbnRzIHRoZSByZWdpc3RlcmVkIGNhbGxiYWNrIGZyb20gZXhlY3V0aW5nLlxuICovXG5leHBvcnQgY29uc3QgcXVldWVBbmltYXRpb25UYXNrID0gKGZ1bmN0aW9uICgpIHtcblx0aWYgKCFoYXMoJ3JhZicpKSB7XG5cdFx0cmV0dXJuIHF1ZXVlVGFzaztcblx0fVxuXG5cdGZ1bmN0aW9uIHF1ZXVlQW5pbWF0aW9uVGFzayhjYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpOiBIYW5kbGUge1xuXHRcdGNvbnN0IGl0ZW06IFF1ZXVlSXRlbSA9IHtcblx0XHRcdGlzQWN0aXZlOiB0cnVlLFxuXHRcdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdFx0fTtcblx0XHRjb25zdCByYWZJZDogbnVtYmVyID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGV4ZWN1dGVUYXNrLmJpbmQobnVsbCwgaXRlbSkpO1xuXG5cdFx0cmV0dXJuIGdldFF1ZXVlSGFuZGxlKGl0ZW0sIGZ1bmN0aW9uICgpIHtcblx0XHRcdGNhbmNlbEFuaW1hdGlvbkZyYW1lKHJhZklkKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIFRPRE86IFVzZSBhc3BlY3QuYmVmb3JlIHdoZW4gaXQgaXMgYXZhaWxhYmxlLlxuXHRyZXR1cm4gaGFzKCdtaWNyb3Rhc2tzJykgPyBxdWV1ZUFuaW1hdGlvblRhc2sgOiBmdW5jdGlvbiAoY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55KTogSGFuZGxlIHtcblx0XHRjaGVja01pY3JvVGFza1F1ZXVlKCk7XG5cdFx0cmV0dXJuIHF1ZXVlQW5pbWF0aW9uVGFzayhjYWxsYmFjayk7XG5cdH07XG59KSgpO1xuXG4vKipcbiAqIFNjaGVkdWxlcyBhIGNhbGxiYWNrIHRvIHRoZSBtaWNyb3Rhc2sgcXVldWUuXG4gKlxuICogQW55IGNhbGxiYWNrcyByZWdpc3RlcmVkIHdpdGggYHF1ZXVlTWljcm9UYXNrYCB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSB0aGUgbmV4dCBtYWNyb3Rhc2suIElmIG5vIG5hdGl2ZVxuICogbWVjaGFuaXNtIGZvciBzY2hlZHVsaW5nIG1hY3JvdGFza3MgaXMgZXhwb3NlZCwgdGhlbiBhbnkgY2FsbGJhY2tzIHdpbGwgYmUgZmlyZWQgYmVmb3JlIGFueSBtYWNyb3Rhc2tcbiAqIHJlZ2lzdGVyZWQgd2l0aCBgcXVldWVUYXNrYCBvciBgcXVldWVBbmltYXRpb25UYXNrYC5cbiAqXG4gKiBAcGFyYW0gY2FsbGJhY2sgdGhlIGZ1bmN0aW9uIHRvIGJlIHF1ZXVlZCBhbmQgbGF0ZXIgZXhlY3V0ZWQuXG4gKiBAcmV0dXJucyBBbiBvYmplY3Qgd2l0aCBhIGBkZXN0cm95YCBtZXRob2QgdGhhdCwgd2hlbiBjYWxsZWQsIHByZXZlbnRzIHRoZSByZWdpc3RlcmVkIGNhbGxiYWNrIGZyb20gZXhlY3V0aW5nLlxuICovXG5leHBvcnQgbGV0IHF1ZXVlTWljcm9UYXNrID0gKGZ1bmN0aW9uICgpIHtcblx0bGV0IGVucXVldWU6IChpdGVtOiBRdWV1ZUl0ZW0pID0+IHZvaWQ7XG5cblx0aWYgKGhhcygnaG9zdC1ub2RlJykpIHtcblx0XHRlbnF1ZXVlID0gZnVuY3Rpb24gKGl0ZW06IFF1ZXVlSXRlbSk6IHZvaWQge1xuXHRcdFx0Z2xvYmFsLnByb2Nlc3MubmV4dFRpY2soZXhlY3V0ZVRhc2suYmluZChudWxsLCBpdGVtKSk7XG5cdFx0fTtcblx0fVxuXHRlbHNlIGlmIChoYXMoJ3Byb21pc2UnKSkge1xuXHRcdGVucXVldWUgPSBmdW5jdGlvbiAoaXRlbTogUXVldWVJdGVtKTogdm9pZCB7XG5cdFx0XHRnbG9iYWwuUHJvbWlzZS5yZXNvbHZlKGl0ZW0pLnRoZW4oZXhlY3V0ZVRhc2spO1xuXHRcdH07XG5cdH1cblx0ZWxzZSBpZiAoaGFzKCdkb20tbXV0YXRpb25vYnNlcnZlcicpKSB7XG5cdFx0Y29uc3QgSG9zdE11dGF0aW9uT2JzZXJ2ZXIgPSBnbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBnbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcblx0XHRjb25zdCBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0Y29uc3QgcXVldWU6IFF1ZXVlSXRlbVtdID0gW107XG5cdFx0Y29uc3Qgb2JzZXJ2ZXIgPSBuZXcgSG9zdE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCk6IHZvaWQge1xuXHRcdFx0d2hpbGUgKHF1ZXVlLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y29uc3QgaXRlbSA9IHF1ZXVlLnNoaWZ0KCk7XG5cdFx0XHRcdGlmIChpdGVtICYmIGl0ZW0uaXNBY3RpdmUpIHtcblx0XHRcdFx0XHRpdGVtLmNhbGxiYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG5cdFx0ZW5xdWV1ZSA9IGZ1bmN0aW9uIChpdGVtOiBRdWV1ZUl0ZW0pOiB2b2lkIHtcblx0XHRcdHF1ZXVlLnB1c2goaXRlbSk7XG5cdFx0XHRub2RlLnNldEF0dHJpYnV0ZSgncXVldWVTdGF0dXMnLCAnMScpO1xuXHRcdH07XG5cdH1cblx0ZWxzZSB7XG5cdFx0ZW5xdWV1ZSA9IGZ1bmN0aW9uIChpdGVtOiBRdWV1ZUl0ZW0pOiB2b2lkIHtcblx0XHRcdGNoZWNrTWljcm9UYXNrUXVldWUoKTtcblx0XHRcdG1pY3JvVGFza3MucHVzaChpdGVtKTtcblx0XHR9O1xuXHR9XG5cblx0cmV0dXJuIGZ1bmN0aW9uIChjYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpOiBIYW5kbGUge1xuXHRcdGNvbnN0IGl0ZW06IFF1ZXVlSXRlbSA9IHtcblx0XHRcdGlzQWN0aXZlOiB0cnVlLFxuXHRcdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdFx0fTtcblxuXHRcdGVucXVldWUoaXRlbSk7XG5cblx0XHRyZXR1cm4gZ2V0UXVldWVIYW5kbGUoaXRlbSk7XG5cdH07XG59KSgpO1xuIl19