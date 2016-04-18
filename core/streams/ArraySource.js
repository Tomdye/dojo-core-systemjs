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
    const resolved = Promise_1.default.resolve();
    /**
     * A seekable array source
     */
    class ArraySource {
        constructor(data) {
            this.currentPosition = 0;
            this.data = [];
            if (data && data.length) {
                this.data = this.data.concat(data);
            }
        }
        seek(controller, position) {
            if (position >= this.data.length || position < 0) {
                let error = new Error('Invalid seek position: ' + position);
                controller.error(error);
                return Promise_1.default.reject(error);
            }
            this.currentPosition = position;
            return Promise_1.default.resolve(this.currentPosition);
        }
        start(controller) {
            return resolved;
        }
        pull(controller) {
            if (this.currentPosition >= this.data.length) {
                controller.close();
            }
            else {
                this.currentPosition += 1;
                controller.enqueue(this.data[this.currentPosition - 1]);
            }
            return resolved;
        }
        cancel(reason) {
            return resolved;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ArraySource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJyYXlTb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyZWFtcy9BcnJheVNvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFBQSwwQkFBb0IsWUFBWSxDQUFDLENBQUE7SUFJakMsTUFBTSxRQUFRLEdBQUcsaUJBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUVuQzs7T0FFRztJQUNIO1FBT0MsWUFBWSxJQUFjO1lBQ3pCLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRWYsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLENBQUM7UUFDRixDQUFDO1FBRUQsSUFBSSxDQUFDLFVBQXVDLEVBQUUsUUFBZ0I7WUFDN0QsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsR0FBRyxRQUFRLENBQUMsQ0FBQztnQkFDNUQsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFeEIsTUFBTSxDQUFDLGlCQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlCLENBQUM7WUFFRCxJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQztZQUVoQyxNQUFNLENBQUMsaUJBQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCxLQUFLLENBQUMsVUFBdUM7WUFDNUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNqQixDQUFDO1FBRUQsSUFBSSxDQUFDLFVBQXVDO1lBQzNDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDcEIsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNMLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxDQUFDO2dCQUMxQixVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pELENBQUM7WUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2pCLENBQUM7UUFFRCxNQUFNLENBQUMsTUFBWTtZQUNsQixNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2pCLENBQUM7SUFDRixDQUFDO0lBaEREO2lDQWdEQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAnLi4vUHJvbWlzZSc7XG5pbXBvcnQgeyBTb3VyY2UgfSBmcm9tICcuL1JlYWRhYmxlU3RyZWFtJztcbmltcG9ydCBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIgZnJvbSAnLi9SZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXInO1xuXG5jb25zdCByZXNvbHZlZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG4vKipcbiAqIEEgc2Vla2FibGUgYXJyYXkgc291cmNlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFycmF5U291cmNlPFQ+IGltcGxlbWVudHMgU291cmNlPFQ+IHtcblx0Ly8gY3VycmVudCBzZWVrIHBvc2l0aW9uIGluIHRoZSBkYXRhIGFycmF5XG5cdGN1cnJlbnRQb3NpdGlvbjogbnVtYmVyO1xuXG5cdC8vIHNoYWxsb3cgY29weSBvZiBkYXRhIGFycmF5IHBhc3NlZCB0byBjb25zdHJ1Y3RvclxuXHRkYXRhOiBBcnJheTxUPjtcblxuXHRjb25zdHJ1Y3RvcihkYXRhOiBBcnJheTxUPikge1xuXHRcdHRoaXMuY3VycmVudFBvc2l0aW9uID0gMDtcblx0XHR0aGlzLmRhdGEgPSBbXTtcblxuXHRcdGlmIChkYXRhICYmIGRhdGEubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLmRhdGEgPSB0aGlzLmRhdGEuY29uY2F0KGRhdGEpO1xuXHRcdH1cblx0fVxuXG5cdHNlZWsoY29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPFQ+LCBwb3NpdGlvbjogbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+IHtcblx0XHRpZiAocG9zaXRpb24gPj0gdGhpcy5kYXRhLmxlbmd0aCB8fCBwb3NpdGlvbiA8IDApIHtcblx0XHRcdGxldCBlcnJvciA9IG5ldyBFcnJvcignSW52YWxpZCBzZWVrIHBvc2l0aW9uOiAnICsgcG9zaXRpb24pO1xuXHRcdFx0Y29udHJvbGxlci5lcnJvcihlcnJvcik7XG5cblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG5cdFx0fVxuXG5cdFx0dGhpcy5jdXJyZW50UG9zaXRpb24gPSBwb3NpdGlvbjtcblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5jdXJyZW50UG9zaXRpb24pO1xuXHR9XG5cblx0c3RhcnQoY29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPFQ+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHJlc29sdmVkO1xuXHR9XG5cblx0cHVsbChjb250cm9sbGVyOiBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXI8VD4pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAodGhpcy5jdXJyZW50UG9zaXRpb24gPj0gdGhpcy5kYXRhLmxlbmd0aCkge1xuXHRcdFx0Y29udHJvbGxlci5jbG9zZSgpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXMuY3VycmVudFBvc2l0aW9uICs9IDE7XG5cdFx0XHRjb250cm9sbGVyLmVucXVldWUodGhpcy5kYXRhW3RoaXMuY3VycmVudFBvc2l0aW9uIC0gMV0pO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXNvbHZlZDtcblx0fVxuXG5cdGNhbmNlbChyZWFzb24/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gcmVzb2x2ZWQ7XG5cdH1cbn1cbiJdfQ==