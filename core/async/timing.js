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
    /**
     * Used for delaying a Promise chain for a specific number of milliseconds.
     *
     * @param milliseconds the number of milliseconds to delay
     * @return {function(T): Promise<T>} a function producing a promise that eventually returns the value passed to it; usable with Thenable.then()
     */
    function delay(milliseconds) {
        return function (value) {
            return new Promise_1.default(function (resolve) {
                setTimeout(function () {
                    resolve(value);
                }, milliseconds);
            });
        };
    }
    exports.delay = delay;
    /**
     * Reject a promise chain if a result hasn't been found before the timeout
     *
     * @param milliseconds after this number of milliseconds a rejection will be returned
     * @param reason The reason for the rejection
     * @return {function(T): Promise<T>} a function that produces a promise that is rejected or resolved based on your timeout
     */
    function timeout(milliseconds, reason) {
        const start = Date.now();
        return function (value) {
            if (Date.now() - milliseconds > start) {
                return Promise_1.default.reject(reason);
            }
            return Promise_1.default.resolve(value);
        };
    }
    exports.timeout = timeout;
    /**
     * A Promise that will reject itself automatically after a time.
     * Useful for combining with other promises in Promise.race.
     */
    class DelayedRejection extends Promise_1.default {
        /**
         * @param milliseconds the number of milliseconds to wait before triggering a rejection
         * @param reason the reason for the rejection
         */
        constructor(milliseconds, reason) {
            super(function (resolve, reject) {
                setTimeout(reason ? reject.bind(this, reason) : reject.bind(this), milliseconds);
            });
        }
    }
    exports.DelayedRejection = DelayedRejection;
    ;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FzeW5jL3RpbWluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFBQSwwQkFBb0IsWUFBWSxDQUFDLENBQUE7SUFFakM7Ozs7O09BS0c7SUFDSCxlQUF5QixZQUFvQjtRQUM1QyxNQUFNLENBQUMsVUFBVSxLQUFRO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLGlCQUFPLENBQUMsVUFBVSxPQUFPO2dCQUNuQyxVQUFVLENBQUM7b0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoQixDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUM7SUFDSCxDQUFDO0lBUmUsYUFBSyxRQVFwQixDQUFBO0lBTUQ7Ozs7OztPQU1HO0lBQ0gsaUJBQTJCLFlBQW9CLEVBQUUsTUFBYTtRQUM3RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDekIsTUFBTSxDQUFDLFVBQVUsS0FBUTtZQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE1BQU0sQ0FBSSxNQUFNLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLGlCQUFPLENBQUMsT0FBTyxDQUFJLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQztJQUNILENBQUM7SUFSZSxlQUFPLFVBUXRCLENBQUE7SUFFRDs7O09BR0c7SUFDSCwrQkFBc0MsaUJBQU87UUFDNUM7OztXQUdHO1FBQ0gsWUFBWSxZQUFvQixFQUFFLE1BQWM7WUFDL0MsTUFBTSxVQUFVLE9BQU8sRUFBRSxNQUFNO2dCQUM5QixVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDbEYsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0lBQ0YsQ0FBQztJQVZZLHdCQUFnQixtQkFVNUIsQ0FBQTtJQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvbWlzZSBmcm9tICcuLi9Qcm9taXNlJztcblxuLyoqXG4gKiBVc2VkIGZvciBkZWxheWluZyBhIFByb21pc2UgY2hhaW4gZm9yIGEgc3BlY2lmaWMgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcGFyYW0gbWlsbGlzZWNvbmRzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5XG4gKiBAcmV0dXJuIHtmdW5jdGlvbihUKTogUHJvbWlzZTxUPn0gYSBmdW5jdGlvbiBwcm9kdWNpbmcgYSBwcm9taXNlIHRoYXQgZXZlbnR1YWxseSByZXR1cm5zIHRoZSB2YWx1ZSBwYXNzZWQgdG8gaXQ7IHVzYWJsZSB3aXRoIFRoZW5hYmxlLnRoZW4oKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVsYXk8VD4obWlsbGlzZWNvbmRzOiBudW1iZXIpOiBJZGVudGl0eTxUPiB7XG5cdHJldHVybiBmdW5jdGlvbiAodmFsdWU6IFQpOiBQcm9taXNlPFQ+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXNvbHZlKHZhbHVlKTtcblx0XHRcdH0sIG1pbGxpc2Vjb25kcyk7XG5cdFx0fSk7XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSWRlbnRpdHk8VD4ge1xuXHQodmFsdWU6IFQpOiBQcm9taXNlPFQ+O1xufVxuXG4vKipcbiAqIFJlamVjdCBhIHByb21pc2UgY2hhaW4gaWYgYSByZXN1bHQgaGFzbid0IGJlZW4gZm91bmQgYmVmb3JlIHRoZSB0aW1lb3V0XG4gKlxuICogQHBhcmFtIG1pbGxpc2Vjb25kcyBhZnRlciB0aGlzIG51bWJlciBvZiBtaWxsaXNlY29uZHMgYSByZWplY3Rpb24gd2lsbCBiZSByZXR1cm5lZFxuICogQHBhcmFtIHJlYXNvbiBUaGUgcmVhc29uIGZvciB0aGUgcmVqZWN0aW9uXG4gKiBAcmV0dXJuIHtmdW5jdGlvbihUKTogUHJvbWlzZTxUPn0gYSBmdW5jdGlvbiB0aGF0IHByb2R1Y2VzIGEgcHJvbWlzZSB0aGF0IGlzIHJlamVjdGVkIG9yIHJlc29sdmVkIGJhc2VkIG9uIHlvdXIgdGltZW91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdGltZW91dDxUPihtaWxsaXNlY29uZHM6IG51bWJlciwgcmVhc29uOiBFcnJvcik6IElkZW50aXR5PFQ+IHtcblx0Y29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xuXHRyZXR1cm4gZnVuY3Rpb24gKHZhbHVlOiBUKTogUHJvbWlzZTxUPiB7XG5cdFx0aWYgKERhdGUubm93KCkgLSBtaWxsaXNlY29uZHMgPiBzdGFydCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0PFQ+KHJlYXNvbik7XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmU8VD4odmFsdWUpO1xuXHR9O1xufVxuXG4vKipcbiAqIEEgUHJvbWlzZSB0aGF0IHdpbGwgcmVqZWN0IGl0c2VsZiBhdXRvbWF0aWNhbGx5IGFmdGVyIGEgdGltZS5cbiAqIFVzZWZ1bCBmb3IgY29tYmluaW5nIHdpdGggb3RoZXIgcHJvbWlzZXMgaW4gUHJvbWlzZS5yYWNlLlxuICovXG5leHBvcnQgY2xhc3MgRGVsYXllZFJlamVjdGlvbiBleHRlbmRzIFByb21pc2U8YW55PiB7XG5cdC8qKlxuXHQgKiBAcGFyYW0gbWlsbGlzZWNvbmRzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIHRyaWdnZXJpbmcgYSByZWplY3Rpb25cblx0ICogQHBhcmFtIHJlYXNvbiB0aGUgcmVhc29uIGZvciB0aGUgcmVqZWN0aW9uXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihtaWxsaXNlY29uZHM6IG51bWJlciwgcmVhc29uPzogRXJyb3IpIHtcblx0XHRzdXBlcihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRzZXRUaW1lb3V0KHJlYXNvbiA/IHJlamVjdC5iaW5kKHRoaXMsIHJlYXNvbikgOiByZWplY3QuYmluZCh0aGlzKSwgbWlsbGlzZWNvbmRzKTtcblx0XHR9KTtcblx0fVxufTtcbiJdfQ==