// This is a simple adaptation to TypeScript of the reference implementation (as of May 2015):
// https://github.com/whatwg/streams/blob/master/reference-implementation/lib/transform-stream.js
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../Promise', './ReadableStream', './WritableStream'], factory);
    }
})(function (require, exports) {
    "use strict";
    const Promise_1 = require('../Promise');
    const ReadableStream_1 = require('./ReadableStream');
    const WritableStream_1 = require('./WritableStream');
    /**
     * A `TransformStream` is both readable and writable. Its purpose is to apply some transform logic to everything that
     * is written to it and provide the transformed data via its reader. As such, it requires no `ReadableStream`,
     * `WritableStream`, or `Source` or `Sink` to be supplied - it provides its own.
     *
     * It does require an object that implements the {@link Transform} interface to be supplied. The `transform` method
     * will be applied to all data written to the stream.
     *
     * The readable stream API is available via the `TransformStream`'s `readable` property, which is a
     * {@link ReadableStream}. The writable stream API is available via the `TransformStream`'s `writable` property, which
     * is a {@link WritableStream}.
     */
    class TransformStream {
        constructor(transformer) {
            let writeChunk;
            let writeDone;
            let errorWritable;
            let transforming = false;
            let chunkWrittenButNotYetTransformed = false;
            let enqueueInReadable;
            let closeReadable;
            let errorReadable;
            function maybeDoTransform() {
                if (!transforming) {
                    transforming = true;
                    try {
                        transformer.transform(writeChunk, enqueueInReadable, transformDone);
                        writeChunk = undefined;
                        chunkWrittenButNotYetTransformed = false;
                    }
                    catch (e) {
                        transforming = false;
                        errorWritable(e);
                        errorReadable(e);
                    }
                }
            }
            function transformDone() {
                transforming = false;
                writeDone();
            }
            this.writable = new WritableStream_1.default({
                abort() {
                    return Promise_1.default.resolve();
                },
                start(error) {
                    errorWritable = error;
                    return Promise_1.default.resolve();
                },
                write(chunk) {
                    writeChunk = chunk;
                    chunkWrittenButNotYetTransformed = true;
                    const promise = new Promise_1.default(function (resolve) {
                        writeDone = resolve;
                    });
                    maybeDoTransform();
                    return promise;
                },
                close() {
                    try {
                        transformer.flush(enqueueInReadable, closeReadable);
                        return Promise_1.default.resolve();
                    }
                    catch (e) {
                        errorWritable(e);
                        errorReadable(e);
                        return Promise_1.default.reject(e);
                    }
                }
            }, transformer.writableStrategy);
            this.readable = new ReadableStream_1.default({
                start(controller) {
                    enqueueInReadable = controller.enqueue.bind(controller);
                    closeReadable = controller.close.bind(controller);
                    errorReadable = controller.error.bind(controller);
                    return Promise_1.default.resolve();
                },
                pull(controller) {
                    if (chunkWrittenButNotYetTransformed) {
                        maybeDoTransform();
                    }
                    return Promise_1.default.resolve();
                },
                cancel() {
                    return Promise_1.default.resolve();
                }
            }, transformer.readableStrategy);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TransformStream;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhbnNmb3JtU3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbXMvVHJhbnNmb3JtU3RyZWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDhGQUE4RjtBQUM5RixpR0FBaUc7Ozs7Ozs7Ozs7SUFHakcsMEJBQW9CLFlBQVksQ0FBQyxDQUFBO0lBQ2pDLGlDQUF1QyxrQkFBa0IsQ0FBQyxDQUFBO0lBRTFELGlDQUFxQyxrQkFBa0IsQ0FBQyxDQUFBO0lBa0N4RDs7Ozs7Ozs7Ozs7T0FXRztJQUNIO1FBSUMsWUFBWSxXQUE0QjtZQUN2QyxJQUFJLFVBQWEsQ0FBQztZQUNsQixJQUFJLFNBQXFCLENBQUM7WUFDMUIsSUFBSSxhQUFvQyxDQUFDO1lBQ3pDLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztZQUN6QixJQUFJLGdDQUFnQyxHQUFHLEtBQUssQ0FBQztZQUM3QyxJQUFJLGlCQUE2QixDQUFDO1lBQ2xDLElBQUksYUFBb0MsQ0FBQztZQUN6QyxJQUFJLGFBQW9DLENBQUM7WUFFekM7Z0JBQ0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO29CQUNuQixZQUFZLEdBQUcsSUFBSSxDQUFDO29CQUNwQixJQUFJLENBQUM7d0JBQ0osV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxDQUFDLENBQUM7d0JBQ3BFLFVBQVUsR0FBRyxTQUFTLENBQUM7d0JBQ3ZCLGdDQUFnQyxHQUFHLEtBQUssQ0FBQztvQkFDMUMsQ0FBRTtvQkFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNaLFlBQVksR0FBRyxLQUFLLENBQUM7d0JBQ3JCLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakIsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQixDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1lBRUQ7Z0JBQ0MsWUFBWSxHQUFHLEtBQUssQ0FBQztnQkFDckIsU0FBUyxFQUFFLENBQUM7WUFDYixDQUFDO1lBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLHdCQUFjLENBQWU7Z0JBQ2hELEtBQUs7b0JBQ0osTUFBTSxDQUFDLGlCQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFCLENBQUM7Z0JBRUQsS0FBSyxDQUFDLEtBQTRCO29CQUNqQyxhQUFhLEdBQUcsS0FBSyxDQUFDO29CQUN0QixNQUFNLENBQUMsaUJBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDMUIsQ0FBQztnQkFFRCxLQUFLLENBQUMsS0FBUTtvQkFDYixVQUFVLEdBQUcsS0FBSyxDQUFDO29CQUNuQixnQ0FBZ0MsR0FBRyxJQUFJLENBQUM7b0JBQ3hDLE1BQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBTyxVQUFVLE9BQU87d0JBQ2xELFNBQVMsR0FBRyxPQUFPLENBQUM7b0JBQ3JCLENBQUMsQ0FBQyxDQUFDO29CQUNILGdCQUFnQixFQUFFLENBQUM7b0JBQ25CLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBQ2hCLENBQUM7Z0JBRUQsS0FBSztvQkFDSixJQUFJLENBQUM7d0JBQ0osV0FBVyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxhQUFhLENBQUMsQ0FBQzt3QkFDcEQsTUFBTSxDQUFDLGlCQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzFCLENBQUU7b0JBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDWixhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2pCLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakIsTUFBTSxDQUFDLGlCQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxQixDQUFDO2dCQUNGLENBQUM7YUFDRCxFQUFFLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRWpDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx3QkFBYyxDQUFjO2dCQUMvQyxLQUFLLENBQUMsVUFBdUM7b0JBQzVDLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN4RCxhQUFhLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2xELGFBQWEsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDbEQsTUFBTSxDQUFDLGlCQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFCLENBQUM7Z0JBRUQsSUFBSSxDQUFDLFVBQXVDO29CQUMzQyxFQUFFLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7d0JBQ3RDLGdCQUFnQixFQUFFLENBQUM7b0JBQ3BCLENBQUM7b0JBQ0QsTUFBTSxDQUFDLGlCQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFCLENBQUM7Z0JBRUQsTUFBTTtvQkFDTCxNQUFNLENBQUMsaUJBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDMUIsQ0FBQzthQUNELEVBQUUsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbEMsQ0FBQztJQUNGLENBQUM7SUF0RkQ7cUNBc0ZDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGlzIGEgc2ltcGxlIGFkYXB0YXRpb24gdG8gVHlwZVNjcmlwdCBvZiB0aGUgcmVmZXJlbmNlIGltcGxlbWVudGF0aW9uIChhcyBvZiBNYXkgMjAxNSk6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vd2hhdHdnL3N0cmVhbXMvYmxvYi9tYXN0ZXIvcmVmZXJlbmNlLWltcGxlbWVudGF0aW9uL2xpYi90cmFuc2Zvcm0tc3RyZWFtLmpzXG5cbmltcG9ydCB7IFN0cmF0ZWd5IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCBQcm9taXNlIGZyb20gJy4uL1Byb21pc2UnO1xuaW1wb3J0IFJlYWRhYmxlU3RyZWFtLCB7IFNvdXJjZSB9IGZyb20gJy4vUmVhZGFibGVTdHJlYW0nO1xuaW1wb3J0IFJlYWRhYmxlU3RyZWFtQ29udHJvbGxlciBmcm9tICcuL1JlYWRhYmxlU3RyZWFtQ29udHJvbGxlcic7XG5pbXBvcnQgV3JpdGFibGVTdHJlYW0sIHsgU2luayB9IGZyb20gJy4vV3JpdGFibGVTdHJlYW0nO1xuXG4vKipcbiAqIFRoZSBgVHJhbnNmb3JtYCBpbnRlcmZhY2UgZGVmaW5lcyB0aGUgcmVxdWlyZW1lbnRzIGZvciBhIHRyYW5zZm9ybSBvYmplY3QgdG8gYmUgc3VwcGxpZWQgdG8gYVxuICoge0BsaW5rIFRyYW5zZm9ybVN0cmVhbX0gaW5zdGFuY2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHJhbnNmb3JtPFIsIFc+IHtcblx0LyoqXG5cdCAqIFRoZSBgdHJhbnNmb3JtYCBtZXRob2Qgc2hvdWxkIGFjY2VwdCBhIGNodW5rLCBhbiBgZW5xdWV1ZUluUmVhZGFibGVgIGZ1bmN0aW9uLCBhbmQgYSBgdHJhbnNmb3JtRG9uZWAgZnVuY3Rpb24uXG5cdCAqIFRoZSBjaHVuayBpcyB0aGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZC4gVGhlIHRyYW5zZm9ybSBmdW5jdGlvbiBzaG91bGQgcGVyZm9ybSBhbnkgdHJhbnNmb3JtIGxvZ2ljIG9uIHRoZSBjaHVua1xuXHQgKiBhbmQgdGhlbiBjYWxsIHRoZSBzdXBwbGllZCBgZW5xdWV1ZUluUmVhZGFibGVgIGZ1bmN0aW9uLCBwYXNzaW5nIGl0IHRoZSB0cmFuc2Zvcm1lZCBkYXRhLiBBZnRlciB0aGF0IGl0IHNob3VsZFxuXHQgKiBjYWxsIHRoZSBzdXBwbGllZCBgdHJhbnNmb3JtRG9uZWAgZnVuY3Rpb24gdG8gbm90aWZ5IHRoZSBgVHJhbnNmb3JtU3RyZWFtYCB0aGF0IHRyYW5zZm9ybWF0aW9uIGlzIGNvbXBsZXRlLlxuXHQgKi9cblx0dHJhbnNmb3JtKGNodW5rOiBXLCBlbnF1ZXVlSW5SZWFkYWJsZTogKGNodW5rOiBSKSA9PiB2b2lkLCB0cmFuc2Zvcm1Eb25lOiAoKSA9PiB2b2lkKTogdm9pZDtcblxuXHQvKipcblx0ICogVGhlIGBmbHVzaGAgbWV0aG9kIHdpbGwgYmUgY2FsbGVkIGJ5IHRoZSBgVHJhbnNmb3JtU3RyZWFtYCB3aGVuIGl0cyB7QGxpbmsgV3JpdGFibGVTdHJlYW19IGlzIGNsb3NlZC4gQW55IGxvZ2ljXG5cdCAqIHRoZSB0cmFuc2Zvcm1lciBtYXkgd2lzaCB0byBydW4gd2hlbiB0aGUgc3RyZWFtIGlzIGNsb3NlZCBjYW4gYmUgc3VwcGxpZWQgaW4gdGhpcyBmdW5jdGlvbi4gQW55IHBlbmRpbmcgZGF0YVxuXHQgKiBjYW4gc3RpbGwgYmUgZW5xdWV1ZWQgdXNpbmcgdGhlIHN1cHBsaWVkIGBlbnF1ZXVlYCBmdW5jdGlvbi4gV2hlbiB0aGUgdHJhbnNmb3JtZXIgaGFzIGZpbmlzaGVkIHRyYW5zZm9ybWluZyBhbGxcblx0ICogZGF0YSBhbmQgaXMgcmVhZHkgdG8gY2xvc2UgdGhlIHtAbGluayBSZWFkYWJsZVN0cmVhbX0gaXQgc2hvdWxkIGNhbGwgdGhlIHN1cHBsaWVkIGBjbG9zZWAgZnVuY3Rpb24uXG5cdCAqL1xuXHRmbHVzaChlbnF1ZXVlOiBGdW5jdGlvbiwgY2xvc2U6IEZ1bmN0aW9uKTogdm9pZDtcblxuXHQvKipcblx0ICogSWYgc3VwcGxpZWQsIHRoaXMgc3RyYXRlZ3kgd2lsbCBiZSB1c2VkIGZvciB0aGUgYFRyYW5zZm9ybWVyYCdzIGludGVybmFsIHtAbGluayBSZWFkYWJsZVN0cmVhbX1cblx0ICovXG5cdHJlYWRhYmxlU3RyYXRlZ3k6IFN0cmF0ZWd5PFI+O1xuXG5cdC8qKlxuXHQgKiBJZiBzdXBwbGllZCwgdGhpcyBzdHJhdGVneSB3aWxsIGJlIHVzZWQgZm9yIHRoZSBgVHJhbnNmb3JtZXJgJ3MgaW50ZXJuYWwge0BsaW5rIFdyaXRhYmxlU3RyZWFtfVxuXHQgKi9cblx0d3JpdGFibGVTdHJhdGVneTogU3RyYXRlZ3k8Vz47XG59XG5cbi8qKlxuICogQSBgVHJhbnNmb3JtU3RyZWFtYCBpcyBib3RoIHJlYWRhYmxlIGFuZCB3cml0YWJsZS4gSXRzIHB1cnBvc2UgaXMgdG8gYXBwbHkgc29tZSB0cmFuc2Zvcm0gbG9naWMgdG8gZXZlcnl0aGluZyB0aGF0XG4gKiBpcyB3cml0dGVuIHRvIGl0IGFuZCBwcm92aWRlIHRoZSB0cmFuc2Zvcm1lZCBkYXRhIHZpYSBpdHMgcmVhZGVyLiBBcyBzdWNoLCBpdCByZXF1aXJlcyBubyBgUmVhZGFibGVTdHJlYW1gLFxuICogYFdyaXRhYmxlU3RyZWFtYCwgb3IgYFNvdXJjZWAgb3IgYFNpbmtgIHRvIGJlIHN1cHBsaWVkIC0gaXQgcHJvdmlkZXMgaXRzIG93bi5cbiAqXG4gKiBJdCBkb2VzIHJlcXVpcmUgYW4gb2JqZWN0IHRoYXQgaW1wbGVtZW50cyB0aGUge0BsaW5rIFRyYW5zZm9ybX0gaW50ZXJmYWNlIHRvIGJlIHN1cHBsaWVkLiBUaGUgYHRyYW5zZm9ybWAgbWV0aG9kXG4gKiB3aWxsIGJlIGFwcGxpZWQgdG8gYWxsIGRhdGEgd3JpdHRlbiB0byB0aGUgc3RyZWFtLlxuICpcbiAqIFRoZSByZWFkYWJsZSBzdHJlYW0gQVBJIGlzIGF2YWlsYWJsZSB2aWEgdGhlIGBUcmFuc2Zvcm1TdHJlYW1gJ3MgYHJlYWRhYmxlYCBwcm9wZXJ0eSwgd2hpY2ggaXMgYVxuICoge0BsaW5rIFJlYWRhYmxlU3RyZWFtfS4gVGhlIHdyaXRhYmxlIHN0cmVhbSBBUEkgaXMgYXZhaWxhYmxlIHZpYSB0aGUgYFRyYW5zZm9ybVN0cmVhbWAncyBgd3JpdGFibGVgIHByb3BlcnR5LCB3aGljaFxuICogaXMgYSB7QGxpbmsgV3JpdGFibGVTdHJlYW19LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmFuc2Zvcm1TdHJlYW08UiwgVz4ge1xuXHRyZWFkYWJsZTogUmVhZGFibGVTdHJlYW08Uj47XG5cdHdyaXRhYmxlOiBXcml0YWJsZVN0cmVhbTxXPjtcblxuXHRjb25zdHJ1Y3Rvcih0cmFuc2Zvcm1lcjogVHJhbnNmb3JtPFIsIFc+KSB7XG5cdFx0bGV0IHdyaXRlQ2h1bms6IFc7XG5cdFx0bGV0IHdyaXRlRG9uZTogKCkgPT4gdm9pZDtcblx0XHRsZXQgZXJyb3JXcml0YWJsZTogKGVycm9yPzogYW55KSA9PiB2b2lkO1xuXHRcdGxldCB0cmFuc2Zvcm1pbmcgPSBmYWxzZTtcblx0XHRsZXQgY2h1bmtXcml0dGVuQnV0Tm90WWV0VHJhbnNmb3JtZWQgPSBmYWxzZTtcblx0XHRsZXQgZW5xdWV1ZUluUmVhZGFibGU6ICgpID0+IHZvaWQ7XG5cdFx0bGV0IGNsb3NlUmVhZGFibGU6IChlcnJvcj86IGFueSkgPT4gdm9pZDtcblx0XHRsZXQgZXJyb3JSZWFkYWJsZTogKGVycm9yPzogYW55KSA9PiB2b2lkO1xuXG5cdFx0ZnVuY3Rpb24gbWF5YmVEb1RyYW5zZm9ybSgpIHtcblx0XHRcdGlmICghdHJhbnNmb3JtaW5nKSB7XG5cdFx0XHRcdHRyYW5zZm9ybWluZyA9IHRydWU7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0dHJhbnNmb3JtZXIudHJhbnNmb3JtKHdyaXRlQ2h1bmssIGVucXVldWVJblJlYWRhYmxlLCB0cmFuc2Zvcm1Eb25lKTtcblx0XHRcdFx0XHR3cml0ZUNodW5rID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdGNodW5rV3JpdHRlbkJ1dE5vdFlldFRyYW5zZm9ybWVkID0gZmFsc2U7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHR0cmFuc2Zvcm1pbmcgPSBmYWxzZTtcblx0XHRcdFx0XHRlcnJvcldyaXRhYmxlKGUpO1xuXHRcdFx0XHRcdGVycm9yUmVhZGFibGUoZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmFuc2Zvcm1Eb25lKCkge1xuXHRcdFx0dHJhbnNmb3JtaW5nID0gZmFsc2U7XG5cdFx0XHR3cml0ZURvbmUoKTtcblx0XHR9XG5cblx0XHR0aGlzLndyaXRhYmxlID0gbmV3IFdyaXRhYmxlU3RyZWFtPFc+KDxTaW5rIDxXPj4ge1xuXHRcdFx0YWJvcnQoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdH0sXG5cblx0XHRcdHN0YXJ0KGVycm9yOiAoZXJyb3I/OiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdFx0ZXJyb3JXcml0YWJsZSA9IGVycm9yO1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHR9LFxuXG5cdFx0XHR3cml0ZShjaHVuazogVykge1xuXHRcdFx0XHR3cml0ZUNodW5rID0gY2h1bms7XG5cdFx0XHRcdGNodW5rV3JpdHRlbkJ1dE5vdFlldFRyYW5zZm9ybWVkID0gdHJ1ZTtcblx0XHRcdFx0Y29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0XHRcdFx0d3JpdGVEb25lID0gcmVzb2x2ZTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdG1heWJlRG9UcmFuc2Zvcm0oKTtcblx0XHRcdFx0cmV0dXJuIHByb21pc2U7XG5cdFx0XHR9LFxuXG5cdFx0XHRjbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR0cmFuc2Zvcm1lci5mbHVzaChlbnF1ZXVlSW5SZWFkYWJsZSwgY2xvc2VSZWFkYWJsZSk7XG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0ZXJyb3JXcml0YWJsZShlKTtcblx0XHRcdFx0XHRlcnJvclJlYWRhYmxlKGUpO1xuXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sIHRyYW5zZm9ybWVyLndyaXRhYmxlU3RyYXRlZ3kpO1xuXG5cdFx0dGhpcy5yZWFkYWJsZSA9IG5ldyBSZWFkYWJsZVN0cmVhbSg8U291cmNlIDxSPj4ge1xuXHRcdFx0c3RhcnQoY29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPFI+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0XHRcdGVucXVldWVJblJlYWRhYmxlID0gY29udHJvbGxlci5lbnF1ZXVlLmJpbmQoY29udHJvbGxlcik7XG5cdFx0XHRcdGNsb3NlUmVhZGFibGUgPSBjb250cm9sbGVyLmNsb3NlLmJpbmQoY29udHJvbGxlcik7XG5cdFx0XHRcdGVycm9yUmVhZGFibGUgPSBjb250cm9sbGVyLmVycm9yLmJpbmQoY29udHJvbGxlcik7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdH0sXG5cblx0XHRcdHB1bGwoY29udHJvbGxlcjogUmVhZGFibGVTdHJlYW1Db250cm9sbGVyPFI+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0XHRcdGlmIChjaHVua1dyaXR0ZW5CdXROb3RZZXRUcmFuc2Zvcm1lZCkge1xuXHRcdFx0XHRcdG1heWJlRG9UcmFuc2Zvcm0oKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHR9LFxuXG5cdFx0XHRjYW5jZWwoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdH1cblx0XHR9LCB0cmFuc2Zvcm1lci5yZWFkYWJsZVN0cmF0ZWd5KTtcblx0fVxufVxuIl19