(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    class RequestTimeoutError {
        constructor(message) {
            this.message = message || 'The request timed out.';
        }
        get name() {
            return 'RequestTimeoutError';
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = RequestTimeoutError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdFRpbWVvdXRFcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXF1ZXN0L2Vycm9ycy9SZXF1ZXN0VGltZW91dEVycm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUVBO1FBUUMsWUFBWSxPQUFnQjtZQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSx3QkFBd0IsQ0FBQztRQUNwRCxDQUFDO1FBUkQsSUFBSSxJQUFJO1lBQ1AsTUFBTSxDQUFDLHFCQUFxQixDQUFDO1FBQzlCLENBQUM7SUFPRixDQUFDO0lBWEQ7eUNBV0MsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlcXVlc3RFcnJvciwgUmVzcG9uc2UgfSBmcm9tICcuLi8uLi9yZXF1ZXN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVxdWVzdFRpbWVvdXRFcnJvcjxUPiBpbXBsZW1lbnRzIFJlcXVlc3RFcnJvcjxUPiB7XG5cdG1lc3NhZ2U6IHN0cmluZztcblx0Z2V0IG5hbWUoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gJ1JlcXVlc3RUaW1lb3V0RXJyb3InO1xuXHR9XG5cblx0cmVzcG9uc2U6IFJlc3BvbnNlPFQ+O1xuXG5cdGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcpIHtcblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlIHx8ICdUaGUgcmVxdWVzdCB0aW1lZCBvdXQuJztcblx0fVxufVxuIl19