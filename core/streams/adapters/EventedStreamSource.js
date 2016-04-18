(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../../on', '../../Promise'], factory);
    }
})(function (require, exports) {
    "use strict";
    const on_1 = require('../../on');
    const Promise_1 = require('../../Promise');
    class EventedStreamSource {
        constructor(target, type) {
            this._target = target;
            if (Array.isArray(type)) {
                this._events = type;
            }
            else {
                this._events = [type];
            }
            this._handles = [];
        }
        start(controller) {
            this._controller = controller;
            this._events.forEach((eventName) => {
                this._handles.push(on_1.default(this._target, eventName, this._handleEvent.bind(this)));
            });
            return Promise_1.default.resolve();
        }
        cancel(reason) {
            while (this._handles.length) {
                this._handles.shift().destroy();
            }
            return Promise_1.default.resolve();
        }
        _handleEvent(event) {
            this._controller.enqueue(event);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = EventedStreamSource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRlZFN0cmVhbVNvdXJjZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJlYW1zL2FkYXB0ZXJzL0V2ZW50ZWRTdHJlYW1Tb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBRUEscUJBQWlDLFVBQVUsQ0FBQyxDQUFBO0lBQzVDLDBCQUFvQixlQUFlLENBQUMsQ0FBQTtJQU9wQztRQU1DLFlBQVksTUFBd0IsRUFBRSxJQUFnQjtZQUNyRCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUV0QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsSUFBSSxDQUFDLE9BQU8sR0FBUyxJQUFJLENBQUM7WUFDM0IsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNMLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBUSxJQUFJLENBQUUsQ0FBQztZQUMvQixDQUFDO1lBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDcEIsQ0FBQztRQUVELEtBQUssQ0FBQyxVQUEyQztZQUNoRCxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQWlCO2dCQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFFLENBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JGLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLGlCQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVELE1BQU0sQ0FBQyxNQUFZO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQyxDQUFDO1lBRUQsTUFBTSxDQUFDLGlCQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVTLFlBQVksQ0FBQyxLQUFZO1lBQ2xDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUM7SUFDRixDQUFDO0lBdkNEO3lDQXVDQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV2ZW50ZWQgZnJvbSAnLi4vLi4vRXZlbnRlZCc7XG5pbXBvcnQgeyBIYW5kbGUgfSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzJztcbmltcG9ydCBvbiwgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICcuLi8uLi9vbic7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICcuLi8uLi9Qcm9taXNlJztcbmltcG9ydCB7IFNvdXJjZSB9IGZyb20gJy4uL1JlYWRhYmxlU3RyZWFtJztcbmltcG9ydCBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIgZnJvbSAnLi4vUmVhZGFibGVTdHJlYW1Db250cm9sbGVyJztcblxuZXhwb3J0IHR5cGUgRXZlbnRUYXJnZXRUeXBlcyA9IEV2ZW50ZWQgfCBFdmVudEVtaXR0ZXIgfCBFdmVudFRhcmdldDtcbmV4cG9ydCB0eXBlIEV2ZW50VHlwZXMgPSBzdHJpbmcgfCBzdHJpbmdbXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRlZFN0cmVhbVNvdXJjZSBpbXBsZW1lbnRzIFNvdXJjZTxFdmVudD4ge1xuXHRwcm90ZWN0ZWQgX2NvbnRyb2xsZXI6IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlcjxFdmVudD47XG5cdHByb3RlY3RlZCBfdGFyZ2V0OiBFdmVudFRhcmdldFR5cGVzO1xuXHRwcm90ZWN0ZWQgX2V2ZW50czogc3RyaW5nW107XG5cdHByb3RlY3RlZCBfaGFuZGxlczogSGFuZGxlW107XG5cblx0Y29uc3RydWN0b3IodGFyZ2V0OiBFdmVudFRhcmdldFR5cGVzLCB0eXBlOiBFdmVudFR5cGVzKSB7XG5cdFx0dGhpcy5fdGFyZ2V0ID0gdGFyZ2V0O1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodHlwZSkpIHtcblx0XHRcdHRoaXMuX2V2ZW50cyA9IDxhbnk+IHR5cGU7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpcy5fZXZlbnRzID0gWyA8YW55PiB0eXBlIF07XG5cdFx0fVxuXG5cdFx0dGhpcy5faGFuZGxlcyA9IFtdO1xuXHR9XG5cblx0c3RhcnQoY29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPEV2ZW50Pik6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRoaXMuX2NvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuXHRcdHRoaXMuX2V2ZW50cy5mb3JFYWNoKChldmVudE5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0dGhpcy5faGFuZGxlcy5wdXNoKG9uKDxhbnk+IHRoaXMuX3RhcmdldCwgZXZlbnROYW1lLCB0aGlzLl9oYW5kbGVFdmVudC5iaW5kKHRoaXMpKSk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblxuXHRjYW5jZWwocmVhc29uPzogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0d2hpbGUgKHRoaXMuX2hhbmRsZXMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLl9oYW5kbGVzLnNoaWZ0KCkuZGVzdHJveSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaGFuZGxlRXZlbnQoZXZlbnQ6IEV2ZW50KSB7XG5cdFx0dGhpcy5fY29udHJvbGxlci5lbnF1ZXVlKGV2ZW50KTtcblx0fVxufVxuIl19