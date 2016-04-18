(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../../Promise'], factory);
    }
})(function (require, exports) {
    "use strict";
    const Promise_1 = require('../../Promise');
    class WritableNodeStreamSink {
        constructor(nodeStream, encoding = '') {
            this._isClosed = false;
            this._encoding = encoding;
            this._nodeStream = nodeStream;
            this._onError = this._handleError.bind(this);
            this._nodeStream.on('error', this._onError);
        }
        _handleError(error) {
            this._isClosed = true;
            this._removeListeners();
            if (this._rejectWritePromise) {
                this._rejectWritePromise(error);
                this._rejectWritePromise = undefined;
            }
            throw error;
        }
        _removeListeners() {
            this._nodeStream.removeListener('error', this._onError);
        }
        abort(reason) {
            // TODO: is there anything else to do here?
            return this.close();
        }
        close() {
            this._isClosed = true;
            this._removeListeners();
            return new Promise_1.default((resolve, reject) => {
                // TODO: if the node stream returns an error from 'end', should we:
                // 1. reject this.close with the error? (implemented)
                // 2. put 'this' into an error state? (this._handleError)
                this._nodeStream.end(null, null, (error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        start() {
            if (this._isClosed) {
                return Promise_1.default.reject(new Error('Stream is closed'));
            }
            return Promise_1.default.resolve();
        }
        write(chunk) {
            if (this._isClosed) {
                return Promise_1.default.reject(new Error('Stream is closed'));
            }
            return new Promise_1.default((resolve, reject) => {
                this._rejectWritePromise = reject;
                this._nodeStream.write(chunk, this._encoding, (error) => {
                    if (error) {
                        this._handleError(error);
                    }
                    else {
                        this._rejectWritePromise = undefined;
                        resolve();
                    }
                });
            });
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = WritableNodeStreamSink;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV3JpdGFibGVOb2RlU3RyZWFtU2luay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJlYW1zL2FkYXB0ZXJzL1dyaXRhYmxlTm9kZVN0cmVhbVNpbmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBQUEsMEJBQW9CLGVBQWUsQ0FBQyxDQUFBO0lBS3BDO1FBT0MsWUFBWSxVQUFpQyxFQUFFLFFBQVEsR0FBVyxFQUFFO1lBQ25FLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRXZCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1lBQzFCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1lBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRVMsWUFBWSxDQUFDLEtBQVk7WUFDbEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFFeEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxDQUFDO1lBQ3RDLENBQUM7WUFFRCxNQUFNLEtBQUssQ0FBQztRQUNiLENBQUM7UUFFUyxnQkFBZ0I7WUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRUQsS0FBSyxDQUFDLE1BQVc7WUFDaEIsMkNBQTJDO1lBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQztRQUVELEtBQUs7WUFDSixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUV4QixNQUFNLENBQUMsSUFBSSxpQkFBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU07Z0JBQ3hDLG1FQUFtRTtnQkFDbkUscURBQXFEO2dCQUNyRCx5REFBeUQ7Z0JBQ3pELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFZO29CQUM3QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDZixDQUFDO29CQUNELElBQUksQ0FBQyxDQUFDO3dCQUNMLE9BQU8sRUFBRSxDQUFDO29CQUNYLENBQUM7Z0JBQ0YsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLO1lBQ0osRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDdEQsQ0FBQztZQUVELE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxLQUFLLENBQUMsS0FBYTtZQUNsQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsTUFBTSxDQUFDLGlCQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUN0RCxDQUFDO1lBRUQsTUFBTSxDQUFDLElBQUksaUJBQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNO2dCQUN4QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDO2dCQUVsQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQWE7b0JBQzNELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ1gsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDMUIsQ0FBQztvQkFDRCxJQUFJLENBQUMsQ0FBQzt3QkFDTCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxDQUFDO3dCQUNyQyxPQUFPLEVBQUUsQ0FBQztvQkFDWCxDQUFDO2dCQUNGLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0lBQ0YsQ0FBQztJQW5GRDs0Q0FtRkMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9taXNlIGZyb20gJy4uLy4uL1Byb21pc2UnO1xuaW1wb3J0IHsgU2luayB9IGZyb20gJy4uL1dyaXRhYmxlU3RyZWFtJztcblxuZXhwb3J0IHR5cGUgTm9kZVNvdXJjZVR5cGUgPSBCdWZmZXIgfCBzdHJpbmc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdyaXRhYmxlTm9kZVN0cmVhbVNpbmsgaW1wbGVtZW50cyBTaW5rPE5vZGVTb3VyY2VUeXBlPiB7XG5cdHByb3RlY3RlZCBfZW5jb2Rpbmc6IHN0cmluZztcblx0cHJvdGVjdGVkIF9pc0Nsb3NlZDogYm9vbGVhbjtcblx0cHJvdGVjdGVkIF9ub2RlU3RyZWFtOiBOb2RlSlMuV3JpdGFibGVTdHJlYW07XG5cdHByb3RlY3RlZCBfb25FcnJvcjogKGVycm9yOiBFcnJvcikgPT4gdm9pZDtcblx0cHJvdGVjdGVkIF9yZWplY3RXcml0ZVByb21pc2U6IEZ1bmN0aW9uO1xuXG5cdGNvbnN0cnVjdG9yKG5vZGVTdHJlYW06IE5vZGVKUy5Xcml0YWJsZVN0cmVhbSwgZW5jb2Rpbmc6IHN0cmluZyA9ICcnKSB7XG5cdFx0dGhpcy5faXNDbG9zZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuX2VuY29kaW5nID0gZW5jb2Rpbmc7XG5cdFx0dGhpcy5fbm9kZVN0cmVhbSA9IG5vZGVTdHJlYW07XG5cdFx0dGhpcy5fb25FcnJvciA9IHRoaXMuX2hhbmRsZUVycm9yLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5fbm9kZVN0cmVhbS5vbignZXJyb3InLCB0aGlzLl9vbkVycm9yKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaGFuZGxlRXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG5cdFx0dGhpcy5faXNDbG9zZWQgPSB0cnVlO1xuXHRcdHRoaXMuX3JlbW92ZUxpc3RlbmVycygpO1xuXG5cdFx0aWYgKHRoaXMuX3JlamVjdFdyaXRlUHJvbWlzZSkge1xuXHRcdFx0dGhpcy5fcmVqZWN0V3JpdGVQcm9taXNlKGVycm9yKTtcblx0XHRcdHRoaXMuX3JlamVjdFdyaXRlUHJvbWlzZSA9IHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHR0aHJvdyBlcnJvcjtcblx0fVxuXG5cdHByb3RlY3RlZCBfcmVtb3ZlTGlzdGVuZXJzKCk6IHZvaWQge1xuXHRcdHRoaXMuX25vZGVTdHJlYW0ucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fb25FcnJvcik7XG5cdH1cblxuXHRhYm9ydChyZWFzb246IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIFRPRE86IGlzIHRoZXJlIGFueXRoaW5nIGVsc2UgdG8gZG8gaGVyZT9cblx0XHRyZXR1cm4gdGhpcy5jbG9zZSgpO1xuXHR9XG5cblx0Y2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5faXNDbG9zZWQgPSB0cnVlO1xuXHRcdHRoaXMuX3JlbW92ZUxpc3RlbmVycygpO1xuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdC8vIFRPRE86IGlmIHRoZSBub2RlIHN0cmVhbSByZXR1cm5zIGFuIGVycm9yIGZyb20gJ2VuZCcsIHNob3VsZCB3ZTpcblx0XHRcdC8vIDEuIHJlamVjdCB0aGlzLmNsb3NlIHdpdGggdGhlIGVycm9yPyAoaW1wbGVtZW50ZWQpXG5cdFx0XHQvLyAyLiBwdXQgJ3RoaXMnIGludG8gYW4gZXJyb3Igc3RhdGU/ICh0aGlzLl9oYW5kbGVFcnJvcilcblx0XHRcdHRoaXMuX25vZGVTdHJlYW0uZW5kKG51bGwsIG51bGwsIChlcnJvcjogRXJyb3IpID0+IHtcblx0XHRcdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0c3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKHRoaXMuX2lzQ2xvc2VkKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdTdHJlYW0gaXMgY2xvc2VkJykpO1xuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXG5cdHdyaXRlKGNodW5rOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAodGhpcy5faXNDbG9zZWQpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1N0cmVhbSBpcyBjbG9zZWQnKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHRoaXMuX3JlamVjdFdyaXRlUHJvbWlzZSA9IHJlamVjdDtcblxuXHRcdFx0dGhpcy5fbm9kZVN0cmVhbS53cml0ZShjaHVuaywgdGhpcy5fZW5jb2RpbmcsIChlcnJvcj86IEVycm9yKSA9PiB7XG5cdFx0XHRcdGlmIChlcnJvcikge1xuXHRcdFx0XHRcdHRoaXMuX2hhbmRsZUVycm9yKGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHR0aGlzLl9yZWplY3RXcml0ZVByb21pc2UgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxufVxuIl19