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
    class ReadableNodeStreamSource {
        constructor(nodeStream) {
            ;
            this._isClosed = false;
            this._nodeStream = nodeStream;
            // TODO: remove <any> when typedef is fixed to include 'isPaused'
            this._shouldResume = !this._nodeStream.isPaused();
            if (this._shouldResume) {
                // put stream in paused mode so it behaves as a pull source, rather than a push source
                this._nodeStream.pause();
            }
        }
        // Perform internal close logic
        _close() {
            this._isClosed = true;
            this._removeListeners();
            this._nodeStream.unpipe();
            if (this._shouldResume) {
                this._nodeStream.resume();
            }
        }
        // Handle external request to close
        _handleClose() {
            this._close();
            this._controller.close();
        }
        _handleError(error) {
            this._close();
            this._controller.error(error);
        }
        _removeListeners() {
            this._nodeStream.removeListener('close', this._onClose);
            this._nodeStream.removeListener('end', this._onClose);
            this._nodeStream.removeListener('error', this._onError);
        }
        cancel(reason) {
            this._handleClose();
            return Promise_1.default.resolve();
        }
        pull(controller) {
            if (this._isClosed) {
                return Promise_1.default.reject(new Error('Stream is closed'));
            }
            const chunk = this._nodeStream.read();
            if (chunk === null) {
                this._handleClose();
            }
            else {
                controller.enqueue(chunk);
            }
            return Promise_1.default.resolve();
        }
        start(controller) {
            this._controller = controller;
            this._onClose = this._handleClose.bind(this);
            this._onError = this._handleError.bind(this);
            this._nodeStream.on('close', this._onClose);
            this._nodeStream.on('end', this._onClose);
            this._nodeStream.on('error', this._onError);
            return Promise_1.default.resolve();
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ReadableNodeStreamSource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhZGFibGVOb2RlU3RyZWFtU291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cmVhbXMvYWRhcHRlcnMvUmVhZGFibGVOb2RlU3RyZWFtU291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUFBLDBCQUFvQixlQUFlLENBQUMsQ0FBQTtJQU9wQztRQVFDLFlBQVksVUFBb0I7WUFBRyxDQUFDO1lBQ25DLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1lBRTlCLGlFQUFpRTtZQUNqRSxJQUFJLENBQUMsYUFBYSxHQUFHLENBQVEsSUFBSSxDQUFDLFdBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUUxRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDeEIsc0ZBQXNGO2dCQUN0RixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzFCLENBQUM7UUFDRixDQUFDO1FBRUQsK0JBQStCO1FBQ3JCLE1BQU07WUFDZixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRTFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzNCLENBQUM7UUFDRixDQUFDO1FBRUQsbUNBQW1DO1FBQ3pCLFlBQVk7WUFDckIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRVMsWUFBWSxDQUFDLEtBQVk7WUFDbEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVTLGdCQUFnQjtZQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRUQsTUFBTSxDQUFDLE1BQVk7WUFDbEIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXBCLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFRCxJQUFJLENBQUMsVUFBb0Q7WUFDeEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sQ0FBQyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDdEQsQ0FBQztZQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFdEMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNyQixDQUFDO1lBQ0QsSUFBSSxDQUFDLENBQUM7Z0JBQ0wsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQixDQUFDO1lBRUQsTUFBTSxDQUFDLGlCQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVELEtBQUssQ0FBQyxVQUFvRDtZQUN6RCxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZQUM5QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFNUMsTUFBTSxDQUFDLGlCQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztJQUNGLENBQUM7SUFuRkQ7OENBbUZDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvbWlzZSBmcm9tICcuLi8uLi9Qcm9taXNlJztcbmltcG9ydCB7IFNvdXJjZSB9IGZyb20gJy4uL1JlYWRhYmxlU3RyZWFtJztcbmltcG9ydCBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIgZnJvbSAnLi4vUmVhZGFibGVTdHJlYW1Db250cm9sbGVyJztcbmltcG9ydCB7IFJlYWRhYmxlIH0gZnJvbSAnc3RyZWFtJztcblxuZXhwb3J0IHR5cGUgTm9kZVNvdXJjZVR5cGUgPSBCdWZmZXIgfCBzdHJpbmc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlYWRhYmxlTm9kZVN0cmVhbVNvdXJjZSBpbXBsZW1lbnRzIFNvdXJjZTxOb2RlU291cmNlVHlwZT4ge1xuXHRwcm90ZWN0ZWQgX2NvbnRyb2xsZXI6IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlcjxOb2RlU291cmNlVHlwZT47XG5cdHByb3RlY3RlZCBfaXNDbG9zZWQ6IGJvb2xlYW47XG5cdHByb3RlY3RlZCBfb25DbG9zZTogKCkgPT4gdm9pZDtcblx0cHJvdGVjdGVkIF9vbkVycm9yOiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkO1xuXHRwcm90ZWN0ZWQgX25vZGVTdHJlYW06IFJlYWRhYmxlO1xuXHRwcm90ZWN0ZWQgX3Nob3VsZFJlc3VtZTogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3Rvcihub2RlU3RyZWFtOiBSZWFkYWJsZSkgeztcblx0XHR0aGlzLl9pc0Nsb3NlZCA9IGZhbHNlO1xuXHRcdHRoaXMuX25vZGVTdHJlYW0gPSBub2RlU3RyZWFtO1xuXG5cdFx0Ly8gVE9ETzogcmVtb3ZlIDxhbnk+IHdoZW4gdHlwZWRlZiBpcyBmaXhlZCB0byBpbmNsdWRlICdpc1BhdXNlZCdcblx0XHR0aGlzLl9zaG91bGRSZXN1bWUgPSAhKDxhbnk+IHRoaXMuX25vZGVTdHJlYW0pLmlzUGF1c2VkKCk7XG5cblx0XHRpZiAodGhpcy5fc2hvdWxkUmVzdW1lKSB7XG5cdFx0XHQvLyBwdXQgc3RyZWFtIGluIHBhdXNlZCBtb2RlIHNvIGl0IGJlaGF2ZXMgYXMgYSBwdWxsIHNvdXJjZSwgcmF0aGVyIHRoYW4gYSBwdXNoIHNvdXJjZVxuXHRcdFx0dGhpcy5fbm9kZVN0cmVhbS5wYXVzZSgpO1xuXHRcdH1cblx0fVxuXG5cdC8vIFBlcmZvcm0gaW50ZXJuYWwgY2xvc2UgbG9naWNcblx0cHJvdGVjdGVkIF9jbG9zZSgpOiB2b2lkIHtcblx0XHR0aGlzLl9pc0Nsb3NlZCA9IHRydWU7XG5cdFx0dGhpcy5fcmVtb3ZlTGlzdGVuZXJzKCk7XG5cdFx0dGhpcy5fbm9kZVN0cmVhbS51bnBpcGUoKTtcblxuXHRcdGlmICh0aGlzLl9zaG91bGRSZXN1bWUpIHtcblx0XHRcdHRoaXMuX25vZGVTdHJlYW0ucmVzdW1lKCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gSGFuZGxlIGV4dGVybmFsIHJlcXVlc3QgdG8gY2xvc2Vcblx0cHJvdGVjdGVkIF9oYW5kbGVDbG9zZSgpOiB2b2lkIHtcblx0XHR0aGlzLl9jbG9zZSgpO1xuXHRcdHRoaXMuX2NvbnRyb2xsZXIuY2xvc2UoKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaGFuZGxlRXJyb3IoZXJyb3I6IEVycm9yKTogdm9pZCB7XG5cdFx0dGhpcy5fY2xvc2UoKTtcblx0XHR0aGlzLl9jb250cm9sbGVyLmVycm9yKGVycm9yKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfcmVtb3ZlTGlzdGVuZXJzKCk6IHZvaWQge1xuXHRcdHRoaXMuX25vZGVTdHJlYW0ucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgdGhpcy5fb25DbG9zZSk7XG5cdFx0dGhpcy5fbm9kZVN0cmVhbS5yZW1vdmVMaXN0ZW5lcignZW5kJywgdGhpcy5fb25DbG9zZSk7XG5cdFx0dGhpcy5fbm9kZVN0cmVhbS5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCB0aGlzLl9vbkVycm9yKTtcblx0fVxuXG5cdGNhbmNlbChyZWFzb24/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0aGlzLl9oYW5kbGVDbG9zZSgpO1xuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0cHVsbChjb250cm9sbGVyOiBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXI8Tm9kZVNvdXJjZVR5cGU+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKHRoaXMuX2lzQ2xvc2VkKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdTdHJlYW0gaXMgY2xvc2VkJykpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGNodW5rID0gdGhpcy5fbm9kZVN0cmVhbS5yZWFkKCk7XG5cblx0XHRpZiAoY2h1bmsgPT09IG51bGwpIHtcblx0XHRcdHRoaXMuX2hhbmRsZUNsb3NlKCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29udHJvbGxlci5lbnF1ZXVlKGNodW5rKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblxuXHRzdGFydChjb250cm9sbGVyOiBSZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXI8Tm9kZVNvdXJjZVR5cGU+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5fY29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG5cdFx0dGhpcy5fb25DbG9zZSA9IHRoaXMuX2hhbmRsZUNsb3NlLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5fb25FcnJvciA9IHRoaXMuX2hhbmRsZUVycm9yLmJpbmQodGhpcyk7XG5cblx0XHR0aGlzLl9ub2RlU3RyZWFtLm9uKCdjbG9zZScsIHRoaXMuX29uQ2xvc2UpO1xuXHRcdHRoaXMuX25vZGVTdHJlYW0ub24oJ2VuZCcsIHRoaXMuX29uQ2xvc2UpO1xuXHRcdHRoaXMuX25vZGVTdHJlYW0ub24oJ2Vycm9yJywgdGhpcy5fb25FcnJvcik7XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cbn1cbiJdfQ==