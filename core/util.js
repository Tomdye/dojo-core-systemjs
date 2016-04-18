(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './lang'], factory);
    }
})(function (require, exports) {
    "use strict";
    const lang_1 = require('./lang');
    /**
     * Wraps a setTimeout call in a handle, allowing the timeout to be cleared by calling destroy.
     *
     * @param callback Callback to be called when the timeout elapses
     * @param delay Number of milliseconds to wait before calling the callback
     * @return Handle which can be destroyed to clear the timeout
     */
    function createTimer(callback, delay) {
        let timerId = setTimeout(callback, delay);
        return lang_1.createHandle(function () {
            clearTimeout(timerId);
            timerId = null;
        });
    }
    exports.createTimer = createTimer;
    /**
     * Wraps a callback, returning a function which fires after no further calls are received over a set interval.
     *
     * @param callback Callback to wrap
     * @param delay Number of milliseconds to wait after any invocations before calling the original callback
     * @return Debounced function
     */
    function debounce(callback, delay) {
        // node.d.ts clobbers setTimeout/clearTimeout with versions that return/receive NodeJS.Timer,
        // but browsers return/receive a number
        let timer;
        return function () {
            timer && clearTimeout(timer);
            let context = this;
            let args = arguments;
            timer = setTimeout(function () {
                callback.apply(context, args);
                args = context = timer = null;
            }, delay);
        };
    }
    exports.debounce = debounce;
    /**
     * Wraps a callback, returning a function which fires at most once per set interval.
     *
     * @param callback Callback to wrap
     * @param delay Number of milliseconds to wait before allowing the original callback to be called again
     * @return Throttled function
     */
    function throttle(callback, delay) {
        let ran;
        return function () {
            if (ran) {
                return;
            }
            ran = true;
            callback.apply(this, arguments);
            setTimeout(function () {
                ran = null;
            }, delay);
        };
    }
    exports.throttle = throttle;
    /**
     * Like throttle, but calls the callback at the end of each interval rather than the beginning.
     * Useful for e.g. resize or scroll events, when debounce would appear unresponsive.
     *
     * @param callback Callback to wrap
     * @param delay Number of milliseconds to wait before calling the original callback and allowing it to be called again
     * @return Throttled function
     */
    function throttleAfter(callback, delay) {
        let ran;
        return function () {
            if (ran) {
                return;
            }
            ran = true;
            let context = this;
            let args = arguments;
            setTimeout(function () {
                callback.apply(context, args);
                args = context = ran = null;
            }, delay);
        };
    }
    exports.throttleAfter = throttleAfter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUNBLHVCQUE2QixRQUFRLENBQUMsQ0FBQTtJQUV0Qzs7Ozs7O09BTUc7SUFDSCxxQkFBNEIsUUFBa0MsRUFBRSxLQUFjO1FBQzdFLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFMUMsTUFBTSxDQUFDLG1CQUFZLENBQUM7WUFDbkIsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RCLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBUGUsbUJBQVcsY0FPMUIsQ0FBQTtJQUVEOzs7Ozs7T0FNRztJQUNILGtCQUE2RCxRQUFXLEVBQUUsS0FBYTtRQUN0Riw2RkFBNkY7UUFDN0YsdUNBQXVDO1FBQ3ZDLElBQUksS0FBVSxDQUFDO1FBRWYsTUFBTSxDQUFLO1lBQ1YsS0FBSyxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU3QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDbkIsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDO1lBRXJCLEtBQUssR0FBRyxVQUFVLENBQUM7Z0JBQ2xCLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM5QixJQUFJLEdBQUcsT0FBTyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDL0IsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQWhCZSxnQkFBUSxXQWdCdkIsQ0FBQTtJQUVEOzs7Ozs7T0FNRztJQUNILGtCQUE2RCxRQUFXLEVBQUUsS0FBYTtRQUN0RixJQUFJLEdBQVksQ0FBQztRQUVqQixNQUFNLENBQUs7WUFDVixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNULE1BQU0sQ0FBQztZQUNSLENBQUM7WUFFRCxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBRVgsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDaEMsVUFBVSxDQUFDO2dCQUNWLEdBQUcsR0FBRyxJQUFJLENBQUM7WUFDWixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUM7SUFDSCxDQUFDO0lBZmUsZ0JBQVEsV0FldkIsQ0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSCx1QkFBa0UsUUFBVyxFQUFFLEtBQWE7UUFDM0YsSUFBSSxHQUFZLENBQUM7UUFFakIsTUFBTSxDQUFLO1lBQ1YsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDVCxNQUFNLENBQUM7WUFDUixDQUFDO1lBRUQsR0FBRyxHQUFHLElBQUksQ0FBQztZQUVYLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQztZQUNuQixJQUFJLElBQUksR0FBRyxTQUFTLENBQUM7WUFFckIsVUFBVSxDQUFDO2dCQUNWLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM5QixJQUFJLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7WUFDN0IsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQWxCZSxxQkFBYSxnQkFrQjVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIYW5kbGUgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgY3JlYXRlSGFuZGxlIH0gZnJvbSAnLi9sYW5nJztcblxuLyoqXG4gKiBXcmFwcyBhIHNldFRpbWVvdXQgY2FsbCBpbiBhIGhhbmRsZSwgYWxsb3dpbmcgdGhlIHRpbWVvdXQgdG8gYmUgY2xlYXJlZCBieSBjYWxsaW5nIGRlc3Ryb3kuXG4gKlxuICogQHBhcmFtIGNhbGxiYWNrIENhbGxiYWNrIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSB0aW1lb3V0IGVsYXBzZXNcbiAqIEBwYXJhbSBkZWxheSBOdW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGNhbGxpbmcgdGhlIGNhbGxiYWNrXG4gKiBAcmV0dXJuIEhhbmRsZSB3aGljaCBjYW4gYmUgZGVzdHJveWVkIHRvIGNsZWFyIHRoZSB0aW1lb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUaW1lcihjYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkLCBkZWxheT86IG51bWJlcik6IEhhbmRsZSB7XG5cdGxldCB0aW1lcklkID0gc2V0VGltZW91dChjYWxsYmFjaywgZGVsYXkpO1xuXG5cdHJldHVybiBjcmVhdGVIYW5kbGUoZnVuY3Rpb24gKCkge1xuXHRcdGNsZWFyVGltZW91dCh0aW1lcklkKTtcblx0XHR0aW1lcklkID0gbnVsbDtcblx0fSk7XG59XG5cbi8qKlxuICogV3JhcHMgYSBjYWxsYmFjaywgcmV0dXJuaW5nIGEgZnVuY3Rpb24gd2hpY2ggZmlyZXMgYWZ0ZXIgbm8gZnVydGhlciBjYWxscyBhcmUgcmVjZWl2ZWQgb3ZlciBhIHNldCBpbnRlcnZhbC5cbiAqXG4gKiBAcGFyYW0gY2FsbGJhY2sgQ2FsbGJhY2sgdG8gd3JhcFxuICogQHBhcmFtIGRlbGF5IE51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gd2FpdCBhZnRlciBhbnkgaW52b2NhdGlvbnMgYmVmb3JlIGNhbGxpbmcgdGhlIG9yaWdpbmFsIGNhbGxiYWNrXG4gKiBAcmV0dXJuIERlYm91bmNlZCBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVib3VuY2U8VCBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4oY2FsbGJhY2s6IFQsIGRlbGF5OiBudW1iZXIpOiBUIHtcblx0Ly8gbm9kZS5kLnRzIGNsb2JiZXJzIHNldFRpbWVvdXQvY2xlYXJUaW1lb3V0IHdpdGggdmVyc2lvbnMgdGhhdCByZXR1cm4vcmVjZWl2ZSBOb2RlSlMuVGltZXIsXG5cdC8vIGJ1dCBicm93c2VycyByZXR1cm4vcmVjZWl2ZSBhIG51bWJlclxuXHRsZXQgdGltZXI6IGFueTtcblxuXHRyZXR1cm4gPFQ+IGZ1bmN0aW9uICgpIHtcblx0XHR0aW1lciAmJiBjbGVhclRpbWVvdXQodGltZXIpO1xuXG5cdFx0bGV0IGNvbnRleHQgPSB0aGlzO1xuXHRcdGxldCBhcmdzID0gYXJndW1lbnRzO1xuXG5cdFx0dGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdGNhbGxiYWNrLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuXHRcdFx0YXJncyA9IGNvbnRleHQgPSB0aW1lciA9IG51bGw7XG5cdFx0fSwgZGVsYXkpO1xuXHR9O1xufVxuXG4vKipcbiAqIFdyYXBzIGEgY2FsbGJhY2ssIHJldHVybmluZyBhIGZ1bmN0aW9uIHdoaWNoIGZpcmVzIGF0IG1vc3Qgb25jZSBwZXIgc2V0IGludGVydmFsLlxuICpcbiAqIEBwYXJhbSBjYWxsYmFjayBDYWxsYmFjayB0byB3cmFwXG4gKiBAcGFyYW0gZGVsYXkgTnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSBhbGxvd2luZyB0aGUgb3JpZ2luYWwgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIGFnYWluXG4gKiBAcmV0dXJuIFRocm90dGxlZCBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gdGhyb3R0bGU8VCBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZD4oY2FsbGJhY2s6IFQsIGRlbGF5OiBudW1iZXIpOiBUIHtcblx0bGV0IHJhbjogYm9vbGVhbjtcblxuXHRyZXR1cm4gPFQ+IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAocmFuKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0cmFuID0gdHJ1ZTtcblxuXHRcdGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRyYW4gPSBudWxsO1xuXHRcdH0sIGRlbGF5KTtcblx0fTtcbn1cblxuLyoqXG4gKiBMaWtlIHRocm90dGxlLCBidXQgY2FsbHMgdGhlIGNhbGxiYWNrIGF0IHRoZSBlbmQgb2YgZWFjaCBpbnRlcnZhbCByYXRoZXIgdGhhbiB0aGUgYmVnaW5uaW5nLlxuICogVXNlZnVsIGZvciBlLmcuIHJlc2l6ZSBvciBzY3JvbGwgZXZlbnRzLCB3aGVuIGRlYm91bmNlIHdvdWxkIGFwcGVhciB1bnJlc3BvbnNpdmUuXG4gKlxuICogQHBhcmFtIGNhbGxiYWNrIENhbGxiYWNrIHRvIHdyYXBcbiAqIEBwYXJhbSBkZWxheSBOdW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGNhbGxpbmcgdGhlIG9yaWdpbmFsIGNhbGxiYWNrIGFuZCBhbGxvd2luZyBpdCB0byBiZSBjYWxsZWQgYWdhaW5cbiAqIEByZXR1cm4gVGhyb3R0bGVkIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aHJvdHRsZUFmdGVyPFQgZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IHZvaWQ+KGNhbGxiYWNrOiBULCBkZWxheTogbnVtYmVyKTogVCB7XG5cdGxldCByYW46IGJvb2xlYW47XG5cblx0cmV0dXJuIDxUPiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHJhbikge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHJhbiA9IHRydWU7XG5cblx0XHRsZXQgY29udGV4dCA9IHRoaXM7XG5cdFx0bGV0IGFyZ3MgPSBhcmd1bWVudHM7XG5cblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdGNhbGxiYWNrLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuXHRcdFx0YXJncyA9IGNvbnRleHQgPSByYW4gPSBudWxsO1xuXHRcdH0sIGRlbGF5KTtcblx0fTtcbn1cbiJdfQ==