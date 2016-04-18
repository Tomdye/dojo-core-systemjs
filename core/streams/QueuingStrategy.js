(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    class QueuingStrategy {
        constructor(kwArgs) {
            this.highWaterMark = kwArgs.highWaterMark;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QueuingStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVldWluZ1N0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbXMvUXVldWluZ1N0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUVBO1FBR0MsWUFBWSxNQUFjO1lBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztRQUMzQyxDQUFDO0lBQ0YsQ0FBQztJQU5EO3FDQU1DLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTdHJhdGVneSB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1ZXVpbmdTdHJhdGVneTxUPiBpbXBsZW1lbnRzIFN0cmF0ZWd5PFQ+IHtcblx0aGlnaFdhdGVyTWFyazogbnVtYmVyO1xuXG5cdGNvbnN0cnVjdG9yKGt3QXJnczogS3dBcmdzKSB7XG5cdFx0dGhpcy5oaWdoV2F0ZXJNYXJrID0ga3dBcmdzLmhpZ2hXYXRlck1hcms7XG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBLd0FyZ3Mge1xuXHRoaWdoV2F0ZXJNYXJrOiBudW1iZXI7XG59XG4iXX0=